'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Phase = 'input' | 'sent';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const emailRedirectTo = `${window.location.origin}/auth/callback`;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo },
    });

    setLoading(false);

    if (authError) {
      setError('メールの送信に失敗しました。アドレスを確認して再度お試しください。');
      return;
    }

    setPhase('sent');
  };

  if (phase === 'sent') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="text-6xl">📬</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">メールを送信しました</h1>
            <p className="text-sm text-gray-500 mt-2">
              <span className="font-medium text-gray-700">{email}</span> に
              <br />
              ログインリンクを送りました。
              <br />
              メールを確認してリンクをクリックしてください。
            </p>
          </div>
          <p className="text-xs text-gray-400">
            メールが届かない場合は迷惑メールフォルダもご確認ください。
          </p>
          <button
            type="button"
            onClick={() => {
              setPhase('input');
              setEmail('');
            }}
            className="text-sm text-amber-600 hover:text-amber-700 underline underline-offset-2"
          >
            別のメールアドレスで再送する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <p className="text-5xl">🍽️</p>
          <h1 className="text-2xl font-bold text-gray-900">今日何食べる？</h1>
          <p className="text-sm text-gray-500">
            ログインして食事履歴や好み設定を使いましょう
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-gray-800">メールでログイン</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              パスワード不要 — リンクをクリックするだけ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                autoComplete="email"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-amber-200 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  送信中…
                </>
              ) : (
                'ログインリンクを送る'
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <p className="text-center text-sm text-gray-400">
          <Link href="/" className="text-amber-600 hover:text-amber-700 underline underline-offset-2">
            ← トップに戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
