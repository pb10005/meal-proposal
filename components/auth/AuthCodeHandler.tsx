'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AuthCodeHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) return;

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) console.error('[Auth] code exchange failed:', error.message);
      // Remove ?code= from URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      router.replace(url.pathname + url.search);
    });
  }, [router, searchParams]);

  return null;
}
