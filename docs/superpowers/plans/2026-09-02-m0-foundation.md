# M0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the running skeleton of the AI Agent Marketplace — a deployable Next.js app where a user can sign in, land on an (empty) catalog, and where every later milestone's foundations (typed env, database, auth, money primitives, design tokens, error reporting) are already in place and tested.

**Architecture:** Modular monolith. Next.js 15 App Router serves both UI and API from one deployable. Domain logic lives in `src/server/<module>/` as plain TypeScript and is imported by server components, server actions, and route handlers — UI never touches Prisma directly. Shared cross-cutting primitives (database client, env, auth, money) live in `src/lib/`.

**Tech Stack:** Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 (CSS-first `@theme`) · PostgreSQL on Neon · Prisma 6 · Auth.js v5 (`next-auth@beta`) with Prisma adapter, Resend magic link, and Google OAuth · Zod · Vitest · Playwright · Sentry · pnpm

**Spec:** `docs/superpowers/specs/2026-09-02-ai-agent-marketplace-v1-design.md`

## Global Constraints

These apply to every task. They are not restated per-task.

- **Money is `BigInt` paise. No floats, no `number`, anywhere in the money path.** Currency is INR only in V1.
- **TypeScript `strict: true`.** No `any` in committed code; no `@ts-ignore` without an adjacent comment explaining why.
- **Secrets never reach the client.** Only `NEXT_PUBLIC_*` variables may be read in client components. `.env` is gitignored; `.env.example` is committed and must list every variable.
- **Design tokens are the only source of color.** No raw hex values in components. Amber (`action`) is reserved for money actions; teal (`trust`) for trust signals.
- **Package manager is `pnpm`.** All commands in this plan assume it.
- **Every task ends with a green test run and a commit.** Commit messages use Conventional Commits (`feat:`, `test:`, `chore:`, `fix:`).
- **Node 20 LTS or newer.**

## File Structure

| Path | Responsibility |
|---|---|
| `src/lib/env.ts` | Zod-validated, fail-fast environment access. The only place `process.env` is read. |
| `src/lib/money.ts` | Paise arithmetic, parsing and INR formatting. Pure functions, no I/O. |
| `src/lib/db.ts` | Prisma client singleton (survives dev hot-reload). |
| `src/lib/auth-providers.ts` | Pure provider list builder, testable without a database. |
| `src/lib/auth.ts` | Auth.js v5 configuration; exports `auth`, `handlers`, `signIn`, `signOut`. |
| `src/lib/session.ts` | `requireUser()` / `requireAdmin()` server-side guards. |
| `src/lib/cn.ts` | Tailwind class merge helper. |
| `prisma/schema.prisma` | Auth.js models + `User` role flags. Grows every milestone. |
| `src/app/globals.css` | Tailwind import + `@theme` design tokens from spec §Design system. |
| `src/components/ui/*` | Presentational primitives: `Button`, `Badge`, `Card`. |
| `src/components/layout/*` | `SiteHeader`, `SiteFooter`. |
| `src/app/(public)/*` | Public routes: home/catalog. |
| `src/app/(buyer)/dashboard/*` | Authenticated routes. |
| `src/app/(auth)/signin/*` | Sign-in. |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth.js handler. |
| `src/instrumentation.ts`, `sentry.*.config.ts` | Sentry wiring. |

---

