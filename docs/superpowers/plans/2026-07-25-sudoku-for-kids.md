# Sudoku for Kids Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a localized `/[locale]/sudoku-for-kids` page with a real 4×4 activity, strong SEO, internal backlinks, and one legitimate README backlink.

**Architecture:** Keep the 4×4 puzzle model in a pure library module with deterministic fixtures and validation helpers. Render the activity through one focused client component, while the page remains a server component responsible for metadata, structured data, educational copy, and internal links. Reuse the current sitemap, `llms.txt`, homepage components, and CI site audits.

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript, next-intl locale routing, Tailwind CSS, Vitest, GitHub Actions.

## Global Constraints

- Route must be `/{locale}/sudoku-for-kids`.
- English H1 must be `Sudoku for Kids: Free Easy 4×4 Puzzle`.
- The first version must not collect a name, email, account, profile, or other child personal data.
- Include exactly three predefined 4×4 puzzles with one verified solution each.
- Support input 1–4, clear, check, reset, next puzzle, and browser print.
- Keep Samurai Sudoku positioned as a later advanced challenge.
- Add backlinks from homepage learning, homepage footer, how-to-play, printable hub, and README.
- Do not create additional kids-Sudoku routes in this task.

---

### Task 1: 4×4 puzzle model and validation

**Files:**
- Create: `lib/kids-sudoku/puzzles.test.ts`
- Create: `lib/kids-sudoku/puzzles.ts`

**Interfaces:**
- Produces: `KidsSudokuPuzzle`, `KIDS_SUDOKU_PUZZLES`, `createKidsSudokuGrid`, `checkKidsSudokuGrid`, and `countKidsSudokuSolutions`.

- [ ] **Step 1: Write the failing tests**

Create tests that assert:

```ts
expect(KIDS_SUDOKU_PUZZLES).toHaveLength(3);
expect(countKidsSudokuSolutions(puzzle.grid)).toBe(1);
expect(checkKidsSudokuGrid(puzzle.grid, puzzle)).toBe('incomplete');
expect(checkKidsSudokuGrid(puzzle.solution, puzzle)).toBe('complete');
```

Also verify each solution contains 1–4 exactly once in every row, column, and 2×2 box, and every non-zero given matches the solution.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm test lib/kids-sudoku/puzzles.test.ts
```

Expected: failure because `lib/kids-sudoku/puzzles.ts` does not exist.

- [ ] **Step 3: Implement the minimal puzzle model**

Define:

```ts
export type KidsSudokuGrid = number[][];
export type KidsSudokuStatus = 'incomplete' | 'incorrect' | 'complete';

export interface KidsSudokuPuzzle {
  id: string;
  grid: KidsSudokuGrid;
  solution: KidsSudokuGrid;
  clueCount: number;
}
```

Use three fixed, unique 4×4 puzzles. `checkKidsSudokuGrid` must return `incomplete` when any cell is zero, `incorrect` when a filled cell differs from the solution, and `complete` only for the full correct grid.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
pnpm test lib/kids-sudoku/puzzles.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/kids-sudoku/puzzles.ts lib/kids-sudoku/puzzles.test.ts
git commit -m "feat: add verified kids Sudoku puzzles"
```

### Task 2: Interactive 4×4 activity

**Files:**
- Create: `components/kids/KidsSudoku4x4.tsx`

**Interfaces:**
- Consumes: `KIDS_SUDOKU_PUZZLES`, `createKidsSudokuGrid`, and `checkKidsSudokuGrid`.
- Produces: `KidsSudoku4x4({ locale }: { locale: string })`.

- [ ] **Step 1: Add a component contract test through source inspection**

Create or extend `lib/kids-sudoku/puzzles.test.ts` to read `components/kids/KidsSudoku4x4.tsx` and require these user-visible controls after the file exists:

```ts
expect(source).toContain('kids_sudoku_check');
expect(source).toContain('kids_sudoku_next');
expect(source).toContain('window.print()');
```

Run the focused test and confirm it fails because the component is missing.

- [ ] **Step 2: Implement the client component**

The component must:

- initialize from puzzle 0;
- prevent editing non-zero givens;
- allow selecting an empty cell and entering 1–4;
- support keyboard keys 1–4, Backspace, and Delete;
- clear the selected editable cell;
- show localized `incomplete`, `incorrect`, and `complete` feedback;
- reset the current puzzle;
- cycle through all three puzzles;
- call `window.print()` from a print button;
- track check and next actions with the existing analytics helper or `TrackedLink`-compatible event utilities.

- [ ] **Step 3: Run the focused test**

```bash
pnpm test lib/kids-sudoku/puzzles.test.ts
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add components/kids/KidsSudoku4x4.tsx lib/kids-sudoku/puzzles.test.ts
git commit -m "feat: add interactive 4x4 kids Sudoku"
```

### Task 3: SEO landing page

