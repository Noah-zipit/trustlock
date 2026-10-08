"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type {
  Deliverable,
  Milestone,
  TimelineEvent,
  Verdict,
} from "@/lib/types";
import { formatDate, timeLeft } from "@/lib/format";
import {
  ActionButton,
  Button,
  Card,
  Field,
  inputClass,
  Money,
  StatusBadge,
  Timeline,
  VaultBar,
  VerdictCard,
} from "@/components/ui";

interface Detail {
  milestone: Milestone;
  deliverable?: Deliverable;
  verdict?: Verdict;
  events: TimelineEvent[];
}

async function post(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

function SubmitForm({ id, onDone }: { id: string; onDone: () => void }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post(`/api/milestones/${id}/submit`, { repoUrl, liveUrl, notes });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-[20px] font-semibold">
        Submit your delivery
      </h2>
      <p className="mt-1 text-[14px] text-ink-muted">
        This is what the AI verifier will judge. Link real work; vague notes
        fail the brief-coverage check.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <Field label="Repository URL">
          <input
            className={inputClass}
            type="url"
            placeholder="https://github.com/you/project"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
        </Field>
        <Field label="Live URL">
          <input
            className={inputClass}
            type="url"
            placeholder="https://your-demo.vercel.app"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
          />
        </Field>
        <Field
          label="Delivery notes"
          hint="Say what you built, file by file or feature by feature."
        >
          <textarea
            className={`${inputClass} min-h-[110px] resize-y`}
            placeholder="Implemented the cart review, address form, payment step and confirmation screen. Deployed and tested on mobile."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
        {error && <p className="text-[14px] text-danger">{error}</p>}
        <Button type="submit" loading={busy} className="w-full">
          {busy ? "Submitting…" : "Submit for AI verification"}
        </Button>
      </form>
    </Card>
  );
}

