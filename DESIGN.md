# TrustLock — DESIGN.md

Design language: premium fintech dark. Reference blend: Linear's near-black product
canvas + hairline-bordered panels, Stripe's money typography (tabular figures wherever
an amount appears). No gradients-as-decoration, no purple/blue headline gradients.

## Tokens

- canvas: `#0A0B0E` (near black, never pure black)
- surface-1: `#111318` panels
- surface-2: `#16181E` raised
- hairline: `#23262E` borders
- ink: `#F2F4F7` primary text
- ink-muted: `#A7AEBB`
- ink-faint: `#6B7280`
- brand (trust emerald): `#2FD39A`
- brand-deep: `#0E9F6E`
- held (escrow amber): `#F5A524`
- danger (dispute red): `#F0524F`
- info: `#5E8BFF`

## Typography

- Display: "Bricolage Grotesque", weights 500–700, tight tracking (-0.02em). Solid ink
  color only — never gradient text.
- Body: system-ui stack, 16px base, 1.55 line height.
- Money: `font-variant-numeric: tabular-nums` on every amount, always with currency code.

## Composition rules (anti-slop)

- Left-aligned headings everywhere. No centered hero-template.
- No 3-feature-card rows, no bento grids, no numbered "01/02/03" sections.
- Buttons: 10px radius, solid fills, no pills, no glows.
- Status is communicated by color + label text, never color alone.
- One restrained entrance animation per page max (fade/slide 200ms). Honor
  prefers-reduced-motion.
- Real copy only. Every number on screen is either live data or a labeled demo value.

## Signature elements

- The "vault bar": a horizontal escrow-state strip on the milestone page showing
  HELD → VERIFYING → RELEASED as segmented progress with amounts in tabular figures.
- Transaction timeline: vertical, timestamped, monospace hashes.
- Verdict card: checklist of AI checks with pass/fail marks and a confidence meter.
