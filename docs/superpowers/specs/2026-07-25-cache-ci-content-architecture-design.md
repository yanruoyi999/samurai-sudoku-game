# Cache, CI, and Content Architecture Design

## Goal

Resolve the remaining audit findings without changing puzzle rules, payment behavior, or the production `main` branch directly.

## Scope

This branch contains five independently reviewable improvements:

1. Correct puzzle JSON caching so corrected puzzles can refresh while offline play still works.
2. Run internal-link and page-quality audits against a locally built Next.js server in pull-request CI.
3. Establish one canonical content hierarchy for Samurai Sudoku guides and reduce overlapping page intent.
4. Split the oversized homepage into focused components and shared guide data.
5. Add a transparent puzzle methodology page describing generation, validation, difficulty, corrections, and content review.

## 1. Puzzle cache policy

Current dated puzzle JSON responses are marked `immutable` for one year and the service worker uses `CacheFirst` for 30 days. That can preserve corrected puzzle data too long.

The new policy will:

- use `StaleWhileRevalidate` for dated puzzle JSON;
- retain up to 200 puzzle documents for offline play;
- keep cached puzzle data for 30 days as an offline fallback;
- change HTTP caching to require browser revalidation while allowing CDN reuse for one hour;
- centralize the values in a JSON policy file consumed by `next.config.js` and unit tests.

## 2. CI audits

Both audit scripts require a running website and `/sitemap.xml`. CI will:

1. install dependencies;
2. run lint, TypeScript, Vitest, and puzzle validation as today;
3. build the production application once;
4. start `next start` on `127.0.0.1:3000`;
5. wait for `/sitemap.xml` to return successfully;
6. run the internal-link audit against localhost;
7. run the page-quality audit against localhost;
8. stop the server even when an audit fails.

A dedicated shell script will own server startup, readiness, cleanup, and audit execution so the workflow remains readable and testable.

## 3. Guide content architecture

The canonical guide hierarchy will be:

- `what-is-samurai-sudoku`: definition and five-grid layout;
- `how-to-play`: rules and controls;
- `beginners`: beginner learning path;
- `first-move-strategy`: opening interaction and first deduction;
- `choose-difficulty`: difficulty and archive/new-game choice;
- `solving-tips`: primary start-to-finish solving hub;
- `strategy-guide`: intermediate and advanced deduction techniques;
- `overlap-boxes`: overlap-box specialist page;
- `candidate-notes`: candidate-note specialist page;
- `evil-solving-path`: hard/Evil specialist workflow;
- `solver`: hint and solver behavior;
- printable/PDF pages: print and purchase intent.

A shared `lib/samurai/guides.ts` registry will define each guide's slug, title, short description, role, and primary keyword for English and Chinese. Homepage and guide navigation will consume the registry rather than repeat ad-hoc arrays.

The primary keyword for each page must be unique. Broad terms such as `武士数独攻略` and `samurai sudoku solving tips` belong to `solving-tips`; `strategy-guide` will target intermediate/advanced technique terms.

## 4. Homepage decomposition

The localized homepage will keep server rendering and existing behavior, but presentation will be split into focused server components under `components/home/`:

- `HomeHero`
- `QuickStartSection`
- `LogicGameSection`
- `DifficultySection`
- `LearningPathSection`
- `HomeFaqSection`
- `SiteFooter`

The page file remains responsible for translations, message parsing, structured data, and assembling sections. Shared guide metadata comes from the guide registry.

## 5. Puzzle methodology

Add `/[locale]/about/puzzle-methodology` with:

- how puzzles are generated;
- how unique solutions are validated;
- how difficulty is estimated;
- what automated checks run before deployment;
- how corrections and cache refreshes work;
- how guide content is reviewed and updated;
- contact path for reporting an error.

The About page, footer, sitemap, and `llms.txt` will link to this page.

## Analytics and behavior

No new tracking is required for the cache or CI changes. Homepage links retain their current destinations. The methodology page uses normal internal links.

## Verification

- Vitest verifies the cache policy and guide registry uniqueness.
- A Node test verifies the CI audit runner's command structure and cleanup trap.
- GitHub CI verifies lint, TypeScript, tests, puzzle corpus, production build, internal links, and page quality.
- Vercel preview must build successfully.
- PR changed files are reviewed to ensure no puzzle generation, payment, or storage logic changed.

## Non-goals

- No merge of PR #3 in this branch.
- No account, subscription, or payment changes.
- No puzzle algorithm rewrite.
- No mass creation of new generic strategy articles.
