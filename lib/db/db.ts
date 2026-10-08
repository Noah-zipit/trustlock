/**
 * Prototype datastore: a single JSON file with an in-process write queue.
 *
 * This is deliberately dependency-free for the hackathon prototype so judges
 * can run the project with nothing but `npm install`. Every write goes
 * through a promise chain so concurrent API requests cannot interleave a
 * read-modify-write.
 *
 * PHASE 2: replace the internals of this module with a real database
 * (Postgres via Prisma/Drizzle, or Vercel KV). Keep the exported function
 * signatures identical — the API routes do not need to change.
 */

import { promises as fs } from "fs";
import path from "path";
import type {
  Deliverable,
  Dispute,
  Milestone,
  MilestoneStatus,
  TimelineEvent,
  Verdict,
} from "../types";

interface Store {
  milestones: Milestone[];
  deliverables: Deliverable[];
  verdicts: Verdict[];
  events: TimelineEvent[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "trustlock.json");

function emptyStore(): Store {
  return { milestones: [], deliverables: [], verdicts: [], events: [] };
}

function seed(): Store {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const daysAgo = (n: number) =>
    iso(new Date(now.getTime() - n * 24 * 60 * 60 * 1000));

  const milestones: Milestone[] = [
    {
      id: "ms-northwind",
      title: "Landing page rebuild for Northwind Traders",
      brief:
        "Rebuild the Northwind Traders marketing landing page in Next.js with the approved Figma design. Must include the hero, product grid, testimonial section and contact form. Deployed to a public URL and PageSpeed mobile score above 85.",
      amountCents: 85000,
      currency: "USD",
      deadline: iso(new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000)),
      clientName: "Northwind Traders",
      freelancerName: "Ashar Q.",
      status: "FUNDED",
      createdAt: daysAgo(3),
      updatedAt: daysAgo(2),
      paypalOrderId: "MOCK-ORDER-8F3K2N",
    },
    {
      id: "ms-booking-api",
      title: "Booking system API integration",
      brief:
        "Integrate the booking provider's REST API into the existing salon site: availability lookup, slot reservation, confirmation emails and admin cancellation. Provide a README with setup steps and a Postman collection covering every endpoint.",
      amountCents: 120000,
      currency: "USD",
      deadline: iso(new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)),
      clientName: "Velvet & Co. Salon",
      freelancerName: "Ashar Q.",
      status: "SUBMITTED",
      createdAt: daysAgo(9),
      updatedAt: daysAgo(0.2),
      paypalOrderId: "MOCK-ORDER-4D7Q1Z",
    },
    {
      id: "ms-logo-pack",
      title: "Brand identity and logo pack",
      brief:
        "Full identity for the Fernway Coffee launch: primary logo, secondary mark, color palette, typography pairing and a 12-page brand guideline PDF. Deliver SVG, PNG and PDF in a shared drive folder.",
      amountCents: 45000,
      currency: "USD",
      deadline: daysAgo(6),
      clientName: "Fernway Coffee",
      freelancerName: "Ashar Q.",
      status: "RELEASED",
      createdAt: daysAgo(14),
      updatedAt: daysAgo(5),
      paypalOrderId: "MOCK-ORDER-2H9M5T",
      paypalCaptureId: "MOCK-CAPTURE-6J1B8W",
      paypalPayoutId: "MOCK-PAYOUT-3P4R7V",
    },
    {
      id: "ms-app-ui",
      title: "Mobile app UI screens",
      brief:
        "Design 18 mobile app screens for the FleetTrack driver app in Figma: onboarding, map view, trip history, earnings and settings. Export an interactive prototype link and a component style guide.",
      amountCents: 60000,
      currency: "USD",
      deadline: daysAgo(1),
      clientName: "FleetTrack Inc.",
      freelancerName: "Ashar Q.",
      status: "DISPUTED",
      createdAt: daysAgo(12),
      updatedAt: daysAgo(0.5),
      paypalOrderId: "MOCK-ORDER-9X2C6L",
      dispute: {
        id: "dp-1",
        milestoneId: "ms-app-ui",
        openedBy: "client",
        reason:
          "Only 12 of the 18 screens were delivered and the earnings screen does not match the agreed wireframe. Requesting a partial refund.",
        openedAt: daysAgo(0.5),
        status: "OPEN",
      },
    },
  ];

  const deliverables: Deliverable[] = [
    {
      id: "dl-booking-api",
      milestoneId: "ms-booking-api",
      repoUrl: "https://github.com/Noah-zipit/velvet-booking-api",
      liveUrl: "https://velvet-booking-demo.vercel.app",
      notes:
        "All four endpoints implemented and deployed. Postman collection is in the repo root. Confirmation emails go through the sandbox mailer; swap the SMTP env var for production.",
      submittedAt: daysAgo(0.2),
    },
    {
      id: "dl-logo-pack",
      milestoneId: "ms-logo-pack",
      repoUrl: "https://github.com/Noah-zipit/fernway-identity",
      liveUrl: "https://drive.example.com/fernway-brand-pack",
      notes:
        "Full pack delivered: logo, mark, palette, type pairing and the 12-page guideline PDF.",
      submittedAt: daysAgo(6),
    },
    {
      id: "dl-app-ui",
      milestoneId: "ms-app-ui",
      repoUrl: "https://github.com/Noah-zipit/fleettrack-ui",
      liveUrl: "https://figma.example.com/fleettrack-driver-app",
      notes: "12 screens done, remaining 6 in progress.",
      submittedAt: daysAgo(1),
    },
  ];

  const verdicts: Verdict[] = [
    {
      id: "vd-logo-pack",
      milestoneId: "ms-logo-pack",
      deliverableId: "dl-logo-pack",
      approved: true,
      confidence: 0.93,
      reasoning:
        "All requested assets are present: primary logo, secondary mark, palette, type pairing and a 12-page guideline PDF. File formats match the brief (SVG, PNG, PDF). Approved for release.",
      checks: [
        {
          name: "Brief coverage",
          passed: true,
          detail: "5 of 5 requested items found in the delivery.",
        },
        {
          name: "File formats",
          passed: true,
          detail: "SVG, PNG and PDF all present.",
        },
        {
          name: "Delivery link reachable",
          passed: true,
          detail: "Shared folder link resolves.",
        },
      ],
      createdAt: daysAgo(5),
      engine: "mock",
    },
  ];

  const events: TimelineEvent[] = [
    { id: "ev-1", milestoneId: "ms-northwind", at: daysAgo(3), kind: "created", label: "Milestone created", detail: "Brief agreed by Northwind Traders and Ashar Q." },
    { id: "ev-2", milestoneId: "ms-northwind", at: daysAgo(2), kind: "funded", label: "$850.00 held in escrow", detail: "PayPal authorization — funds held, not yet paid.", reference: "MOCK-ORDER-8F3K2N" },
    { id: "ev-3", milestoneId: "ms-booking-api", at: daysAgo(9), kind: "created", label: "Milestone created", detail: "Brief agreed by Velvet & Co. Salon and Ashar Q." },
    { id: "ev-4", milestoneId: "ms-booking-api", at: daysAgo(8), kind: "funded", label: "$1,200.00 held in escrow", detail: "PayPal authorization — funds held, not yet paid.", reference: "MOCK-ORDER-4D7Q1Z" },
    { id: "ev-5", milestoneId: "ms-booking-api", at: daysAgo(0.2), kind: "submitted", label: "Deliverable submitted", detail: "Repo, live URL and notes provided for AI verification." },
    { id: "ev-6", milestoneId: "ms-logo-pack", at: daysAgo(14), kind: "created", label: "Milestone created", detail: "Brief agreed by Fernway Coffee and Ashar Q." },
    { id: "ev-7", milestoneId: "ms-logo-pack", at: daysAgo(13), kind: "funded", label: "$450.00 held in escrow", detail: "PayPal authorization — funds held, not yet paid.", reference: "MOCK-ORDER-2H9M5T" },
    { id: "ev-8", milestoneId: "ms-logo-pack", at: daysAgo(6), kind: "submitted", label: "Deliverable submitted", detail: "Repo, live URL and notes provided for AI verification." },
    { id: "ev-9", milestoneId: "ms-logo-pack", at: daysAgo(5), kind: "verified", label: "AI verification passed", detail: "Confidence 93% — 3 of 3 checks passed.", reference: "vd-logo-pack" },
    { id: "ev-10", milestoneId: "ms-logo-pack", at: daysAgo(5), kind: "released", label: "$450.00 released to Ashar Q.", detail: "PayPal capture + payout completed.", reference: "MOCK-PAYOUT-3P4R7V" },
    { id: "ev-11", milestoneId: "ms-app-ui", at: daysAgo(12), kind: "created", label: "Milestone created", detail: "Brief agreed by FleetTrack Inc. and Ashar Q." },
    { id: "ev-12", milestoneId: "ms-app-ui", at: daysAgo(11), kind: "funded", label: "$600.00 held in escrow", detail: "PayPal authorization — funds held, not yet paid.", reference: "MOCK-ORDER-9X2C6L" },
    { id: "ev-13", milestoneId: "ms-app-ui", at: daysAgo(1), kind: "submitted", label: "Deliverable submitted", detail: "Repo, live URL and notes provided for AI verification." },
    { id: "ev-14", milestoneId: "ms-app-ui", at: daysAgo(0.5), kind: "disputed", label: "Dispute opened by FleetTrack Inc.", detail: "Only 12 of 18 screens delivered; earnings screen mismatches wireframe." },
  ];

  return { milestones, deliverables, verdicts, events };
}

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    const s = seed();
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(s, null, 2), "utf8");
    return s;
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

