import {
  ChargebeeError,
  createPortalSession,
  findCustomerByEmail,
} from "@/lib/chargebee";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return Response.json({ error: "email is required" }, { status: 400 });
    }

    const customer = await findCustomerByEmail(email.trim().toLowerCase());
    if (!customer) {
      return Response.json(
        { error: "No subscription found for that email address." },
        { status: 404 }
      );
    }

    const origin = new URL(request.url).origin;
    const session = await createPortalSession(customer.id, `${origin}/`);

    return Response.json({ url: session.access_url });
  } catch (error: any) {
    console.error("Error creating Chargebee portal session:", error);

    if (error instanceof ChargebeeError) {
      const status = error.status >= 500 ? 502 : 400;
      return Response.json({ error: error.message }, { status });
    }

    return Response.json(
      { error: "Failed to open billing portal" },
      { status: 500 }
    );
  }
}
