'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import type { Mood, MealForm } from '@/types/meal';

type TimeOption = 10 | 20 | 40;

const MOOD_OPTIONS: { value: Mood; label: string; desc: string }[] = [
  { value: 'sappari', label: 'さっぱり', desc: 'あっさり・軽め' },
  { value: 'kottori', label: 'こってり', desc: '濃厚・ボリューム' },
  { value: 'spicy', label: '辛い', desc: 'スパイシー' },
  { value: 'sweet', label: '甘い', desc: 'やさしい・スイーツ系' },
];

const TIME_OPTIONS: { value: TimeOption; label: string }[] = [
  { value: 10, label: '10分' },
  { value: 20, label: '20分' },
  { value: 40, label: '40分〜' },
];

const FORM_OPTIONS: { value: MealForm; label: string; desc: string }[] = [
  { value: 'cook', label: '自炊', desc: '家で作る' },
  { value: 'eat_out', label: '外食', desc: 'レストラン・食堂' },
  { value: 'buy', label: '買って済ます', desc: 'コンビニ・テイクアウト' },
];

export default function HomePage() {
  const router = useRouter();
  const [mood, setMood] = useState<Mood | null>(null);
  const [timeMin, setTimeMin] = useState<TimeOption | null>(null);
  const [form, setForm] = useState<MealForm | null>(null);
  const [freeText, setFreeText] = useState('');

  const isValid = mood !== null && timeMin !== null && form !== null;

  const handleSubmit = () => {
    if (!isValid) return;

    const params = new URLSearchParams({
      mood,
      time_min: String(timeMin),
      form,
      ...(freeText.trim() ? { free_text: freeText.trim() } : {}),
    });

    router.push(`/suggest?${params.toString()}`);
  };

  return (
    <div className="space-y-8 pt-2">
      {/* Hero */}
      <div className="text-center pt-2">
        <p className="text-gray-500 text-sm mt-1">気分と状況を選ぶだけで、ぴったりの食事を3つ提案します</p>
      </div>

      {/* Mood */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          今の気分は？
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMood(opt.value)}
              className={[
                'flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all min-h-[80px] cursor-pointer',
                mood === opt.value
                  ? 'border-amber-500 bg-amber-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50',
              ].join(' ')}
            >
              <span className={`text-base font-bold ${mood === opt.value ? 'text-amber-700' : 'text-gray-800'}`}>
                {opt.label}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Time */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          使える時間は？
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeMin(opt.value)}
              className={[
                'flex items-center justify-center p-4 rounded-2xl border-2 transition-all min-h-[64px] cursor-pointer',
                timeMin === opt.value
                  ? 'border-amber-500 bg-amber-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50',
              ].join(' ')}
            >
              <span className={`text-base font-bold ${timeMin === opt.value ? 'text-amber-700' : 'text-gray-800'}`}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Form */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          食事スタイルは？
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {FORM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setForm(opt.value)}
              className={[
                'flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all min-h-[80px] cursor-pointer',
                form === opt.value
                  ? 'border-amber-500 bg-amber-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50',
              ].join(' ')}
            >
              <span className={`text-sm font-bold ${form === opt.value ? 'text-amber-700' : 'text-gray-800'}`}>
                {opt.label}
              </span>
              <span className="text-xs text-gray-400 mt-0.5 text-center leading-tight">{opt.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Free text */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          その他のリクエスト（任意）
        </h2>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="例：野菜多め、お腹いっぱい食べたい、糖質少なめ…"
          maxLength={200}
          rows={3}
          className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{freeText.length}/200</p>
      </section>

      {/* Submit */}
      <div className="pt-2 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          disabled={!isValid}
        >
          今日の3案を出す ✨
        </Button>
        {!isValid && (
          <p className="text-center text-xs text-gray-400 mt-2">
            気分・時間・スタイルをすべて選んでください
          </p>
        )}
      </div>
    </div>
  );
}
