# Kids Sudoku Full Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the existing localized Sudoku for Kids hub into a persistent, playable, printable, teacher-friendly 4×4 and 6×6 product cluster without collecting child personal data.

**Architecture:** A shared size-aware Kids Sudoku engine will power verified 4×4 and 6×6 libraries, interactive boards, print pages, answers, and the worksheet generator. Progress uses a versioned 30-day localStorage record. Every page remains server-rendered for SEO while interactive tools are isolated client components.

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript, Tailwind CSS, next-intl locale routing, Vitest, existing analytics helpers, existing sitemap/link/page-quality audits.

## Global Constraints

- Work only on `fix/20260725-cache-ci-content-architecture`; do not modify `main` directly.
- Preserve `backup/20260726-before-kids-full-optimization` as the rollback snapshot.
- Keep PR #4 in Draft state.
- Do not change Samurai Sudoku generation, PayPal, signed downloads, account behavior, or analytics consent.
- Do not collect child names, email addresses, birthdays, schools, profiles, or comments.
- Store Kids Sudoku progress only in browser localStorage and expire it after 30 days.
- Every production change must be preceded by a failing test or contract assertion.
- Every phase ends with GitHub CI and Vercel verification.

---

### Task 1: Shared Kids Sudoku Engine

**Files:**
- Create: `lib/kids-sudoku/core.ts`
- Create: `lib/kids-sudoku/core.test.ts`
- Modify: `lib/kids-sudoku/puzzles.ts`
- Modify: `lib/kids-sudoku/puzzles.test.ts`

**Interfaces:**
- Produces `KidsSudokuSpec`, `KidsSudokuPuzzle`, `KidsSudokuLevel`, `cloneKidsSudokuGrid`, `countKidsSudokuSolutions`, `checkKidsSudokuGrid`, `buildKidsSudokuPuzzle`, `KIDS_SUDOKU_4X4_PUZZLES`, and `KIDS_SUDOKU_6X6_PUZZLES`.
- Later tasks consume the verified puzzle arrays and generic grid checking API.

- [ ] **Step 1: Write failing engine tests**

Add tests proving that a generic 4×4 spec uses 2×2 boxes, a generic 6×6 spec uses 2×3 boxes, valid completed boards pass, invalid rows/columns/boxes fail, and solution counting distinguishes zero, one, and multiple solutions.

- [ ] **Step 2: Run tests and confirm RED**

Run through PR CI. Expected failure: missing `core.ts` exports.

- [ ] **Step 3: Implement the minimal generic engine**

Define:

```ts
export interface KidsSudokuSpec {
  size: number;
  boxRows: number;
  boxColumns: number;
}

export function countKidsSudokuSolutions(
  grid: number[][],
  spec: KidsSudokuSpec,
  limit = 2,
): number;
```

Use minimum-candidate backtracking and validate row, column, and configured box dimensions.

- [ ] **Step 4: Write failing library-size tests**

Require exactly 24 verified 4×4 puzzles and 12 verified 6×6 puzzles, divided evenly across `easy`, `medium`, and `challenge`, with unique IDs and exactly one solution.

- [ ] **Step 5: Confirm library tests fail against the current 3-puzzle fixture**

Expected failure: incorrect library sizes and missing 6×6 library.

- [ ] **Step 6: Build deterministic verified libraries**

Use valid completed boards, seeded coordinate orders, and clue removal that retains exactly one solution. Target clue profiles:

```ts
4x4: easy=10, medium=8, challenge=6
6x6: easy=24, medium=20, challenge=16
```

If a target cannot be reached while preserving uniqueness, keep the last valid clue count and record it on the puzzle.

- [ ] **Step 7: Run the complete unit suite**

Expected: all engine and library tests pass.

- [ ] **Step 8: Commit**

Commit message: `feat: add verified 4x4 and 6x6 kids sudoku libraries`.

---

### Task 2: Versioned Local Progress

