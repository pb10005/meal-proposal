import { MealCandidate } from '@/types/meal';

// Spicy keywords that trigger removal when user has spicy NG
const SPICY_KEYWORDS = [
  'キムチ',
  '麻辣',
  'マーラー',
  '辛口',
  '激辛',
  '唐辛子',
  'チリ',
  'ハラペーニョ',
];

function containsAnyKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw));
}

function mealContainsAllergen(
  candidate: MealCandidate,
  allergen: string
): boolean {
  const searchFields = [
    candidate.name,
    ...candidate.ingredients,
    ...candidate.shopping_list,
  ].join(' ');
  return searchFields.includes(allergen);
}

function mealContainsRestriction(
  candidate: MealCandidate,
  restriction: string
): boolean {
  const searchFields = [
    candidate.name,
    candidate.category,
    ...candidate.ingredients,
    ...candidate.steps,
  ].join(' ');
  return searchFields.includes(restriction);
}

function isSpicy(candidate: MealCandidate): boolean {
  const searchFields = [
    candidate.name,
    ...candidate.ingredients,
    ...candidate.steps,
    ...candidate.nutrition_tags,
  ].join(' ');
  return containsAnyKeyword(searchFields, SPICY_KEYWORDS);
}

export function applyHardBlock(
  candidates: MealCandidate[],
  allergies: string[],
  dietaryRestrictions: string[],
  dislikedItems: string[]
): MealCandidate[] {
  return candidates.filter((candidate) => {
    // Filter based on allergens in ingredients
    for (const allergen of allergies) {
      if (mealContainsAllergen(candidate, allergen)) {
        return false;
      }
    }

    // Filter based on dietary restrictions
    for (const restriction of dietaryRestrictions) {
      if (mealContainsRestriction(candidate, restriction)) {
        return false;
      }
    }

    // Filter spicy if 辛い is in dislikes
    if (dislikedItems.includes('辛い') || dislikedItems.includes('辛いもの')) {
      if (isSpicy(candidate)) {
        return false;
      }
    }

    // Filter based on other dislikes
    for (const dislike of dislikedItems) {
      if (dislike === '辛い' || dislike === '辛いもの') continue;
      const searchFields = [
        candidate.name,
        ...candidate.ingredients,
        ...candidate.shopping_list,
      ].join(' ');
      if (searchFields.includes(dislike)) {
        return false;
      }
    }

    return true;
  });
}
