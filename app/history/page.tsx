'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MEAL_CATEGORY_LABELS, MEAL_CATEGORY_ICONS } from '@/config/meal-categories';
import type { MealCategory } from '@/types/meal';

interface MealLogEntry {
  id: string;
  name: string;
  category: string;
  form: string;
  eaten_at: string;
}

const FORM_LABELS: Record<string, string> = {
  cook: '自炊',
  eat_out: '外食',
  buy: '購入',
};

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '昨日';
  if (diffDays < 7) return `${diffDays}日前`;

  return date.toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
  });
}

export default function HistoryPage() {
  const [meals, setMeals] = useState<MealLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data } = await supabase
        .from('meals_log')
        .select('id, name, category, form, eaten_at')
        .eq('user_id', user.id)
        .order('eaten_at', { ascending: false })
        .limit(50);

      setMeals(data ?? []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 pt-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-4xl">🔒</p>
        <h2 className="text-lg font-bold text-gray-700">ログインが必要です</h2>
        <p className="text-sm text-gray-500">
          食事履歴を見るにはログインしてください。
          <br />
          履歴は繰り返しを避けるためにも使われます。
        </p>
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-4xl">📋</p>
        <h2 className="text-lg font-bold text-gray-700">まだ食事記録がありません</h2>
        <p className="text-sm text-gray-500">
          提案から「これにする」を選ぶと自動で記録されます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-2">
      <h1 className="text-xl font-bold text-gray-900">食事履歴</h1>
      <p className="text-sm text-gray-500 -mt-3">
        最近の食事を参考に、重複しない提案を行います
      </p>

      <div className="space-y-3">
        {meals.map((meal) => {
          const icon = MEAL_CATEGORY_ICONS[meal.category as MealCategory] ?? '🍽️';
          const categoryLabel =
            MEAL_CATEGORY_LABELS[meal.category as MealCategory] ?? meal.category;
          const formLabel = FORM_LABELS[meal.form] ?? meal.form;

          return (
            <div
              key={meal.id}
              className="bg-white rounded-2xl border border-amber-50 p-4 flex items-center gap-3"
            >
              <span className="text-2xl flex-shrink-0" aria-hidden="true">
                {icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{meal.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {categoryLabel} · {formLabel}
                </p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {formatDate(meal.eaten_at)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
