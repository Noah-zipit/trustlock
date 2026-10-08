import Link from "next/link";
import { db } from "@/lib/db/db";
import { timeLeft } from "@/lib/format";
import { Button, Card, EmptyState, Money, StatusBadge } from "@/components/ui";

export default async function DashboardPage() {
  const milestones = await db.listMilestones();
  const openDisputes = await db.openDisputes();

  return (
    <div className="rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] font-semibold tracking-[-0.01em]">
            Milestones
          </h1>
          <p className="mt-1 text-[15px] text-ink-muted">
            Every milestone below is a live escrow. Fund it, deliver against
            it, let the AI verify, watch the money move.
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button>New milestone</Button>
        </Link>
      </div>

      {openDisputes.length > 0 && (
        <Link
          href="/disputes"
          className="mt-6 flex items-center justify-between rounded-xl border border-danger/40 bg-danger/10 px-5 py-4"
        >
          <span className="text-[14px] font-medium text-danger">
            {openDisputes.length} dispute{openDisputes.length > 1 ? "s" : ""}{" "}
            waiting for human review
          </span>
          <span className="text-[14px] text-danger">Review →</span>
        </Link>
      )}

      {milestones.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No milestones yet"
            body="Create the first one. You will play both sides: fund it as the client, deliver as the freelancer."
            action={
              <Link href="/dashboard/new">
                <Button>Create a milestone</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {milestones.map((m) => (
            <Link key={m.id} href={`/escrow/${m.id}`}>
              <Card className="h-full p-5 transition-colors hover:border-ink-faint">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-[18px] font-semibold leading-snug">
                    {m.title}
                  </h2>
                  <StatusBadge status={m.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-[14px] text-ink-muted">
                  {m.brief}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
                  <Money
                    cents={m.amountCents}
                    currency={m.currency}
                    className="font-display text-[20px] font-semibold"
                  />
                  <span className="text-[13px] text-ink-faint">
                    {m.clientName} → {m.freelancerName} · {timeLeft(m.deadline)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
