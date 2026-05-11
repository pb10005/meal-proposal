'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MealCard } from '@/components/meal/MealCard';
import { MealCardSkeleton } from '@/components/meal/MealCardSkeleton';
import { ExclusionReasons } from '@/components/meal/ExclusionReasons';
import { Button } from '@/components/ui/Button';
import type { MealCandidate, SuggestResponse } from '@/types/meal';
import { trackEvent } from '@/lib/analytics/track-client';

function SuggestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<SuggestResponse | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<MealCandidate | null>(null);

  const mood = searchParams.get('mood');
  const timeMin = searchParams.get('time_min');
  const form = searchParams.get('form');
  const freeText = searchParams.get('free_text');

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setAccepted(null);

    if (!mood || !timeMin || !form) {
      setError('条件が不足しています。ホームに戻って再度入力してください。');
      setLoading(false);
      return;
    }

    try {
      const body: Record<string, unknown> = {
        mood,
        time_min: Number(timeMin),
        form,
      };
      if (freeText) body.free_text = freeText;

      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data: SuggestResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提案の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [mood, timeMin, form, freeText]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleAccept = async (candidate: MealCandidate) => {
    if (!response) return;
    setAcceptingId(candidate.id);

    try {
      await fetch('/api/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestion_log_id: response.suggestion_log_id,
          candidate_id: candidate.id,
          name: candidate.name,
          category: candidate.category,
          form: candidate.form,
        }),
      });
      setAccepted(candidate);
    } catch (err) {
      console.error('Accept failed:', err);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReroll = async () => {
    await trackEvent({
      event_name: 'reroll_clicked',
      properties: { mood, time_min: timeMin, form },
    });
    fetchSuggestions();
  };

  const handleChangeConditions = () => {
    router.push('/');
  };

  // Success state
  if (accepted) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="text-5xl">🎉</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            「{accepted.name}」に決定！
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            食事ログに保存しました
          </p>
        </div>
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleReroll}
          >
            また提案してもらう
          </Button>
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={() => router.push('/history')}
          >
            履歴を見る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-lg font-bold text-gray-900">今日の3案</h1>
        <button
          onClick={handleChangeConditions}
          className="text-sm text-amber-600 hover:text-amber-700 underline underline-offset-2"
        >
          条件を変える
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Exclusion reasons */}
      {!loading && response && response.excluded_reasons.length > 0 && (
        <ExclusionReasons reasons={response.excluded_reasons} />
      )}

      {/* Cards */}
      <div className="space-y-4">
        {loading ? (
          <>
            <MealCardSkeleton />
            <MealCardSkeleton />
            <MealCardSkeleton />
          </>
        ) : response ? (
          response.candidates.map((candidate) => (
            <MealCard
              key={candidate.id}
              candidate={candidate}
              onAccept={handleAccept}
              isAccepting={acceptingId === candidate.id}
            />
          ))
        ) : null}
      </div>

      {/* Action buttons */}
      {!loading && !error && (
        <div className="space-y-3 pt-2">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleReroll}
          >
            やり直す（別の3案）
          </Button>
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={handleChangeConditions}
          >
            条件を変える
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SuggestPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 pt-6">
          <MealCardSkeleton />
          <MealCardSkeleton />
          <MealCardSkeleton />
        </div>
      }
    >
      <SuggestContent />
    </Suspense>
  );
}
