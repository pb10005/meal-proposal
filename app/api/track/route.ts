import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  event_name: z.string(),
  properties: z.record(z.unknown()).optional().default({}),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('events_log').insert({
      event_name: body.event_name,
      properties: body.properties,
      user_id: user?.id ?? null,
    });
  } catch {
    // Analytics must not break the caller
  }
  return NextResponse.json({ ok: true });
}
