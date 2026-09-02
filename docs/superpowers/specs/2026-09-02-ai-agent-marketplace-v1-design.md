# AI Agent Marketplace — V1 Design Specification

**Status:** Approved · **Date:** 2026-09-02 · **Source PRD:** `docs/AI Agent marketplace.txt`

## Context

`D:\AI Agent Marketplace` currently contains one file: a PRD at `docs/AI Agent marketplace.txt`. Nothing is built. The goal is a two-sided digital-goods marketplace — the "ThemeForest of AI agents" — where buyers purchase and download self-hostable automation workflows (n8n, Make, LangChain, scripts) and run them in their own environment with their own API keys.

The PRD is strong on product and weak on sequencing: its "Phase 1 MVP" bundles seven subsystems (auth, listings, search, payments, subscriptions, disputes, admin, automated trust scanning) into one release. For a solo founder that is a 6–9 month build that front-loads seller tooling nobody has asked for yet.

**Decisions made during planning:**

| Question | Decision |
|---|---|
| Who builds it | Solo founder + Claude Code |
| Launch supply | Founder authors the first listings; no public seller signup in V1 |
| Payments | Razorpay (test mode first), ThemeForest-style wallet |
| Checkout | Both — direct per-item pay **and** wallet balance |
| Refunds | Return as wallet store credit (instant, no gateway reversal) |
| Subscriptions | **Not in V1.** One-time purchase only |
| Reviews | In V1, purchase-gated |
| Refund disputes | In V1, as a threaded message log (not realtime chat) |
| Stack | Chosen below |

**Intended outcome of V1:** a real buyer can find an agent, pay for it, download it, and get their money back if it doesn't work — with every rupee traceable in a ledger. Everything else waits.

### Regulatory note (act on this before real money)

Buyer wallet balance is **non-withdrawable store credit** — spendable on the platform, never cashed out. Seller earnings are a **payable balance** settled by manual bank transfer on request. This is deliberate: holding cash-out-able customer funds in India implicates prepaid-payment-instrument rules. Have a CA/lawyer review before switching Razorpay to live mode.

---

## Stack

Optimized for one person shipping and operating this alone. One language, one repo, one deployable, managed everything.

| Layer | Choice | Why |
|---|---|---|
| App | **Next.js 15 (App Router) + TypeScript** | One codebase for UI, API routes, and server actions. Server Components keep the catalog fast and SEO-indexable. |
| DB | **Postgres (Neon) + Prisma** | Relational integrity is non-negotiable for a ledger. Prisma gives typed queries and migrations. |
| Auth | **Auth.js v5** — email magic link + Google OAuth | No per-seat vendor cost. Single account with role flags (`isAdmin`), matching the PRD's role-switchable model. |
| File storage | **Cloudflare R2**, private bucket | S3-compatible, **zero egress fees** — decisive for a business whose product is downloads. |
| Payments | **Razorpay Orders API + Standard Checkout**, webhooks | Test mode throughout V1. |
| Email | **Resend** + React Email | Receipts, refund notices, magic links. |
| Hosting | **Vercel** + Vercel Cron | Cron drives the refund-window release job. |
| Errors | **Sentry** | Money code must page you when it throws. |
| Testing | **Vitest** (ledger/domain) + **Playwright** (money-path E2E) | |

Demo videos in V1 are **hosted URLs** (YouTube/Vimeo unlisted) validated and embedded — no video upload/transcode pipeline. Screenshots upload to R2.

---

## Architecture

Modular monolith. Domain logic lives in `src/server/<module>/` as plain TypeScript, callable from both server actions and route handlers. UI never touches Prisma directly.

```
src/
  app/                      # routes: (public) catalog, (buyer) dashboard, (admin), api/
  server/
    ledger/                 # THE core module — double-entry money
    catalog/                # listings, versions, categories, platforms, search
    orders/                 # cart-less checkout, order lifecycle, entitlements
    payments/razorpay/      # order creation, webhook verification, idempotency
    delivery/               # R2 presigning, entitlement checks, download logging
    trust/                  # upload scanning hook, listing publish validator
    refunds/                # refund requests, message threads, admin decisions
    reviews/
    admin/                  # audit log, withdrawals
  components/ui/            # design system
  lib/                      # db, auth, env (zod-validated), money helpers
```