**Files:**
- Create: `lib/kids-sudoku/progress.ts`
- Create: `lib/kids-sudoku/progress.test.ts`

**Interfaces:**
- Produces `KIDS_SUDOKU_PROGRESS_KEY`, `KidsSudokuProgressRecord`, `readKidsSudokuProgress`, `writeKidsSudokuProgress`, and `clearKidsSudokuProgress`.
- The interactive activity consumes these helpers.

- [ ] **Step 1: Write failing progress tests**

Test valid restoration, 30-day expiry, malformed JSON, unknown puzzle IDs, invalid grid dimensions, and completed puzzle ID deduplication.

- [ ] **Step 2: Confirm RED**

Expected failure: missing `progress.ts`.

- [ ] **Step 3: Implement versioned progress helpers**

Use this record shape:

```ts
interface KidsSudokuProgressRecord {
  version: 1;
  puzzleId: string;
  grid: number[][];
  completedPuzzleIds: string[];
  updatedAt: number;
}
```

Reject records older than `30 * 24 * 60 * 60 * 1000` milliseconds and remove invalid records from storage.

- [ ] **Step 4: Run tests**

Expected: all progress tests pass.

- [ ] **Step 5: Commit**

Commit message: `feat: persist kids sudoku progress locally`.

---

### Task 3: Shared Interactive Board and Completion Flow

**Files:**
- Create: `components/kids/KidsSudokuActivity.tsx`
- Create: `components/kids/KidsSudokuActivity.contract.test.ts`
- Modify: `components/kids/KidsSudoku4x4.tsx`
- Create: `components/kids/KidsSudoku6x6.tsx`

**Interfaces:**
- `KidsSudokuActivity` accepts `locale`, `puzzles`, `storageEnabled`, and optional `nextStageHref`.
- Wrappers provide the 4×4 and 6×6 libraries.

- [ ] **Step 1: Write failing component contract tests**

Assert that the shared component includes level selection, local progress restore/save calls, a stable `useCallback` keyboard handler, a dependency array on the keyboard `useEffect`, completion analytics, and completion CTA links.

- [ ] **Step 2: Confirm RED**

Expected failure: missing shared component and wrappers.

- [ ] **Step 3: Implement shared activity**

Required behavior:

- Fixed givens cannot be edited.
- Pointer and keyboard input support all values for the current size.
- Level selector filters the library.
- Reset, clear, check, next puzzle, and print remain available.
- Current puzzle and grid restore from localStorage.
- Progress saves after grid changes.
- Completing a puzzle records its ID once and fires `kids_sudoku_completed` once per completion.
- Completion panel shows solved count, another puzzle, printable worksheets, and next-stage link.
- Keyboard listener is registered with a memoized callback and precise dependencies.

- [ ] **Step 4: Replace the existing 4×4 component with a wrapper**

Keep the current exported name `KidsSudoku4x4` so the hub page does not change its public interface.

- [ ] **Step 5: Add the 6×6 wrapper**

Export `KidsSudoku6x6` configured with the verified 6×6 library and 2×3 box copy.

- [ ] **Step 6: Run tests and production type check**

Expected: component contracts and TypeScript pass.

- [ ] **Step 7: Commit**

Commit message: `feat: add persistent kids sudoku activity flow`.

---

### Task 4: Upgrade the Main Kids Hub

**Files:**
- Modify: `app/[locale]/sudoku-for-kids/page.tsx`
- Modify: `app/[locale]/sudoku-for-kids/page.contract.test.ts`

**Interfaces:**
- Consumes the upgraded `KidsSudoku4x4` component.
- Links to all child pages created in later tasks.

- [ ] **Step 1: Extend the failing page contract**

Require long-tail FAQ copy for five-year-olds, kindergarten, worksheets, and classroom use; require cards for printable worksheets, 6×6, worksheet generator, answers, and resources; require a privacy statement and no email signup form.

- [ ] **Step 2: Confirm RED**

