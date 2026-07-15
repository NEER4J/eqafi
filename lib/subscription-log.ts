/**
 * Persists subscription activity to the `eqafi_subscription_events` table in Supabase
 * via PostgREST, using the service role key (server-side only).
 *
 * Logging must never break checkout or webhook processing, so failures are
 * logged to the console and swallowed.
 */

export interface SubscriptionEvent {
  event_id?: string;
  event_type: string;
  source: "chargebee_webhook" | "app";
  subscription_id?: string;
  customer_id?: string;
  customer_email?: string;
  plan_id?: string;
  status?: string;
  amount_cents?: number;
  currency?: string;
  occurred_at?: string;
  payload?: unknown;
}

export async function logSubscriptionEvent(event: SubscriptionEvent) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn("Supabase not configured; skipping subscription event log");
    return;
  }

  if (!event.occurred_at) {
    event = { ...event, occurred_at: new Date().toISOString() };
  }

  try {
    // on_conflict=event_id + ignore-duplicates makes webhook retries idempotent
    const response = await fetch(
      `${url}/rest/v1/eqafi_subscription_events?on_conflict=event_id`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify(event),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to log subscription event (${response.status}):`,
        await response.text()
      );
    }
  } catch (error) {
    console.error("Failed to log subscription event:", error);
  }
}
