import { MealCategory } from '@/types/meal';

export const MEAL_CATEGORY_LABELS: Record<MealCategory, string> = {
  curry_stew: 'カレー・シチュー',
  noodle: '麺類',
  fried: '揚げ物',
  donburi: '丼もの',
  ethnic: 'エスニック',
  bread: 'パン・サンドイッチ',
  light_snack: '軽食・スナック',
  grilled_meat: '焼き肉・グリル',
  fish: '魚料理',
  salad: 'サラダ',
  rice_set: '定食',
  soup: 'スープ',
  convenience: 'コンビニ食',
  other: 'その他',
};

export const MEAL_CATEGORY_ICONS: Record<MealCategory, string> = {
  curry_stew: '🍛',
  noodle: '🍜',
  fried: '🍟',
  donburi: '🍚',
  ethnic: '🌮',
  bread: '🥪',
  light_snack: '🥨',
  grilled_meat: '🥩',
  fish: '🐟',
  salad: '🥗',
  rice_set: '🍱',
  soup: '🍲',
  convenience: '🏪',
  other: '🍽️',
};