// Serializes all mutations so concurrent requests cannot corrupt the file.
let queue: Promise<unknown> = Promise.resolve();

function mutate<T>(fn: (store: Store) => T): Promise<T> {
  const run = queue.then(async () => {
    const store = await readStore();
    const result = fn(store);
    await writeStore(store);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const db = {
  listMilestones: async (): Promise<Milestone[]> => {
    const s = await readStore();
    return [...s.milestones].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  getMilestone: async (id: string): Promise<Milestone | undefined> => {
    const s = await readStore();
    return s.milestones.find((m) => m.id === id);
  },
  createMilestone: (m: Milestone) =>
    mutate((s) => {
      s.milestones.push(m);
      return m;
    }),
  updateMilestone: (id: string, patch: Partial<Milestone>) =>
    mutate((s) => {
      const m = s.milestones.find((x) => x.id === id);
      if (!m) throw new Error("milestone not found");
      Object.assign(m, patch, { updatedAt: new Date().toISOString() });
      return m;
    }),
  updateStatus: (id: string, status: MilestoneStatus) =>
    mutate((s) => {
      const m = s.milestones.find((x) => x.id === id);
      if (!m) throw new Error("milestone not found");
      m.status = status;
      m.updatedAt = new Date().toISOString();
      return m;
    }),
  getDeliverable: async (milestoneId: string): Promise<Deliverable | undefined> => {
    const s = await readStore();
    return s.deliverables.find((d) => d.milestoneId === milestoneId);
  },
  addDeliverable: (d: Deliverable) =>
    mutate((s) => {
      s.deliverables = s.deliverables.filter(
        (x) => x.milestoneId !== d.milestoneId
      );
      s.deliverables.push(d);
      return d;
    }),
  getVerdict: async (milestoneId: string): Promise<Verdict | undefined> => {
    const s = await readStore();
    return s.verdicts.find((v) => v.milestoneId === milestoneId);
  },
  addVerdict: (v: Verdict) =>
    mutate((s) => {
      s.verdicts = s.verdicts.filter((x) => x.milestoneId !== v.milestoneId);
      s.verdicts.push(v);
      return v;
    }),
  eventsFor: async (milestoneId: string): Promise<TimelineEvent[]> => {
    const s = await readStore();
    return s.events
      .filter((e) => e.milestoneId === milestoneId)
      .sort((a, b) => a.at.localeCompare(b.at));
  },
  addEvent: (e: TimelineEvent) =>
    mutate((s) => {
      s.events.push(e);
      return e;
    }),
  openDisputes: async (): Promise<Dispute[]> => {
    const s = await readStore();
    return s.milestones
      .filter((m) => m.status === "DISPUTED" && m.dispute?.status === "OPEN")
      .map((m) => m.dispute as Dispute);
  },
};

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(
    Math.random() * 1296
  ).toString(36)}`;
}