### Task 1: Project scaffold and test toolchain

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Test: `src/lib/__tests__/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: working `pnpm dev`, `pnpm test`, `pnpm build`, `pnpm typecheck`, `pnpm lint`. Path alias `@/*` → `src/*`.

- [ ] **Step 1: Scaffold the app**

Run from the repo root. The repo already contains `docs/` and `.gitignore`, so scaffold in place rather than into a subdirectory.

```bash
pnpm dlx create-next-app@latest . \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-pnpm --yes
```

If the generator refuses because the directory is non-empty, allow it to proceed — it will not touch `docs/`. Verify afterwards:

```bash
ls docs/superpowers/specs && head -3 .gitignore
```

- [ ] **Step 2: Add test and tooling dependencies**

```bash
pnpm add zod
pnpm add -D vitest @vitejs/plugin-react vite-tsconfig-paths @types/node prettier
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globals: false,
  },
});
```

- [ ] **Step 4: Add scripts to `package.json`**

Merge into the existing `"scripts"` block:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 5: Write a smoke test that proves the toolchain runs**

Create `src/lib/__tests__/smoke.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("toolchain", () => {
  it("runs TypeScript tests", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Verify everything is green**

```bash
pnpm test && pnpm typecheck && pnpm build
```

Expected: test passes, no type errors, build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 app with TypeScript, Tailwind v4 and Vitest"
```

---

### Task 2: Zod-validated environment module

Environment misconfiguration is the most common cause of a broken deploy. This module makes the app refuse to start rather than fail mysteriously at runtime, and it is the only place in the codebase permitted to read `process.env`.

**Files:**
- Create: `src/lib/env.ts`
- Create: `.env.example`
- Test: `src/lib/env.test.ts`

**Interfaces:**
- Consumes: `zod` from Task 1.
- Produces: `parseServerEnv(raw: Record<string, string | undefined>): ServerEnv` (pure) and `getEnv(): ServerEnv` (memoized singleton). `ServerEnv` fields: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_RESEND_KEY`, `EMAIL_FROM`, `NODE_ENV`, `ENABLE_TEST_LOGIN` (boolean).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/env.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { parseServerEnv } from "./env";

const valid = {
  DATABASE_URL: "postgresql://user:pass@host/db",
  AUTH_SECRET: "0123456789abcdef0123456789abcdef",
  AUTH_URL: "http://localhost:3000",
  AUTH_GOOGLE_ID: "google-id",
  AUTH_GOOGLE_SECRET: "google-secret",
  AUTH_RESEND_KEY: "re_test_key",
  EMAIL_FROM: "no-reply@example.com",
  NODE_ENV: "test",
};

describe("parseServerEnv", () => {
  it("returns a typed config for a valid environment", () => {
    const env = parseServerEnv(valid);
    expect(env.DATABASE_URL).toBe("postgresql://user:pass@host/db");
    expect(env.NODE_ENV).toBe("test");
  });

  it("throws listing every missing variable, not just the first", () => {
    expect(() => parseServerEnv({ NODE_ENV: "test" })).toThrowError(
      /DATABASE_URL[\s\S]*AUTH_SECRET/
    );
  });

  it("rejects a DATABASE_URL that is not a postgres connection string", () => {
    expect(() =>
      parseServerEnv({ ...valid, DATABASE_URL: "mysql://user:pass@host/db" })
    ).toThrowError(/DATABASE_URL/);
  });

  it("rejects an AUTH_SECRET shorter than 32 characters", () => {
    expect(() =>
      parseServerEnv({ ...valid, AUTH_SECRET: "tooshort" })
    ).toThrowError(/AUTH_SECRET/);
  });

  it("rejects a malformed EMAIL_FROM address", () => {
    expect(() =>
      parseServerEnv({ ...valid, EMAIL_FROM: "not-an-email" })
    ).toThrowError(/EMAIL_FROM/);
  });

  it("defaults ENABLE_TEST_LOGIN to false when absent", () => {
    expect(parseServerEnv(valid).ENABLE_TEST_LOGIN).toBe(false);
  });

  it("parses ENABLE_TEST_LOGIN=true as a boolean", () => {
    expect(
      parseServerEnv({ ...valid, ENABLE_TEST_LOGIN: "true" }).ENABLE_TEST_LOGIN
    ).toBe(true);
  });

  it("forces ENABLE_TEST_LOGIN off in production even when set to true", () => {
    const env = parseServerEnv({
      ...valid,
      NODE_ENV: "production",
      ENABLE_TEST_LOGIN: "true",
    });
    expect(env.ENABLE_TEST_LOGIN).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/lib/env.test.ts`
Expected: FAIL — `Failed to resolve import "./env"`.

- [ ] **Step 3: Implement the module**

Create `src/lib/env.ts`. Note `getEnv()` is lazy and memoized rather than a module-level constant — a top-level `parseServerEnv(process.env)` would throw at import time inside unit tests that have no real environment.

```typescript
import { z } from "zod";

const serverEnvSchema = z
  .object({
    DATABASE_URL: z
      .string()
      .min(1)
      .refine(
        (v) => v.startsWith("postgres://") || v.startsWith("postgresql://"),
        { message: "must be a postgres:// or postgresql:// connection string" }
      ),
    AUTH_SECRET: z.string().min(32, "must be at least 32 characters"),
    AUTH_URL: z.string().url(),
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    AUTH_RESEND_KEY: z.string().min(1),
    EMAIL_FROM: z.string().email(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    ENABLE_TEST_LOGIN: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
  })
  // A dev-only credentials login must never be reachable in production,
  // regardless of how the environment is configured.
  .transform((cfg) => ({
    ...cfg,
    ENABLE_TEST_LOGIN:
      cfg.NODE_ENV === "production" ? false : cfg.ENABLE_TEST_LOGIN,
  }));

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(
  raw: Record<string, string | undefined>
): ServerEnv {
  const result = serverEnvSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues
      .map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return result.data;
}

let cached: ServerEnv | undefined;

export function getEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run src/lib/env.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Write `.env.example`**

```bash
cat > .env.example <<'EOF'
# Postgres (Neon). Use the pooled connection string for the app.
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Auth.js — generate with: pnpm dlx auth secret
AUTH_SECRET=""
AUTH_URL="http://localhost:3000"

# Google OAuth — https://console.cloud.google.com/apis/credentials
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# Resend — magic-link sign-in and transactional email
AUTH_RESEND_KEY=""
EMAIL_FROM="no-reply@localhost"

# Dev/E2E only. Forced off in production by src/lib/env.ts.
ENABLE_TEST_LOGIN="false"
EOF
```

- [ ] **Step 6: Confirm `.env` is ignored and `.env.example` is not**

```bash
git check-ignore -v .env; echo "env ignored: $?"
git check-ignore -v .env.example; echo "example ignored: $?"
```

Expected: `.env` reports as ignored (exit 0); `.env.example` does not (exit 1).

- [ ] **Step 7: Commit**

```bash
git add src/lib/env.ts src/lib/env.test.ts .env.example
git commit -m "feat: add zod-validated environment module with fail-fast startup"
```

---

### Task 3: Money primitives

The spec's hardest invariant is that money never touches a float. Establishing this before any feature code means later milestones have no excuse to reach for `number`. Pure functions, no I/O.

**Files:**
- Create: `src/lib/money.ts`
- Test: `src/lib/money.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Paise = bigint`
  - `rupeesToPaise(rupees: string): Paise` — parses a decimal string, rejects more than two decimal places
  - `formatINR(paise: Paise): string` — `1234500n` → `"₹12,345.00"`
  - `splitCommission(gross: Paise, ratePercent: number): { platform: Paise; seller: Paise }` — the two results always sum exactly to `gross`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/money.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { rupeesToPaise, formatINR, splitCommission } from "./money";

describe("rupeesToPaise", () => {
  it("converts whole rupees", () => {
    expect(rupeesToPaise("499")).toBe(49900n);
  });

  it("converts rupees with paise", () => {
    expect(rupeesToPaise("1499.50")).toBe(149950n);
  });

  it("pads a single decimal place", () => {
    expect(rupeesToPaise("10.5")).toBe(1050n);
  });

  it("handles zero", () => {
    expect(rupeesToPaise("0")).toBe(0n);
  });

  it("rejects more than two decimal places", () => {
    expect(() => rupeesToPaise("10.555")).toThrowError(/two decimal places/i);
  });

  it("rejects negative amounts", () => {
    expect(() => rupeesToPaise("-5")).toThrowError(/negative/i);
  });

  it("rejects non-numeric input", () => {
    expect(() => rupeesToPaise("Rs499")).toThrowError(/invalid/i);
  });
});

describe("formatINR", () => {
  it("formats with two decimal places", () => {
    expect(formatINR(49900n)).toBe("₹499.00");
  });

  it("groups thousands in the Indian numbering system", () => {
    expect(formatINR(1234500n)).toBe("₹12,345.00");
  });

  it("groups lakhs correctly", () => {
    expect(formatINR(12345600n)).toBe("₹1,23,456.00");
  });

  it("formats zero", () => {
    expect(formatINR(0n)).toBe("₹0.00");
  });

  it("formats sub-rupee amounts", () => {
    expect(formatINR(7n)).toBe("₹0.07");
  });

  it("formats a negative amount with a leading sign", () => {
    expect(formatINR(-49900n)).toBe("-₹499.00");
  });
});

describe("splitCommission", () => {
  it("splits a clean amount", () => {
    expect(splitCommission(100000n, 20)).toEqual({
      platform: 20000n,
      seller: 80000n,
    });
  });

  it("never loses a paisa to rounding — the parts always sum to the gross", () => {
    for (const gross of [1n, 3n, 7n, 99n, 100001n, 49999n]) {
      const { platform, seller } = splitCommission(gross, 20);
      expect(platform + seller).toBe(gross);
    }
  });

  it("rounds the platform cut down so the seller is never short-changed", () => {
    // 20% of 3 paise = 0.6 paise -> platform gets 0, seller gets 3
    expect(splitCommission(3n, 20)).toEqual({ platform: 0n, seller: 3n });
  });

  it("supports a fractional rate exactly", () => {
    expect(splitCommission(100000n, 17.5)).toEqual({
      platform: 17500n,
      seller: 82500n,
    });
  });

  it("handles a zero commission rate", () => {
    expect(splitCommission(50000n, 0)).toEqual({
      platform: 0n,
      seller: 50000n,
    });
  });

  it("handles a full commission rate", () => {
    expect(splitCommission(50000n, 100)).toEqual({
      platform: 50000n,
      seller: 0n,
    });
  });

  it("rejects a rate outside 0-100", () => {
    expect(() => splitCommission(100n, 101)).toThrowError(/between 0 and 100/i);
    expect(() => splitCommission(100n, -1)).toThrowError(/between 0 and 100/i);
  });

  it("rejects a negative gross", () => {
    expect(() => splitCommission(-1n, 20)).toThrowError(/negative/i);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/lib/money.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the module**

Create `src/lib/money.ts`:

```typescript
/**
 * All money in this application is an integer number of paise, held as a
 * bigint. Never introduce a float or a `number` into a money value: JS
 * numbers cannot represent 0.1 exactly, and a marketplace ledger that
 * drifts by a paisa cannot be reconciled.
 */
