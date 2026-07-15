import { timingSafeEqual } from "crypto";
import { logSubscriptionEvent } from "@/lib/subscription-log";

/**
 * Chargebee webhook endpoint.
 *
 * Configure in Chargebee under Settings > Configure Chargebee > Webhooks with
 * Basic Auth using CHARGEBEE_WEBHOOK_USERNAME / CHARGEBEE_WEBHOOK_PASSWORD.
 */

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

function isAuthorized(request: Request) {
  const username = process.env.CHARGEBEE_WEBHOOK_USERNAME;
  const password = process.env.CHARGEBEE_WEBHOOK_PASSWORD;

  if (!username || !password) {
    console.error(
      "CHARGEBEE_WEBHOOK_USERNAME/CHARGEBEE_WEBHOOK_PASSWORD not set; rejecting webhook"
    );
    return false;
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const separator = decoded.indexOf(":");
  if (separator === -1) return false;

  return (
    safeEqual(decoded.slice(0, separator), username) &&
    safeEqual(decoded.slice(separator + 1), password)
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: any;
  try {
    event = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!event?.event_type) {
    return Response.json({ error: "Missing event_type" }, { status: 400 });
  }

  const subscription = event.content?.subscription;
  const customer = event.content?.customer;
  const invoice = event.content?.invoice;
  const transaction = event.content?.transaction;

  await logSubscriptionEvent({
    event_id: event.id,
    event_type: event.event_type,
    source: "chargebee_webhook",
    subscription_id: subscription?.id ?? invoice?.subscription_id,
    customer_id:
      subscription?.customer_id ?? customer?.id ?? invoice?.customer_id,
    customer_email: customer?.email ?? invoice?.email,
    plan_id: subscription?.subscription_items?.[0]?.item_price_id,
    status: subscription?.status ?? invoice?.status ?? transaction?.status,
    amount_cents:
      invoice?.total ??
      transaction?.amount ??
      subscription?.subscription_items?.[0]?.amount ??
      subscription?.mrr,
    currency:
      subscription?.currency_code ??
      invoice?.currency_code ??
      transaction?.currency_code,
    occurred_at: event.occurred_at
      ? new Date(event.occurred_at * 1000).toISOString()
      : undefined,
    payload: event.content,
  });

  switch (event.event_type) {
    case "subscription_created":
    case "subscription_activated":
    case "subscription_changed":
    case "subscription_renewed":
    case "subscription_reactivated":
    case "subscription_cancelled":
      console.log(
        `Chargebee webhook: ${event.event_type}`,
        JSON.stringify({
          subscriptionId: subscription?.id,
          status: subscription?.status,
          planId: subscription?.subscription_items?.[0]?.item_price_id,
          customerId: subscription?.customer_id,
          customerEmail: customer?.email,
        })
      );
      break;

    case "payment_succeeded":
    case "payment_failed":
      console.log(
        `Chargebee webhook: ${event.event_type}`,
        JSON.stringify({
          invoiceId: event.content?.invoice?.id,
          transactionId: event.content?.transaction?.id,
          customerId: event.content?.transaction?.customer_id,
        })
      );
      break;

    default:
      console.log(`Chargebee webhook: unhandled event ${event.event_type}`);
  }

  return Response.json({ received: true });
}
