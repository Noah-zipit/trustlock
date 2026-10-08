import Link from "next/link";

function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-[14px] text-ink-muted hover:text-ink">
        ← Back home
      </Link>
      <h1 className="mt-3 font-display text-[36px] font-semibold tracking-[-0.01em]">{title}</h1>
      <p className="mt-1 text-[13px] text-ink-faint">Last updated {updated}</p>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-muted">
        {children}
      </div>
    </div>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-[20px] font-semibold text-ink">{children}</h2>;
}

export default function TermsPage() {
  return (
    <LegalShell title="Terms of service" updated="October 8, 2026">
      <p>
        TrustLock is a demonstration project built for the PayPal AI Hackathon
        2026. It is a prototype, not a financial service, and no real money
        moves through it.
      </p>
      <H>What this demo does</H>
      <p>
        The demo simulates an escrow flow: milestone creation, fund
        authorization, deliverable submission, AI verification, fund release
        and dispute review. All payments are mock transactions clearly labeled
        as such. Nothing here creates a financial obligation between any
        parties.
      </p>
      <H>Your content</H>
      <p>
        Anything you type into the demo stays in the demo's local prototype
        database. Do not enter real payment credentials, personal financial
        information or anything you would not want stored in plain text.
      </p>
      <H>No warranties</H>
      <p>
        This prototype is provided as is, without warranties of any kind. The
        AI verifier is a mock in this phase and its verdicts carry no meaning
        outside the demonstration.
      </p>
      <H>Contact</H>
      <p>
        TrustLock is an open-source hackathon entry by Ashar Qaisar. The source
        code is available under the MIT license in the project's public
        repository.
      </p>
    </LegalShell>
  );
}
