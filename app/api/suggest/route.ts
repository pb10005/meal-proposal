import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { generateMealSuggestions } from '@/lib/llm/index';
import { buildSuggestPrompt } from '@/lib/llm/prompts';
import { applyHardBlock } from '@/lib/rules/hard-block';
import { buildExclusionRules } from '@/lib/rules/exclusions';
import { trackEvent } from '@/lib/analytics/track';
import { FALLBACK_MEALS } from '@/config/fallback-meals';
import { MealCategory, MealForm, Mood, SuggestResponse, UserPreferences } from '@/types/meal';

const SuggestInputSchema = z.object({
  mood: z.enum(['sappari', 'kottori', 'spicy', 'sweet']),
  time_min: z.union([z.literal(10), z.literal(20), z.literal(40)]),
  form: z.enum(['cook', 'eat_out', 'buy']),
  free_text: z.string().max(200).optional(),
  budget_band: z.enum(['low', 'mid', 'high']).optional(),
});

type SuggestInput = {
  mood: Mood;
  time_min: 10 | 20 | 40;
  form: MealForm;
  free_text?: string;
  budget_band?: 'low' | 'mid' | 'high';
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = SuggestInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input: SuggestInput = parsed.data;

  // Get user from Supabase session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user preferences (if logged in)
  let prefs: UserPreferences = {
    likes: [],
    dislikes: [],
    allergies: [],
    dietary_restrictions: [],
  };

  let recentCategories: MealCategory[] = [];

  if (user) {
    // Fetch preferences
    const { data: prefsData } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (prefsData) {
      prefs = {
        likes: prefsData.likes ?? [],
        dislikes: prefsData.dislikes ?? [],
        allergies: prefsData.allergies ?? [],
        dietary_restrictions: prefsData.dietary_restrictions ?? [],
      };
    }

    // Fetch recent meal categories (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentMeals } = await supabase
      .from('meals_log')
      .select('category')
      .eq('user_id', user.id)
      .gte('eaten_at', sevenDaysAgo.toISOString())
      .order('eaten_at', { ascending: false })
      .limit(10);

    if (recentMeals) {
      recentCategories = [
        ...new Set(recentMeals.map((m) => m.category as MealCategory)),
      ];
    }
  }

  // Build exclusion rules for logging
  const exclusionRules = buildExclusionRules(
    recentCategories,
    prefs.allergies,
    prefs.dietary_restrictions
  );

  // Generate candidates via LLM
  let candidates: import('@/types/meal').MealCandidate[] = [];
  let llmError: string | null = null;

  try {
    const prompt = buildSuggestPrompt(input, prefs, recentCategories);
    const llmCandidates = await generateMealSuggestions(prompt);
    candidates = applyHardBlock(
      llmCandidates,
      prefs.allergies,
      prefs.dietary_restrictions,
      prefs.dislikes
    );
  } catch (err) {
    llmError = err instanceof Error ? err.message : 'LLM error';
    console.error('[suggest] LLM error:', llmError);
  }

  // Pad with fallbacks if needed
  if (candidates.length < 3) {
    const needed = 3 - candidates.length;
    const usedIds = new Set(candidates.map((c) => c.id));
    const available = FALLBACK_MEALS.filter((f) => !usedIds.has(f.id));
    candidates = [...candidates, ...available.slice(0, needed)];
  }

  // Ensure exactly 3
  candidates = candidates.slice(0, 3);

  const latency = Date.now() - startTime;

  // Save to suggestions_log
  let suggestionLogId = '';
  try {
    const { data: logData } = await supabase
      .from('suggestions_log')
      .insert({
        user_id: user?.id ?? null,
        input: input as Record<string, unknown>,
        normalized_input: null,
        excluded_rules: exclusionRules.map((r) => r.rule),
        candidates: candidates as unknown as Record<string, unknown>[],
        accepted_candidate_id: null,
        latency_ms: latency,
      })
      .select('id')
      .single();

    if (logData) {
      suggestionLogId = logData.id;
    }
  } catch (err) {
    console.error('[suggest] Failed to save suggestion log:', err);
  }

  // Track analytics
  await trackEvent({
    event_name: 'suggestion_generated',
    properties: {
      mood: input.mood,
      form: input.form,
      time_min: input.time_min,
      candidate_count: candidates.length,
      used_fallback: llmError !== null,
      latency_ms: latency,
    },
    user_id: user?.id ?? null,
  });

  const response: SuggestResponse = {
    suggestion_log_id: suggestionLogId,
    excluded_reasons: exclusionRules.map((r) => r.reason),
    candidates,
  };

  return NextResponse.json(response);
}