export type Paise = bigint;

const RUPEES_PATTERN = /^\d+(\.\d{1,2})?$/;

export function rupeesToPaise(rupees: string): Paise {
  const trimmed = rupees.trim();
  if (trimmed.startsWith("-")) {
    throw new Error(`Amount cannot be negative: "${rupees}"`);
  }
  if (/\.\d{3,}$/.test(trimmed)) {
    throw new Error(
      `Amount cannot have more than two decimal places: "${rupees}"`
    );
  }
  if (!RUPEES_PATTERN.test(trimmed)) {
    throw new Error(`Invalid rupee amount: "${rupees}"`);
  }
  const [whole, fraction = ""] = trimmed.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

export function formatINR(paise: Paise): string {
  if (paise < 0n) return `-${formatINR(-paise)}`;
  const whole = paise / 100n;
  const fraction = (paise % 100n).toString().padStart(2, "0");
  return `₹${groupIndian(whole.toString())}.${fraction}`;
}

/** Indian grouping: last three digits, then pairs. 123456 -> 1,23,456 */
function groupIndian(digits: string): string {
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${grouped},${last3}`;
}

export function splitCommission(
  gross: Paise,
  ratePercent: number
): { platform: Paise; seller: Paise } {
  if (gross < 0n) {
    throw new Error("Gross amount cannot be negative");
  }
  if (!Number.isFinite(ratePercent) || ratePercent < 0 || ratePercent > 100) {
    throw new Error("Commission rate must be between 0 and 100");
  }
  // Scale by 100 so a rate like 17.5% stays exact in integer arithmetic.
  const scaledRate = BigInt(Math.round(ratePercent * 100));
  const platform = (gross * scaledRate) / 10000n; // truncates toward zero
  return { platform, seller: gross - platform };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run src/lib/money.test.ts`
Expected: PASS, 21 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/money.ts src/lib/money.test.ts
git commit -m "feat: add integer-paise money primitives with exact commission split"
```

---

### Task 4: Database — Prisma, Neon, and the User model

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`
- Modify: `package.json` (Prisma scripts and the `postinstall` generate hook)

**Interfaces:**
- Consumes: `getEnv()` from Task 2.
- Produces: `prisma` — the shared `PrismaClient` singleton, imported as `import { prisma } from "@/lib/db"`. Models available to later tasks: `User`, `Account`, `Session`, `VerificationToken`.

- [ ] **Step 1: Provision the database**

Create a free Postgres project at https://neon.tech. Copy the **pooled** connection string into `DATABASE_URL` in a new local `.env`:

```bash
cp .env.example .env
pnpm dlx auth secret   # writes AUTH_SECRET into .env
```

Then fill in the Google and Resend values by hand.

- [ ] **Step 2: Install Prisma**

```bash
pnpm add @prisma/client
pnpm add -D prisma
```

- [ ] **Step 3: Write the schema**

Create `prisma/schema.prisma`. These are the Auth.js v5 required models plus the marketplace's own `User` fields.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?

  // Single account, role-switchable (spec: buyer and seller are one account).
  isAdmin       Boolean   @default(false)
  isSeller      Boolean   @default(false)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]

  @@index([createdAt])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}
