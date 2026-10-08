import { NextRequest, NextResponse } from "next/server";
import { db, newId } from "@/lib/db/db";

/**
 * Open a dispute on a milestone. Freezes the escrow: the milestone leaves
 * the automatic flow and waits for a human decision in the review queue.
 * Allowed from FUNDED, SUBMITTED and VERIFIED.
 */
const DISPUTABLE = ["FUNDED", "SUBMITTED", "VERIFIED"] as const;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const milestone = await db.getMilestone(id);
  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found." }, { status: 404 });
  }
  if (!(DISPUTABLE as readonly string[]).includes(milestone.status)) {
    return NextResponse.json(
      { error: `Cannot dispute a milestone in ${milestone.status} state.` },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const reason = body?.reason?.trim() ?? "";
  const openedBy = body?.openedBy === "freelancer" ? "freelancer" : "client";
  if (reason.length < 10) {
    return NextResponse.json(
      { error: "Please describe the dispute in at least a sentence." },
      { status: 400 }
    );
  }

  const dispute = {
    id: newId("dp"),
    milestoneId: id,
    openedBy: openedBy as "client" | "freelancer",
    reason,
    openedAt: new Date().toISOString(),
    status: "OPEN" as const,
  };

  await db.updateMilestone(id, { status: "DISPUTED", dispute });
  await db.addEvent({
    id: newId("ev"),
    milestoneId: id,
    at: new Date().toISOString(),
    kind: "disputed",
    label: `Dispute opened by ${openedBy === "client" ? milestone.clientName : milestone.freelancerName}`,
    detail: reason,
  });

  const updated = await db.getMilestone(id);
  return NextResponse.json({ milestone: updated, dispute }, { status: 201 });
}
