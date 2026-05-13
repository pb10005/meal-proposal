export const MEAL_CATEGORIES = [
  'curry_stew',
  'noodle',
  'fried',
  'donburi',
  'ethnic',
  'bread',
  'light_snack',
  'grilled_meat',
  'fish',
  'salad',
  'rice_set',
  'soup',
  'convenience',
  'other',
] as const;

export type MealCategory = (typeof MEAL_CATEGORIES)[number];
export type MealForm = 'cook' | 'eat_out' | 'buy';

export const MEAL_TIMINGS = ['breakfast', 'lunch', 'snack', 'dinner', 'late_night'] as const;
export type MealTiming = (typeof MEAL_TIMINGS)[number];
export type Mood = 'sappari' | 'kottori' | 'spicy' | 'sweet';
export type BudgetBand = 'low' | 'mid' | 'high';

export interface SuggestInput {
  mood: Mood;
  time_min: 10 | 20 | 40;
  form: MealForm;
  free_text?: string;
  budget_band?: BudgetBand;
}

export interface MealCandidate {
  id: string;
  name: string;
  category: MealCategory;
  form: MealForm;
  time_min: number;
  cost_band: BudgetBand;
  nutrition_tags: string[];
  reason: string;
  ingredients: string[];
  steps: string[];
  shopping_list: string[];
}

export interface SuggestResponse {
  suggestion_log_id: string;
  excluded_reasons: string[];
  candidates: MealCandidate[];
}

export interface UserPreferences {
  likes: string[];
  dislikes: string[];
  allergies: string[];
  dietary_restrictions: string[];
}
