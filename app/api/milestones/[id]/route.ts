import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const milestone = await db.getMilestone(id);
  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found." }, { status: 404 });
  }
  const [deliverable, verdict, events] = await Promise.all([
    db.getDeliverable(id),
    db.getVerdict(id),
    db.eventsFor(id),
  ]);
  return NextResponse.json({ milestone, deliverable, verdict, events });
}
