import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="TrustLock logo" className="h-8 w-8" />
            <span className="font-display text-[19px] font-semibold tracking-tight">
              TrustLock
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-[14px] text-ink-muted">
            <Link href="/dashboard" className="hover:text-ink">Milestones</Link>
            <Link href="/disputes" className="hover:text-ink">Review queue</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </>
  );
}