```

- [ ] **Step 4: Add Prisma scripts to `package.json`**

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  }
}
```

- [ ] **Step 5: Run the first migration**

```bash
pnpm db:migrate --name init_auth_and_users
```

Expected: a new folder under `prisma/migrations/`, and "Your database is now in sync with your schema."

- [ ] **Step 6: Write the Prisma client singleton**

Create `src/lib/db.ts`. The global cache prevents Next.js dev hot-reload from opening a new connection pool on every edit — without it you will exhaust Neon's connection limit within minutes.

```typescript
import { PrismaClient } from "@prisma/client";
import { getEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      getEnv().NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (getEnv().NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 7: Verify the connection end to end**

```bash
pnpm add -D tsx
pnpm exec tsx -e "import {prisma} from './src/lib/db'; prisma.user.count().then(n => { console.log('users:', n); return prisma.\$disconnect(); })"
```

Expected: `users: 0`.

- [ ] **Step 8: Commit**

```bash
git add prisma src/lib/db.ts package.json pnpm-lock.yaml
git commit -m "feat: add Prisma schema with Auth.js models and User role flags"
```

---

### Task 5: Authentication

Magic-link sign-in is the primary flow (buyers should not have to invent a password to buy a workflow), Google OAuth is the fast path, and a hard-gated credentials provider exists solely so later milestones can write E2E tests for purchase flows without automating an email inbox.

**Files:**
- Create: `src/lib/auth-providers.ts`, `src/lib/auth.ts`, `src/lib/session.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/(auth)/signin/page.tsx`
- Test: `src/lib/auth-providers.test.ts`, `src/lib/session.test.ts`

**Interfaces:**
- Consumes: `prisma` (Task 4), `getEnv()` / `ServerEnv` (Task 2).
- Produces:
  - `buildAuthProviders(env: ServerEnv): Provider[]`
  - `auth`, `handlers`, `signIn`, `signOut` from `@/lib/auth`
  - `getCurrentUser(): Promise<SessionUser | null>`, `requireUser(): Promise<SessionUser>`, `requireAdmin(): Promise<SessionUser>` from `@/lib/session`, where `SessionUser = { id: string; email: string; name?: string | null; image?: string | null; isAdmin: boolean; isSeller: boolean }`

- [ ] **Step 1: Install Auth.js**

```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

- [ ] **Step 2: Write the failing provider test**

