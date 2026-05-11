export interface TrackEvent {
  event_name: string;
  properties?: Record<string, unknown>;
}

export async function trackEvent({ event_name, properties = {} }: TrackEvent): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event_name, properties);
  }
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_name, properties }),
    });
  } catch {
    // Analytics should not block the main flow
  }
}
