/**
 * AI verifier abstraction.
 *
 * The verifier reads a milestone brief plus the freelancer's evidence
 * (repo URL, live URL, notes) and returns a structured verdict: which checks
 * passed, an overall confidence, and human-readable reasoning.
 *
 * Phase 1 ships the MOCK verifier with deterministic, demo-friendly verdicts
 * so the whole flow is clickable. Phase 2 plugs a real model in via the
 * documented slot below — the interface does not change.
 *
 * ---------------------------------------------------------------------------
 * PHASE 2 LLM SLOT
 * ---------------------------------------------------------------------------
 * Implement `class LlmVerifier implements Verifier` in
 * lib/verifier/llm-verifier.ts:
 *
 *   const provider = process.env.VERIFIER_PROVIDER; // "openai" | "anthropic"
 *   - Build a system prompt: "You are a freelance-deliverable auditor…"
 *   - User message: the brief + evidence JSON.
 *   - Ask for STRICT JSON: { approved, confidence, reasoning, checks[] }
 *     where each check is { name, passed, detail }.
 *   - Checks the model should perform:
 *       1. brief-coverage — every requested item appears in the delivery
 *       2. evidence-completeness — repo URL, live URL and notes all present
 *       3. link-reachability — attempt HTTP HEAD on both URLs, report status
 *   - Parse with a schema validator (zod), retry once on malformed JSON,
 *     then set engine to the provider name.
 *   - Guardrails: never approve above 0.95 without all checks passing;
 *     always keep a human appeal path (the dispute flow already exists).
 * ---------------------------------------------------------------------------
 */

import type { Deliverable, Milestone, VerificationCheck, Verdict } from "../types";
import { newId } from "../db/db";

export interface Verifier {
  verifyDeliverable(
    milestone: Milestone,
    deliverable: Deliverable
  ): Promise<Verdict>;
}

function check(
  name: string,
  passed: boolean,
  detail: string
): VerificationCheck {
  return { name, passed, detail };
}

/**
 * Phase 1 mock. Deterministic per milestone so the demo is stable:
 * verdicts are derived from the evidence content, not random.
 */
export class MockVerifier implements Verifier {
  async verifyDeliverable(
    milestone: Milestone,
    deliverable: Deliverable
  ): Promise<Verdict> {
    await new Promise((r) => setTimeout(r, 1400));

    const hasRepo = deliverable.repoUrl.trim().length > 0;
    const hasLive = deliverable.liveUrl.trim().length > 0;
    const hasNotes = deliverable.notes.trim().length > 20;
    const mentionsAllKeywords = keywordCoverage(milestone.brief, deliverable.notes);

    const checks: VerificationCheck[] = [
      check(
        "Brief coverage",
        mentionsAllKeywords.covered,
        mentionsAllKeywords.detail
      ),
      check(
        "Evidence completeness",
        hasRepo && hasLive && hasNotes,
        hasRepo && hasLive && hasNotes
          ? "Repository URL, live URL and delivery notes all provided."
          : "Missing evidence: " +
              [
                !hasRepo && "repository URL",
                !hasLive && "live URL",
                !hasNotes && "delivery notes",
              ]
                .filter(Boolean)
                .join(", ") +
              "."
      ),
      check(
        "Delivery links reachable",
        hasRepo && hasLive,
        "Mock check: links resolve in the demo environment. Phase 2 performs live HTTP verification."
      ),
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    const approved = passedCount === checks.length;
    const confidence = approved ? 0.87 : 0.42 + passedCount * 0.1;

    return {
      id: newId("vd"),
      milestoneId: milestone.id,
      deliverableId: deliverable.id,
      approved,
      confidence: Math.min(0.99, Math.round(confidence * 100) / 100),
      reasoning: approved
        ? "The delivery covers the brief's requirements and all evidence is present: repository, live URL and notes. Approved for release."
        : "The delivery does not yet satisfy the brief. Review the failed checks above, update the delivery, and resubmit.",
      checks,
      createdAt: new Date().toISOString(),
      engine: "mock",
    };
  }
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "for", "with", "on",
  "must", "into", "every", "all", "are", "is", "be", "by", "from",
]);

function keywordCoverage(
  brief: string,
  notes: string
): { covered: boolean; detail: string } {
  const words = brief
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOPWORDS.has(w));
  const unique = [...new Set(words)].slice(0, 8);
  const hay = notes.toLowerCase();
  const hits = unique.filter((w) => hay.includes(w));
  const covered = hits.length >= Math.ceil(unique.length * 0.5);
  return {
    covered,
    detail: covered
      ? `${hits.length} of ${unique.length} key brief terms reflected in the delivery notes.`
      : `Only ${hits.length} of ${unique.length} key brief terms reflected in the delivery notes.`,
  };
}

/** Factory. Phase 2: return LlmVerifier when VERIFIER_PROVIDER is set. */
export function getVerifier(): Verifier {
  return new MockVerifier();
}
