import { ChargebeeError, createCheckout, getItemPrice } from "@/lib/chargebee";
import { logSubscriptionEvent } from "@/lib/subscription-log";

export async function POST(request: Request) {
  try {
    const { planId, email } = await request.json();

    if (!planId || typeof planId !== "string") {
      return Response.json({ error: "planId is required" }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const hostedPage = await createCheckout({
      planId,
      redirectUrl: `${origin}/subscription/success`,
      cancelUrl: `${origin}/#pricing`,
      customerEmail: typeof email === "string" && email ? email : undefined,
    });

    const plan = await getItemPrice(planId).catch(() => null);
    await logSubscriptionEvent({
      event_type: "checkout_created",
      source: "app",
      plan_id: planId,
      status: "checkout_opened",
      amount_cents: plan?.price,
      currency: plan?.currency_code,
      customer_email: typeof email === "string" && email ? email : undefined,
      payload: { hosted_page_id: hostedPage.id },
    });

    return Response.json({ url: hostedPage.url });
  } catch (error: any) {
    console.error("Error creating Chargebee checkout:", error);

    if (error instanceof ChargebeeError) {
      const status = error.status >= 500 ? 502 : 400;
      return Response.json({ error: error.message }, { status });
    }

    return Response.json(
      { error: "Failed to start checkout" },
      { status: 500 }
    );
  }
}
