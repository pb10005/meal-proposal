'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MEAL_CATEGORIES, MEAL_TIMINGS, type MealCategory, type MealForm, type MealTiming } from '@/types/meal';
import { MEAL_CATEGORY_LABELS, MEAL_CATEGORY_ICONS } from '@/config/meal-categories';

interface AddMealModalProps {
  onClose: () => void;
  onAdded: () => void;
}

const FORM_OPTIONS: { value: MealForm; label: string }[] = [
  { value: 'cook', label: '自炊' },
  { value: 'eat_out', label: '外食' },
  { value: 'buy', label: '購入' },
];

const TIMING_OPTIONS: { value: MealTiming; label: string }[] = [
  { value: 'breakfast', label: '朝食' },
  { value: 'lunch', label: '昼食' },
  { value: 'snack', label: 'おやつ' },
  { value: 'dinner', label: '夕食' },
  { value: 'late_night', label: '夜食' },
];

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AddMealModal({ onClose, onAdded }: AddMealModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MealCategory>('other');
  const [form, setForm] = useState<MealForm>('eat_out');
  const [timing, setTiming] = useState<MealTiming | null>(null);
  const [eatenAt, setEatenAt] = useState(toLocalDatetimeValue(new Date()));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          form,
          ...(timing ? { timing } : {}),
          eaten_at: new Date(eatenAt).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? '保存に失敗しました');
      }

      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xl p-6 pb-8 sm:pb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">食事を記録</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              料理名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: カレーライス"
              maxLength={100}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MealCategory)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              {MEAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {MEAL_CATEGORY_ICONS[c]} {MEAL_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">食事タイミング</label>
            <div className="flex flex-wrap gap-2">
              {TIMING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTiming(timing === opt.value ? null : opt.value)}
                  className={[
                    'px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors',
                    timing === opt.value
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">食事タイプ</label>
            <div className="flex gap-2">
              {FORM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(opt.value)}
                  className={[
                    'flex-1 py-2 rounded-xl text-sm font-medium border transition-colors',
                    form === opt.value
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">食べた日時</label>
            <input
              type="datetime-local"
              value={eatenAt}
              onChange={(e) => setEatenAt(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={submitting}
            disabled={!name.trim()}
          >
            記録する
          </Button>
        </form>
      </div>
    </div>
  );
}
