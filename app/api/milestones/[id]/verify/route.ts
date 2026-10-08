import { NextResponse } from "next/server";
import { db, newId } from "@/lib/db/db";
import { getVerifier } from "@/lib/verifier/verifier";

/**
 * Run AI verification on the submitted deliverable.
 * Approved -> VERIFIED (ready for release). Rejected -> stays SUBMITTED,
 * freelancer can revise and resubmit. Only allowed from SUBMITTED.
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
  if (milestone.status !== "SUBMITTED") {
    return NextResponse.json(
      { error: `Nothing to verify in ${milestone.status} state.` },
      { status: 409 }
    );
  }
  const deliverable = await db.getDeliverable(id);
  if (!deliverable) {
    return NextResponse.json({ error: "No deliverable submitted yet." }, { status: 409 });
  }

  const verifier = getVerifier();
  const verdict = await verifier.verifyDeliverable(milestone, deliverable);
  await db.addVerdict(verdict);

  if (verdict.approved) {
    await db.updateStatus(id, "VERIFIED");
    await db.addEvent({
      id: newId("ev"),
      milestoneId: id,
      at: new Date().toISOString(),
      kind: "verified",
      label: "AI verification passed",
      detail: `Confidence ${Math.round(verdict.confidence * 100)}% — ${verdict.checks.filter((c) => c.passed).length} of ${verdict.checks.length} checks passed.`,
      reference: verdict.id,
    });
  } else {
    await db.addEvent({
      id: newId("ev"),
      milestoneId: id,
      at: new Date().toISOString(),
      kind: "note",
      label: "AI verification did not pass",
      detail: verdict.reasoning,
      reference: verdict.id,
    });
  }

  const updated = await db.getMilestone(id);
  return NextResponse.json({ verdict, milestone: updated });
}