**Rule enforced throughout: money is `BigInt` paise.** No floats, no `number`, anywhere in the money path.

### The ledger (build this first, get it right)

Append-only double-entry. Every movement of money writes a set of entries summing to exactly zero, under one transaction and one idempotency key.

```prisma
model LedgerAccount {
  id      String   @id @default(cuid())
  kind    AccountKind   // USER_WALLET | SELLER_EARNINGS | PLATFORM_REVENUE
                        // | GATEWAY_CLEARING | PAYOUTS_PAYABLE
  ownerId String?       // null for platform-level accounts
  @@unique([kind, ownerId])
}

model LedgerEntry {
  id             String   @id @default(cuid())
  transactionId  String   // groups the balanced set
  accountId      String
  amountPaise    BigInt   // signed; the set MUST sum to 0
  availableAt    DateTime?  // seller earnings held until refund window closes
  reason         LedgerReason
  refType        String?  // "order" | "topup" | "refund" | "withdrawal"
  refId          String?
  createdAt      DateTime @default(now())
  @@index([accountId, createdAt])
  @@unique([transactionId, accountId, reason])
}
```

Balances are **derived** (`SUM(amountPaise)`), never stored as a mutable column. Entries are never updated or deleted — a correction is a new reversing transaction.

The five money flows:

| Flow | Debit | Credit |
|---|---|---|
| Wallet top-up | `GATEWAY_CLEARING` | `USER_WALLET` |
| Purchase from wallet | `USER_WALLET` | `SELLER_EARNINGS` (net) + `PLATFORM_REVENUE` (commission) |
| Direct purchase | `GATEWAY_CLEARING` | `SELLER_EARNINGS` (net) + `PLATFORM_REVENUE` |
| Refund approved | `SELLER_EARNINGS` + `PLATFORM_REVENUE` | `USER_WALLET` |
| Seller withdrawal | `SELLER_EARNINGS` | `PAYOUTS_PAYABLE` (admin marks settled) |

Invariants enforced by tests and a nightly reconciliation script: every `transactionId` sums to zero; no `USER_WALLET` balance goes negative; sum of all accounts equals zero.

Seller earnings post with `availableAt = now + 14 days` (the refund window). A Vercel cron job does nothing but advance them to withdrawable — the hold is a query filter, not a state machine.

### Secure delivery

The PRD is right that this must be backend-enforced. Implementation:

1. Files live in a **private** R2 bucket; object keys are opaque cuids and never leave the server.
2. `GET /api/download/[entitlementId]` checks: session user owns the entitlement, status is `ACTIVE`, listing version matches.
3. On pass, mint a **60-second** presigned R2 URL and 302 to it.
4. Write a `DownloadEvent` (user, IP, UA, version, timestamp) — abuse signal and dispute evidence.
5. Refund approved → `Entitlement.status = REVOKED`. Any already-issued URL dies within 60s.

No download links are ever rendered into HTML. No public bucket. No permanent URLs.

### Razorpay integration

Server creates a Razorpay Order; client opens Standard Checkout; **fulfilment happens only in the webhook handler**, never in the browser callback. Webhooks verify HMAC signature, then insert into a `WebhookEvent` table with a unique constraint on Razorpay's event id — duplicate deliveries become no-ops. Fulfilment and the ledger write share one DB transaction.

Two payment intents: `TOPUP` (credits wallet) and `PURCHASE` (creates order + entitlement directly). Both land in the same webhook.

### Listing quality gate

The PRD's mandatory-documentation rule is a liability shield, so it's enforced by a validator that blocks `publish`, not by discipline. A listing cannot go live without: title, description, category, platform tag, ≥1 screenshot, demo video URL, usage description, **structured required-credentials list**, setup guide (markdown), ≥1 file asset, license type, price.

`trust/scan.ts` in V1 is deliberately light — extension allowlist, size cap, zip inspection, regex secret-scan for hardcoded API keys in JSON/text. It runs at the same hook point where ClamAV and dependency scanning will slot in later.