Expected failure: missing cards and FAQ phrases.

- [ ] **Step 3: Update the hub**

Keep the main title and canonical intent. Add a product-navigation section, expanded FAQ, completion-progression explanation, and contextual links to every Kids Sudoku subpage.

- [ ] **Step 4: Run page contract tests**

Expected: pass.

- [ ] **Step 5: Commit**

Commit message: `seo: expand sudoku for kids hub and long-tail coverage`.

---

### Task 5: Printable Worksheets and Answer Keys

**Files:**
- Create: `app/[locale]/sudoku-for-kids/printable/page.tsx`
- Create: `app/[locale]/sudoku-for-kids/printable/page.contract.test.ts`
- Create: `app/[locale]/sudoku-for-kids/answers/page.tsx`
- Create: `app/[locale]/sudoku-for-kids/answers/page.contract.test.ts`
- Create: `components/kids/KidsSudokuPrintGrid.tsx`

**Interfaces:**
- Consumes curated items from the verified 4×4 library.
- The generator later reuses `KidsSudokuPrintGrid`.

- [ ] **Step 1: Write failing page contracts**

Require unique metadata, H1, canonical intent, print controls, at least six worksheet grids, answer-page link, hub link, and structured data.

- [ ] **Step 2: Confirm RED**

Expected failure: missing pages and print component.

- [ ] **Step 3: Implement the print grid**

Render givens with correct 2×2 or 2×3 thick borders and a print-safe layout. Support `showSolution` and `label` props.

- [ ] **Step 4: Implement printable page**

Render six curated 4×4 puzzles, browser-print action, rules, no-signup explanation, answer-key link, generator link, and LearningResource/ItemList structured data.

- [ ] **Step 5: Implement answer page**

Render matching six solutions with clear numbering and links back to worksheets and hub. Use `CollectionPage` and `ItemList` structured data.

- [ ] **Step 6: Run contracts and build**

Expected: pass.

- [ ] **Step 7: Commit**

Commit message: `feat: add printable kids sudoku worksheets and answers`.

---

### Task 6: Playable 6×6 Page

**Files:**
- Create: `app/[locale]/sudoku-for-kids/6x6/page.tsx`
- Create: `app/[locale]/sudoku-for-kids/6x6/page.contract.test.ts`

**Interfaces:**
- Consumes `KidsSudoku6x6`.

- [ ] **Step 1: Write failing page contract**

Require the primary keyword `6x6 sudoku for kids`, an explanation of 2×3 boxes, interactive component usage, 4×4 fallback link, worksheet-generator link, FAQ, and structured data.

- [ ] **Step 2: Confirm RED**

Expected failure: missing page.

- [ ] **Step 3: Implement the page**

Provide age-readiness guidance, three concise rules, the playable board, and progression links.

- [ ] **Step 4: Run contract and build**

Expected: pass.

- [ ] **Step 5: Commit**

Commit message: `feat: add playable 6x6 sudoku for kids`.

---

### Task 7: Teacher Worksheet Generator

**Files:**
- Create: `components/kids/KidsWorksheetGenerator.tsx`
- Create: `components/kids/KidsWorksheetGenerator.contract.test.ts`
- Create: `lib/kids-sudoku/worksheet.ts`
- Create: `lib/kids-sudoku/worksheet.test.ts`
- Create: `app/[locale]/sudoku-for-kids/worksheet-generator/page.tsx`
- Create: `app/[locale]/sudoku-for-kids/worksheet-generator/page.contract.test.ts`

**Interfaces:**
- Produces `selectWorksheetPuzzles` for deterministic selection by size, level, count, and seed.
- Client component consumes the selector and `KidsSudokuPrintGrid`.

- [ ] **Step 1: Write failing worksheet-selection tests**

Test 4×4/6×6 filtering, Easy/Medium/Challenge/Mixed, 2/4/6 counts, deterministic seeds, no duplicate puzzle IDs, and answer inclusion.

