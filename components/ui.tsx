"use client";

import { useState } from "react";
import type { MilestoneStatus, TimelineEvent, Verdict } from "@/lib/types";
import { formatDateTime, formatMoney } from "@/lib/format";

/* ---------------------------------- Button --------------------------------- */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const styles = {
    primary:
      "bg-brand text-[#06281c] hover:bg-[#46e0ab] font-semibold",
    secondary:
      "bg-surface-2 text-ink border border-hairline hover:border-ink-faint",
    danger: "bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25",
    ghost: "text-ink-muted hover:text-ink",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-3 text-[15px] transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}

/* ----------------------------------- Card ---------------------------------- */

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-hairline bg-surface-1 ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------------------------------- Badge ---------------------------------- */

const STATUS_STYLE: Record<MilestoneStatus, string> = {
  DRAFT: "bg-surface-2 text-ink-muted border-hairline",
  FUNDED: "bg-held/15 text-held border-held/40",
  SUBMITTED: "bg-info/15 text-info border-info/40",
  VERIFIED: "bg-brand/15 text-brand border-brand/40",
  RELEASED: "bg-brand/15 text-brand border-brand/40",
  DISPUTED: "bg-danger/15 text-danger border-danger/40",
  RESOLVED_RELEASED: "bg-brand/15 text-brand border-brand/40",
  RESOLVED_REFUNDED: "bg-surface-2 text-ink-muted border-hairline",
};

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  DRAFT: "Draft",
  FUNDED: "Funds held",
  SUBMITTED: "In verification",
  VERIFIED: "Verified",
  RELEASED: "Released",
  DISPUTED: "Disputed",
  RESOLVED_RELEASED: "Resolved · released",
  RESOLVED_REFUNDED: "Resolved · refunded",
};

export function StatusBadge({ status }: { status: MilestoneStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-medium ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ---------------------------------- Money ---------------------------------- */

export function Money({
  cents,
  currency,
  className = "",
}: {
  cents: number;
  currency: string;
  className?: string;
}) {
  return (
    <span className={`money ${className}`}>{formatMoney(cents, currency)}</span>
  );
}

/* --------------------------------- VaultBar --------------------------------- */

const STAGES = ["FUNDED", "SUBMITTED", "VERIFIED", "RELEASED"] as const;

export function VaultBar({ status }: { status: MilestoneStatus }) {
  const order: Record<string, number> = {
    DRAFT: -1,
    FUNDED: 0,
    SUBMITTED: 1,
    VERIFIED: 2,
    RELEASED: 3,
    RESOLVED_RELEASED: 3,
    DISPUTED: -2,
    RESOLVED_REFUNDED: -2,
  };
  const pos = order[status] ?? -1;
  const labels = ["Held", "Submitted", "Verified", "Released"];

  if (status === "DISPUTED") {
    return (
      <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-[14px] text-danger">
        Escrow frozen — dispute under human review. No money moves until it is resolved.
      </div>
    );
  }
  if (status === "RESOLVED_REFUNDED") {
    return (
      <div className="rounded-xl border border-hairline bg-surface-2 px-4 py-3 text-[14px] text-ink-muted">
        Escrow closed — funds returned to the client after review.
      </div>
    );
  }

  return (
    <div aria-label="Escrow progress">
      <div className="flex gap-1.5">
        {STAGES.map((s, i) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full ${
              i <= pos ? "bg-brand" : "bg-surface-2"
            }`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-ink-faint">
        {labels.map((l, i) => (
          <span key={l} className={i <= pos ? "text-ink-muted" : ""}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Timeline --------------------------------- */

const KIND_DOT: Record<TimelineEvent["kind"], string> = {
  created: "bg-ink-faint",
  funded: "bg-held",
  submitted: "bg-info",
  verified: "bg-brand",
  released: "bg-brand",
  disputed: "bg-danger",
  resolved: "bg-ink-muted",
  note: "bg-ink-faint",
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-ink-faint text-[14px]">No activity yet.</p>;
  }
  return (
    <ol className="relative space-y-5 border-l border-hairline pl-6">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span
            className={`absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full ${KIND_DOT[e.kind]}`}
            aria-hidden
          />
          <p className="text-[15px] font-medium">{e.label}</p>
          {e.detail && (
            <p className="mt-0.5 text-[14px] text-ink-muted">{e.detail}</p>
          )}
          <p className="mt-1 text-[12px] text-ink-faint">
            {formatDateTime(e.at)}
            {e.reference && (
              <span className="money ml-2 rounded bg-surface-2 px-1.5 py-0.5">
                {e.reference}
              </span>
            )}
          </p>
        </li>
      ))}
    </ol>
  );
}

/* -------------------------------- VerdictCard -------------------------------- */

export function VerdictCard({ verdict }: { verdict: Verdict }) {
  const pct = Math.round(verdict.confidence * 100);
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`font-display text-[20px] font-semibold ${
              verdict.approved ? "text-brand" : "text-danger"
            }`}
          >
            {verdict.approved ? "Approved for release" : "Did not pass"}
          </p>
          <p className="mt-1 text-[14px] text-ink-muted">{verdict.reasoning}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="money font-display text-[28px] font-semibold">{pct}%</p>
          <p className="text-[12px] text-ink-faint">confidence</p>
        </div>
      </div>
      <div
        className="mt-3 h-1.5 rounded-full bg-surface-2"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Verification confidence"
      >
        <div
          className={`h-full rounded-full ${verdict.approved ? "bg-brand" : "bg-danger"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="mt-4 space-y-3">
        {verdict.checks.map((c) => (
          <li key={c.name} className="flex gap-3">
            <span
              aria-hidden
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                c.passed ? "bg-brand/20 text-brand" : "bg-danger/20 text-danger"
              }`}
            >
              {c.passed ? "✓" : "×"}
            </span>
            <div>
              <p className="text-[14px] font-medium">{c.name}</p>
              <p className="text-[13px] text-ink-muted">{c.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] text-ink-faint">
        Verified by TrustLock AI ({verdict.engine} engine) ·{" "}
        {formatDateTime(verdict.createdAt)}
      </p>
    </Card>
  );
}

/* --------------------------------- EmptyState -------------------------------- */

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-hairline px-6 py-14 text-center">
      <p className="font-display text-[20px] font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[14px] text-ink-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ----------------------------------- Field ----------------------------------- */

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-medium">{label}</span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-[13px] text-ink-faint">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-[13px] text-danger">{error}</span>
      )}
    </label>
  );
}

export const inputClass =
  "w-full rounded-[10px] border border-hairline bg-surface-2 px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none min-h-[44px]";

/* ------------------------------ ActionButton ------------------------------- */

export function ActionButton({
  label,
  busyLabel,
  onClick,
  variant,
  confirm,
}: {
  label: string;
  busyLabel: string;
  onClick: () => Promise<void>;
  variant?: ButtonProps["variant"];
  confirm?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <Button
        variant={variant}
        loading={busy}
        onClick={async () => {
          if (confirm && !window.confirm(confirm)) return;
          setBusy(true);
          setError("");
          try {
            await onClick();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? busyLabel : label}
      </Button>
      {error && <p className="mt-2 text-[13px] text-danger">{error}</p>}
    </div>
  );
}
