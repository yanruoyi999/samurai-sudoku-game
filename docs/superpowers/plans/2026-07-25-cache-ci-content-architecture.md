# Cache, CI, and Content Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix puzzle cache freshness, enforce site audits in CI, centralize guide intent, split the homepage, and document puzzle methodology without modifying `main` directly.

**Architecture:** Store cache values and guide metadata in shared data modules, consume them from configuration and UI, and validate them with focused tests. Run live-site audits through a single CI shell runner that builds and starts Next.js locally before crawling.

**Tech Stack:** Next.js 15, React 18, TypeScript, next-intl, Vitest, pnpm, GitHub Actions, next-pwa.

## Global Constraints

- Work only on `fix/20260725-cache-ci-content-architecture`.
- Preserve `backup/20260725-before-cache-ci-content-fix` unchanged.
- Keep PR #3 independent and do not merge it into this branch.
- Do not change puzzle generation, payment, download authorization, or game storage logic.
- Preserve English and Chinese localized routes.
- Keep offline puzzle access.

---

### Task 1: Make puzzle caching refreshable

**Files:**
- Create: `lib/pwa/puzzle-cache-policy.json`
- Create: `lib/pwa/puzzle-cache-policy.test.ts`
- Modify: `next.config.js`

**Interfaces:**
- Produces JSON keys `runtimeHandler`, `runtimeMaxEntries`, `runtimeMaxAgeSeconds`, and `httpCacheControl`.
- `next.config.js` consumes all four keys.

- [ ] **Step 1: Write failing cache-policy tests**

```ts
import { describe, expect, it } from 'vitest';
import policy from './puzzle-cache-policy.json';

describe('puzzle cache policy', () => {
  it('revalidates dated puzzle JSON instead of treating it as immutable', () => {
    expect(policy.runtimeHandler).toBe('StaleWhileRevalidate');
    expect(policy.httpCacheControl).not.toContain('immutable');
    expect(policy.httpCacheControl).toContain('max-age=0');
  });

  it('keeps a bounded offline fallback', () => {
    expect(policy.runtimeMaxEntries).toBe(200);
    expect(policy.runtimeMaxAgeSeconds).toBe(30 * 24 * 60 * 60);
  });
});
```

- [ ] **Step 2: Confirm the test fails because the policy file does not exist**

Run: `pnpm vitest run lib/pwa/puzzle-cache-policy.test.ts`
Expected: FAIL resolving `puzzle-cache-policy.json`.

- [ ] **Step 3: Add the policy JSON**

```json
{
  "runtimeHandler": "StaleWhileRevalidate",
  "runtimeMaxEntries": 200,
  "runtimeMaxAgeSeconds": 2592000,
  "httpCacheControl": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
}
```

- [ ] **Step 4: Consume the policy from `next.config.js`**

Require the JSON next to `printable-sampler.json`, replace the dated puzzle `CacheFirst` handler and hard-coded expiration, and replace the one-year immutable puzzle header with `policy.httpCacheControl`.

- [ ] **Step 5: Run cache tests, TypeScript, and build**

Run:

```bash
pnpm vitest run lib/pwa/puzzle-cache-policy.test.ts
pnpm exec tsc --noEmit
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```bash
git add lib/pwa/puzzle-cache-policy.json lib/pwa/puzzle-cache-policy.test.ts next.config.js
git commit -m "fix: make puzzle cache refreshable"
```

### Task 2: Run live audits in pull-request CI

**Files:**
- Create: `scripts/run-site-audits.sh`
- Create: `scripts/run-site-audits.node-test.mjs`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces script command `pnpm audit:site`.
- Consumes a built `.next` directory and starts `pnpm start --hostname 127.0.0.1 --port 3000`.

- [ ] **Step 1: Write a failing Node test for the runner contract**

The test reads `scripts/run-site-audits.sh` and asserts it contains `trap`, `pnpm start`, a sitemap readiness check, `audit:internal-links`, and `audit:page-quality`.

- [ ] **Step 2: Confirm the test fails because the runner does not exist**

Run: `node --test scripts/run-site-audits.node-test.mjs`
Expected: FAIL with file-not-found.

- [ ] **Step 3: Implement the audit runner**

The script must use `set -euo pipefail`, start Next in the background, store the PID, register cleanup with `trap`, poll `http://127.0.0.1:3000/sitemap.xml` for up to 60 seconds, and then run both audits against localhost.

- [ ] **Step 4: Add package scripts**

Add:

```json
"test:site-audits": "node --test scripts/run-site-audits.node-test.mjs",
"audit:site": "bash scripts/run-site-audits.sh"
```

- [ ] **Step 5: Update CI**

After puzzle validation, add production build and site audit steps. Upload `/tmp/samurai-next.log` if the audit step fails.

- [ ] **Step 6: Run tests locally or through PR CI**

Run:

```bash
pnpm test:site-audits
pnpm build
pnpm audit:site
```

Expected: all commands exit 0 and both audit summaries report no failures.

- [ ] **Step 7: Commit**

```bash
git add scripts/run-site-audits.sh scripts/run-site-audits.node-test.mjs package.json .github/workflows/ci.yml
git commit -m "ci: enforce site quality audits"
```

### Task 3: Centralize Samurai guide intent

