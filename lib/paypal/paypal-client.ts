/**
 * PayPal client abstraction.
 *
 * Phase 1 ships the MOCK implementation so the full escrow flow is clickable
 * without credentials. Phase 2 swaps the factory to SandboxPayPalClient once
 * PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET exist — the interface does not change.
 *
 * ---------------------------------------------------------------------------
 * SANDBOX API MAPPING (for the Phase 2 implementation)
 * ---------------------------------------------------------------------------
 * getPayPalClient() -> new SandboxPayPalClient({ clientId, clientSecret })
 *   Base URL: https://api-m.sandbox.paypal.com
 *
 * createOrder({ amountCents, currency, description })
 *   -> POST /v2/checkout/orders
 *      { intent: "AUTHORIZE",
 *        purchase_units: [{ amount: { currency_code, value: "850.00" },
 *                           description }] }
 *   <- { id: "<ORDER-ID>", status: "CREATED" }
 *   The client approves via the PayPal-hosted approval URL (Phase 2 UI);
 *   funds are HELD by the subsequent authorize call:
 *   -> POST /v2/checkout/orders/{id}/authorize
 *   Mock note: Phase 1 returns "MOCK-ORDER-XXXX" and records heldAt.
 *
 * captureOrder(orderId)
 *   -> POST /v2/checkout/orders/{orderId}/capture
 *   <- { purchase_units: [{ payments: { captures: [{ id: "<CAPTURE-ID>" }] } }] }
 *   This is the moment held money actually moves.
 *
 * createPayout({ recipientEmail, amountCents, currency, note })
 *   -> POST /v1/payments/payouts
 *      { sender_batch_header: { sender_batch_id: "<unique>", email_subject },
 *        items: [{ recipient_type: "EMAIL", amount: { currency, value },
 *                  receiver, note }] }
 *   <- { batch_header: { payout_batch_id: "<BATCH-ID>" } }
 *
 * Auth for every call: OAuth2 client-credentials
 *   -> POST /v1/oauth2/token  (Basic clientId:clientSecret)
 *   <- { access_token }  (cache ~8h, reuse across calls)
 * ---------------------------------------------------------------------------
 */

export interface CreateOrderInput {
  amountCents: number;
  currency: string;
  description: string;
}

export interface PayPalOrder {
  /** "MOCK-ORDER-…" in Phase 1; real PayPal order id in Phase 2. */
  id: string;
  status: "CREATED" | "AUTHORIZED";
  amountCents: number;
  currency: string;
  heldAt: string;
  approvalUrl: string;
}

export interface PayPalCapture {
  id: string;
  orderId: string;
  amountCents: number;
  currency: string;
  capturedAt: string;
}

export interface CreatePayoutInput {
  recipientEmail: string;
  amountCents: number;
  currency: string;
  note: string;
}

export interface PayPalPayout {
  /** "MOCK-PAYOUT-…" in Phase 1; real batch id in Phase 2. */
  batchId: string;
  recipientEmail: string;
  amountCents: number;
  currency: string;
  createdAt: string;
}

export interface PayPalClient {
  /** Authorize (hold) funds. Money does NOT move yet. */
  createOrder(input: CreateOrderInput): Promise<PayPalOrder>;
  /** Capture a previously authorized order. Money moves to the platform. */
  captureOrder(orderId: string): Promise<PayPalCapture>;
  /** Pay the freelancer out. Money moves to the recipient. */
  createPayout(input: CreatePayoutInput): Promise<PayPalPayout>;
}

function mockId(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${s}`;
}

/** Phase 1 mock: deterministic shapes, clearly-marked mock references. */
export class MockPayPalClient implements PayPalClient {
  async createOrder(input: CreateOrderInput): Promise<PayPalOrder> {
    await delay(600);
    return {
      id: mockId("MOCK-ORDER"),
      status: "AUTHORIZED",
      amountCents: input.amountCents,
      currency: input.currency,
      heldAt: new Date().toISOString(),
      approvalUrl: "#mock-approval",
    };
  }

  async captureOrder(orderId: string): Promise<PayPalCapture> {
    await delay(600);
    return {
      id: mockId("MOCK-CAPTURE"),
      orderId,
      amountCents: 0, // filled by caller context in the API route
      currency: "USD",
      capturedAt: new Date().toISOString(),
    };
  }

  async createPayout(input: CreatePayoutInput): Promise<PayPalPayout> {
    await delay(600);
    return {
      batchId: mockId("MOCK-PAYOUT"),
      recipientEmail: input.recipientEmail,
      amountCents: input.amountCents,
      currency: input.currency,
      createdAt: new Date().toISOString(),
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Factory. Phase 2: when PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set,
 * return new SandboxPayPalClient({ clientId, clientSecret }) instead.
 */
export function getPayPalClient(): PayPalClient {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (id && secret) {
    // Phase 2 wiring point. Intentionally not implemented yet — credentials
    // do not exist. Throwing loudly beats silently using the mock with money.
    throw new Error(
      "PAYPAL_CLIENT_ID/SECRET are set but SandboxPayPalClient is not implemented yet (Phase 2)."
    );
  }
  return new MockPayPalClient();
}

/** The UI uses this to label every mock money reference honestly. */
export function isMockReference(ref: string): boolean {
  return ref.startsWith("MOCK-");
}
