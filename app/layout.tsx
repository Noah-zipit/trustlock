import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TrustLock — AI escrow for freelancers",
  description:
    "The client funds the milestone, the money is held, and an AI verifier releases it only when the work checks out. No more ghosted invoices.",
  metadataBase: new URL("https://trustlock.dev"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-full bg-canvas text-ink flex flex-col">
        {children}
      </body>
    </html>
  );
}
