# Product Requirements Document (PRD)
## AI Agent Marketplace — "AgentStore"
### The ThemeForest of AI Agents & Automation Workflows

**Version:** 2.0 (Production-Ready)
**Date:** September 7, 2026
**Model Reference:** ThemeForest / Envato Market / TemplateMonster — but for AI agents & automation workflows instead of website themes

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Opportunity](#2-problem-statement--opportunity)
3. [Target Users](#3-target-users)
4. [Product Scope & Phases](#4-product-scope--phases)
5. [Core End-to-End Flows](#5-core-end-to-end-flows)
6. [Key Features by Module](#6-key-features-by-module)
7. [Monetization Model](#7-monetization-model)
8. [Trust, Safety & Quality Control](#8-trust-safety--quality-control)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Notification System](#10-notification-system)
11. [Search & Discovery](#11-search--discovery)
12. [File Storage & Delivery](#12-file-storage--delivery)
13. [API Architecture](#13-api-architecture)
14. [Legal & Compliance](#14-legal--compliance)
15. [Error Handling & Edge Cases](#15-error-handling--edge-cases)
16. [Analytics & Reporting](#16-analytics--reporting)
17. [Design & Theme Guidelines](#17-design--theme-guidelines)
18. [Tech Stack & System Architecture](#18-tech-stack--system-architecture)
19. [Database Schema Design](#19-database-schema-design)
20. [API Route Structure](#20-api-route-structure)
21. [Deployment Architecture](#21-deployment-architecture)
22. [Success Metrics (KPIs)](#22-success-metrics-kpis)
23. [Resolved Decisions](#23-resolved-decisions)
24. [Recommendations](#24-recommendations)
25. [Roadmap](#25-roadmap)

---

## 1. Executive Summary

An open, two-sided marketplace where anyone can **build an AI agent / automation workflow on any platform** (n8n, Make, Zapier, LangChain, custom Python, etc.) and **list it for sale as a downloadable file**. Buyers browse, purchase, download, and self-host the agent in their own environment.

This is fundamentally a **digital goods marketplace** (like ThemeForest) applied to the AI agent/automation category — not a hosting platform. The platform's core value is **discovery + trust + transaction**, not execution.

**Core Value Proposition:**
- **For Sellers:** Monetize reusable AI agents/workflows → passive income from one-time builds
- **For Buyers:** Skip the build phase → purchase production-ready agents, plug in your own API keys, deploy instantly
- **For the Platform:** Commission-based revenue from every transaction, subscription revenue share

---

## 2. Problem Statement & Opportunity

### The Problem
- Businesses increasingly want AI agents (lead-gen bots, support agents, data-scraping workflows, content pipelines) but **building from scratch is expensive** and requires technical skill.
- Freelancers/developers/no-code builders are already creating these workflows for clients one-off, with **no reusable resale channel**.
- Existing marketplaces (ThemeForest, Envato, Gumroad) don't have **agent/workflow-specific structure** — no way to show what triggers, what integrations, what AI model is used, compatibility, etc.

### The Opportunity
- Become the **"ThemeForest of AI Agents"** — first-mover advantage in a category that's growing fast (n8n, Make, LangChain ecosystems exploding).
- AI agent tooling market is projected to grow significantly — no dominant marketplace player exists yet.
- Unlike SaaS-execution platforms (which are expensive to run), a **download-and-self-host** model keeps infrastructure costs low while the market is validated.

---

## 3. Target Users

### 3.1 Seller Persona

| Attribute | Detail |
|---|---|
| **Who** | Freelance automation builders, agencies, hobbyist no-coders, AI developers |
| **Motivation** | Passive income from reusable workflows, portfolio/visibility, audience building |
| **Behavior** | Already builds agents/workflows for clients, wants a channel to sell templates |
| **Key Need** | Easy listing creation, reliable payouts, seller analytics, buyer support tools |
| **Access** | Open marketplace — anyone with a verified account can list |

### 3.2 Buyer Persona

| Attribute | Detail |
|---|---|
| **Who** | SMB owners, agencies/freelancers, developers |
| **Motivation** | Deploy automation without building from scratch, save time, get working reference |
| **Behavior** | Searches for specific use-case solutions, compares options, reads reviews |
| **Key Need** | Clear documentation, demo videos, trustworthy sellers, working downloads |
| **Concern** | Security of downloaded files, will it work with my setup, refund if broken |

### 3.3 Admin Persona

| Attribute | Detail |
|---|---|
| **Who** | Platform operators, trust & safety team |
| **Motivation** | Maintain marketplace quality, prevent fraud, grow GMV |
| **Key Need** | Listing approval queue, dispute resolution tools, fraud monitoring, revenue dashboards |

---

## 4. Product Scope & Phases

### Phase 1 — MVP (Month 1–5)

| Module | Scope |
|---|---|
| **Auth** | Email/password + Google OAuth signup, role-switchable accounts (buyer ↔ seller), email verification, seller 2FA |
| **Seller Flow** | Profile setup, payout method, create listing (all mandatory fields), submit for review, seller dashboard |
| **Buyer Flow** | Browse, search, filter, preview, purchase, download, reviews, support ticket |
| **Payments** | Stripe Connect (global) + Razorpay (India), one-time purchase, platform commission deduction |
| **Trust & Safety** | ClamAV file scanning, manual admin review queue, seller email verification badge |
| **Admin** | Listing approval/rejection, dispute handling, basic payout management, category management |
| **Notifications** | Email-based (transactional) — purchase confirmation, refund alerts, listing approval, new review |
| **Search** | PostgreSQL full-text search (tsvector), category + platform filters, price range filter |
| **Catalog Focus** | Start with **n8n + Make** workflows only (manageable quality review) |

### Phase 2 — Growth (Month 6–8)

| Module | Scope |
|---|---|
| **Versioning** | Seller pushes updates, buyers with active subscription get new versions, version history on listing |
| **Subscriptions** | Optional recurring billing for updates/support |
| **Analytics** | Seller dashboard (views, conversion, revenue charts), admin GMV dashboard |
| **Search Upgrade** | Migrate to Meilisearch for faceted search, typo-tolerance, relevance tuning |
| **Discovery** | Trending algorithm, featured listings, "compatible platform" filter expansion (Zapier, LangChain, custom scripts) |
| **Reviews** | Verified-purchase reviews, rating system, seller response to reviews |
| **Bundles** | Sellers can create bundles/collections at discounted prices |
| **Affiliate** | Referral program for buyers (share link → earn % on referred purchases) |
| **Notifications** | In-app notification center + email (real-time via WebSocket) |

### Phase 3 — Scale (Month 9+)

| Module | Scope |
|---|---|
| **Sandbox Preview** | Optional hosted "try before you buy" for compatible platforms |
| **API Layer** | Agent-as-a-service — hosted execution option (natural extension) |
| **Custom Requests** | Buyer posts requirement → sellers bid (freelance-marketplace hybrid) |
| **White-label** | Sellers can offer white-label/resale licenses |
| **Advanced Trust** | Automated quality scoring, AI-powered listing review assist, community moderation |
| **Mobile** | React Native or PWA for mobile experience |
| **Public API** | 3rd-party integrations — embed marketplace listings, webhook notifications |

---

## 5. Core End-to-End Flows

### 5.1 Seller Flow — List an Agent for Sale

```
┌──────────────────────────────────────────────────────────────────┐
│  SELLER FLOW                                                     │
│                                                                  │
│  Sign Up → Verify Email → Enable 2FA → Set Payout Method        │
│     │                                                            │
│     ▼                                                            │
│  Create Listing (mandatory fields):                              │
│     ├── Title + Description + Category                           │
│     ├── Platform Tag (n8n / Make / etc.)                         │
│     ├── Demo Video (real-world usage, not UI walkthrough)        │
│     ├── Usage Description (problem solved, inputs/outputs)       │
│     ├── Required API Keys List (exact credentials buyer needs)   │
│     ├── Setup Guide (step-by-step import + test instructions)    │
│     ├── Screenshots / Workflow Diagram                           │
│     ├── Upload Downloadable File (.json, .zip, .py, .yaml)      │
│     └── Pricing (one-time + optional subscription add-on)        │
│     │                                                            │
│     ▼                                                            │
│  Submit for Review                                               │
│     ├── Automated: Malware scan (ClamAV)                         │
│     ├── Automated: Credential-leak scan                          │
│     ├── Automated: File structure validation                     │
│     └── Manual: Admin quality check                              │
│     │                                                            │
│     ▼                                                            │
│  Approved → Listing Goes Live                                    │
│     │                                                            │
│     ▼                                                            │
│  Seller Dashboard: sales, revenue, reviews, buyer messages,      │
│  push updates to listing                                         │
└──────────────────────────────────────────────────────────────────┘
```

**Mandatory Listing Fields (listing cannot go live without these):**

| Field | Description | Validation |
|---|---|---|
| Title | Agent/workflow name | 5–100 chars, no spam keywords |
| Description | What it does, who it's for | 50–5000 chars, markdown supported |
| Category | Primary category | Must select from predefined list |
| Platform Tag | Compatible platform(s) | At least one from: n8n, Make, Zapier, LangChain, Custom Script |
| Demo Video | Real-world agent execution | Upload or YouTube/Loom link, min 30 seconds |
| Usage Description | Problem solved, inputs, outputs, ideal use case | 100–3000 chars |
| Required API Keys | Exact list of credentials buyer must provide | At least 1 entry, free-text per key |
| Setup Guide | Step-by-step: import → configure → test | 100–5000 chars, markdown supported |
| Screenshots | Visual proof of the agent/workflow | At least 1, max 10, each max 5MB |
| Downloadable File | The actual agent/workflow file(s) | .json, .zip, .py, .yaml, .yml — max 50MB |
| Price | One-time purchase price | Min ₹99 / $1.99, max ₹99,999 / $999 |

### 5.2 Buyer Flow — Discover & Purchase

```
┌──────────────────────────────────────────────────────────────────┐
│  BUYER FLOW                                                      │
│                                                                  │
│  Browse / Search Marketplace                                     │
│     ├── Filter: category, platform, price range, rating,         │
│     │          "verified seller", license type                   │
│     └── Sort: trending, newest, highest rated, price             │
│     │                                                            │
│     ▼                                                            │
│  View Listing Page:                                              │
│     ├── Demo video (real-world usage)                            │
│     ├── Usage description + required API keys checklist          │
│     ├── Setup guidance preview                                   │
│     ├── Screenshots + workflow diagram                           │
│     ├── Reviews + Q&A section                                    │
│     ├── Seller profile + verification badge                      │
│     └── Version history + last updated date                      │
│     │                                                            │
│     ▼                                                            │
│  Purchase Decision:                                              │
│     ├── Option A: One-time payment → instant download            │
│     └── Option B: One-time + subscription → download + updates   │
│     │                                                            │
│     ▼                                                            │
│  Payment (Stripe / Razorpay)                                     │
│     │                                                            │
│     ▼                                                            │
│  Download Page (unlocked):                                       │
│     ├── Download file(s)                                         │
│     ├── Full setup documentation                                 │
│     └── License terms                                            │
│     │                                                            │
│     ▼                                                            │
│  Post-Purchase:                                                  │
│     ├── Message seller for setup help                            │
│     ├── Leave review                                             │
│     ├── Raise refund/dispute request                             │
│     └── (If subscribed) Get notified on new versions             │
└──────────────────────────────────────────────────────────────────┘
```

### 5.3 Post-Purchase / Support & Refund Flow

**Support Flow:**
1. Buyer raises support ticket → routed to seller first
2. Seller responds within SLA (recommended: 48 hours for MVP)
3. If unresolved after 5 days → auto-escalates to admin mediation
4. Subscription lapses → buyer keeps last downloaded version but stops receiving updates

**Refund/Dispute Flow (Chat-Based Resolution):**

```
┌──────────────────────────────────────────────────────────────────┐
│  REFUND FLOW                                                     │
│                                                                  │
│  Buyer requests refund (any reason)                              │
│     │                                                            │
│     ▼                                                            │
│  Opens chat/dispute thread tied to that purchase                 │
│     │                                                            │
│     ▼                                                            │
│  Seller notified instantly (in-app + email)                      │
│     │                                                            │
│     ▼                                                            │
│  Buyer & Seller discuss in-thread                                │
│     ├── Seller offers setup help → issue resolved → case closed  │
│     ├── Seller approves refund → refund processed                │
│     └── No resolution (5 days) → escalates to admin mediation    │
│     │                                                            │
│     ▼                                                            │
│  On Refund Approval:                                             │
│     ├── Payment reversed to buyer                                │
│     ├── Download access immediately revoked (backend-enforced)   │
│     ├── Active subscription cancelled                            │
│     └── Commission clawed back from seller payout                │
│                                                                  │
│  DOWNLOAD ACCESS RULES:                                          │
│     • Before purchase: download button disabled/locked           │
│     • After purchase: signed URL generated (expires in 24hr)     │
│     • After refund: all download URLs invalidated                │
│     • Enforcement: backend-only (signed/expiring URLs tied to    │
│       purchase status), not just hidden in UI                    │
└──────────────────────────────────────────────────────────────────┘
```

### 5.4 Payout Flow (Seller)

```
┌──────────────────────────────────────────────────────────────────┐
│  PAYOUT FLOW                                                     │
│                                                                  │
│  Sale completed                                                  │
│     │                                                            │
│     ▼                                                            │
│  Hold period: 14 days (refund window)                            │
│     │                                                            │
│     ▼                                                            │
│  Amount added to seller's "available balance"                    │
│     (sale price − platform commission − payment gateway fee)     │
│     │                                                            │
│     ▼                                                            │
│  Payout schedule: Bi-weekly (1st and 15th of each month)         │
│     │                                                            │
│     ▼                                                            │
│  Minimum payout threshold: ₹500 / $10                            │
│     │                                                            │
│     ▼                                                            │
│  Payout via: Stripe Connect (bank transfer) / Razorpay X /      │
│  PayPal (international sellers)                                  │
│     │                                                            │
│     ▼                                                            │
│  Seller receives payout + invoice/statement                      │
│                                                                  │
│  COMMISSION STRUCTURE:                                           │
│     • One-time sales: 20% platform commission                    │
│     • Subscription revenue: 15% platform commission              │
│     • Payment gateway fee: ~2-3% (passed to buyer or absorbed)   │
│     • Early seller incentive: 15% commission for first 6 months  │
└──────────────────────────────────────────────────────────────────┘
```

### 5.5 Admin Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  ADMIN FLOW                                                      │
│                                                                  │
│  Listing Review Queue                                            │
│     ├── View submitted listing + scan results                    │
│     ├── Approve → listing goes live                              │
│     ├── Reject → seller notified with reason                     │
│     └── Request changes → seller edits and resubmits             │
│                                                                  │
│  Dispute Resolution                                              │
│     ├── View escalated dispute thread (full chat history)        │
│     ├── Decision: refund buyer / side with seller / partial      │
│     └── Record decision + notify both parties                    │
│                                                                  │
│  Platform Management                                             │
│     ├── Category/tag management                                  │
│     ├── Commission rate configuration                            │
│     ├── Featured listing management                              │
│     ├── Seller account suspension/ban                            │
│     ├── Fraud monitoring dashboard                               │
│     └── Revenue & GMV reporting                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Key Features by Module

| Module | Features |
|---|---|
| **Catalog / Discovery** | Full-text search, faceted filters (category, platform, price, rating, license type), trending/featured sections, collections, auto-suggestions, SEO-optimized listing URLs |
| **Listing Page** | Rich media (video + screenshots), documentation tabs (usage / setup / API keys), version history, Q&A section, reviews with verified-purchase badge, "similar agents" recommendations |
| **Seller Dashboard** | Listing CRUD + status tracking, sales analytics (views → clicks → purchases funnel), revenue charts, payout history, buyer messages, version push with changelog, performance insights |
| **Buyer Dashboard** | Purchase history with re-download access, active subscriptions management, support tickets, wishlist/favorites, review management, download history |
| **Payments & Licensing** | Stripe Connect + Razorpay integration, one-time + subscription billing, license type selector (personal / commercial / extended), refund processing, invoice generation |
| **Trust & Safety** | ClamAV malware scan, credential-leak scanner, file structure validator, manual review queue, seller verification badges (email ✓, identity ✓, trusted seller), rating/review system, report-listing flow |
| **Admin Panel** | Approval queue with scan results, dispute resolution center, commission config, category/tag management, fraud monitoring, seller/buyer management, platform analytics dashboard |
| **Notifications** | Email (transactional via Resend), in-app notification center, real-time updates (WebSocket), notification preferences per user |
| **Messaging** | Purchase-tied chat threads, dispute threads, seller Q&A responses, file/screenshot sharing in chat |

---

## 7. Monetization Model

### Revenue Streams

| Stream | Model | Rate |
|---|---|---|
| **One-time Sales Commission** | Platform takes % of every sale | 20% (15% introductory for first 6 months) |
| **Subscription Revenue Share** | Platform takes % of recurring subscription payments | 15% |
| **Featured Listings** | Sellers pay to feature their listing on homepage/category pages | ₹499–2999 / $9.99–49.99 per week (Phase 2) |
| **Promoted Search** | Sellers pay for top placement in search results | CPC model (Phase 3) |

### License Types

| License | Description | Typical Price Multiplier |
|---|---|---|
| **Personal** | Single user, single project, no resale | 1x (base price) |
| **Commercial** | Use for client projects, multi-project, no resale of template itself | 2–3x base price |
| **Extended** | White-label, resale of the workflow template allowed | 5–10x base price |

### Payment Gateway Fees

| Gateway | Transaction Fee | Use Case |
|---|---|---|
| **Stripe** | 2.9% + $0.30 (international), 2% + ₹2 (India) | Global payments, seller payouts via Stripe Connect |
| **Razorpay** | 2% + GST (India) | Indian buyers, UPI/netbanking support |

---

## 8. Trust, Safety & Quality Control

### Automated Pipeline (on every file upload)

```
┌──────────────────────────────────────────────────────────────────┐
│  FILE UPLOAD → SCANNING PIPELINE                                 │
│                                                                  │
│  Step 1: File Type Validation                                    │
│     ├── Allowed: .json, .zip, .py, .yaml, .yml, .js, .ts        │
│     ├── Max size: 50MB                                           │
│     └── Reject: executables (.exe, .bat, .sh), binaries          │
│                                                                  │
│  Step 2: Malware Scan (ClamAV)                                   │
│     ├── Full virus/trojan scan                                   │
│     └── Flag + block if threat detected                          │
│                                                                  │
│  Step 3: Credential Leak Scan                                    │
│     ├── Regex scan for hardcoded API keys, tokens, passwords     │
│     ├── Check for AWS keys, OpenAI keys, database URIs           │
│     └── Flag + warn seller if found                              │
│                                                                  │
│  Step 4: Structure Validation (platform-specific)                │
│     ├── n8n: validate JSON structure matches n8n workflow schema  │
│     ├── Make: validate blueprint JSON format                     │
│     └── Python: basic syntax check (ast.parse)                   │
│                                                                  │
│  Step 5: Content Hash                                            │
│     ├── SHA-256 hash for integrity verification                  │
│     └── Duplicate detection (same file already listed?)          │
│                                                                  │
│  Result → Pass (move to manual review) or Fail (reject + reason) │
└──────────────────────────────────────────────────────────────────┘
```

### Manual Review Checklist (Admin)

| Check | Criteria |
|---|---|
| Demo video quality | Shows real execution, not just UI, demonstrates actual output |
| Documentation completeness | Usage desc + API keys list + setup guide all present and clear |
| Category accuracy | Listed category matches the actual workflow purpose |
| Pricing reasonableness | Not obviously overpriced/underpriced for the category |
| Description quality | No spam, no misleading claims, properly formatted |
| File contents | Spot-check file matches description (especially for first-time sellers) |

### Seller Trust Tiers

| Tier | Requirements | Benefits |
|---|---|---|
| **New Seller** | Verified email | Basic listing, manual review on every listing |
| **Verified Seller** | Email + identity verification (KYC) | Verified badge, faster review queue |
| **Trusted Seller** | 10+ approved listings, 4.0+ avg rating, 0 active disputes, 3+ months | Auto-approval on new listings, featured seller placement, lower commission (18%) |

### Buyer Protections

- "You are installing third-party code — review before granting API access" consent banner
- Verified-purchase badge on reviews (only buyers who purchased can leave reviews)
- 14-day refund window on all purchases
- Download URLs are signed + expire (tied to purchase status)
- Report listing flow with admin response SLA (24 hours)

---

## 9. Authentication & Authorization

### Auth Strategy

| Method | Use Case |
|---|---|
| **Email + Password** | Primary signup/login, bcrypt hashed, minimum 8 chars |
| **Google OAuth** | Quick signup/login, link to existing account |
| **GitHub OAuth** | Developer-focused signup (Phase 2) |
| **Magic Link** | Password-free login via email (Phase 2) |
| **2FA (TOTP)** | Mandatory for sellers with active payouts, optional for buyers |

### Session Management

| Parameter | Value |
|---|---|
| Session token type | JWT (access token) + HTTP-only cookie (refresh token) |
| Access token expiry | 15 minutes |
| Refresh token expiry | 7 days (30 days if "remember me") |
| Concurrent sessions | Max 5 per account |
| Session invalidation | On password change, on 2FA enable/disable, on account suspension |

### Role-Based Access Control (RBAC)

```
┌────────────────────────────────────────────────────────────────┐
│  ROLE HIERARCHY                                                │
│                                                                │
│  Super Admin                                                   │
│     └── Can: everything + system config + admin management     │
│                                                                │
│  Admin                                                         │
│     └── Can: listing approval, disputes, user management,      │
│             category management, view analytics                │
│                                                                │
│  Seller (role on top of User)                                  │
│     └── Can: create/edit own listings, view own analytics,     │
│             respond to buyer messages, manage versions,        │
│             view payout history                                │
│                                                                │
│  Buyer (default User role)                                     │
│     └── Can: browse, purchase, download (own purchases),       │
│             leave reviews, raise support/refund, message       │
│             sellers (on purchased items only)                   │
│                                                                │
│  Guest (unauthenticated)                                       │
│     └── Can: browse catalog, view listing pages,               │
│             search/filter — cannot purchase/download/review    │
└────────────────────────────────────────────────────────────────┘
```

### Security Measures

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt with salt rounds = 12 |
| Rate limiting | Login: 5 attempts/15min per IP. API: 100 req/min per user |
| CSRF protection | Double-submit cookie pattern |
| XSS prevention | Input sanitization + CSP headers |
| SQL injection | Parameterized queries via Prisma ORM |
| Admin audit log | Every admin action logged with timestamp, actor, action, target |

---

## 10. Notification System

### Notification Channels

| Channel | Technology | Use Case |
|---|---|---|
| **Email** | Resend API | Transactional: purchase confirmation, refund, payout, verification |
| **In-App** | Database + API polling (MVP), WebSocket (Phase 2) | Real-time: new sale, new review, listing approved, support message |
| **Push** | Web Push API (Phase 3) | Re-engagement: new version available, featured listing |

### Notification Templates

| Event | Recipient | Channel | Priority |
|---|---|---|---|
| Purchase confirmation | Buyer | Email + In-App | High |
| New sale alert | Seller | Email + In-App | High |
| Listing approved | Seller | Email + In-App | Medium |
| Listing rejected (with reason) | Seller | Email + In-App | High |
| Refund requested | Seller | Email + In-App | High |
| Refund approved/denied | Buyer | Email + In-App | High |
| Dispute escalated to admin | Admin | Email + In-App | High |
| New review on listing | Seller | In-App | Medium |
| New version available | Subscribed Buyers | Email + In-App | Medium |
| Payout processed | Seller | Email + In-App | Medium |
| Support message received | Buyer/Seller | In-App + Email (digest) | Medium |
| Subscription renewal reminder | Buyer | Email | Medium |
| Subscription payment failed | Buyer + Seller | Email + In-App | High |
| Account verification reminder | User | Email | Low |
| Seller 2FA required reminder | Seller | Email | High |

### Notification Preferences

Users can configure per-channel preferences:
- **Email notifications:** on/off per category (sales, reviews, support, marketing)
- **In-app notifications:** always on for critical (purchases, refunds), toggleable for others
- **Email digest mode:** real-time or daily digest (for non-critical notifications)

---

## 11. Search & Discovery

### Search Architecture

**MVP (Phase 1):** PostgreSQL full-text search
- `tsvector` + `tsquery` for title, description, tags
- GIN index for fast lookups
- Adequate for <10,000 listings

**Phase 2:** Migrate to Meilisearch
- Sub-50ms search responses
- Typo tolerance (crucial for searching technical terms)
- Faceted filtering
- Custom relevance tuning
- Synonym support (e.g., "chatbot" = "conversational agent")

### Search & Filter Parameters

| Filter | Type | Values |
|---|---|---|
| **Query** | Text | Free-text search across title, description, tags |
| **Category** | Multi-select | Sales & CRM, Customer Support, Data Scraping, Content Generation, Marketing Automation, Developer Tools, Finance & Accounting, HR & Recruitment, Social Media, Other |
| **Platform** | Multi-select | n8n, Make (Integromat), Zapier, LangChain, AutoGen, CrewAI, Custom Python, Custom JavaScript, Other |
| **Price Range** | Range slider | Min–Max (₹ or $) |
| **Rating** | Min threshold | 3+, 4+, 4.5+ stars |
| **License Type** | Select | Personal, Commercial, Extended |
| **Seller Type** | Multi-select | Verified Seller, Trusted Seller |
| **Sort By** | Select | Relevance, Trending, Newest, Highest Rated, Price Low→High, Price High→Low, Most Downloaded |

### Discovery Features

| Feature | Description |
|---|---|
| **Trending** | Algorithm: (purchases_last_7_days × 0.4) + (views_last_7_days × 0.2) + (avg_rating × 0.3) + (recency_score × 0.1) |
| **Featured** | Admin-curated + paid placement (Phase 2) |
| **Collections** | Curated groups: "Best n8n Agents for Marketing", "Top 10 CRM Automation" |
| **Similar Agents** | Based on category + platform + tag overlap |
| **Recently Viewed** | Per-user, stored in localStorage |
| **Wishlist** | Save listings for later |

### SEO Strategy (Listing Pages)

| Element | Implementation |
|---|---|
| URL structure | `/agents/{category-slug}/{listing-slug}-{id}` |
| Title tag | `{Agent Name} - {Category} | AgentStore` |
| Meta description | Auto-generated from first 160 chars of listing description |
| Structured data | JSON-LD `Product` schema with price, rating, availability |
| Open Graph tags | Title, description, thumbnail for social sharing |
| Sitemap | Auto-generated, submitted to Google Search Console |
| Canonical URLs | Prevent duplicate content across filter/sort variations |

---

## 12. File Storage & Delivery

### Storage Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  FILE STORAGE ARCHITECTURE                                       │
│                                                                  │
│  Upload Flow:                                                    │
│  Seller uploads → Temp S3 bucket → Scanning Pipeline             │
│     ├── Pass → Move to Production S3 bucket                      │
│     └── Fail → Delete from Temp + notify seller                  │
│                                                                  │
│  Storage Structure (S3):                                         │
│  /listings/{listing_id}/                                         │
│     ├── /versions/{version_id}/                                  │
│     │     ├── agent-file.zip (the downloadable)                  │
│     │     └── metadata.json (hash, size, scan result)            │
│     ├── /media/                                                  │
│     │     ├── demo-video.mp4                                     │
│     │     ├── screenshot-1.webp                                  │
│     │     ├── screenshot-2.webp                                  │
│     │     └── workflow-diagram.webp                              │
│     └── /thumbnails/                                             │
│           └── listing-thumb.webp (auto-generated)                │
│                                                                  │
│  Download Flow:                                                  │
│  Buyer clicks download → Backend checks purchase status          │
│     ├── Valid purchase → Generate signed S3 URL (expires 1hr)    │
│     ├── Refunded → Return 403 Forbidden                         │
│     └── No purchase → Return 401 Unauthorized                   │
└──────────────────────────────────────────────────────────────────┘
```

### File Constraints

| Parameter | Limit |
|---|---|
| Max file size (downloadable) | 50 MB |
| Max file size (demo video) | 100 MB |
| Max file size (screenshot) | 5 MB per image |
| Max screenshots per listing | 10 |
| Allowed downloadable types | .json, .zip, .py, .yaml, .yml, .js, .ts, .tar.gz |
| Allowed image types | .jpg, .jpeg, .png, .webp, .gif |
| Allowed video types | .mp4, .webm (or YouTube/Loom link) |
| Image optimization | Auto-convert to WebP, resize to max 1920px width |
| Version retention | Keep all versions (seller can delete old versions) |

### CDN & Delivery

| Asset Type | Delivery Method |
|---|---|
| Listing images/thumbnails | CloudFront CDN (public, cached) |
| Demo videos | CloudFront CDN (public, cached) or YouTube/Loom embed |
| Downloadable files | Signed S3 URLs (private, expires 1 hour, single-use token) |

---

## 13. API Architecture

### Architecture Pattern

**Backend:** RESTful API (JSON) with versioned endpoints
- Base URL: `https://api.agentstore.com/v1/`
- Authentication: Bearer token (JWT)
- Content-Type: `application/json`
- Rate Limiting: Token bucket algorithm via Redis

**Why REST over GraphQL:**
- Simpler to implement and debug for MVP
- Better caching with CDN (GET endpoints)
- More familiar for future 3rd-party integrations
- GraphQL can be added in Phase 3 for complex queries if needed

### API Versioning

| Version | Status | Support |
|---|---|---|
| `v1` | Active | Full support, MVP + Phase 2 |
| `v2` | Future | When breaking changes are needed |

Versioning via URL path (`/v1/`, `/v2/`), not headers — simpler for consumers.

### Rate Limiting

| Endpoint Group | Limit | Window |
|---|---|---|
| Auth (login, register) | 5 requests | 15 minutes per IP |
| Search / Browse | 60 requests | 1 minute per IP |
| Authenticated API | 100 requests | 1 minute per user |
| File Upload | 10 requests | 1 hour per user |
| Payment webhooks | Unlimited | N/A (validated by signature) |

### Standard Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "error": null
}
```

Error response:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "LISTING_NOT_FOUND",
    "message": "The requested listing does not exist.",
    "details": {}
  }
}
```

---

## 14. Legal & Compliance

### Terms of Service — Key Clauses

| Clause | Detail |
|---|---|
| **Platform Role** | AgentStore is a distribution channel (like Envato), not a service provider. Platform is not liable for how a downloaded agent performs once buyer supplies their own keys. |
| **Seller Responsibility** | Sellers warrant that uploaded files are original work (or properly licensed), free from malware, and accurately described. Sellers are responsible for supporting buyers. |
| **Buyer Responsibility** | Buyers acknowledge they are downloading and running third-party code. Buyers must review files before granting API key access. Buyers use their own credentials only. |
| **Intellectual Property** | Sellers retain IP ownership. License grants usage rights per selected license type. Platform gets non-exclusive right to display/market listings. |
| **Dispute Resolution** | Chat-based resolution first, admin mediation if unresolved, binding arbitration as last resort. |
| **Account Termination** | Platform can suspend/terminate accounts for ToS violations, fraud, or repeated disputes. Pending payouts held during investigation. |

### Privacy & Data Protection

| Regulation | Compliance Action |
|---|---|
| **GDPR (EU)** | Cookie consent, data export/deletion requests, DPA with processors |
| **CCPA (California)** | "Do Not Sell" opt-out, privacy policy disclosure |
| **India IT Act** | Grievance officer designation, data localization for payment data |

### Tax Compliance

| Region | Requirement | Implementation |
|---|---|---|
| **India** | GST on platform commission, TDS on seller payouts | Razorpay handles GST; generate Form 26Q for TDS |
| **US** | 1099-K for sellers exceeding threshold | Stripe Connect handles 1099 reporting |
| **EU** | VAT on digital goods (MOSS) | Stripe Tax for automated VAT calculation |
| **Global** | Invoice generation for every transaction | Auto-generated PDF invoices per purchase |

### DMCA / Copyright

1. Copyright holder submits takedown notice (via dedicated form)
2. Admin reviews within 24 hours
3. If valid → listing removed, seller notified with counter-notice option
4. Counter-notice filed → listing restored after 10 business days unless legal action filed
5. Repeat offenders → account termination

### Seller KYC (Know Your Customer)

| Tier | Required Documents | When |
|---|---|---|
| Basic | Email verification | Account creation |
| Verified | Government ID (Aadhaar/Passport/Driver's License) + selfie match | Before first payout |
| Business | Business registration certificate + GST/Tax ID | For business accounts (optional) |

---

## 15. Error Handling & Edge Cases

### Seller-Side Edge Cases

| Scenario | Handling |
|---|---|
| **Seller deletes listing with active subscriptions** | Block deletion → seller must first cancel all active subscriptions (7-day notice to subscribers), then delete |
| **Seller account suspended with pending payouts** | Payouts frozen during investigation. If cleared → resume. If permanent → hold for 90 days (dispute window), then refund remaining to buyers or release to seller per admin decision |
| **Seller uploads file that fails scan** | File rejected → seller notified with specific reason → seller can fix and re-upload |
| **File upload fails midway** | Implement resumable uploads (tus protocol or S3 multipart upload). Show upload progress. Auto-cleanup failed uploads after 24 hours |
| **Seller pushes version update to listing** | All subscribed buyers notified. Buyers without subscription keep their purchased version (no access to update) |
| **Seller changes price** | Existing purchasers unaffected. Active subscriptions continue at original rate until next renewal cycle |

### Buyer-Side Edge Cases

| Scenario | Handling |
|---|---|
| **Payment fails mid-checkout** | Transaction rolled back. No purchase record created. Buyer shown retry option. Log failed attempt |
| **Subscription renewal payment fails** | 3 retry attempts over 7 days (day 1, day 3, day 7). After 3rd failure → subscription cancelled, buyer notified, loses access to future updates |
| **Buyer downloads then requests refund** | Download count tracked. If downloaded, refund request flagged for manual review. Signed URLs invalidated on refund approval regardless |
| **Downloaded file is corrupted** | SHA-256 hash displayed on download page. Buyer can verify integrity. If mismatch → auto-replace download |
| **Buyer disputes legitimate purchase** | Chat-based resolution. Admin can see download logs, payment logs, chat history. Decision based on evidence |

### Platform-Level Edge Cases

| Scenario | Handling |
|---|---|
| **Payment gateway outage** | Detect via health check → show maintenance message → queue transactions for retry → switch to backup gateway if available |
| **S3/Storage outage** | CloudFront serves cached assets. Downloads deferred with "try again in X minutes" message. Alert admin |
| **Database failover** | Read replicas serve traffic during primary failover. Writes queued and replayed |
| **DDoS / Abuse** | Cloudflare WAF + rate limiting. Auto-block IPs exceeding thresholds. CAPTCHA on auth endpoints |
| **Data breach protocol** | Immediate: rotate all secrets, invalidate sessions. Within 72hrs: notify affected users (GDPR requirement). Document and report |

---

## 16. Analytics & Reporting

### Seller Analytics Dashboard

| Metric | Visualization | Detail |
|---|---|---|
| **Revenue** | Line chart (daily/weekly/monthly) | Total revenue, revenue per listing, commission deducted |
| **Sales Funnel** | Funnel chart | Views → Listing Page → Purchase → Download |
| **Conversion Rate** | Percentage + trend | Per listing and aggregate |
| **Top Listings** | Ranked table | By revenue, by views, by rating |
| **Reviews Summary** | Star distribution + recent reviews | Average rating, total reviews, sentiment |
| **Buyer Geography** | Map / top countries list | Where your buyers are from |
| **Payout History** | Table | Date, amount, status, method |

### Admin Platform Analytics

| Metric | Visualization | Detail |
|---|---|---|
| **GMV (Gross Merchandise Value)** | Line chart + total | Total transaction value across platform |
| **Platform Revenue** | Line chart | Commission earned (one-time + subscription) |
| **Active Sellers/Buyers** | KPI cards + trend | MAU/WAU for each role |
| **Listing Health** | Table | New listings, approval rate, rejection reasons, avg time-to-approve |
| **Category Performance** | Bar chart | Revenue and listings per category |
| **Trust Metrics** | KPI cards | Refund rate, dispute rate, avg resolution time, flagged listings |
| **Conversion Funnel** | Funnel | Homepage → Search → Listing → Purchase |
| **Cohort Retention** | Heatmap | Buyer return rate by signup month |
| **Fraud Signals** | Alert feed | Unusual patterns (mass downloads, fake reviews, etc.) |

### Revenue Reporting (Tax)

| Report | Recipient | Frequency |
|---|---|---|
| **Seller Earnings Statement** | Seller | Monthly (downloadable PDF) |
| **Transaction Report** | Seller | On-demand (CSV export) |
| **Platform Revenue Report** | Admin/Finance | Monthly |
| **GST/Tax Report** | Admin/Finance | Monthly/Quarterly (per regulation) |
| **1099-K / Form 26Q** | Seller / Tax Authority | Annual |

---

## 17. Design & Theme Guidelines

### Color System

Chosen direction: **deep blue-black base (not pure black) + warm amber accent + teal secondary accent** — deliberately avoids the two most common AI-product clichés (pure-black-with-neon-purple, and generic SaaS blue-on-white).

**Amber signals "marketplace/value"** (price, buy CTA); **teal signals "trust/verification"** (badges, platform tags) — this split gives every screen a clear visual grammar: gold = money-related actions, teal = trust-related signals.

| Token | Hex | CSS Variable | Usage |
|---|---|---|---|
| Void | `#0B0E14` | `--color-void` | Page background |
| Panel | `#141B26` | `--color-panel` | Cards, listing tiles, nav bar |
| Surface | `#1A2332` | `--color-surface` | Elevated panels, modals, dropdowns |
| Ledger | `#1F2733` | `--color-ledger` | Borders, dividers, hairlines |
| Signal (amber) | `#E8A33D` | `--color-signal` | Primary CTA, price, "Buy Now", subscribe button |
| Signal Hover | `#D4922E` | `--color-signal-hover` | Hover state for amber CTAs |
| Circuit (teal) | `#3FC7B0` | `--color-circuit` | Verified badge, platform tags, links, success |
| Circuit Hover | `#35B09C` | `--color-circuit-hover` | Hover state for teal elements |
| Text Primary | `#EDEFF4` | `--color-text-primary` | Headings, titles |
| Text Secondary | `#B8BEC9` | `--color-text-secondary` | Body text, descriptions |
| Text Muted | `#8891A0` | `--color-text-muted` | Metadata, secondary labels |
| Danger | `#E2554C` | `--color-danger` | Refund/dispute alerts, errors, "Report" |
| Danger Hover | `#CB4A42` | `--color-danger-hover` | Hover state for danger elements |
| Warning | `#E8C33D` | `--color-warning` | Warning states, pending status |
| Success | `#3FC77B` | `--color-success` | Success messages, positive indicators |

### Typography

| Element | Font | Weight | Size |
|---|---|---|---|
| **Headings (H1–H3)** | Inter | 700 (Bold) | 32px / 24px / 20px |
| **Body text** | Inter | 400 (Regular) | 16px |
| **Small text / metadata** | Inter | 400 | 14px |
| **Buttons** | Inter | 600 (Semibold) | 14px–16px |
| **Technical text** (filenames, API keys, code) | JetBrains Mono | 400 | 14px |
| **Price tags** | Inter | 700 | 24px–32px |

### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | 4px | Tight element gaps |
| `--space-sm` | 8px | Inline elements, icon gaps |
| `--space-md` | 16px | Card padding, form gaps |
| `--space-lg` | 24px | Section gaps |
| `--space-xl` | 32px | Major section separation |
| `--space-2xl` | 48px | Page-level sections |
| `--space-3xl` | 64px | Hero/banner spacing |

### Component Design Rules

| Rule | Detail |
|---|---|
| **Border radius** | Cards: 12px. Buttons: 8px. Inputs: 8px. Badges: 16px (pill). |
| **Shadows** | Minimal — use border (`--color-ledger`) for card edges. Subtle `box-shadow` only on modals and dropdowns: `0 8px 32px rgba(0,0,0,0.4)` |
| **Amber usage** | Reserved for money/action moments ONLY: price tags, Buy/Subscribe buttons, revenue numbers. Don't overuse decoratively. |
| **Teal usage** | Verification badges, platform compatibility tags, links, success states. Acts as a trust-scan color for browsing. |
| **Flat surfaces** | No gradients or glow effects on surfaces. Flat + generous spacing reads more trustworthy for a real-money marketplace. |
| **Monospace accent** | Use JetBrains Mono for: filenames, API key fields, JSON snippets, version numbers, technical metadata. Reinforces "this is code/tech" credibility. |
| **Hover states** | Subtle background shift (lighten by 1 step) + cursor:pointer. No scale transforms on cards (feels cheap). |
| **Transitions** | All interactive elements: `transition: all 0.2s ease`. No jarring state changes. |

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column, stacked cards, hamburger nav |
| Tablet | 640px – 1024px | 2-column grid, collapsible sidebar |
| Desktop | 1024px – 1440px | 3–4 column grid, full sidebar |
| Wide | > 1440px | Max-width container (1440px), centered |

---

## 18. Tech Stack & System Architecture

### Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) + TypeScript | SSR for SEO (listing pages), React ecosystem, ISR for catalog, built-in API routes |
| **Styling** | Tailwind CSS v4 | Rapid development, consistent design system, utility-first |
| **Client State** | Zustand | Lightweight, no boilerplate, simple global state |
| **Server State** | TanStack Query (React Query) | Server state caching, background refetch, optimistic updates |
| **Backend** | Node.js + Fastify + TypeScript | High performance, schema validation, same language as frontend |
| **Database** | PostgreSQL (via Neon or Supabase) | ACID transactions for payments, relational data model, JSONB flexibility |
| **ORM** | Prisma | Type-safe queries, auto-generated types, migration system |
| **Auth** | NextAuth.js v5 (Auth.js) | OAuth + credentials, session management, RBAC middleware |
| **Payments** | Stripe Connect + Razorpay | Marketplace split payments, seller onboarding, multi-currency |
| **File Storage** | AWS S3 + CloudFront CDN | Secure signed URLs, versioned storage, global delivery |
| **Search** | PostgreSQL tsvector (MVP) → Meilisearch (Phase 2) | Start simple, upgrade when listing count justifies it |
| **Real-time** | Socket.io | Notifications, chat/dispute threads, dashboard live updates |
| **Email** | Resend | Developer-friendly transactional email, React Email templates |
| **File Scanning** | ClamAV (containerized) + custom validators | Open-source malware scan + platform-specific file validation |
| **Job Queue** | BullMQ (Redis-backed) | File scan pipeline, payout jobs, email queue, subscription renewals |
| **Caching** | Redis (Upstash) | Session store, rate limiting, search cache, hot listing cache |
| **Monitoring** | Sentry (errors) + PostHog (analytics) + Better Stack (uptime) | Full observability stack |
| **CI/CD** | GitHub Actions | Automated testing, lint, build, deploy pipeline |
| **Hosting** | Vercel (frontend) + Railway (backend + workers) | Vercel for Next.js optimization, Railway for backend simplicity |

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐  │
│  │   Browser    │────▶│   Cloudflare     │────▶│   Vercel (Next.js)  │  │
│  │   (Client)   │     │   WAF + CDN      │     │   Frontend + SSR    │  │
│  └─────────────┘     └──────────────────┘     └─────────┬───────────┘  │
│                                                          │              │
│                                              ┌───────────▼───────────┐  │
│                                              │   Railway (Backend)   │  │
│                                              │   Fastify API Server  │  │
│                                              └───┬───┬───┬───┬───┬──┘  │
│                                                  │   │   │   │   │     │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐     │   │   │   │   │     │
│    │PostgreSQL │◀─┤  Redis   │  │Meilisearch│◀────┘   │   │   │   │    │
│    │  (Neon)   │  │(Upstash) │  │ (Phase 2) │        │   │   │   │     │
│    └──────────┘  └──────────┘  └──────────┘         │   │   │   │     │
│                                                      │   │   │   │     │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐         │   │   │   │     │
│    │  AWS S3   │◀─┤CloudFront│  │  BullMQ   │◀───────┘   │   │   │    │
│    │ (Storage) │  │  (CDN)   │  │ (Workers) │            │   │   │     │
│    └──────────┘  └──────────┘  └────┬──────┘            │   │   │     │
│                                      │                   │   │   │     │
│                                 ┌────▼──────┐           │   │   │     │
│                                 │  ClamAV   │           │   │   │     │
│                                 │ (Scanner) │           │   │   │     │
│                                 └───────────┘           │   │   │     │
│                                                         │   │   │     │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │   │     │
│    │  Stripe   │◀─┤ Razorpay │  │  Resend  │◀───────────┘   │   │    │
│    │ Connect   │  │          │  │ (Email)  │                │   │     │
│    └──────────┘  └──────────┘  └──────────┘                │   │     │
│                                                             │   │     │
│    ┌──────────┐  ┌──────────┐                              │   │     │
│    │ Socket.io │◀─┤ PostHog  │◀─────────────────────────────┘   │    │
│    │(Realtime) │  │(Analytics)│                                  │     │
│    └──────────┘  └──────────┘                                   │     │
│                                                                  │     │
│    ┌──────────┐                                                  │     │
│    │  Sentry   │◀────────────────────────────────────────────────┘    │
│    │ (Errors)  │                                                      │
│    └──────────┘                                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Background Job Architecture (BullMQ)

| Queue | Jobs | Priority | Retry |
|---|---|---|---|
| `file-scan` | Malware scan, credential scan, structure validation | High | 3 retries, 5min backoff |
| `payments` | Payout processing, subscription renewal, refund processing | Critical | 5 retries, exponential backoff |
| `email` | Transactional emails, digest emails | Medium | 3 retries, 2min backoff |
| `notifications` | In-app notification creation, push notifications | Medium | 2 retries, 1min backoff |
| `analytics` | Event tracking, report generation | Low | 1 retry |
| `cleanup` | Expired temp file cleanup, session cleanup | Low | 1 retry |

---

## 19. Database Schema Design

### Entity Relationship Overview

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│   User   │────▶│  Listing │────▶│   Version    │
└────┬─────┘     └────┬─────┘     └──────────────┘
     │                │
     │           ┌────▼─────┐     ┌──────────────┐
     │           │  Media   │     │   Category   │
     │           └──────────┘     └──────────────┘
     │
     ├──────────▶┌──────────┐     ┌──────────────┐
     │           │ Purchase │────▶│   Download   │
     │           └────┬─────┘     └──────────────┘
     │                │
     │           ┌────▼─────┐
     │           │  Review  │
     │           └──────────┘
     │
     ├──────────▶┌──────────┐     ┌──────────────┐
     │           │ Payout   │     │   Dispute    │
     │           └──────────┘     └──────────────┘
     │
     └──────────▶┌──────────┐
                 │Notificat.│
                 └──────────┘
```

### Core Tables

#### users
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),          -- NULL if OAuth-only
    name            VARCHAR(150) NOT NULL,
    avatar_url      VARCHAR(500),
    bio             TEXT,
    role            VARCHAR(20) DEFAULT 'buyer',  -- 'buyer', 'seller', 'admin', 'super_admin'
    
    -- Seller-specific
    is_seller       BOOLEAN DEFAULT false,
    seller_verified BOOLEAN DEFAULT false,  -- KYC done
    seller_tier     VARCHAR(20) DEFAULT 'new',  -- 'new', 'verified', 'trusted'
    stripe_account_id VARCHAR(255),         -- Stripe Connect account
    razorpay_account_id VARCHAR(255),       -- Razorpay linked account
    payout_method   VARCHAR(50),            -- 'stripe', 'razorpay', 'paypal'
    
    -- Auth
    email_verified  BOOLEAN DEFAULT false,
    two_fa_enabled  BOOLEAN DEFAULT false,
    two_fa_secret   VARCHAR(255),
    oauth_provider  VARCHAR(50),            -- 'google', 'github', NULL
    oauth_id        VARCHAR(255),
    
    -- Preferences
    notification_prefs JSONB DEFAULT '{}',
    
    -- Meta
    status          VARCHAR(20) DEFAULT 'active',  -- 'active', 'suspended', 'banned'
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_seller ON users(is_seller) WHERE is_seller = true;
```

#### categories
```sql
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon        VARCHAR(50),               -- icon name or emoji
    parent_id   UUID REFERENCES categories(id),  -- for subcategories
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### platforms
```sql
CREATE TABLE platforms (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,     -- 'n8n', 'Make', 'Zapier', etc.
    slug        VARCHAR(100) UNIQUE NOT NULL,
    icon_url    VARCHAR(500),
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### listings
```sql
CREATE TABLE listings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id           UUID NOT NULL REFERENCES users(id),
    
    -- Content
    title               VARCHAR(100) NOT NULL,
    slug                VARCHAR(150) UNIQUE NOT NULL,
    description         TEXT NOT NULL,
    usage_description   TEXT NOT NULL,           -- what problem it solves
    setup_guide         TEXT NOT NULL,           -- step-by-step instructions
    required_api_keys   JSONB NOT NULL,          -- [{name, description, required}]
    tags                TEXT[] DEFAULT '{}',
    
    -- Relations
    category_id         UUID NOT NULL REFERENCES categories(id),
    
    -- Pricing
    price_amount        DECIMAL(10,2) NOT NULL,  -- in smallest currency unit conceptually
    price_currency      VARCHAR(3) DEFAULT 'USD',
    subscription_price  DECIMAL(10,2),           -- optional monthly subscription for updates
    license_types       JSONB DEFAULT '[{"type":"personal","multiplier":1}]',
    
    -- File
    file_url            VARCHAR(500),            -- S3 path to current version
    file_size_bytes     BIGINT,
    file_hash           VARCHAR(64),             -- SHA-256
    current_version     VARCHAR(20) DEFAULT '1.0.0',
    
    -- Metrics (denormalized for performance)
    total_sales         INTEGER DEFAULT 0,
    total_views         INTEGER DEFAULT 0,
    avg_rating          DECIMAL(3,2) DEFAULT 0,
    total_reviews       INTEGER DEFAULT 0,
    
    -- Status
    status              VARCHAR(20) DEFAULT 'draft',
    -- 'draft', 'pending_review', 'approved', 'rejected', 'suspended', 'archived'
    rejection_reason    TEXT,
    approved_at         TIMESTAMPTZ,
    approved_by         UUID REFERENCES users(id),
    
    -- Scan results
    scan_status         VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'scanning', 'passed', 'failed'
    scan_results        JSONB DEFAULT '{}',
    
    -- SEO
    meta_title          VARCHAR(70),
    meta_description    VARCHAR(160),
    
    -- Search (PostgreSQL full-text)
    search_vector       TSVECTOR,
    
    -- Meta
    featured            BOOLEAN DEFAULT false,
    featured_until      TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    published_at        TIMESTAMPTZ
);

CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_search ON listings USING GIN(search_vector);
CREATE INDEX idx_listings_price ON listings(price_amount);
CREATE INDEX idx_listings_rating ON listings(avg_rating DESC);
CREATE INDEX idx_listings_featured ON listings(featured) WHERE featured = true;
CREATE INDEX idx_listings_tags ON listings USING GIN(tags);
```

#### listing_platforms (many-to-many)
```sql
CREATE TABLE listing_platforms (
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES platforms(id),
    PRIMARY KEY (listing_id, platform_id)
);
```

#### listing_versions
```sql
CREATE TABLE listing_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    version_number  VARCHAR(20) NOT NULL,
    changelog       TEXT,
    file_url        VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    file_hash       VARCHAR(64),
    scan_status     VARCHAR(20) DEFAULT 'pending',
    scan_results    JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(listing_id, version_number)
);

CREATE INDEX idx_versions_listing ON listing_versions(listing_id);
```

#### listing_media
```sql
CREATE TABLE listing_media (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    type        VARCHAR(20) NOT NULL,  -- 'screenshot', 'video', 'diagram'
    url         VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    sort_order  INTEGER DEFAULT 0,
    alt_text    VARCHAR(255),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_listing ON listing_media(listing_id);
```

#### purchases
```sql
CREATE TABLE purchases (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id            UUID NOT NULL REFERENCES users(id),
    listing_id          UUID NOT NULL REFERENCES listings(id),
    seller_id           UUID NOT NULL REFERENCES users(id),
    version_id          UUID REFERENCES listing_versions(id),
    
    -- Payment
    amount              DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(3) DEFAULT 'USD',
    license_type        VARCHAR(20) DEFAULT 'personal',
    payment_gateway     VARCHAR(20) NOT NULL,  -- 'stripe', 'razorpay'
    gateway_payment_id  VARCHAR(255),          -- Stripe/Razorpay payment ID
    gateway_charge_id   VARCHAR(255),
    
    -- Commission
    platform_commission DECIMAL(10,2) NOT NULL,
    commission_rate     DECIMAL(5,4) NOT NULL,  -- e.g., 0.2000 = 20%
    seller_earnings     DECIMAL(10,2) NOT NULL,
    gateway_fee         DECIMAL(10,2) DEFAULT 0,
    
    -- Subscription
    has_subscription    BOOLEAN DEFAULT false,
    subscription_id     UUID REFERENCES subscriptions(id),
    
    -- Status
    status              VARCHAR(20) DEFAULT 'completed',
    -- 'pending', 'completed', 'refunded', 'disputed', 'failed'
    
    -- Download tracking
    download_count      INTEGER DEFAULT 0,
    last_downloaded_at  TIMESTAMPTZ,
    download_access     BOOLEAN DEFAULT true,  -- revoked on refund
    
    -- Meta
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX idx_purchases_listing ON purchases(listing_id);
CREATE INDEX idx_purchases_seller ON purchases(seller_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE UNIQUE INDEX idx_purchases_unique ON purchases(buyer_id, listing_id) 
    WHERE status IN ('completed', 'pending');
```

#### subscriptions
```sql
CREATE TABLE subscriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id            UUID NOT NULL REFERENCES users(id),
    listing_id          UUID NOT NULL REFERENCES listings(id),
    purchase_id         UUID REFERENCES purchases(id),
    
    -- Billing
    amount              DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(3) DEFAULT 'USD',
    billing_cycle       VARCHAR(20) DEFAULT 'monthly',  -- 'monthly', 'yearly'
    gateway_subscription_id VARCHAR(255),
    
    -- Status
    status              VARCHAR(20) DEFAULT 'active',
    -- 'active', 'cancelled', 'past_due', 'expired'
    current_period_start TIMESTAMPTZ,
    current_period_end   TIMESTAMPTZ,
    cancelled_at         TIMESTAMPTZ,
    
    -- Retry tracking
    failed_payments     INTEGER DEFAULT 0,
    last_payment_attempt TIMESTAMPTZ,
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_buyer ON subscriptions(buyer_id);
CREATE INDEX idx_subscriptions_listing ON subscriptions(listing_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### downloads
```sql
CREATE TABLE downloads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id     UUID NOT NULL REFERENCES purchases(id),
    buyer_id        UUID NOT NULL REFERENCES users(id),
    listing_id      UUID NOT NULL REFERENCES listings(id),
    version_id      UUID REFERENCES listing_versions(id),
    
    ip_address      INET,
    user_agent      TEXT,
    file_hash       VARCHAR(64),         -- hash at time of download
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_downloads_purchase ON downloads(purchase_id);
CREATE INDEX idx_downloads_buyer ON downloads(buyer_id);
```

#### reviews
```sql
CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES purchases(id),
    buyer_id    UUID NOT NULL REFERENCES users(id),
    listing_id  UUID NOT NULL REFERENCES listings(id),
    
    rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title       VARCHAR(200),
    body        TEXT,
    
    -- Seller response
    seller_response TEXT,
    seller_responded_at TIMESTAMPTZ,
    
    -- Moderation
    is_verified_purchase BOOLEAN DEFAULT true,
    is_flagged  BOOLEAN DEFAULT false,
    status      VARCHAR(20) DEFAULT 'published',  -- 'published', 'hidden', 'removed'
    
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(purchase_id)  -- one review per purchase
);

CREATE INDEX idx_reviews_listing ON reviews(listing_id);
CREATE INDEX idx_reviews_buyer ON reviews(buyer_id);
CREATE INDEX idx_reviews_rating ON reviews(listing_id, rating);
```

#### disputes
```sql
CREATE TABLE disputes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id     UUID NOT NULL REFERENCES purchases(id),
    buyer_id        UUID NOT NULL REFERENCES users(id),
    seller_id       UUID NOT NULL REFERENCES users(id),
    
    reason          VARCHAR(50) NOT NULL,
    -- 'not_as_described', 'doesnt_work', 'missing_docs', 'security_concern', 'other'
    description     TEXT NOT NULL,
    
    -- Resolution
    status          VARCHAR(20) DEFAULT 'open',
    -- 'open', 'seller_responded', 'escalated', 'resolved_refund',
    -- 'resolved_no_refund', 'resolved_partial', 'withdrawn'
    resolution_note TEXT,
    resolved_by     UUID REFERENCES users(id),  -- admin who resolved
    resolved_at     TIMESTAMPTZ,
    
    -- Auto-escalation
    escalated_at    TIMESTAMPTZ,
    auto_escalate_at TIMESTAMPTZ,  -- 5 days after opening
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_disputes_purchase ON disputes(purchase_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_seller ON disputes(seller_id);
```

#### dispute_messages
```sql
CREATE TABLE dispute_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id  UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    sender_id   UUID NOT NULL REFERENCES users(id),
    sender_role VARCHAR(20) NOT NULL,  -- 'buyer', 'seller', 'admin'
    message     TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',    -- [{url, filename, type}]
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dispute_msgs_dispute ON dispute_messages(dispute_id);
```

#### payouts
```sql
CREATE TABLE payouts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id           UUID NOT NULL REFERENCES users(id),
    
    amount              DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(3) DEFAULT 'USD',
    payout_method       VARCHAR(20) NOT NULL,  -- 'stripe', 'razorpay', 'paypal'
    gateway_payout_id   VARCHAR(255),
    
    -- Period
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,
    
    -- Breakdown
    total_sales_amount  DECIMAL(10,2),
    total_commission    DECIMAL(10,2),
    total_refunds       DECIMAL(10,2),
    net_amount          DECIMAL(10,2) NOT NULL,
    
    -- Status
    status              VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'processing', 'completed', 'failed'
    processed_at        TIMESTAMPTZ,
    failure_reason      TEXT,
    
    -- Invoice
    invoice_url         VARCHAR(500),
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payouts_seller ON payouts(seller_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_period ON payouts(period_start, period_end);
```

#### notifications
```sql
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    
    type        VARCHAR(50) NOT NULL,
    -- 'sale', 'purchase', 'review', 'listing_approved', 'listing_rejected',
    -- 'refund_request', 'refund_approved', 'dispute_escalated',
    -- 'payout', 'version_update', 'support_message', 'subscription_renewal'
    
    title       VARCHAR(200) NOT NULL,
    body        TEXT,
    data        JSONB DEFAULT '{}',    -- contextual data (listing_id, purchase_id, etc.)
    link        VARCHAR(500),          -- in-app navigation link
    
    is_read     BOOLEAN DEFAULT false,
    read_at     TIMESTAMPTZ,
    
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

#### admin_audit_logs
```sql
CREATE TABLE admin_audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id    UUID NOT NULL REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,
    -- 'listing_approved', 'listing_rejected', 'user_suspended', 'user_banned',
    -- 'dispute_resolved', 'payout_processed', 'category_created', etc.
    target_type VARCHAR(50),           -- 'listing', 'user', 'dispute', 'payout'
    target_id   UUID,
    details     JSONB DEFAULT '{}',
    ip_address  INET,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_action ON admin_audit_logs(action);
CREATE INDEX idx_audit_target ON admin_audit_logs(target_type, target_id);
```

#### listing_views (analytics)
```sql
CREATE TABLE listing_views (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID NOT NULL REFERENCES listings(id),
    viewer_id   UUID REFERENCES users(id),  -- NULL for guests
    ip_address  INET,
    user_agent  TEXT,
    referrer    VARCHAR(500),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Partitioned by month for performance
CREATE INDEX idx_views_listing ON listing_views(listing_id);
CREATE INDEX idx_views_date ON listing_views(created_at);
```

---

## 20. API Route Structure

### Authentication
```
POST   /v1/auth/register            # Email + password signup
POST   /v1/auth/login               # Email + password login
POST   /v1/auth/logout              # Invalidate session
POST   /v1/auth/refresh             # Refresh access token
POST   /v1/auth/forgot-password     # Send password reset email
POST   /v1/auth/reset-password      # Reset password with token
POST   /v1/auth/verify-email        # Verify email with token
GET    /v1/auth/oauth/google        # Google OAuth redirect
GET    /v1/auth/oauth/google/callback
POST   /v1/auth/2fa/enable          # Enable TOTP 2FA
POST   /v1/auth/2fa/verify          # Verify TOTP code
POST   /v1/auth/2fa/disable         # Disable 2FA
```

### Users & Profiles
```
GET    /v1/users/me                 # Get current user profile
PATCH  /v1/users/me                 # Update profile
PATCH  /v1/users/me/avatar          # Upload avatar
GET    /v1/users/me/notifications   # Get notifications (paginated)
PATCH  /v1/users/me/notifications/:id  # Mark notification as read
POST   /v1/users/me/notifications/read-all  # Mark all as read
GET    /v1/users/me/preferences     # Get notification preferences
PATCH  /v1/users/me/preferences     # Update preferences
GET    /v1/users/:id/public         # Get public seller profile
```

### Seller
```
POST   /v1/seller/onboard           # Start seller onboarding
PATCH  /v1/seller/payout-method     # Set/update payout method
POST   /v1/seller/kyc               # Submit KYC documents
GET    /v1/seller/dashboard         # Dashboard summary stats
GET    /v1/seller/analytics         # Detailed analytics (views, sales, revenue)
GET    /v1/seller/payouts           # Payout history
GET    /v1/seller/payouts/:id       # Payout detail
```

### Listings
```
GET    /v1/listings                  # Browse/search listings (public)
GET    /v1/listings/featured        # Featured listings (public)
GET    /v1/listings/trending        # Trending listings (public)
GET    /v1/listings/:slug           # Get listing detail (public)
POST   /v1/listings                 # Create new listing (seller)
PATCH  /v1/listings/:id             # Update listing (seller, own only)
DELETE /v1/listings/:id             # Delete listing (seller, own only)
POST   /v1/listings/:id/submit      # Submit for review (seller)
POST   /v1/listings/:id/upload      # Upload downloadable file (seller)
POST   /v1/listings/:id/media       # Upload screenshot/video (seller)
DELETE /v1/listings/:id/media/:mediaId  # Remove media (seller)
GET    /v1/listings/:id/versions    # Get version history (public)
POST   /v1/listings/:id/versions    # Push new version (seller)
GET    /v1/listings/:id/reviews     # Get reviews (public)
GET    /v1/listings/:id/qa          # Get Q&A (public)
POST   /v1/listings/:id/qa          # Post question (buyer)
POST   /v1/listings/:id/report      # Report listing (any user)
```

### Purchases & Downloads
```
POST   /v1/purchases                # Create purchase (initiate payment)
GET    /v1/purchases                # Get buyer's purchase history
GET    /v1/purchases/:id            # Get purchase detail
POST   /v1/purchases/:id/download   # Generate signed download URL
POST   /v1/purchases/:id/refund     # Request refund
```

### Subscriptions
```
GET    /v1/subscriptions            # Get buyer's active subscriptions
POST   /v1/subscriptions/:id/cancel # Cancel subscription
```

### Reviews
```
POST   /v1/reviews                  # Create review (buyer, purchased only)
PATCH  /v1/reviews/:id              # Update review (buyer, own only)
DELETE /v1/reviews/:id              # Delete review (buyer, own only)
POST   /v1/reviews/:id/respond      # Seller response to review
```

### Disputes
```
POST   /v1/disputes                 # Open dispute (buyer)
GET    /v1/disputes                 # Get user's disputes
GET    /v1/disputes/:id             # Get dispute detail + messages
POST   /v1/disputes/:id/messages    # Send message in dispute
POST   /v1/disputes/:id/withdraw    # Withdraw dispute (buyer)
POST   /v1/disputes/:id/approve-refund  # Approve refund (seller)
```

### Categories & Platforms
```
GET    /v1/categories               # List all categories (public)
GET    /v1/platforms                 # List all platforms (public)
```

### Webhooks (Payment Gateways)
```
POST   /v1/webhooks/stripe          # Stripe webhook handler
POST   /v1/webhooks/razorpay        # Razorpay webhook handler
```

### Admin
```
GET    /v1/admin/listings/queue      # Get review queue
POST   /v1/admin/listings/:id/approve    # Approve listing
POST   /v1/admin/listings/:id/reject     # Reject listing (with reason)
GET    /v1/admin/disputes            # Get escalated disputes
POST   /v1/admin/disputes/:id/resolve    # Resolve dispute
GET    /v1/admin/users               # User management
PATCH  /v1/admin/users/:id/status    # Suspend/ban user
GET    /v1/admin/analytics           # Platform analytics
GET    /v1/admin/payouts             # Manage payouts
POST   /v1/admin/payouts/process     # Trigger payout batch
GET    /v1/admin/categories          # Category management
POST   /v1/admin/categories          # Create category
PATCH  /v1/admin/categories/:id      # Update category
DELETE /v1/admin/categories/:id      # Delete category
GET    /v1/admin/audit-logs          # Audit log viewer
GET    /v1/admin/config              # Platform configuration
PATCH  /v1/admin/config              # Update commission %, etc.
```

---

## 21. Deployment Architecture

### Environment Strategy

| Environment | Purpose | Hosting | Database |
|---|---|---|---|
| **Development** | Local development | localhost | Local PostgreSQL / Docker |
| **Staging** | Pre-production testing, QA | Vercel Preview + Railway Dev | Neon branch (free) |
| **Production** | Live marketplace | Vercel Pro + Railway Pro | Neon Pro / Supabase Pro |

### CI/CD Pipeline (GitHub Actions)

```
┌──────────────────────────────────────────────────────────────┐
│  CI/CD PIPELINE                                              │
│                                                              │
│  Push to feature branch:                                     │
│     ├── Lint (ESLint + Prettier)                             │
│     ├── Type check (tsc --noEmit)                            │
│     ├── Unit tests (Vitest)                                  │
│     └── Build check (next build)                             │
│                                                              │
│  Pull Request to main:                                       │
│     ├── All above +                                          │
│     ├── Integration tests                                    │
│     ├── E2E tests (Playwright — critical flows)              │
│     └── Vercel Preview deployment                            │
│                                                              │
│  Merge to main:                                              │
│     ├── All above +                                          │
│     ├── Database migration (Prisma migrate deploy)           │
│     ├── Deploy frontend (Vercel auto-deploy)                 │
│     ├── Deploy backend (Railway auto-deploy)                 │
│     └── Post-deploy health check                             │
│                                                              │
│  Release tag (v1.x.x):                                       │
│     └── Production deployment with rollback capability       │
└──────────────────────────────────────────────────────────────┘
```

### Infrastructure Costs (Estimated Monthly)

| Service | Plan | Estimated Cost |
|---|---|---|
| Vercel | Pro | $20/month |
| Railway | Pro (backend + workers) | $20–50/month |
| Neon PostgreSQL | Pro | $19/month |
| Upstash Redis | Pro | $10/month |
| AWS S3 | Pay-as-you-go | $5–20/month (early stage) |
| CloudFront CDN | Pay-as-you-go | $5–15/month |
| Resend | Pro (50k emails) | $20/month |
| Sentry | Team | $26/month |
| PostHog | Free tier (1M events) | $0 |
| Meilisearch Cloud (Phase 2) | Build | $30/month |
| ClamAV | Self-hosted on Railway | Included in Railway cost |
| **Total (MVP)** | | **~$150–200/month** |

### Scaling Strategy

| Stage | Traffic | Action |
|---|---|---|
| **Launch** | <1000 users/day | Single Railway instance, Neon free/pro |
| **Growth** | 1k–10k users/day | Railway auto-scaling, Neon read replicas, Redis caching aggressive |
| **Scale** | 10k–100k users/day | Move to AWS ECS/EKS, RDS PostgreSQL, ElastiCache, dedicated Meilisearch cluster |
| **Enterprise** | 100k+ users/day | Multi-region deployment, database sharding, dedicated CDN, Kubernetes |

---

## 22. Success Metrics (KPIs)

### Supply Side (Sellers)

| KPI | Target (Month 6) | Target (Month 12) |
|---|---|---|
| Active sellers | 50+ | 200+ |
| New listings/month | 20+ | 100+ |
| Listing approval rate | >70% | >80% |
| Seller retention (monthly) | >60% | >75% |
| Avg listings per seller | 2+ | 3+ |

### Demand Side (Buyers)

| KPI | Target (Month 6) | Target (Month 12) |
|---|---|---|
| Registered buyers | 500+ | 5,000+ |
| Monthly active buyers | 100+ | 1,000+ |
| View → Purchase conversion | >2% | >3.5% |
| Repeat purchase rate | >15% | >25% |
| Avg order value | ₹1,500 / $20 | ₹2,000 / $25 |

### Trust & Quality

| KPI | Target |
|---|---|
| Average listing rating | >4.0 stars |
| Listings flagged/removed | <5% |
| Refund rate | <10% |
| Dispute resolution time (avg) | <72 hours |
| Admin review turnaround | <24 hours |

### Revenue

| KPI | Target (Month 6) | Target (Month 12) |
|---|---|---|
| GMV (monthly) | ₹2L / $2.5k | ₹15L / $20k |
| Platform revenue (commission) | ₹40k / $500 | ₹3L / $4k |
| Subscription attach rate | >20% | >30% |
| MRR from subscriptions | ₹10k / $125 | ₹1L / $1.2k |

---

## 23. Resolved Decisions

| Decision | Resolution | Rationale |
|---|---|---|
| **Marketplace type** | Open marketplace — anyone can list | Lower barrier = more supply. Quality controlled via review queue. |
| **Delivery model** | Download + self-host (not hosted execution) | Low infrastructure cost, validated model (ThemeForest), buyers want control |
| **API key liability** | Buyers always use their own keys | Platform stays in "distribution channel" role, not service provider |
| **Refund process** | Chat-based, buyer-seller direct, admin escalation | Fair to both sides, builds trust, reduces frivolous refunds |
| **Download security** | Backend-enforced signed URLs, revoked on refund | Prevents "download then refund" abuse |
| **Tech stack** | Next.js + Fastify + PostgreSQL + Stripe | Full-stack TypeScript, ACID for payments, scalable, cost-effective |
| **Commission rate** | 20% (15% introductory) | Competitive with Envato, attractive for early sellers |
| **MVP platform focus** | n8n + Make only | Manageable quality review, most popular self-hostable platforms |

---

## 24. Recommendations

### Launch Strategy

1. **Quality bar at launch**: Keep every listing on **manual admin review** for the first 3–6 months. Once seller reputation matures (5+ approved listings, no complaints), auto-approve their future listings.

2. **Platform focus**: Launch MVP with **n8n + Make** workflows only. Expand to Zapier, LangChain, custom scripts in Phase 2 once review process is proven.

3. **Commission incentive**: Start at **15% commission** for the first 6 months to attract early sellers, then move to 20%.

4. **Seed the marketplace**: Before public launch, onboard **10–20 curated sellers** with pre-approved listings so buyers don't land on an empty marketplace.

5. **Content marketing**: Create blog content around "best n8n workflows for X" and "AI automation templates" to drive organic SEO traffic to listing pages.

6. **Community**: Build a Discord/Telegram community for sellers — feature requests, best practices, support.

### Open Questions (Require Business Decision)

| Question | Options | Recommendation |
|---|---|---|
| Commission % final rate | 15%, 20%, 25%, tiered by volume | 20% flat, 15% for first 6 months |
| Minimum payout threshold | ₹500, ₹1000, ₹2000 | ₹500 / $10 — keep it low for early sellers |
| Refund window duration | 7 days, 14 days, 30 days | 14 days (industry standard for digital goods) |
| Free listings allowed? | Yes (freemium), No (all paid) | Yes — free listings drive traffic, sellers can upsell paid versions |
| Listing creation fee? | Yes (anti-spam), No | No fee — rely on review queue for quality control |

---

## 25. Roadmap

### Phase 1 — MVP (Month 1–5)

| Month | Focus | Deliverables |
|---|---|---|
| **Month 1** | Foundation | Project setup, auth system, database schema, user registration/login, basic UI shell (nav, layout, design system) |
| **Month 2** | Seller Core | Seller onboarding, listing creation form (all mandatory fields), file upload to S3, seller dashboard (basic) |
| **Month 3** | Buyer Core + Payments | Catalog page, listing detail page, search/filter, Stripe Connect integration, purchase flow, download with signed URLs |
| **Month 4** | Trust + Admin | ClamAV scanning pipeline, admin review queue, admin panel (listings, users, disputes), refund/dispute flow |
| **Month 5** | Polish + Launch | Reviews/ratings, email notifications (Resend), SEO optimization, testing (unit + E2E), bug fixes, soft launch |

### Phase 2 — Growth (Month 6–8)

| Month | Focus | Deliverables |
|---|---|---|
| **Month 6** | Versioning + Search | Listing versioning, Meilisearch integration, subscription billing (Stripe), expanded platform support |
| **Month 7** | Analytics + Discovery | Seller analytics dashboard, trending algorithm, featured listings, collections, Razorpay integration (India) |
| **Month 8** | Community + Trust | Advanced reviews (seller response, verified badge), affiliate/referral program, seller trust tiers, bundles |

### Phase 3 — Scale (Month 9+)

| Quarter | Focus | Deliverables |
|---|---|---|
| **Q4** | Advanced Features | Sandbox preview (try before buy), in-app real-time notifications (Socket.io), mobile-responsive PWA |
| **Q5** | Expansion | Public API, custom request marketplace (buyer posts → sellers bid), white-label licenses |
| **Q6+** | Platform | Agent-as-a-service (hosted execution), advanced fraud detection, multi-language support, enterprise features |

---

## Appendix A: Folder Structure (Monorepo)

```
agentstore/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/         # Auth pages (login, register, etc.)
│   │   │   ├── (marketplace)/  # Public pages (browse, listing detail)
│   │   │   ├── dashboard/      # Buyer dashboard
│   │   │   ├── seller/         # Seller dashboard
│   │   │   ├── admin/          # Admin panel
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx        # Homepage
│   │   ├── components/         # React components
│   │   │   ├── ui/             # Design system components
│   │   │   ├── listing/        # Listing-specific components
│   │   │   ├── dashboard/      # Dashboard components
│   │   │   └── layout/         # Layout components (nav, footer, sidebar)
│   │   ├── lib/                # Utilities, hooks, stores
│   │   ├── styles/             # Global CSS, Tailwind config
│   │   └── public/             # Static assets
│   │
│   └── api/                    # Fastify backend
│       ├── src/
│       │   ├── routes/         # API route handlers
│       │   │   ├── auth/
│       │   │   ├── listings/
│       │   │   ├── purchases/
│       │   │   ├── reviews/
│       │   │   ├── disputes/
│       │   │   ├── seller/
│       │   │   ├── admin/
│       │   │   └── webhooks/
│       │   ├── services/       # Business logic
│       │   ├── middleware/     # Auth, rate-limit, validation
│       │   ├── jobs/           # BullMQ job processors
│       │   ├── utils/          # Helpers
│       │   └── server.ts       # Fastify server entry
│       └── prisma/
│           ├── schema.prisma   # Database schema
│           └── migrations/     # Migration files
│
├── packages/
│   ├── shared/                 # Shared types, constants, validators
│   ├── email-templates/        # React Email templates
│   └── config/                 # Shared ESLint, TS configs
│
├── docker/
│   ├── clamav/                 # ClamAV container config
│   └── docker-compose.yml      # Local dev environment
│
├── .github/
│   └── workflows/              # CI/CD pipelines
│
├── package.json                # Root package.json (pnpm workspace)
├── pnpm-workspace.yaml
├── turbo.json                  # Turborepo config
└── README.md
```

---

## Appendix B: Environment Variables

```env
# ─── Database ───
DATABASE_URL=postgresql://user:pass@host:5432/agentstore
DIRECT_URL=postgresql://user:pass@host:5432/agentstore  # Prisma direct (no pooling)

# ─── Auth ───
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=https://agentstore.com
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# ─── Payments ───
STRIPE_SECRET_KEY=sk_xxx
STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RAZORPAY_KEY_ID=rzp_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx

# ─── Storage ───
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=agentstore-files
AWS_S3_REGION=ap-south-1
AWS_CLOUDFRONT_URL=https://cdn.agentstore.com

# ─── Redis ───
REDIS_URL=redis://xxx

# ─── Email ───
RESEND_API_KEY=re_xxx

# ─── Search ───
MEILISEARCH_HOST=https://xxx
MEILISEARCH_API_KEY=xxx

# ─── Monitoring ───
SENTRY_DSN=https://xxx@sentry.io/xxx
POSTHOG_KEY=phc_xxx

# ─── App ───
NEXT_PUBLIC_APP_URL=https://agentstore.com
NEXT_PUBLIC_API_URL=https://api.agentstore.com
PLATFORM_COMMISSION_RATE=0.20
```

---

*This document is the single source of truth for the AI Agent Marketplace (AgentStore) product and engineering team. All implementation decisions should reference this PRD. Last updated: September 7, 2026.*
