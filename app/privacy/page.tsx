import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-[14px] text-ink-muted hover:text-ink">
        ← Back home
      </Link>
      <h1 className="mt-3 font-display text-[36px] font-semibold tracking-[-0.01em]">
        Privacy policy
      </h1>
      <p className="mt-1 text-[13px] text-ink-faint">Last updated October 8, 2026</p>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-muted">
        <p>
          TrustLock is a hackathon demonstration prototype. This policy is
          short because the data story is short.
        </p>
        <h2 className="font-display text-[20px] font-semibold text-ink">
          What is stored
        </h2>
        <p>
          Milestone titles, briefs, amounts, names you type in, deliverable
          links and notes, and the timeline of demo actions. Everything lives
          in a local JSON file on the machine running the demo. There is no
          analytics, no tracking, no cookies beyond what the framework needs to
          serve pages.
        </p>
        <h2 className="font-display text-[20px] font-semibold text-ink">
          What is never collected
        </h2>
        <p>
          Real payment credentials, bank details or government IDs. The
          payment layer is mocked end to end; if you are looking at a screen
          asking for real financial information, you are not looking at
          TrustLock.
        </p>
        <h2 className="font-display text-[20px] font-semibold text-ink">
          Your control
        </h2>
        <p>
          This is a local prototype: deleting the project's data file removes
          everything. For questions, reach the author through the public
          repository linked from the demo.
        </p>
      </div>
    </div>
  );
}