**Files:**
- Create: `app/[locale]/sudoku-for-kids/page.tsx`

**Interfaces:**
- Consumes: `KidsSudoku4x4`, `buildLanguageAlternates`, `buildLocalizedUrl`, and `buildAbsoluteUrl`.

- [ ] **Step 1: Write a failing page source test**

Create `app/[locale]/sudoku-for-kids/page.test.ts` that reads the page source and requires:

```ts
expect(source).toContain('Sudoku for Kids: Free Easy 4×4 Puzzle');
expect(source).toContain('LearningResource');
expect(source).toContain('FAQPage');
expect(source).toContain('/games/samurai/daily');
expect(source).toContain('/printable-samurai-sudoku');
```

Run it and verify failure because the page does not exist.

- [ ] **Step 2: Implement metadata and structured data**

Use an English title beginning with `Sudoku for Kids` and a description that mentions free 4×4 play, no registration, parent/teacher use, and printable browser worksheets.

Add:

- canonical and hreflang;
- Open Graph and Twitter metadata;
- WebPage;
- LearningResource;
- HowTo;
- FAQPage;
- BreadcrumbList.

- [ ] **Step 3: Implement educational content and internal links**

Include:

- the required H1;
- the interactive activity;
- 4×4 rules;
- age progression guidance;
- parent/teacher tips;
- FAQ;
- links to Daily Samurai Sudoku, how-to-play, printable hub, puzzle methodology, and homepage.

- [ ] **Step 4: Run focused tests**

```bash
pnpm test app/[locale]/sudoku-for-kids/page.test.ts lib/kids-sudoku/puzzles.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/sudoku-for-kids/page.tsx app/[locale]/sudoku-for-kids/page.test.ts
git commit -m "feat: add Sudoku for Kids SEO page"
```

### Task 4: Sitemap, answer-engine map, and backlinks

**Files:**
- Modify: `app/sitemap.ts`
- Modify: `app/sitemap.test.ts`
- Modify: `app/llms.txt/route.ts`
- Modify: `components/home/LearningPathSection.tsx`
- Modify: `components/home/SiteFooter.tsx`
- Modify: `app/[locale]/games/samurai/how-to-play/page.tsx`
- Modify: `app/[locale]/printable-samurai-sudoku/page.tsx`
- Modify: `README.md`

**Interfaces:**
- Adds the localized kids page to all discovery and backlink surfaces.

- [ ] **Step 1: Extend sitemap tests first**

Add assertions:

```ts
expect(urls.has('https://www.samuraisudoku.net/en/sudoku-for-kids')).toBe(true);
expect(urls.has('https://www.samuraisudoku.net/zh/sudoku-for-kids')).toBe(true);
```

Run:

```bash
pnpm test app/sitemap.test.ts
```

Expected: fail until the route is added.

- [ ] **Step 2: Add sitemap and llms entries**

Use monthly change frequency and priority `0.72`. Describe the page in `llms.txt` as a free, no-registration 4×4 learning resource for parents and teachers.

- [ ] **Step 3: Add contextual backlinks**

Add naturally varied anchors:

- homepage learning: `Sudoku for Kids`;
- footer: `Kids Sudoku`;
- how-to-play: `Start with easy 4×4 Sudoku for kids`;
- printable hub: `Need a simpler 4×4 worksheet?`;
- README: `[Play Sudoku for Kids](https://www.samuraisudoku.net/en/sudoku-for-kids)`.

- [ ] **Step 4: Run targeted tests**

```bash
pnpm test app/sitemap.test.ts app/[locale]/sudoku-for-kids/page.test.ts lib/kids-sudoku/puzzles.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add app/sitemap.ts app/sitemap.test.ts app/llms.txt/route.ts components/home/LearningPathSection.tsx components/home/SiteFooter.tsx app/[locale]/games/samurai/how-to-play/page.tsx app/[locale]/printable-samurai-sudoku/page.tsx README.md
git commit -m "seo: connect Sudoku for Kids across the site"
```

### Task 5: Full verification

**Files:**
- No new production files unless verification reveals a defect.

- [ ] **Step 1: Run lint and type checking**

```bash
pnpm lint
pnpm exec tsc --noEmit
```

Expected: pass with zero warnings or errors.

- [ ] **Step 2: Run all tests**

```bash
pnpm test
```

Expected: pass.

- [ ] **Step 3: Validate puzzle corpus and production build**

```bash
pnpm validate-puzzles
pnpm build
```

Expected: pass.

- [ ] **Step 4: Run local site audits**

```bash
pnpm audit:site
```

Expected: internal-link and page-quality audits pass, including `/en/sudoku-for-kids` and `/zh/sudoku-for-kids`.

- [ ] **Step 5: Confirm GitHub CI and Vercel preview**

Verify the PR head has a successful GitHub CI run and successful Vercel status before reporting completion.
