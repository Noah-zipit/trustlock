import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";

/** Human review queue: every open dispute with its milestone context. */
export async function GET() {
  const disputes = await db.openDisputes();
  const milestones = await db.listMilestones();
  const byId = new Map(milestones.map((m) => [m.id, m]));
  return NextResponse.json({
    disputes: disputes.map((d) => ({ ...d, milestone: byId.get(d.milestoneId) })),
  });
}
