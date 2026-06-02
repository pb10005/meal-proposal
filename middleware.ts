import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const MIDDLEWARE_TIMEOUT_MS = 1000;

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session with a timeout to prevent Vercel middleware timeout (MIDDLEWARE_INVOCATION_TIMEOUT).
  // getUser() makes a network call to Supabase; on cold starts this can exceed Vercel's ~1.5s limit.
  const timeout = new Promise<void>((resolve) =>
    setTimeout(resolve, MIDDLEWARE_TIMEOUT_MS)
  );
  await Promise.race([supabase.auth.getUser(), timeout]);

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
