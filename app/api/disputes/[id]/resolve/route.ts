import { NextRequest, NextResponse } from "next/server";
import { db, newId } from "@/lib/db/db";
import { getPayPalClient } from "@/lib/paypal/paypal-client";
import { formatMoney } from "@/lib/format";

/**
 * Human resolution of a dispute.
 * - "release": capture + payout to the freelancer (RESOLVED_RELEASED)
 * - "refund": void the authorization; money returns to the client
 *   (RESOLVED_REFUNDED). Phase 2 maps this to the PayPal void API.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const decision = body?.decision;
  const resolution = body?.resolution?.trim() ?? "";
  if (decision !== "release" && decision !== "refund") {
    return NextResponse.json(
      { error: 'Decision must be "release" or "refund".' },
      { status: 400 }
    );
  }
  if (resolution.length < 10) {
    return NextResponse.json(
      { error: "A resolution note is required." },
      { status: 400 }
    );
  }

  const milestones = await db.listMilestones();
  const milestone = milestones.find((m) => m.dispute?.id === id);
  if (!milestone || !milestone.dispute || milestone.dispute.status !== "OPEN") {
    return NextResponse.json({ error: "Dispute not found or already resolved." }, { status: 404 });
  }

  const paypal = getPayPalClient();
  let reference: string | undefined;

  if (decision === "release" && milestone.paypalOrderId) {
    const capture = await paypal.captureOrder(milestone.paypalOrderId);
    const payout = await paypal.createPayout({
      recipientEmail: "freelancer@example.com",
      amountCents: milestone.amountCents,
      currency: milestone.currency,
      note: `TrustLock dispute release: ${milestone.title}`,
    });
    await db.updateMilestone(milestone.id, {
      status: "RESOLVED_RELEASED",
      paypalCaptureId: capture.id,
      paypalPayoutId: payout.batchId,
    });
    reference = payout.batchId;
  } else {
    await db.updateMilestone(milestone.id, { status: "RESOLVED_REFUNDED" });
    reference = milestone.paypalOrderId;
  }

  await db.updateMilestone(milestone.id, {
    dispute: {
      ...milestone.dispute,
      status: "RESOLVED",
      resolution,
      resolvedAt: new Date().toISOString(),
    },
  });

  await db.addEvent({
    id: newId("ev"),
    milestoneId: milestone.id,
    at: new Date().toISOString(),
    kind: "resolved",
    label:
      decision === "release"
        ? `${formatMoney(milestone.amountCents, milestone.currency)} released after review`
        : `${formatMoney(milestone.amountCents, milestone.currency)} refunded to ${milestone.clientName}`,
    detail: resolution,
    reference,
  });

  const updated = await db.getMilestone(milestone.id);
  return NextResponse.json({ milestone: updated });
}
