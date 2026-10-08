"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Field, inputClass } from "@/components/ui";

export default function NewMilestonePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    brief: "",
    amount: "500",
    currency: "USD",
    deadline: "",
    clientName: "",
    freelancerName: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deadline:
            form.deadline || new Date(Date.now() + 7 * 864e5).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create milestone.");
      router.push(`/escrow/${data.milestone.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rise mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-[14px] text-ink-muted hover:text-ink">
        ← Back to milestones
      </Link>
      <h1 className="mt-3 font-display text-[32px] font-semibold tracking-[-0.01em]">
        New milestone
      </h1>
      <p className="mt-1 text-[15px] text-ink-muted">
        Describe the work and lock the amount. Nothing is charged until you fund
        it in the next step.
      </p>

      <Card className="mt-8 p-6">
        <form onSubmit={submit} className="space-y-5">
          <Field label="Milestone title">
            <input
              className={inputClass}
              placeholder="Checkout flow rebuild for Acme Store"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </Field>

          <Field
            label="Brief"
            hint="Be specific. The AI verifier reads this to judge the delivery."
          >
            <textarea
              className={`${inputClass} min-h-[130px] resize-y`}
              placeholder="Rebuild the checkout flow in Next.js: cart review, address form, payment step and order confirmation. Deployed to a public URL with the repo linked."
              value={form.brief}
              onChange={(e) => set("brief", e.target.value)}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount">
              <input
                className={`${inputClass} money`}
                type="number"
                min="1"
                step="0.01"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                required
              />
            </Field>
            <Field label="Currency">
              <select
                className={inputClass}
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>PKR</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Client name">
              <input
                className={inputClass}
                placeholder="Acme Store"
                value={form.clientName}
                onChange={(e) => set("clientName", e.target.value)}
              />
            </Field>
            <Field label="Freelancer name">
              <input
                className={inputClass}
                placeholder="Your name"
                value={form.freelancerName}
                onChange={(e) => set("freelancerName", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Deadline" hint="Defaults to 7 days from now.">
            <input
              className={inputClass}
              type="date"
              value={form.deadline}
              onChange={(e) => set("deadline", e.target.value)}
            />
          </Field>

          {error && <p className="text-[14px] text-danger">{error}</p>}

          <Button type="submit" loading={busy} className="w-full">
            {busy ? "Creating…" : "Create milestone"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
