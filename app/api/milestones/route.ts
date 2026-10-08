import { NextRequest, NextResponse } from "next/server";
import { db, newId } from "@/lib/db/db";

export async function GET() {
  const milestones = await db.listMilestones();
  return NextResponse.json({ milestones });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });

  const { title, brief, amount, currency, deadline, clientName, freelancerName } = body;

  if (!title?.trim() || !brief?.trim()) {
    return NextResponse.json(
      { error: "Title and brief are required." },
      { status: 400 }
    );
  }
  const amountCents = Math.round(Number(amount) * 100);
  if (!Number.isFinite(amountCents) || amountCents < 100) {
    return NextResponse.json(
      { error: "Amount must be at least 1.00." },
      { status: 400 }
    );
  }
  if (!deadline || Number.isNaN(Date.parse(deadline))) {
    return NextResponse.json({ error: "A valid deadline is required." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const milestone = await db.createMilestone({
    id: newId("ms"),
    title: title.trim(),
    brief: brief.trim(),
    amountCents,
    currency: (currency || "USD").toUpperCase().slice(0, 3),
    deadline: new Date(deadline).toISOString(),
    clientName: clientName?.trim() || "Client",
    freelancerName: freelancerName?.trim() || "Freelancer",
    status: "DRAFT",
    createdAt: now,
    updatedAt: now,
  });

  await db.addEvent({
    id: newId("ev"),
    milestoneId: milestone.id,
    at: now,
    kind: "created",
    label: "Milestone created",
    detail: `Brief agreed by ${milestone.clientName} and ${milestone.freelancerName}.`,
  });

  return NextResponse.json({ milestone }, { status: 201 });
}