Create `src/lib/auth-providers.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildAuthProviders } from "./auth-providers";
import type { ServerEnv } from "./env";

const base: ServerEnv = {
  DATABASE_URL: "postgresql://user:pass@host/db",
  AUTH_SECRET: "0123456789abcdef0123456789abcdef",
  AUTH_URL: "http://localhost:3000",
  AUTH_GOOGLE_ID: "google-id",
  AUTH_GOOGLE_SECRET: "google-secret",
  AUTH_RESEND_KEY: "re_test_key",
  EMAIL_FROM: "no-reply@example.com",
  NODE_ENV: "development",
  ENABLE_TEST_LOGIN: false,
};

function idsOf(env: ServerEnv): string[] {
  return buildAuthProviders(env).map((p) => {
    const provider = typeof p === "function" ? p() : p;
    return (provider as { id: string }).id;
  });
}

describe("buildAuthProviders", () => {
  it("always includes Google and Resend", () => {
    const ids = idsOf(base);
    expect(ids).toContain("google");
    expect(ids).toContain("resend");
  });

  it("omits the test-login provider by default", () => {
    expect(idsOf(base)).not.toContain("test-login");
  });

  it("includes the test-login provider when explicitly enabled outside production", () => {
    expect(idsOf({ ...base, ENABLE_TEST_LOGIN: true })).toContain("test-login");
  });

  it("never includes the test-login provider in production", () => {
    const ids = idsOf({
      ...base,
      NODE_ENV: "production",
      ENABLE_TEST_LOGIN: true,
    });
    expect(ids).not.toContain("test-login");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm vitest run src/lib/auth-providers.test.ts`
Expected: FAIL — cannot resolve `./auth-providers`.

- [ ] **Step 4: Implement the provider builder**

Create `src/lib/auth-providers.ts`. It is a separate file from `auth.ts` so it can be tested without importing the Prisma adapter, which would open a database connection at import time.

```typescript
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import type { ServerEnv } from "@/lib/env";

export function buildAuthProviders(env: ServerEnv): Provider[] {
  const providers: Provider[] = [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
    Resend({
      apiKey: env.AUTH_RESEND_KEY,
      from: env.EMAIL_FROM,
    }),
  ];

  // Dev/E2E only. env.ts already forces ENABLE_TEST_LOGIN to false in
  // production; the NODE_ENV check here is a deliberate second lock, because
  // an unauthenticated login bypass on a marketplace is unrecoverable.
  if (env.ENABLE_TEST_LOGIN && env.NODE_ENV !== "production") {
    providers.push(
      Credentials({
        id: "test-login",
        name: "Test Login",
        credentials: { email: { label: "Email", type: "email" } },
        async authorize(raw) {
          const email = typeof raw?.email === "string" ? raw.email : null;
          if (!email) return null;
          const { prisma } = await import("@/lib/db");
          const user = await prisma.user.findUnique({ where: { email } });
          return user
            ? { id: user.id, email: user.email, name: user.name }
            : null;
        },
      })
    );
  }

  return providers;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm vitest run src/lib/auth-providers.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Wire up Auth.js**

Create `src/lib/auth.ts`:

```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { buildAuthProviders } from "@/lib/auth-providers";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Database sessions, not JWT: a marketplace must be able to revoke a
  // session server-side (fraud, account takeover, refund abuse).
  session: { strategy: "database" },
  providers: buildAuthProviders(getEnv()),
  pages: { signIn: "/signin" },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
        session.user.isSeller =
          (user as { isSeller?: boolean }).isSeller ?? false;
      }
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isAdmin: boolean;
      isSeller: boolean;
    };
  }
}
```

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 7: Write the failing session-guard test**

Create `src/lib/session.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const authMock = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => authMock() }));

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

const { requireUser, requireAdmin } = await import("./session");

const sessionUser = {
  id: "u1",
  email: "a@b.com",
  name: null,
  image: null,
  isAdmin: false,
  isSeller: false,
};

beforeEach(() => {
  authMock.mockReset();
  redirectMock.mockClear();
});

describe("requireUser", () => {
  it("returns the user when a session exists", async () => {
    authMock.mockResolvedValue({ user: sessionUser });
    await expect(requireUser()).resolves.toEqual(sessionUser);
  });

  it("redirects to /signin when there is no session", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireUser()).rejects.toThrow("REDIRECT:/signin");
  });
});

describe("requireAdmin", () => {
  it("returns the user when the session user is an admin", async () => {
    authMock.mockResolvedValue({ user: { ...sessionUser, isAdmin: true } });
    await expect(requireAdmin()).resolves.toMatchObject({ isAdmin: true });
  });

  it("redirects a signed-in non-admin away rather than revealing the route", async () => {
    authMock.mockResolvedValue({ user: sessionUser });
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/");
  });

  it("redirects an anonymous visitor to /signin", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/signin");
  });
});
```

- [ ] **Step 8: Run the test to verify it fails**

Run: `pnpm vitest run src/lib/session.test.ts`
Expected: FAIL — cannot resolve `./session`.

- [ ] **Step 9: Implement the guards**

Create `src/lib/session.ts`:

```typescript
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  isAdmin: boolean;
  isSeller: boolean;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  if (!user.isAdmin) redirect("/");
  return user;
}
```

- [ ] **Step 10: Run the test to verify it passes**

Run: `pnpm vitest run src/lib/session.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 11: Build the sign-in page**

Create `src/app/(auth)/signin/page.tsx`. Styling is intentionally plain here — Task 6 introduces the design system and Task 7 restyles this page.

