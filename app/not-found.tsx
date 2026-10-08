import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <div className="rise max-w-md text-center">
        <p className="font-display text-[72px] font-semibold text-ink-faint">404</p>
        <h1 className="mt-2 font-display text-[24px] font-semibold">
          This page slipped the escrow
        </h1>
        <p className="mt-2 text-[15px] text-ink-muted">
          The page you are looking for does not exist or was moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/">
            <Button variant="secondary">Home</Button>
          </Link>
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