**Files:**
- Create: `lib/samurai/guides.ts`
- Create: `lib/samurai/guides.test.ts`
- Modify: `app/[locale]/games/samurai/strategy-guide/page.tsx`
- Modify: `app/[locale]/games/samurai/solving-tips/page.tsx`
- Modify: `app/[locale]/games/samurai/how-to-play/page.tsx`

**Interfaces:**
- Produces `SAMURAI_GUIDES`, `getSamuraiGuide(locale, key)`, and `getSamuraiLearningPath(locale)`.
- Each guide entry exposes unique `primaryKeyword` values for `en` and `zh`.

- [ ] **Step 1: Write failing registry tests**

Test that all slugs and primary keywords are unique per locale and that the learning path orders definition, rules, first move, difficulty, solving tips, strategy, and specialist pages.

- [ ] **Step 2: Confirm the test fails because the registry does not exist**

Run: `pnpm vitest run lib/samurai/guides.test.ts`
Expected: FAIL resolving `guides.ts`.

- [ ] **Step 3: Implement the guide registry**

Define explicit roles and primary keywords. Assign broad strategy intent only to `solving-tips`; assign advanced technique intent to `strategy-guide`; assign rules intent to `how-to-play`.

- [ ] **Step 4: Refine metadata and introductions**

Update the three overlapping pages so titles, descriptions, keyword arrays, and first paragraphs clearly match their registry roles and cross-link to the correct hub or specialist page.

- [ ] **Step 5: Run tests and page-quality checks**

Run:

```bash
pnpm vitest run lib/samurai/guides.test.ts
pnpm exec tsc --noEmit
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```bash
git add lib/samurai/guides.ts lib/samurai/guides.test.ts app/[locale]/games/samurai/strategy-guide/page.tsx app/[locale]/games/samurai/solving-tips/page.tsx app/[locale]/games/samurai/how-to-play/page.tsx
git commit -m "refactor: clarify Samurai guide intent"
```

### Task 4: Split the homepage into focused components

**Files:**
- Create: `components/home/HomeHero.tsx`
- Create: `components/home/QuickStartSection.tsx`
- Create: `components/home/LogicGameSection.tsx`
- Create: `components/home/DifficultySection.tsx`
- Create: `components/home/LearningPathSection.tsx`
- Create: `components/home/HomeFaqSection.tsx`
- Create: `components/home/SiteFooter.tsx`
- Modify: `app/[locale]/page.tsx`

**Interfaces:**
- Components accept serializable localized copy and route metadata only.
- `LogicGameSection` retains `TrackedLink` event `home_logic_game_click`.
- `app/[locale]/page.tsx` retains FAQ JSON-LD generation.

- [ ] **Step 1: Extract components without changing rendered copy or links**

Move each existing JSX section into the focused component listed above. Preserve all class names, link destinations, and event properties.

- [ ] **Step 2: Replace homepage-local guide arrays with registry output**

Use `getSamuraiLearningPath(locale)` to build learning cards and guide quick links.

- [ ] **Step 3: Run lint, TypeScript, tests, and page audits**

Run:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
pnpm audit:site
```

Expected: all commands exit 0 with no link or page-quality regression.

- [ ] **Step 4: Commit**

```bash
git add components/home app/[locale]/page.tsx
git commit -m "refactor: split homepage sections"
```

### Task 5: Add puzzle methodology and editorial transparency

**Files:**
- Create: `app/[locale]/about/puzzle-methodology/page.tsx`
- Modify: `app/[locale]/about/page.tsx`
- Modify: `app/[locale]/page.tsx` or `components/home/SiteFooter.tsx`
- Modify: `app/sitemap.ts`
- Modify: `app/llms.txt/route.ts`

**Interfaces:**
- New canonical route: `/[locale]/about/puzzle-methodology`.
- Page includes Article/AboutPage structured data, localized metadata, and links to contact, game, solving tips, and privacy.

- [ ] **Step 1: Create the localized methodology page**

Explain generation, uniqueness validation, difficulty estimation, CI validation, correction workflow, cache refresh behavior, guide review, and error reporting in concrete language.

- [ ] **Step 2: Add inbound and outbound links**

Link from About and footer. Link from methodology to Contact, Privacy, today's puzzle, and solving tips.

- [ ] **Step 3: Add sitemap and llms.txt entries**

Use monthly change frequency and trust-page priority near About.

- [ ] **Step 4: Run full verification**

Run:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm validate-puzzles
pnpm build
pnpm audit:site
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/about app/[locale]/page.tsx components/home/SiteFooter.tsx app/sitemap.ts app/llms.txt/route.ts
git commit -m "docs: explain puzzle methodology"
```

### Task 6: Final PR verification

**Files:**
- Review all changed files.

- [ ] **Step 1: Confirm branch isolation**

Compare `main...fix/20260725-cache-ci-content-architecture` and verify no payment, puzzle-generator, solver, or storage files changed.

- [ ] **Step 2: Confirm GitHub CI success**

Verify the latest PR workflow concludes `success`.

- [ ] **Step 3: Confirm Vercel preview success**

Verify the latest Vercel status concludes `success`.

- [ ] **Step 4: Keep the PR as Draft**

Do not merge or mark ready without explicit approval.
