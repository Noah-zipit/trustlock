import { NextRequest, NextResponse } from "next/server";
import { db, newId } from "@/lib/db/db";

/**
 * Freelancer submits (or revises) a deliverable for AI verification.
 * Allowed from FUNDED (first submission) and SUBMITTED (revision after a
 * failed verification).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const milestone = await db.getMilestone(id);
  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found." }, { status: 404 });
  }
  if (milestone.status !== "FUNDED" && milestone.status !== "SUBMITTED") {
    return NextResponse.json(
      { error: `Cannot submit a deliverable in ${milestone.status} state.` },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const repoUrl = body?.repoUrl?.trim() ?? "";
  const liveUrl = body?.liveUrl?.trim() ?? "";
  const notes = body?.notes?.trim() ?? "";
  if (!repoUrl && !liveUrl && !notes) {
    return NextResponse.json(
      { error: "Provide at least one piece of evidence." },
      { status: 400 }
    );
  }

  const deliverable = await db.addDeliverable({
    id: newId("dl"),
    milestoneId: id,
    repoUrl,
    liveUrl,
    notes,
    submittedAt: new Date().toISOString(),
  });

  await db.updateStatus(id, "SUBMITTED");
  await db.addEvent({
    id: newId("ev"),
    milestoneId: id,
    at: new Date().toISOString(),
    kind: "submitted",
    label: "Deliverable submitted",
    detail: "Repo, live URL and notes provided for AI verification.",
  });

  return NextResponse.json({ deliverable }, { status: 201 });
}