```tsx
import { signIn } from "@/lib/auth";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          await signIn("resend", {
            email: String(formData.get("email")),
            redirectTo: "/",
          });
        }}
        className="flex flex-col gap-3"
      >
        <label htmlFor="email" className="text-sm">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded border px-3 py-2"
        />
        <button type="submit" className="rounded px-3 py-2 font-medium">
          Email me a sign-in link
        </button>
      </form>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <button type="submit" className="w-full rounded border px-3 py-2">
          Continue with Google
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 12: Verify sign-in manually**

```bash
pnpm dev
```

Visit http://localhost:3000/signin, submit your email, and confirm the magic-link email arrives from Resend and signs you in. Then check the row landed:

```bash
pnpm db:studio   # open the User table
```

Expected: one `User` row with your email and `emailVerified` set.

- [ ] **Step 13: Make yourself an admin**

```bash
pnpm exec tsx -e "import {prisma} from './src/lib/db'; prisma.user.update({where:{email:'shrey@pixeleyez.com'},data:{isAdmin:true,isSeller:true}}).then(u=>{console.log('admin:',u.email); return prisma.\$disconnect()})"
```

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: add Auth.js v5 with magic link, Google OAuth and role guards"
```

---

### Task 6: Design tokens and UI primitives

Implements spec §Design system. Token names encode the rule from PRD §14 — amber means money, teal means trust — so misuse is visible in the class name at review time.

**Files:**
- Modify: `src/app/globals.css`, `vitest.config.ts`
- Create: `src/lib/cn.ts`
- Create: `src/components/ui/button.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/card.tsx`
- Test: `src/components/ui/button.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `cn(...inputs: ClassValue[]): string` from `@/lib/cn`
  - `<Button variant="action" | "secondary" | "ghost" | "danger" size="sm" | "md">`
  - `<Badge variant="trust" | "neutral" | "danger">`
  - `<Card>`, `<CardHeader>`, `<CardBody>`

- [ ] **Step 1: Install styling and component-test helpers**

```bash
pnpm add clsx tailwind-merge
pnpm add -D @testing-library/react @testing-library/dom jsdom
```

- [ ] **Step 2: Give component tests a DOM**

Modify the `test` block in `vitest.config.ts` so node tests stay fast and only component tests pay for jsdom:

```typescript
test: {
  environment: "node",
  environmentMatchGlobs: [["src/components/**", "jsdom"]],
  include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  globals: false,
},
```

- [ ] **Step 3: Write the design tokens**

Replace the contents of `src/app/globals.css`. Tailwind v4 is CSS-first: `@theme` variables become utilities automatically (`--color-action` → `bg-action`, `text-action`).

```css
@import "tailwindcss";

@theme {
  /* Surfaces — deep blue-black, never pure black (PRD §14) */
  --color-void: #0b0e14;
  --color-panel: #141b26;
  --color-ledger: #1f2733;

  /* Amber = money. Price, buy, top up, withdraw. Nothing else. */
  --color-action: #e8a33d;
  --color-action-fg: #0b0e14;

  /* Teal = trust. Verified badges, platform tags, success. Nothing else. */
  --color-trust: #3fc7b0;
  --color-trust-fg: #0b0e14;

  --color-danger: #e2554c;
  --color-danger-fg: #0b0e14;

  --color-ink: #edeff4;
  --color-ink-muted: #8891a0;

  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, "SF Mono", monospace;
}

:root {
  color-scheme: dark;
}

body {
  background-color: var(--color-void);
  color: var(--color-ink);
  font-family: var(--font-sans);
}

/* Surfaces stay flat — no gradients, no glow (PRD §14 application notes). */
```

- [ ] **Step 4: Write the class-merge helper**

Create `src/lib/cn.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Write the failing Button test**

Create `src/components/ui/button.test.tsx`:

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Button } from "./button";

