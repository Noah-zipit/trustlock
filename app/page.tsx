import Link from "next/link";
import { Button, Card, VaultBar } from "@/components/ui";

function Nav() {
  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="TrustLock logo" className="h-8 w-8" />
          <span className="font-display text-[19px] font-semibold tracking-tight">
            TrustLock
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-[14px] text-ink-muted sm:flex">
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#agent" className="hover:text-ink">The agent</a>
          <Link href="/disputes" className="hover:text-ink">Disputes</Link>
        </nav>
        <Link href="/dashboard">
          <Button variant="secondary" className="!py-2.5">
            Open dashboard
          </Button>
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24">
      <div className="rise">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
          AI escrow for freelancers
        </p>
        <h1 className="mt-4 font-display text-[44px] font-semibold leading-[1.04] tracking-[-0.02em] sm:text-[60px]">
          Get paid for the work you actually did.
        </h1>
        <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-ink-muted">
          TrustLock holds the client&apos;s money before the work starts. When you
          deliver, an AI verifier checks the work against the brief and
          releases the payment on its own. No chasing invoices. No vanishing
          clients.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button>Try the live demo</Button>
          </Link>
          <a href="#how">
            <Button variant="secondary">How it works</Button>
          </a>
        </div>
        <p className="mt-6 text-[13px] text-ink-faint">
          Built for the PayPal AI Hackathon 2026. Demo runs on mock payments.
        </p>
      </div>

      <Card className="rise p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] text-ink-faint">Milestone</p>
            <p className="mt-1 font-display text-[20px] font-semibold leading-snug">
              Landing page rebuild
              <br />
              for Northwind Traders
            </p>
          </div>
          <span className="rounded-full border border-held/40 bg-held/15 px-3 py-1 text-[13px] font-medium text-held">
            Funds held
          </span>
        </div>
        <p className="money mt-5 font-display text-[40px] font-semibold tracking-tight">
          $850.00 <span className="text-[18px] text-ink-faint">USD</span>
        </p>
        <p className="mt-1 text-[13px] text-ink-faint">
          Authorized via PayPal. Held, not paid.
        </p>
        <div className="mt-6">
          <VaultBar status="FUNDED" />
        </div>
        <div className="mt-6 border-t border-hairline pt-4 text-[13px] text-ink-muted">
          Next step: the freelancer submits the delivery, and the AI verifier
          takes it from there.
        </div>
      </Card>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      stage: "Fund",
      title: "The client locks the money in",
      body: "The milestone amount is authorized through PayPal and held in escrow. The freelancer sees proof of funds before writing a single line. The money cannot move until the work is verified or a human resolves a dispute.",
    },
    {
      stage: "Deliver",
      title: "Work gets submitted as evidence",
      body: "The freelancer submits the repository, the live URL and delivery notes. Everything the brief asked for arrives as structured evidence, ready for review instead of buried in a chat thread.",
    },
    {
      stage: "Verify",
      title: "The AI checks the work against the brief",
      body: "TrustLock's verifier reads the brief and the evidence, runs its checks, and produces a verdict with a confidence score and reasoning you can read. Pass, and the release is automatic. Fail, and the freelancer knows exactly what to fix.",
    },
    {
      stage: "Release",
      title: "Payment moves on its own",
      body: "On a passing verdict the held funds are captured and paid out to the freelancer. The full trail, from authorization to payout, stays visible on a single timeline. If either side disagrees, a human reviewer decides instead of an algorithm.",
    },
  ];
  return (
    <section id="how" className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
          How it works
        </p>
        <h2 className="mt-3 max-w-xl font-display text-[34px] font-semibold leading-tight tracking-[-0.01em]">
          Four stages. The money only moves at the last one.
        </h2>
        <div className="mt-12">
          {steps.map((s, i) => (
            <div
              key={s.stage}
              className={`grid gap-3 py-8 sm:grid-cols-[140px_1fr] sm:gap-8 ${
                i !== steps.length - 1 ? "border-b border-hairline" : ""
              }`}
            >
              <p className="font-display text-[15px] font-semibold uppercase tracking-[0.1em] text-brand">
                {s.stage}
              </p>
              <div>
                <h3 className="font-display text-[22px] font-semibold">
                  {s.title}
                </h3>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentSection() {
  return (
    <section id="agent" className="border-t border-hairline bg-surface-1">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
            Agentic commerce
          </p>
          <h2 className="mt-3 font-display text-[34px] font-semibold leading-tight tracking-[-0.01em]">
            The agent moves the money, not just the messages.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Most payment tools stop at the checkout button. TrustLock puts
            PayPal at the center of the whole deal: authorize to hold, capture
            to move, payout to settle. The AI is not a chatbot on the side. It
            is the gate the money passes through, with a human appeal path
            behind it for the cases it should not decide alone.
          </p>
        </div>
        <Card className="p-6">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Under the hood
          </p>
          <ul className="mt-4 space-y-4 text-[14px] leading-relaxed">
            <li>
              <span className="font-semibold text-ink">PayPal Orders API.</span>{" "}
              <span className="text-ink-muted">
                Intent AUTHORIZE holds the milestone amount. Nothing is charged
                until the work passes.
              </span>
            </li>
            <li>
              <span className="font-semibold text-ink">AI verifier.</span>{" "}
              <span className="text-ink-muted">
                Reads the brief and the delivery evidence, then returns a
                structured verdict: checks, confidence, reasoning.
              </span>
            </li>
            <li>
              <span className="font-semibold text-ink">
                Capture plus Payouts.
              </span>{" "}
              <span className="text-ink-muted">
                A passing verdict triggers capture of the held funds and a
                payout to the freelancer, all on one auditable timeline.
              </span>
            </li>
            <li>
              <span className="font-semibold text-ink">Human review.</span>{" "}
              <span className="text-ink-muted">
                Disputes freeze the escrow and go to a review queue where a
                person makes the call.
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="max-w-2xl font-display text-[34px] font-semibold leading-tight tracking-[-0.01em]">
          See the whole escrow flow, from funding to payout, in about two
          minutes.
        </h2>
        <p className="mt-4 max-w-xl text-[15px] text-ink-muted">
          The demo ships with milestones in every state: one waiting for
          funding, one ready for AI verification, one already paid out, and one
          in dispute.
        </p>
        <div className="mt-8">
          <Link href="/dashboard">
            <Button>Open the demo dashboard</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-[13px] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          TrustLock. A PayPal AI Hackathon 2026 entry. Demo uses mock payments.
        </p>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <AgentSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
