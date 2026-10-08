import { NextResponse } from "next/server";
import { db, newId } from "@/lib/db/db";
import { getPayPalClient } from "@/lib/paypal/paypal-client";
import { formatMoney } from "@/lib/format";

/**
 * Fund a milestone: simulates PayPal authorize (intent=AUTHORIZE).
 * Funds are HELD — nothing is paid to the freelancer yet.
 * Only allowed from DRAFT.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const milestone = await db.getMilestone(id);
  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found." }, { status: 404 });
  }
  if (milestone.status !== "DRAFT") {
    return NextResponse.json(
      { error: `Cannot fund a milestone in ${milestone.status} state.` },
      { status: 409 }
    );
  }

  const paypal = getPayPalClient();
  const order = await paypal.createOrder({
    amountCents: milestone.amountCents,
    currency: milestone.currency,
    description: `TrustLock escrow: ${milestone.title}`,
  });

  await db.updateMilestone(id, {
    status: "FUNDED",
    paypalOrderId: order.id,
  });
  await db.addEvent({
    id: newId("ev"),
    milestoneId: id,
    at: new Date().toISOString(),
    kind: "funded",
    label: `${formatMoney(milestone.amountCents, milestone.currency)} held in escrow`,
    detail: "PayPal authorization — funds held, not yet paid.",
    reference: order.id,
  });

  const updated = await db.getMilestone(id);
  return NextResponse.json({ milestone: updated, order });
}