function DisputeForm({ id, onDone }: { id: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [openedBy, setOpenedBy] = useState<"client" | "freelancer">("client");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)} className="!px-3">
        Open a dispute
      </Button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post(`/api/milestones/${id}/dispute`, { reason, openedBy });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-danger/40 p-6">
      <h2 className="font-display text-[20px] font-semibold text-danger">
        Open a dispute
      </h2>
      <p className="mt-1 text-[14px] text-ink-muted">
        This freezes the escrow immediately. A human reviewer decides; the AI
        steps aside.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <Field label="I am the">
          <select
            className={inputClass}
            value={openedBy}
            onChange={(e) => setOpenedBy(e.target.value as "client" | "freelancer")}
          >
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>
        </Field>
        <Field label="What went wrong?">
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            placeholder="Describe the problem in a sentence or two."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </Field>
        {error && <p className="text-[14px] text-danger">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" variant="danger" loading={busy}>
            {busy ? "Opening…" : "Freeze escrow and open dispute"}
          </Button>
          <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function EscrowPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const refresh = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`/api/milestones/${id}`, { cache: "no-store" });
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    setDetail(await res.json());
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (notFound) {
    return (
      <div className="rise mx-auto max-w-2xl text-center">
        <h1 className="font-display text-[32px] font-semibold">
          Milestone not found
        </h1>
        <p className="mt-2 text-ink-muted">
          It may have been removed, or the link is wrong.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button variant="secondary">Back to milestones</Button>
        </Link>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="h-8 w-64 animate-pulse rounded bg-surface-2" />
        <div className="mt-4 h-48 animate-pulse rounded-2xl bg-surface-1" />
      </div>
    );
  }

  const { milestone: m, deliverable, verdict, events } = detail;

  return (
    <div className="rise mx-auto max-w-4xl">
      <Link href="/dashboard" className="text-[14px] text-ink-muted hover:text-ink">
        ← Back to milestones
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-[32px] font-semibold leading-tight tracking-[-0.01em]">
            {m.title}
          </h1>
          <p className="mt-1 text-[14px] text-ink-muted">
            {m.clientName} → {m.freelancerName} · due {formatDate(m.deadline)} (
            {timeLeft(m.deadline)})
          </p>
        </div>
        <StatusBadge status={m.status} />
      </div>

      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[13px] text-ink-faint">Escrow amount</p>
            <Money
              cents={m.amountCents}
              currency={m.currency}
              className="font-display text-[36px] font-semibold tracking-tight"
            />
            {m.paypalOrderId && (
              <p className="money mt-1 text-[12px] text-ink-faint">
                Order {m.paypalOrderId}
                {m.paypalPayoutId && ` · Payout ${m.paypalPayoutId}`}
              </p>
            )}
          </div>
          <div className="w-full max-w-xs">
            <VaultBar status={m.status} />
          </div>
        </div>

        <div className="mt-6 border-t border-hairline pt-5">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            The brief
          </p>
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed">{m.brief}</p>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {m.status === "DRAFT" && (
            <Card className="p-6">
              <h2 className="font-display text-[20px] font-semibold">
                Fund this milestone
              </h2>
              <p className="mt-1 text-[14px] text-ink-muted">
                Authorize the amount through PayPal. It is held in escrow, not
                paid out. The freelancer sees proof of funds before starting.
              </p>
              <div className="mt-5">
                <ActionButton
                  label="Hold funds in escrow"
                  busyLabel="Authorizing…"
                  onClick={async () => {
                    await post(`/api/milestones/${m.id}/fund`);
                    refresh();
                  }}
                />
              </div>
            </Card>
          )}

          {m.status === "FUNDED" && !deliverable && (
            <SubmitForm id={m.id} onDone={refresh} />
          )}

          {deliverable && (
            <Card className="p-6">
              <h2 className="font-display text-[20px] font-semibold">
                Submitted delivery
              </h2>
              <dl className="mt-4 space-y-3 text-[14px]">
                {deliverable.repoUrl && (
                  <div>
                    <dt className="text-ink-faint">Repository</dt>
                    <dd>
                      <a
                        href={deliverable.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-info hover:underline break-all"
                      >
                        {deliverable.repoUrl}
                      </a>
                    </dd>
                  </div>
                )}
                {deliverable.liveUrl && (
                  <div>
                    <dt className="text-ink-faint">Live URL</dt>
                    <dd>
                      <a
                        href={deliverable.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-info hover:underline break-all"
                      >
                        {deliverable.liveUrl}
                      </a>
                    </dd>
                  </div>
                )}
                {deliverable.notes && (
                  <div>
                    <dt className="text-ink-faint">Notes</dt>
                    <dd className="text-ink-muted">{deliverable.notes}</dd>
                  </div>
                )}
              </dl>
            </Card>
          )}

          {m.status === "SUBMITTED" && (
            <Card className="p-6">
              <h2 className="font-display text-[20px] font-semibold">
                AI verification
              </h2>
              <p className="mt-1 text-[14px] text-ink-muted">
                {verdict && !verdict.approved
                  ? "The last verdict did not pass. The freelancer can revise the delivery and you can run verification again."
                  : "Run the verifier to check this delivery against the brief."}
              </p>
              <div className="mt-5">
                <ActionButton
                  label={verdict ? "Re-run AI verification" : "Run AI verification"}
                  busyLabel="Verifying…"
                  onClick={async () => {
                    await post(`/api/milestones/${m.id}/verify`);
                    refresh();
                  }}
                />
              </div>
            </Card>
          )}

          {verdict && <VerdictCard verdict={verdict} />}

          {m.status === "VERIFIED" && (
            <Card className="border-brand/40 p-6">
              <h2 className="font-display text-[20px] font-semibold text-brand">
                Ready to release
              </h2>
              <p className="mt-1 text-[14px] text-ink-muted">
                The AI approved this delivery. Releasing captures the held
                funds and pays out the freelancer in one motion.
              </p>
              <div className="mt-5">
                <ActionButton
                  label="Release payment"
                  busyLabel="Releasing…"
                  confirm="Release the held funds to the freelancer?"
                  onClick={async () => {
                    await post(`/api/milestones/${m.id}/release`);
                    refresh();
                  }}
                />
              </div>
            </Card>
          )}

          {m.status === "RELEASED" && (
            <Card className="border-brand/40 bg-brand/5 p-6">
              <h2 className="font-display text-[20px] font-semibold text-brand">
                Paid out
              </h2>
              <p className="mt-1 text-[14px] text-ink-muted">
                The freelancer received{" "}
                <Money cents={m.amountCents} currency={m.currency} />. The full
                trail is on the timeline.
              </p>
            </Card>
          )}

          {m.status === "DISPUTED" && m.dispute && (
            <Card className="border-danger/40 p-6">
              <h2 className="font-display text-[20px] font-semibold text-danger">
                Under review
              </h2>
              <p className="mt-2 text-[14px] text-ink-muted">
                Opened by{" "}
                {m.dispute.openedBy === "client" ? m.clientName : m.freelancerName}.
              </p>
              <p className="mt-2 text-[15px]">{m.dispute.reason}</p>
              <Link href="/disputes" className="mt-4 inline-block">
                <Button variant="secondary">Open review queue</Button>
              </Link>
            </Card>
          )}

          {(m.status === "RESOLVED_RELEASED" || m.status === "RESOLVED_REFUNDED") &&
            m.dispute?.resolution && (
              <Card className="p-6">
                <h2 className="font-display text-[20px] font-semibold">
                  Dispute resolved
                </h2>
                <p className="mt-2 text-[15px] text-ink-muted">
                  {m.dispute.resolution}
                </p>
              </Card>
            )}

          {["FUNDED", "SUBMITTED", "VERIFIED"].includes(m.status) && (
            <DisputeForm id={m.id} onDone={refresh} />
          )}
        </div>

        <div>
          <h2 className="mb-4 font-display text-[18px] font-semibold">
            Timeline
          </h2>
          <Timeline events={events} />
        </div>
      </div>
    </div>
  );
}
