import { MealCategory } from '@/types/meal';

export interface ExclusionRule {
  rule: string;
  reason: string;
}

export function buildExclusionRules(
  recentCategories: MealCategory[],
  allergies: string[],
  dietaryRestrictions: string[]
): ExclusionRule[] {
  const rules: ExclusionRule[] = [];

  // Avoid recent categories
  if (recentCategories.length > 0) {
    rules.push({
      rule: 'recent_category_avoidance',
      reason: `最近食べたカテゴリを避けています: ${recentCategories.join(', ')}`,
    });
  }

  // Allergy exclusions
  for (const allergen of allergies) {
    rules.push({
      rule: `allergy_${allergen}`,
      reason: `アレルギー除外: ${allergen}`,
    });
  }

  // Dietary restriction exclusions
  for (const restriction of dietaryRestrictions) {
    rules.push({
      rule: `restriction_${restriction}`,
      reason: `食事制限除外: ${restriction}`,
    });
  }

  return rules;
}
