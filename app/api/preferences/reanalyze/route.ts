import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inferPreferences } from '@/lib/preferences/infer';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await inferPreferences(supabase, user.id);

  try {
    await supabase.from('preferences').upsert({
      user_id: user.id,
      inferred_likes: result.inferred_likes,
      inferred_categories: result.inferred_categories,
      inferred_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[reanalyze] Failed to save inferred preferences:', err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    inferred_likes: result.inferred_likes,
    inferred_categories: result.inferred_categories,
    inferred_at: new Date().toISOString(),
  });
}
