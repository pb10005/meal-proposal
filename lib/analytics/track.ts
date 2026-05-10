import { createClient } from '@/lib/supabase/server';

export interface TrackEvent {
  event_name: string;
  properties?: Record<string, unknown>;
  user_id?: string | null;
}

export async function trackEvent({
  event_name,
  properties = {},
  user_id = null,
}: TrackEvent): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event_name, properties);
  }

  try {
    const supabase = await createClient();
    await supabase.from('events_log').insert({
      event_name,
      properties,
      user_id,
    });
  } catch (error) {
    // Analytics should not block the main flow
    console.error('[Analytics] Failed to track event:', error);
  }
}
