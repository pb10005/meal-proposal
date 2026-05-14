import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { trackEvent } from '@/lib/analytics/track';

const AcceptInputSchema = z.object({
  suggestion_log_id: z.string().uuid(),
  candidate_id: z.string(),
  name: z.string(),
  category: z.string(),
  form: z.string(),
  timing: z.enum(['breakfast', 'lunch', 'snack', 'dinner', 'late_night']).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = AcceptInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { suggestion_log_id, candidate_id, name, category, form, timing } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Update suggestions_log with accepted candidate
  try {
    await supabase
      .from('suggestions_log')
      .update({ accepted_candidate_id: candidate_id })
      .eq('id', suggestion_log_id);
  } catch (err) {
    console.error('[accept] Failed to update suggestion log:', err);
  }

  // Save to meals_log if user is authenticated
  let mealLogId: string | null = null;
  if (user) {
    try {
      const { data: mealData } = await supabase
        .from('meals_log')
        .insert({
          user_id: user.id,
          name,
          category,
          form,
          timing: timing ?? null,
          eaten_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (mealData) {
        mealLogId = mealData.id;
      }
    } catch (err) {
      console.error('[accept] Failed to save meal log:', err);
    }

    if (mealLogId) {
      try {
        const { inferPreferences } = await import('@/lib/preferences/infer');
        const result = await inferPreferences(supabase, user.id);
        await supabase.from('preferences').upsert({
          user_id: user.id,
          inferred_likes: result.inferred_likes,
          inferred_categories: result.inferred_categories,
          inferred_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[accept] Failed to update inferred preferences:', err);
      }
    }
  }

  // Track analytics
  await trackEvent({
    event_name: 'meal_accepted',
    properties: {
      suggestion_log_id,
      candidate_id,
      name,
      category,
      form,
    },
    user_id: user?.id ?? null,
  });

  return NextResponse.json({
    success: true,
    meal_log_id: mealLogId,
  });
}
