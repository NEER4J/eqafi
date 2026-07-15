import Link from "next/link";
import { getHostedPage } from "@/lib/chargebee";
import { logSubscriptionEvent } from "@/lib/subscription-log";

export const metadata = {
  title: "Subscription confirmed — Equafi",
};

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const hostedPageId = typeof params.id === "string" ? params.id : undefined;

  let subscription: any = null;
  let customer: any = null;
  let verified = false;

  if (hostedPageId) {
    try {
      const hostedPage = await getHostedPage(hostedPageId);
      if (hostedPage?.state === "succeeded") {
        verified = true;
        subscription = hostedPage.content?.subscription ?? null;
        customer = hostedPage.content?.customer ?? null;

        // event_id is unique in the table, so page reloads don't create duplicates
        await logSubscriptionEvent({
          event_id: `checkout_completed_${hostedPageId}`,
          event_type: "checkout_completed",
          source: "app",
          subscription_id: subscription?.id,
          customer_id: customer?.id ?? subscription?.customer_id,
          customer_email: customer?.email,
          plan_id: subscription?.subscription_items?.[0]?.item_price_id,
          status: subscription?.status,
          amount_cents: subscription?.subscription_items?.[0]?.amount,
          currency: subscription?.currency_code,
          payload: hostedPage.content,
        });
      }
    } catch (error) {
      console.error("Error verifying hosted page:", error);
    }
  }

  const planId = subscription?.subscription_items?.[0]?.item_price_id;

  return (
    <main className="success-page">
      <div className="success-card">
        {verified ? (
          <>
            <p className="eyebrow">Payment received</p>
            <h1>Your subscription is active.</h1>
            <p>
              Thank you{customer?.first_name ? `, ${customer.first_name}` : ""}!
              We&apos;ve emailed a receipt
              {customer?.email ? ` to ${customer.email}` : ""} and our team will
              reach out shortly to begin onboarding.
            </p>
            <dl className="success-details">
              {planId && (
                <div>
                  <dt>Plan</dt>
                  <dd>{planId.replace(/-CAD-Monthly$/, "").replace(/-/g, " ")}</dd>
                </div>
              )}
              {subscription?.id && (
                <div>
                  <dt>Subscription ID</dt>
                  <dd>{subscription.id}</dd>
                </div>
              )}
              {subscription?.status && (
                <div>
                  <dt>Status</dt>
                  <dd>{subscription.status.replace(/_/g, " ")}</dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          <>
            <p className="eyebrow">Almost there</p>
            <h1>We couldn&apos;t confirm your checkout.</h1>
            <p>
              If you completed payment, you&apos;ll receive a confirmation email
              shortly. Otherwise, please try again or contact us at{" "}
              <a href="mailto:info@equafi.ca">info@equafi.ca</a>.
            </p>
          </>
        )}
        <Link className="primary-button" href="/">
          Back to home
        </Link>
      </div>
    </main>
  );
}