afterEach(cleanup);

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Buy now</Button>);
    expect(screen.getByRole("button", { name: "Buy now" })).toBeDefined();
  });

  it("uses the amber action token for the money variant", () => {
    render(<Button variant="action">Buy now</Button>);
    expect(screen.getByRole("button").className).toContain("bg-action");
  });

  it("does not use the amber action token for secondary actions", () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole("button").className).not.toContain("bg-action");
  });

  it("uses the danger token for destructive actions", () => {
    render(<Button variant="danger">Request refund</Button>);
    expect(screen.getByRole("button").className).toContain("bg-danger");
  });

  it("passes through the disabled attribute", () => {
    render(<Button disabled>Buy now</Button>);
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
  });

  it("merges caller-supplied className", () => {
    render(<Button className="w-full">Buy now</Button>);
    expect(screen.getByRole("button").className).toContain("w-full");
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `pnpm vitest run src/components/ui/button.test.tsx`
Expected: FAIL — cannot resolve `./button`.

- [ ] **Step 7: Implement the primitives**

Create `src/components/ui/button.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "action" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  // Reserved for money moments only: buy, subscribe, top up, withdraw.
  action: "bg-action text-action-fg hover:brightness-110",
  secondary: "bg-panel text-ink border border-ledger hover:bg-ledger",
  ghost: "bg-transparent text-ink-muted hover:text-ink",
  danger: "bg-danger text-danger-fg hover:brightness-110",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trust",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
```

Create `src/components/ui/badge.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "trust" | "neutral" | "danger";

const VARIANTS: Record<Variant, string> = {
  // Reserved for trust signals: verified seller, platform compatibility.
  trust: "border-trust/40 bg-trust/10 text-trust",
  neutral: "border-ledger bg-panel text-ink-muted",
  danger: "border-danger/40 bg-danger/10 text-danger",
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-xs",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
```

Create `src/components/ui/card.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-ledger bg-panel", className)}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-b border-ledger p-4", className)} {...props} />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `pnpm vitest run src/components/ui/button.test.tsx`
Expected: PASS, 6 tests.

- [ ] **Step 9: Commit**

```bash
git add src/app/globals.css src/components/ui src/lib/cn.ts vitest.config.ts package.json pnpm-lock.yaml
git commit -m "feat: add dark design tokens and Button, Badge and Card primitives"
```

---

### Task 7: Application shell and empty catalog

This is the milestone's visible deliverable: sign in, land on a catalog that is empty but real.

**Files:**
- Create: `src/components/layout/site-header.tsx`, `src/components/layout/site-footer.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/(public)/page.tsx` (replacing the scaffolded `src/app/page.tsx`)
- Create: `src/app/(buyer)/dashboard/page.tsx`
- Modify: `src/app/(auth)/signin/page.tsx`
- Create: `playwright.config.ts`, `e2e/shell.spec.ts`

**Interfaces:**
- Consumes: `getCurrentUser()`, `requireUser()` (Task 5), `signOut` (Task 5), UI primitives (Task 6).
- Produces: the route shell every later milestone hangs pages off — `(public)` for the catalog, `(buyer)` for authenticated pages, `(auth)` for sign-in.

- [ ] **Step 1: Build the header**

Create `src/components/layout/site-header.tsx`:

```tsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-ledger bg-panel">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Agent<span className="text-trust">Store</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-ink-muted hover:text-ink"
              >
                My Agents
              </Link>
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm text-ink-muted hover:text-ink"
                >
                  Admin
                </Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Link href="/signin">
              <Button variant="secondary" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
```

Create `src/components/layout/site-footer.tsx`:

```tsx
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-ledger">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-muted">
        <p>
          Agents are third-party files you run in your own environment with your
          own API keys. Review any workflow before granting it access to your
          accounts.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Wire the root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentStore — buy and download AI agents",
  description:
    "Buy ready-made AI agents and automation workflows. Download the file, run it in your own environment with your own API keys.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Build the empty catalog**

Delete the scaffolded page and create the route-group version:

```bash
rm src/app/page.tsx
mkdir -p "src/app/(public)"
```

Create `src/app/(public)/page.tsx`:

```tsx
import { Card, CardBody } from "@/components/ui/card";

export default function CatalogPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Browse AI agents</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">
        Ready-made automation workflows you download and run yourself. Every
        listing states exactly which API keys you need to bring.
      </p>

      <Card className="mt-10">
        <CardBody>
          <p data-testid="empty-catalog" className="text-ink-muted">
            No agents listed yet. The catalog opens soon.
          </p>
        </CardBody>
      </Card>
    </main>
  );
}
```

- [ ] **Step 4: Build the authenticated dashboard stub**

Create `src/app/(buyer)/dashboard/page.tsx`:

```tsx
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold">My Agents</h1>
      <p className="mt-2 text-ink-muted" data-testid="dashboard-greeting">
        Signed in as <span className="font-mono">{user.email}</span>
      </p>
      <p className="mt-6 text-ink-muted">
        Agents you purchase will appear here, with their download history.
      </p>
    </main>
  );
}
```

- [ ] **Step 5: Restyle the sign-in page with the design system**

Replace `src/app/(auth)/signin/page.tsx`:

```tsx
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col justify-center gap-6 px-4 py-20">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <Card>
        <CardBody className="flex flex-col gap-4">
          <form
            action={async (formData: FormData) => {
              "use server";
              await signIn("resend", {
                email: String(formData.get("email")),
                redirectTo: "/",
              });
            }}
            className="flex flex-col gap-2"
          >
            <label htmlFor="email" className="text-sm text-ink-muted">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-ledger bg-void px-3 py-2 text-ink outline-none focus-visible:border-trust"
            />
            <Button type="submit" variant="secondary" className="mt-1">
              Email me a sign-in link
            </Button>
          </form>

          <div className="text-center text-xs text-ink-muted">or</div>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="secondary" className="w-full">
              Continue with Google
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
```

- [ ] **Step 6: Install and configure Playwright**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

Create `playwright.config.ts`:

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Add to `package.json` scripts:

```json
{ "test:e2e": "playwright test" }
```

- [ ] **Step 7: Write the shell E2E test**

Create `e2e/shell.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test("the catalog renders for an anonymous visitor", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Browse AI agents" })
  ).toBeVisible();
  await expect(page.getByTestId("empty-catalog")).toBeVisible();
});

test("an anonymous visitor sees a sign-in link, not a dashboard link", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "My Agents" })).toHaveCount(0);
});

test("the dashboard redirects an anonymous visitor to sign-in", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/signin/);
});

test("the sign-in page offers both magic link and Google", async ({ page }) => {
  await page.goto("/signin");
  await expect(
    page.getByRole("button", { name: "Email me a sign-in link" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue with Google" })
  ).toBeVisible();
});
```

- [ ] **Step 8: Run the E2E suite**

Run: `pnpm test:e2e`
Expected: PASS, 4 tests.

- [ ] **Step 9: Verify the full suite and build are green**

```bash
pnpm test && pnpm typecheck && pnpm lint && pnpm build
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add app shell, empty catalog, dashboard stub and shell E2E tests"
```

---

### Task 8: Error reporting, README, and milestone close-out

**Files:**
- Create: `sentry.server.config.ts`, `sentry.edge.config.ts`, `src/instrumentation.ts`, `src/instrumentation-client.ts` (written by the wizard)
- Create: `src/app/global-error.tsx`
- Modify: `next.config.ts`, `.env.example`, `src/lib/env.ts`
- Create: `README.md`

**Interfaces:**
- Consumes: `parseServerEnv` (Task 2).
- Produces: unhandled server and client errors reach Sentry; a documented setup path for a fresh clone.

- [ ] **Step 1: Install and initialize Sentry**

```bash
pnpm add @sentry/nextjs
pnpm dlx @sentry/wizard@latest -i nextjs
```

Accept the wizard's defaults for the App Router. It writes the config files, patches `next.config.ts`, and adds `SENTRY_AUTH_TOKEN` handling.

- [ ] **Step 2: Add the Sentry DSN to the env schema**

In `src/lib/env.ts`, add to `serverEnvSchema`:

```typescript
NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
```

Optional rather than required, so a fresh clone runs without a Sentry account. Append to `.env.example`:

```bash
cat >> .env.example <<'EOF'

# Sentry (optional locally, required in production)
NEXT_PUBLIC_SENTRY_DSN=""
EOF
```

- [ ] **Step 3: Add a global error boundary**

Create `src/app/global-error.tsx`:

```tsx
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ padding: "4rem", fontFamily: "system-ui" }}>
          <h1>Something went wrong</h1>
          <p>The error has been reported. Please try again.</p>
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify Sentry receives an error**

Add a temporary route `src/app/api/debug-sentry/route.ts`:

```typescript
export function GET() {
  throw new Error("M0 Sentry verification");
}
```

Run `pnpm dev`, visit http://localhost:3000/api/debug-sentry, confirm the event appears in your Sentry issues, then delete the file:

```bash
rm -r src/app/api/debug-sentry
```

- [ ] **Step 5: Write the README**

```bash
cat > README.md <<'EOF'
# AgentStore — AI Agent Marketplace

A marketplace for downloadable AI agents and automation workflows. Buyers
purchase a workflow file and run it in their own environment with their own
API keys.

- **Spec:** `docs/superpowers/specs/2026-09-02-ai-agent-marketplace-v1-design.md`
- **Plans:** `docs/superpowers/plans/`
- **Source PRD:** `docs/AI Agent marketplace.txt`

## Stack

Next.js 15 (App Router), TypeScript, Tailwind v4, PostgreSQL (Neon), Prisma,
Auth.js v5, Cloudflare R2, Razorpay, Vitest, Playwright, Sentry.

## Setup

    pnpm install
    cp .env.example .env      # then fill in every value
    pnpm dlx auth secret      # writes AUTH_SECRET
    pnpm db:migrate
    pnpm dev

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Development server |
| `pnpm test` | Unit and component tests (Vitest) |
| `pnpm test:e2e` | End-to-end tests (Playwright) |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm lint` | ESLint |
| `pnpm db:migrate` | Apply a Prisma migration |
| `pnpm db:studio` | Browse the database |

## Ground rules

- **Money is `BigInt` paise.** Never a float, never a `number`. See `src/lib/money.ts`.
- **`process.env` is read in exactly one place:** `src/lib/env.ts`.
- **Colors come from design tokens only.** Amber (`action`) means money; teal
  (`trust`) means verification. No raw hex in components.
- **Domain logic lives in `src/server/`.** UI never imports Prisma directly.
EOF
```

- [ ] **Step 6: Run the full verification suite**

```bash
pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e
```

Expected: all green.

- [ ] **Step 7: Commit and tag the milestone**

```bash
git add -A
git commit -m "feat: add Sentry error reporting, global error boundary and README"
git tag m0-foundation
```

---

## Milestone Verification

M0 is done when all of the following hold:

- [ ] `pnpm test` — all Vitest suites pass (env, money, auth providers, session guards, Button)
- [ ] `pnpm test:e2e` — all 4 Playwright shell tests pass
- [ ] `pnpm typecheck` and `pnpm lint` — clean
- [ ] `pnpm build` — production build succeeds
- [ ] Signing in with a magic link creates a `User` row and lands on the catalog
- [ ] Signing in with Google works and reuses the same `User` row for the same email address
- [ ] Visiting `/dashboard` signed out redirects to `/signin`
- [ ] The header shows "Sign in" when signed out, and "My Agents" plus "Admin" (for `isAdmin`) when signed in
- [ ] Removing a required variable from `.env` makes the app fail at startup with a message naming that variable
- [ ] A thrown server error appears in Sentry
- [ ] `git check-ignore .env` confirms secrets are not committed

## Out of scope for M0

Listings, categories, platforms, search, R2 uploads, the ledger, Razorpay, entitlements, downloads, reviews, refunds, and the admin panel. M0 exists so those have somewhere solid to land.

## Next milestone

**M1 — Catalog.** Full Prisma schema, category and platform seeds, admin listing CRUD behind the publish validator, public catalog with filters and full-text search, and the listing detail page carrying every field PRD §5.2 requires.
