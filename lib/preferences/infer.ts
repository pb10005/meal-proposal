import { SupabaseClient } from '@supabase/supabase-js';
import { MealCategory, MEAL_CATEGORIES } from '@/types/meal';
import { Database } from '@/types/db';

export interface InferenceResult {
  inferred_likes: string[];
  inferred_categories: MealCategory[];
}

export async function inferPreferences(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<InferenceResult> {
  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [mealsResult, logsResult] = await Promise.all([
      supabase
        .from('meals_log')
        .select('name, category')
        .eq('user_id', userId)
        .gte('eaten_at', sixtyDaysAgo.toISOString()),
      supabase
        .from('suggestions_log')
        .select('candidates, accepted_candidate_id')
        .eq('user_id', userId)
        .not('accepted_candidate_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(30),
    ]);

    const categoryCount = new Map<string, number>();
    const acceptedNames: string[] = [];

    for (const meal of mealsResult.data ?? []) {
      if (meal.category) {
        categoryCount.set(meal.category, (categoryCount.get(meal.category) ?? 0) + 1);
      }
    }

    for (const log of logsResult.data ?? []) {
      const candidates = log.candidates as Array<{ id: string; name: string; category: string }>;
      const accepted = candidates?.find((c) => c.id === log.accepted_candidate_id);
      if (accepted) {
        acceptedNames.push(accepted.name);
        if (accepted.category) {
          categoryCount.set(accepted.category, (categoryCount.get(accepted.category) ?? 0) + 1);
        }
      }
    }

    const validCategories = new Set<string>(MEAL_CATEGORIES);
    const inferred_categories = [...categoryCount.entries()]
      .filter(([cat, count]) => validCategories.has(cat) && count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat as MealCategory);

    const mealLogNames = (mealsResult.data ?? []).map((m) => m.name).filter(Boolean);
    const allNames = [...acceptedNames, ...mealLogNames];
    const inferred_likes = [...new Set(allNames)].slice(0, 10);

    return { inferred_likes, inferred_categories };
  } catch {
    return { inferred_likes: [], inferred_categories: [] };
  }
}
