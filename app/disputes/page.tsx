"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Dispute, Milestone } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import {
  Button,
  Card,
  EmptyState,
  Field,
  inputClass,
  Money,
} from "@/components/ui";

interface QueueItem extends Dispute {
  milestone?: Milestone;
}

function ResolveForm({ dispute, onDone }: { dispute: QueueItem; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Resolve
      </Button>
    );
  }

  async function decide(decision: "release" | "refund") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/disputes/${dispute.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, resolution }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not resolve.");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border-t border-hairline pt-4">
      <Field label="Resolution note (visible to both parties)">
        <textarea
          className={`${inputClass} min-h-[90px] resize-y`}
          placeholder="Explain the decision in a sentence or two."
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
        />
      </Field>
      {error && <p className="mt-2 text-[13px] text-danger">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        <Button loading={busy} onClick={() => decide("release")}>
          {busy ? "Working…" : "Release to freelancer"}
        </Button>
        <Button
          variant="secondary"
          loading={busy}
          onClick={() => decide("refund")}
        >
          Refund to client
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default function DisputesPage() {
  const [items, setItems] = useState<QueueItem[] | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/disputes", { cache: "no-store" });
    const data = await res.json();
    setItems(data.disputes ?? []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="rise">
      <h1 className="font-display text-[32px] font-semibold tracking-[-0.01em]">
        Review queue
      </h1>
      <p className="mt-1 max-w-2xl text-[15px] text-ink-muted">
        Disputes freeze the escrow. The AI steps aside here; a human reads both
        sides and decides where the money goes.
      </p>

      {items === null ? (
        <div className="mt-8 h-40 animate-pulse rounded-2xl bg-surface-1" />
      ) : items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Queue is clear"
            body="No open disputes. When a client or freelancer opens one, it lands here for a human decision."
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((d) => (
            <Card key={d.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/escrow/${d.milestoneId}`}
                    className="font-display text-[20px] font-semibold hover:underline"
                  >
                    {d.milestone?.title ?? d.milestoneId}
                  </Link>
                  <p className="mt-1 text-[13px] text-ink-faint">
                    Opened by {d.openedBy} · {formatDateTime(d.openedAt)}
                  </p>
                </div>
                {d.milestone && (
                  <Money
                    cents={d.milestone.amountCents}
                    currency={d.milestone.currency}
                    className="font-display text-[22px] font-semibold"
                  />
                )}
              </div>
              <p className="mt-3 text-[15px] leading-relaxed">{d.reason}</p>
              <ResolveForm dispute={d} onDone={refresh} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
