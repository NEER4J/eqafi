/**
 * Server-side Chargebee client (Product Catalog 2.0) using the REST API directly.
 * Requires CHARGEBEE_SITE and CHARGEBEE_API_KEY environment variables.
 */

function getConfig() {
  const site = process.env.CHARGEBEE_SITE;
  const apiKey = process.env.CHARGEBEE_API_KEY;
  if (!site || !apiKey) {
    throw new Error(
      "Chargebee is not configured: set CHARGEBEE_SITE and CHARGEBEE_API_KEY"
    );
  }
  return { baseUrl: `https://${site}.chargebee.com/api/v2`, apiKey };
}

export class ChargebeeError extends Error {
  status: number;
  apiErrorCode?: string;

  constructor(status: number, message: string, apiErrorCode?: string) {
    super(message);
    this.status = status;
    this.apiErrorCode = apiErrorCode;
  }
}

async function chargebeeRequest(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  data?: Record<string, string | number | boolean | undefined>
) {
  const { baseUrl, apiKey } = getConfig();

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    cache: "no-store",
  };

  if (data && method === "POST") {
    const form = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        form.append(key, String(value));
      }
    }
    options.body = form.toString();
  }

  const response = await fetch(`${baseUrl}${endpoint}`, options);
  const text = await response.text();

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ChargebeeError(
      response.status,
      `Chargebee returned a non-JSON response (${response.status})`
    );
  }

  if (!response.ok) {
    throw new ChargebeeError(
      response.status,
      json.message || `Chargebee API error (${response.status})`,
      json.api_error_code
    );
  }

  return json;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currencyCode: string;
  period: number;
  periodUnit: string;
}

/** List active plan item prices, optionally filtered to Equafi plans. */
export async function listPlans(): Promise<Plan[]> {
  const result = await chargebeeRequest(
    "/item_prices?limit=100&item_type[is]=plan&status[is]=active"
  );

  return (result.list as any[]).map(({ item_price: p }) => ({
    id: p.id,
    name: p.external_name || p.name,
    price: p.price,
    currencyCode: p.currency_code,
    period: p.period,
    periodUnit: p.period_unit,
  }));
}

/** Retrieve a single item price (plan) by ID. */
export async function getItemPrice(itemPriceId: string) {
  const result = await chargebeeRequest(
    `/item_prices/${encodeURIComponent(itemPriceId)}`
  );
  return result.item_price;
}

/** Create a hosted checkout page for a new subscription. */
export async function createCheckout(options: {
  planId: string;
  redirectUrl: string;
  cancelUrl?: string;
  customerEmail?: string;
}) {
  const data: Record<string, string> = {
    "subscription_items[item_price_id][0]": options.planId,
    redirect_url: options.redirectUrl,
  };
  if (options.cancelUrl) data.cancel_url = options.cancelUrl;
  if (options.customerEmail) data["customer[email]"] = options.customerEmail;

  const result = await chargebeeRequest(
    "/hosted_pages/checkout_new_for_items",
    "POST",
    data
  );
  return result.hosted_page as { id: string; url: string };
}

/** Retrieve a hosted page (used to confirm checkout on the success page). */
export async function getHostedPage(hostedPageId: string) {
  const result = await chargebeeRequest(
    `/hosted_pages/${encodeURIComponent(hostedPageId)}`
  );
  return result.hosted_page;
}

/** Find a customer by email address. Returns null when none exists. */
export async function findCustomerByEmail(email: string) {
  const params = new URLSearchParams({ "email[is]": email, limit: "1" });
  const result = await chargebeeRequest(`/customers?${params.toString()}`);
  return result.list?.[0]?.customer ?? null;
}

/** Create a self-serve portal session so a customer can manage billing. */
export async function createPortalSession(customerId: string, redirectUrl: string) {
  const result = await chargebeeRequest("/portal_sessions", "POST", {
    "customer[id]": customerId,
    redirect_url: redirectUrl,
  });
  return result.portal_session as { access_url: string };
}
