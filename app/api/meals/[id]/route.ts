import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { MEAL_CATEGORIES, MEAL_TIMINGS } from '@/types/meal';

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.enum(MEAL_CATEGORIES).optional(),
  form: z.enum(['cook', 'eat_out', 'buy']).optional(),
  timing: z.enum(MEAL_TIMINGS).nullable().optional(),
  eaten_at: z.string().datetime().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('meals_log')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('[meals] Failed to update meal:', error);
    return NextResponse.json({ error: 'Failed to update meal' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from('meals_log')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('[meals] Failed to delete meal:', error);
    return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
