'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MEAL_CATEGORY_LABELS, MEAL_CATEGORY_ICONS } from '@/config/meal-categories';
import { AddMealModal } from '@/components/meal/AddMealModal';
import { EditMealModal } from '@/components/meal/EditMealModal';
import Link from 'next/link';
import type { MealCategory } from '@/types/meal';

interface MealLogEntry {
  id: string;
  name: string;
  category: string;
  form: string;
  timing: string | null;
  eaten_at: string;
}

const FORM_LABELS: Record<string, string> = {
  cook: '自炊',
  eat_out: '外食',
  buy: '購入',
};

const TIMING_LABELS: Record<string, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  snack: 'おやつ',
  dinner: '夕食',
  late_night: '夜食',
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
  const [showModal, setShowModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealLogEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const loadMeals = useCallback(async () => {
    const supabase = createClient();
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
      .select('id, name, category, form, timing, eaten_at')
      .eq('user_id', user.id)
      .order('eaten_at', { ascending: false })
      .limit(50);

    setMeals(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

  const handleAdded = useCallback(() => {
    setShowModal(false);
    setLoading(true);
    loadMeals();
  }, [loadMeals]);

  const handleSaved = useCallback((updated: MealLogEntry) => {
    setMeals((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditingMeal(null);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/meals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('削除に失敗しました');
      setMeals((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setOpenMenuId(null);
    }
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
      <div className="text-center py-20 space-y-4">
        <p className="text-4xl">🔒</p>
        <h2 className="text-lg font-bold text-gray-700">ログインが必要です</h2>
        <p className="text-sm text-gray-500">
          食事履歴を見るにはログインしてください。
          <br />
          履歴は繰り返しを避けるためにも使われます。
        </p>
        <Link
          href="/login"
          className="inline-block mt-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
        >
          ログインする
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">食事履歴</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            最近の食事を参考に、重複しない提案を行います
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
        >
          <span className="text-base leading-none">＋</span>
          記録する
        </button>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">📋</p>
          <h2 className="text-lg font-bold text-gray-700">まだ食事記録がありません</h2>
          <p className="text-sm text-gray-500">
            提案から「これにする」を選ぶか、「記録する」から手動で追加できます。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.map((meal) => {
            const icon = MEAL_CATEGORY_ICONS[meal.category as MealCategory] ?? '🍽️';
            const categoryLabel =
              MEAL_CATEGORY_LABELS[meal.category as MealCategory] ?? meal.category;
            const formLabel = FORM_LABELS[meal.form] ?? meal.form;
            const timingLabel = meal.timing ? TIMING_LABELS[meal.timing] : null;
            const isMenuOpen = openMenuId === meal.id;
            const isDeleting = deletingId === meal.id;

            return (
              <div
                key={meal.id}
                className="bg-white rounded-2xl border border-amber-50 p-4 flex items-center gap-3 relative"
              >
                <span className="text-2xl flex-shrink-0" aria-hidden="true">
                  {icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{meal.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {timingLabel && (
                      <span className="text-amber-600 font-medium">{timingLabel} · </span>
                    )}
                    {categoryLabel} · {formLabel}
                  </p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatDate(meal.eaten_at)}
                </span>

                {/* Menu button */}
                <div className="relative flex-shrink-0" ref={isMenuOpen ? menuRef : null}>
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(isMenuOpen ? null : meal.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="操作メニュー"
                  >
                    ⋮
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-28">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMeal(meal);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
                      >
                        ✎ 編集
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(meal.id)}
                        disabled={isDeleting}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? '削除中…' : '🗑 削除'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <AddMealModal onClose={() => setShowModal(false)} onAdded={handleAdded} />
      )}

      {editingMeal && (
        <EditMealModal
          meal={editingMeal}
          onClose={() => setEditingMeal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