- [ ] **Step 2: Confirm RED**

Expected failure: missing worksheet module.

- [ ] **Step 3: Implement deterministic selection**

Use a simple integer seed and verified libraries only. Reject unsupported sizes, levels, or counts.

- [ ] **Step 4: Write failing component/page contracts**

Require size, level, count, answers, regenerate, print, analytics, privacy copy, and internal links.

- [ ] **Step 5: Confirm RED**

Expected failure: missing component/page.

- [ ] **Step 6: Implement generator and page**

Render controls, generated puzzle grids, optional answer section, `Generate another set`, and `Print worksheet`. Fire non-personal analytics with size, level, count, and locale.

- [ ] **Step 7: Run tests and build**

Expected: pass.

- [ ] **Step 8: Commit**

Commit message: `feat: add teacher sudoku worksheet generator`.

---

### Task 8: Parent and Teacher Resource Center

**Files:**
- Create: `app/[locale]/sudoku-for-kids/resources/page.tsx`
- Create: `app/[locale]/sudoku-for-kids/resources/page.contract.test.ts`

**Interfaces:**
- Links to hub, printable, answers, 6×6, and worksheet generator.

- [ ] **Step 1: Write failing contract**

Require a 10-minute lesson plan, parent prompts, differentiation, progression, privacy statement, classroom FAQ, at least five internal links, and LearningResource/FAQ structured data.

- [ ] **Step 2: Confirm RED**

Expected failure: missing page.

- [ ] **Step 3: Implement localized resource center**

Use actionable sections for parents and teachers rather than generic benefits copy.

- [ ] **Step 4: Run contract and build**

Expected: pass.

- [ ] **Step 5: Commit**

Commit message: `content: add kids sudoku parent and teacher resources`.

---

### Task 9: SEO Discovery, Internal Links, and Quality Classification

**Files:**
- Modify: `app/sitemap.ts`
- Modify: `app/sitemap.test.ts`
- Modify: `app/llms.txt/route.ts`
- Modify: `lib/site-navigation.ts`
- Modify: `lib/site-navigation.test.ts`
- Modify: `components/home/SiteFooter.tsx`
- Modify: `scripts/page-quality-audit.ts`
- Modify: `scripts/page-quality-audit.test.ts`
- Modify: `README.md`

**Interfaces:**
- Adds every new Kids Sudoku route to discovery while keeping one global Kids hub navigation item.

- [ ] **Step 1: Write failing sitemap and audit tests**

Require all five subpages in English and Chinese, classify all `/sudoku-for-kids` routes as `kids-sudoku`, and retain existing trust-page exclusions.

- [ ] **Step 2: Confirm RED**

Expected failure: missing sitemap entries and category logic.

- [ ] **Step 3: Update discovery and links**

Add routes with distinct priorities and frequencies, update `llms.txt`, add contextual footer links without overcrowding global navigation, and document the live Kids Sudoku cluster in README.

- [ ] **Step 4: Run unit tests**

Expected: pass.

- [ ] **Step 5: Commit**

Commit message: `seo: connect the kids sudoku learning cluster`.

---

### Task 10: Full Verification and PR Documentation

**Files:**
- Modify: PR #4 body only.

- [ ] **Step 1: Run full GitHub CI**

Required successful steps:

- ESLint
- TypeScript
- Vitest
- Site-audit runner contract
- Samurai puzzle corpus validation
- Production build
- Internal-link audit
- Page-quality audit

- [ ] **Step 2: Verify Vercel preview**

Require Vercel status `success` for the final head commit.

- [ ] **Step 3: Review changed-file scope**

Confirm no PayPal, signed download, Samurai generator, or account files changed.

- [ ] **Step 4: Update Draft PR body**

Document all Kids Sudoku additions, test evidence, backup branch, and non-collection/privacy guarantees.

- [ ] **Step 5: Keep Draft PR unmerged**

Wait for explicit user approval before merging.