import { NextResponse } from "next/server";
import { db, newId } from "@/lib/db/db";
import { getPayPalClient } from "@/lib/paypal/paypal-client";
import { formatMoney } from "@/lib/format";

/**
 * Release escrowed funds: PayPal capture (authorized -> captured) then a
 * payout to the freelancer. Only allowed from VERIFIED — the AI verdict is
 * the gate. In Phase 2 this is where the agentic money movement happens.
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
  if (milestone.status !== "VERIFIED") {
    return NextResponse.json(
      { error: `Cannot release funds in ${milestone.status} state. AI verification must pass first.` },
      { status: 409 }
    );
  }
  if (!milestone.paypalOrderId) {
    return NextResponse.json({ error: "No authorized order to capture." }, { status: 409 });
  }

  const paypal = getPayPalClient();
  const capture = await paypal.captureOrder(milestone.paypalOrderId);
  const payout = await paypal.createPayout({
    recipientEmail: "freelancer@example.com",
    amountCents: milestone.amountCents,
    currency: milestone.currency,
    note: `TrustLock release: ${milestone.title}`,
  });

  await db.updateMilestone(id, {
    status: "RELEASED",
    paypalCaptureId: capture.id,
    paypalPayoutId: payout.batchId,
  });
  await db.addEvent({
    id: newId("ev"),
    milestoneId: id,
    at: new Date().toISOString(),
    kind: "released",
    label: `${formatMoney(milestone.amountCents, milestone.currency)} released to ${milestone.freelancerName}`,
    detail: "PayPal capture + payout completed.",
    reference: payout.batchId,
  });

  const updated = await db.getMilestone(id);
  return NextResponse.json({ milestone: updated, capture, payout });
}
