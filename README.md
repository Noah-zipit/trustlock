# TrustLock — AI escrow for freelancers

**PayPal AI Hackathon 2026 entry** · "Build What's Next with PayPal and AI"

The client funds the milestone. The money is held, not paid. The freelancer
delivers. An AI verifier checks the work against the brief, and only then does
the payment release on its own. If either side disagrees, a human reviewer
decides. Think of it as agentic commerce: the agent moves the money.

## The problem

Freelancers lose real income to ghosted invoices and scope creep with no proof
of funds. Clients pay upfront and get work that ignores the brief. Both sides
are guessing. TrustLock removes the guessing: money is authorized before work
starts, and an AI gate stands between delivery and payment.

## How it works

```
 CLIENT                    TRUSTLOCK                      FREELANCER
   │                          │                               │
   │── create milestone ─────▶│                               │
   │── fund (PayPal           │                               │
   │   authorize, HELD) ─────▶│── proof of funds ────────────▶│
   │                          │                               │── work ──▶
   │                          │◀── submit deliverable ────────│
   │                          │   (repo, live URL, notes)     │
   │                          │── AI verifier ──▶ verdict     │
   │                          │   checks + confidence         │
   │                          │── capture + payout ──────────▶│ $$$ released
   │                          │                               │
   │── dispute ───────────────▶│── escrow FROZEN ──▶ human review
```

Milestone lifecycle:
`DRAFT → FUNDED → SUBMITTED → VERIFIED → RELEASED`, with `DISPUTED` branching
to `RESOLVED_RELEASED` / `RESOLVED_REFUNDED` via the human review queue.

## Tech

- Next.js 16 + TypeScript + Tailwind v4
- `lib/paypal/paypal-client.ts` — PayPal behind an interface
  (`createOrder` authorize / `captureOrder` / `createPayout`). Mock now.
- `lib/verifier/verifier.ts` — AI verifier behind an interface
  (`verifyDeliverable` → checks, confidence, reasoning). Mock now.
- `lib/db/db.ts` — dependency-free JSON prototype store (swap for a real DB
  in production; the API routes keep their signatures).

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build check
```

The demo seeds four milestones in every state: one funded and awaiting
delivery, one submitted and ready for AI verification, one fully paid out,
and one in dispute. Click through the whole escrow flow in about two minutes.

## Wiring the real PayPal sandbox (Phase 2)

1. Create a PayPal Developer account at https://developer.paypal.com and make
   a sandbox REST app to get a client ID and secret.
2. Copy `.env.example` to `.env.local` and fill in `PAYPAL_CLIENT_ID` and
   `PAYPAL_CLIENT_SECRET`.
3. Implement `SandboxPayPalClient` per the API mapping documented at the top
   of `lib/paypal/paypal-client.ts` (OAuth2 client-credentials, Orders v2 with
   `intent: "AUTHORIZE"`, authorize, capture, Payouts v1), and return it from
   `getPayPalClient()` when the env vars are set.
4. Add the PayPal-hosted approval redirect to the fund flow so the client
   approves the authorization in the sandbox.

## Wiring a real AI verifier (Phase 2)

Set `VERIFIER_PROVIDER=openai|anthropic` plus the provider API key, then
implement `LlmVerifier` per the slot documented at the top of
`lib/verifier/verifier.ts`: strict-JSON verdicts with per-check results,
live link reachability, and a confidence ceiling unless every check passes.

## Submission checklist

- [x] Working prototype (this repo)
- [x] Public GitHub repo with MIT license
- [ ] Hosted demo URL
- [ ] Demo video under 3 minutes on YouTube
- [ ] Devpost text description

## License

MIT — see [LICENSE](LICENSE).
