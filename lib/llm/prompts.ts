import { SuggestInput, UserPreferences, MealCategory, MealTiming } from '@/types/meal';

const TIMING_LABELS: Record<MealTiming, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  snack: 'おやつ・間食',
  dinner: '夕食',
  late_night: '夜食',
};

const MOOD_LABELS: Record<string, string> = {
  sappari: 'さっぱり（あっさり・軽め）',
  kottori: 'こってり（濃厚・ボリューム）',
  spicy: '辛い（スパイシー）',
  sweet: '甘い（スイーツ系・やさしい）',
};

const FORM_LABELS: Record<string, string> = {
  cook: '自炊（家で作る）',
  eat_out: '外食（レストラン・食堂）',
  buy: '買って済ます（コンビニ・テイクアウト・デリバリー）',
};

const CATEGORY_LABELS: Record<MealCategory, string> = {
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

export function buildSuggestPrompt(
  input: SuggestInput,
  prefs: UserPreferences,
  recentCategories: MealCategory[]
): string {
  const recentCategoryLabels = recentCategories
    .map((c) => CATEGORY_LABELS[c])
    .join('、');

  const exclusions: string[] = [];
  if (prefs.allergies.length > 0) {
    exclusions.push(`アレルギー: ${prefs.allergies.join('、')}`);
  }
  if (prefs.dietary_restrictions.length > 0) {
    exclusions.push(`食事制限: ${prefs.dietary_restrictions.join('、')}`);
  }
  if (prefs.dislikes.length > 0) {
    exclusions.push(`嫌いな食材/料理: ${prefs.dislikes.join('、')}`);
  }
  if (recentCategories.length > 0) {
    exclusions.push(`最近食べたカテゴリ（できれば避ける）: ${recentCategoryLabels}`);
  }

  const preferences: string[] = [];
  if (prefs.likes.length > 0) {
    preferences.push(`好きな食材/料理: ${prefs.likes.join('、')}`);
  }

  return `あなたは食事提案AIアシスタントです。ユーザーの条件に基づいて、ぴったりの食事を3つ提案してください。

## ユーザーの条件
- 気分: ${MOOD_LABELS[input.mood] ?? input.mood}
- 使える時間: ${input.time_min}分以内
- 食事スタイル: ${FORM_LABELS[input.form] ?? input.form}
${input.timing ? `- 食事タイミング: ${TIMING_LABELS[input.timing]}（このタイミングに合った量・内容にすること）` : ''}
${input.budget_band ? `- 予算感: ${input.budget_band === 'low' ? '安め（〜500円）' : input.budget_band === 'mid' ? '普通（500〜1500円）' : '高め（1500円〜）'}` : ''}
${input.free_text ? `- 追加リクエスト: ${input.free_text}` : ''}

${preferences.length > 0 ? `## ユーザーの好み\n${preferences.join('\n')}` : ''}

${exclusions.length > 0 ? `## 除外条件（必ず守ること）\n${exclusions.join('\n')}` : ''}

## 指示
- 上記の条件をすべて満たす食事を3つ提案してください
- 各提案はユニークで、バリエーションを持たせてください
- 除外条件は絶対に守ってください
- 自炊の場合は具体的なレシピを含めてください
- 外食・購入の場合は具体的な店舗タイプや商品を提案してください

以下のJSON形式で回答してください（JSON以外のテキストは不要です）:

{
  "candidates": [
    {
      "id": "candidate_1",
      "name": "料理名",
      "category": "カテゴリ（curry_stew/noodle/fried/donburi/ethnic/bread/light_snack/grilled_meat/fish/salad/rice_set/soup/convenience/otherのいずれか）",
      "form": "${input.form}",
      "time_min": 所要時間（分）,
      "cost_band": "コスト（low/mid/highのいずれか）",
      "nutrition_tags": ["栄養タグ1", "栄養タグ2"],
      "reason": "この料理を提案する理由（ユーザーの気分や条件に合っている点）",
      "ingredients": ["材料1", "材料2"],
      "steps": ["手順1", "手順2"],
      "shopping_list": ["購入品1", "購入品2"]
    }
  ]
}`;
}
