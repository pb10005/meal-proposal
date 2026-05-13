import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { MEAL_CATEGORIES } from '@/types/meal';

const schema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(MEAL_CATEGORIES),
  form: z.enum(['cook', 'eat_out', 'buy']),
  eaten_at: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, category, form, eaten_at } = parsed.data;

  const { data, error } = await supabase
    .from('meals_log')
    .insert({
      user_id: user.id,
      name,
      category,
      form,
      eaten_at: eaten_at ?? new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[meals] Failed to insert meal log:', error);
    return NextResponse.json({ error: 'Failed to save meal' }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
