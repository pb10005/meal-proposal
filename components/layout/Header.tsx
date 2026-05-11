'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email: prompt('メールアドレスを入力してください') ?? '',
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    alert('メールを確認してください');
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-amber-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-amber-700 hover:text-amber-800 transition-colors">
          🍽️ 今日何食べる？
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/history"
            className="text-sm text-gray-600 hover:text-amber-700 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
          >
            履歴
          </Link>
          <Link
            href="/settings"
            className="text-sm text-gray-600 hover:text-amber-700 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
          >
            設定
          </Link>

          {!loading && (
            user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                ログアウト
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignIn}
              >
                ログイン
              </Button>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
