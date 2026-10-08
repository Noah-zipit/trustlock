/**
 * TrustLock domain types.
 *
 * A Milestone moves through this lifecycle:
 *
 *   DRAFT -> FUNDED -> SUBMITTED -> VERIFIED -> RELEASED
 *              |          |            |
 *              +----------+------------+--> DISPUTED -> RESOLVED_RELEASED
 *                                                     -> RESOLVED_REFUNDED
 *
 * Money is HELD (PayPal authorize) at FUNDED and only moves at RELEASED
 * (PayPal capture + payout). The AI verifier is the gate between SUBMITTED
 * and VERIFIED; a human is the gate out of DISPUTED.
 */

export type MilestoneStatus =
  | "DRAFT"
  | "FUNDED"
  | "SUBMITTED"
  | "VERIFIED"
  | "RELEASED"
  | "DISPUTED"
  | "RESOLVED_RELEASED"
  | "RESOLVED_REFUNDED";

export interface Milestone {
  id: string;
  title: string;
  brief: string;
  amountCents: number;
  currency: string;
  deadline: string; // ISO date
  clientName: string;
  freelancerName: string;
  status: MilestoneStatus;
  createdAt: string;
  updatedAt: string;
  /** PayPal order id once funded (mock id in Phase 1). */
  paypalOrderId?: string;
  /** PayPal capture id once released. */
  paypalCaptureId?: string;
  /** PayPal payout batch id once released. */
  paypalPayoutId?: string;
  dispute?: Dispute;
}

export interface Deliverable {
  id: string;
  milestoneId: string;
  repoUrl: string;
  liveUrl: string;
  notes: string;
  submittedAt: string;
}

export interface VerificationCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface Verdict {
  id: string;
  milestoneId: string;
  deliverableId: string;
  approved: boolean;
  confidence: number; // 0..1
  reasoning: string;
  checks: VerificationCheck[];
  createdAt: string;
  /** "mock" in Phase 1, provider name later (e.g. "openai", "anthropic"). */
  engine: string;
}

export interface Dispute {
  id: string;
  milestoneId: string;
  openedBy: "client" | "freelancer";
  reason: string;
  openedAt: string;
  status: "OPEN" | "RESOLVED";
  resolution?: string;
  resolvedAt?: string;
}

export interface TimelineEvent {
  id: string;
  milestoneId: string;
  at: string;
  kind:
    | "created"
    | "funded"
    | "submitted"
    | "verified"
    | "released"
    | "disputed"
    | "resolved"
    | "note";
  label: string;
  detail?: string;
  /** Present for money movement events. Clearly "MOCK-…" in Phase 1. */
  reference?: string;
}
