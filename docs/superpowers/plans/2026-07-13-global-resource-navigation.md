# Global Resource Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a two-level, localized site header that makes free printables immediately discoverable from the home page and every inner page.

**Architecture:** A pure navigation-data builder owns localized destinations and labels. A reusable header renders tracked links from that data, and the locale layout mounts it once for all routes. The game client subtracts the header's stable height from its viewport layout.

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript, Tailwind CSS, Vitest, existing `TrackedLink` analytics.

## Global Constraints

- Reuse the canonical `/{locale}/printable-samurai-sudoku` route.
- Keep the header exactly 88px tall across supported viewport widths.
- Hide the complete header in print media.
- Do not add a navigation dependency or modify puzzle, PayPal, or PDF-generation logic.
- Preserve the user's untracked knowledge-base file.

---

### Task 1: Navigation Data Contract

**Files:** Create `lib/site-navigation.ts`; test `lib/site-navigation.test.ts`.

**Interfaces:** Produce `buildSiteNavigation(locale: string, paidPackPrice: string): SiteNavigationModel` with localized offer, brand, and primary links.

- [x] Write failing tests for English/Chinese canonical links, featured printables, and configured PDF price.
- [x] Run `pnpm vitest run lib/site-navigation.test.ts`; expect failure because the builder is absent.
- [x] Implement the typed builder with Home, Today, Free Printables, Archive, Guides, and PDF Pack destinations.
- [x] Run the focused test again; expect a pass.

### Task 2: Global Header

**Files:** Create `components/site/SiteHeader.tsx`; modify `app/[locale]/layout.tsx` and `app/globals.css`.

**Interfaces:** Consume the navigation builder and `TrackedLink`; produce a semantic 88px header mounted above every localized route.

- [x] Render a full-width tracked offer strip to the printable center.
- [x] Render the brand and horizontally scrollable primary links with a featured printable treatment.
- [x] Mount `SiteHeader` in the locale layout before `{children}`.
- [x] Hide the header in print media and visually suppress only the horizontal scrollbar.

### Task 3: Game Viewport Compatibility

**Files:** Modify `app/[locale]/games/samurai/SamuraiGameClient.tsx`.

**Interfaces:** Consume the fixed 88px header height and produce a game shell with `min-height: calc(100dvh - 5.5rem)`.

- [x] Replace full viewport minimum heights in loading and loaded game shells.
- [x] Verify desktop and mobile board space for clipping, overlap, and double scrolling.

### Task 4: Validation

**Files:** Modify only files required by direct validation failures.

- [x] Run `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm test`; expect zero failures.
- [x] Run `pnpm build`; expect puzzle validation, PDF validation, and production build success.
- [x] Start the site and run internal-link and page-quality audits; expect both to pass.
- [x] Inspect localized home, game, printable, and guide pages at desktop and mobile widths.
