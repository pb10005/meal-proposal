'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { MEAL_CATEGORY_LABELS } from '@/config/meal-categories';
import type { UserPreferences, MealCategory } from '@/types/meal';

type SafetyPrefKey = 'allergies' | 'dietary_restrictions';

const SECTION_CONFIG: {
  key: SafetyPrefKey;
  label: string;
  placeholder: string;
  desc: string;
  color: 'purple' | 'blue';
}[] = [
  {
    key: 'allergies',
    label: 'アレルギー',
    placeholder: '例: 卵、小麦、乳製品',
    desc: '必ず除外します（重要）',
    color: 'purple',
  },
  {
    key: 'dietary_restrictions',
    label: '食事制限',
    placeholder: '例: ベジタリアン、低糖質、ハラール',
    desc: '必ず考慮します',
    color: 'blue',
  },
];

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Pick<UserPreferences, SafetyPrefKey>>({
    allergies: [],
    dietary_restrictions: [],
  });
  const [inputs, setInputs] = useState<Record<SafetyPrefKey, string>>({
    allergies: '',
    dietary_restrictions: '',
  });
  const [inferredLikes, setInferredLikes] = useState<string[]>([]);
  const [inferredCategories, setInferredCategories] = useState<MealCategory[]>([]);
  const [inferredAt, setInferredAt] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);

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
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPrefs({
          allergies: data.allergies ?? [],
          dietary_restrictions: data.dietary_restrictions ?? [],
        });
        setInferredLikes((data.inferred_likes ?? []) as string[]);
        setInferredCategories((data.inferred_categories ?? []) as MealCategory[]);
        setInferredAt(data.inferred_at ?? null);
      }

      setLoading(false);
    }

    load();
  }, []);

  const addItem = (key: SafetyPrefKey) => {
    const value = inputs[key].trim();
    if (!value) return;

    const items = value
      .split(/[,、，]/)
      .map((s) => s.trim())
      .filter(Boolean);

    setPrefs((prev) => ({
      ...prev,
      [key]: [...new Set([...prev[key], ...items])],
    }));
    setInputs((prev) => ({ ...prev, [key]: '' }));
  };

  const removeItem = (key: SafetyPrefKey, item: string) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: prev[key].filter((i) => i !== item),
    }));
  };

  const handleSave = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setSaving(true);
    try {
      await supabase.from('preferences').upsert({
        user_id: user.id,
        allergies: prefs.allergies,
        dietary_restrictions: prefs.dietary_restrictions,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await fetch('/api/preferences/reanalyze', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setInferredLikes(data.inferred_likes ?? []);
        setInferredCategories(data.inferred_categories ?? []);
        setInferredAt(data.inferred_at ?? new Date().toISOString());
      }
    } catch (err) {
      console.error('Reanalyze failed:', err);
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 pt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-100 rounded-xl" />
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
          好みの設定を保存するにはログインしてください。
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
      <div>
        <h1 className="text-xl font-bold text-gray-900">好み設定</h1>
        <p className="text-sm text-gray-500 mt-1">
          食事ログをもとにAIが好みを自動分析します
        </p>
      </div>

      {/* Inferred preferences (read-only) */}
      <div className="bg-white rounded-2xl border border-amber-50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">AIが分析した好み</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              食事ログから自動で推定されます
              {inferredAt &&
                ` · ${new Date(inferredAt).toLocaleDateString('ja-JP')}更新`}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReanalyze}
            isLoading={reanalyzing}
          >
            再分析する
          </Button>
        </div>

        {inferredLikes.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1.5">よく食べる料理</p>
            <div className="flex flex-wrap gap-2">
              {inferredLikes.map((name) => (
                <Tag key={name} color="green">
                  {name}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {inferredCategories.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1.5">よく選ぶカテゴリ</p>
            <div className="flex flex-wrap gap-2">
              {inferredCategories.map((cat) => (
                <Tag key={cat} color="amber">
                  {MEAL_CATEGORY_LABELS[cat] ?? cat}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {inferredLikes.length === 0 && inferredCategories.length === 0 && (
          <p className="text-sm text-gray-400">
            まだデータが不足しています。食事を記録すると自動で分析されます。
          </p>
        )}
      </div>

      {/* Safety preferences (manual input) */}
      {SECTION_CONFIG.map(({ key, label, placeholder, desc, color }) => (
        <div key={key} className="bg-white rounded-2xl border border-amber-50 p-5 space-y-3">
          <div>
            <h2 className="font-semibold text-gray-900">{label}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </div>

          {prefs[key].length > 0 && (
            <div className="flex flex-wrap gap-2">
              {prefs[key].map((item) => (
                <button
                  key={item}
                  onClick={() => removeItem(key, item)}
                  className="inline-flex items-center gap-1 group"
                  title={`${item}を削除`}
                >
                  <Tag color={color}>
                    {item}
                    <span className="ml-1 text-xs opacity-60 group-hover:opacity-100">×</span>
                  </Tag>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={inputs[key]}
              onChange={(e) => setInputs((prev) => ({ ...prev, [key]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem(key);
                }
              }}
              placeholder={placeholder}
              className="flex-1 rounded-xl border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => addItem(key)}
              disabled={!inputs[key].trim()}
            >
              追加
            </Button>
          </div>
        </div>
      ))}

      <div className="pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSave}
          isLoading={saving}
        >
          {saved ? '保存しました ✓' : '設定を保存する'}
        </Button>
      </div>
    </div>
  );
}
