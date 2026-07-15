import { listPlans } from "@/lib/chargebee";

export async function GET() {
  try {
    const plans = await listPlans();
    return Response.json({ plans });
  } catch (error: any) {
    console.error("Error listing Chargebee plans:", error);
    return Response.json(
      { error: error.message || "Failed to list plans" },
      { status: 500 }
    );
  }
}