### Design system

Implements PRD §14 verbatim as CSS variables in Tailwind: Void `#0B0E14`, Panel `#141B26`, Ledger `#1F2733`, Signal amber `#E8A33D`, Circuit teal `#3FC7B0`, text `#EDEFF4`/`#8891A0`, Danger `#E2554C`. Amber is reserved for money actions, teal for trust signals — enforced by naming the tokens `--color-action-*` and `--color-trust-*` so misuse reads wrong in code. Geometric sans for UI, monospace for filenames, credential names, versions, JSON.

---

## Build sequence

Each milestone ends in something demonstrable. Ledger and delivery come before polish, because they're the parts that cannot be retrofitted.

**M0 — Foundation.** Next.js + TS + Tailwind, zod-validated env, Prisma + Neon, Auth.js (magic link + Google), design tokens, app shell/nav, Sentry. *Done when: you can sign in and see an empty catalog.*

**M1 — Catalog.** Full Prisma schema. Category/Platform seeds. Admin listing CRUD with the publish validator. Public catalog with filters (category, platform, price, rating) and Postgres full-text search. Listing detail page with all PRD §5.2 sections. *Done when: you can create a listing in admin and browse it publicly.*

**M2 — Money.** Ledger module + its unit tests **before** any Razorpay code. Razorpay order creation, checkout, signature-verified idempotent webhook. Wallet top-up. Direct purchase. Order → Entitlement. Wallet page with transaction history. *Done when: a Razorpay test card completes both a top-up and a purchase, and the ledger balances.*

**M3 — Delivery.** R2 private bucket, admin file upload with scan hook, entitlement-gated presigned downloads, download logging, buyer library ("My Agents") with per-version download history. *Done when: a purchased file downloads and an unpurchased one 403s.*

**M4 — Trust.** Purchase-gated reviews + rating aggregate on listings. Refund request form → threaded message log → admin approve/deny. Approval atomically revokes entitlement, writes the reversing ledger transaction, and credits the wallet. Transactional email on each state change. *Done when: a full request→discuss→approve→revoke cycle works end to end.*

**M5 — Admin & ops.** Admin dashboard (orders, refunds, listings, users), seller earnings view with held-vs-available split, withdrawal request + manual settle, immutable audit log on every admin action, nightly reconciliation script. *Done when: you can run the business from `/admin`.*

**M6 — Launch prep.** ToS, license texts (Personal + Commercial), refund policy, privacy policy, the PRD §8.6 third-party-code consent gate at checkout. SEO metadata, sitemap, OG images. Analytics for the PRD §9 KPIs. Razorpay live-mode switch checklist. *Done when: legally and operationally ready to take real money.*

## Verification

- **Ledger unit tests (Vitest)** — sum-to-zero per transaction, idempotent replay of the same key is a no-op, wallet cannot go negative, refund exactly reverses its purchase, commission math at boundary values.
- **Money-path E2E (Playwright)** against Razorpay test mode: top-up → purchase → download → refund → download now 403s.
- **Delivery security tests** — download without entitlement, with a revoked entitlement, with someone else's entitlement, and with an expired presigned URL all fail closed.
- **Webhook replay test** — deliver the same Razorpay event 3×, assert exactly one order and one ledger transaction.
- **Reconciliation script** (`pnpm reconcile`) — all accounts sum to zero; Razorpay captured total matches `GATEWAY_CLEARING`.
- **Manual pass per milestone** in the running app, plus a Lighthouse check on the catalog and listing pages before M6.

## Explicitly out of scope for V1

Subscriptions and recurring billing · self-serve seller signup and listing wizard · automated payouts / Razorpay Route · sandbox "try before you buy" · hosted agent execution · affiliate program · bundles · multi-currency · extended/resale license tier · realtime chat.

Each has a designed seam (payment abstraction, seller role, entitlement versioning, license enum) so adding it later is additive, not a rewrite.

## Next step

Produce the M0 implementation plan via the writing-plans workflow, then execute milestone by milestone.
