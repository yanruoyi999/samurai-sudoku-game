# Game Guidance and Completion CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add contextual help links during play and useful next-step actions after puzzle completion without changing puzzle logic.

**Architecture:** A pure helper module defines guide links and difficulty progression. A reusable `GameGuidancePanel` renders tracked help links in both desktop and mobile controls. `SamuraiGameClient` owns the completion card because it already observes puzzle completion state.

**Tech Stack:** Next.js 15, React 18, TypeScript, next-intl, Zustand, Vitest.

## Global Constraints

- Work only on `fix/20260725-game-guidance-and-completion-cta`.
- Preserve `backup/20260725-before-game-guidance-fix` unchanged.
- Do not modify puzzle generation, solver behavior, storage format, or completion detection.
- Keep all links localized under `/${locale}`.
- Navigation must remain usable if analytics fails.

---

### Task 1: Guidance helpers

**Files:**
- Create: `lib/sudoku/game-guidance.ts`
- Create: `lib/sudoku/game-guidance.test.ts`

**Interfaces:**
- Produces: `getNextDifficulty(difficulty: Difficulty | null): Difficulty | null`
- Produces: `getGameGuidanceLinks(locale: string): Array<{ key: string; href: string; label: string; description: string }>`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { getGameGuidanceLinks, getNextDifficulty } from './game-guidance';

describe('getNextDifficulty', () => {
  it('progresses through easy, medium, hard, and stops at evil', () => {
    expect(getNextDifficulty('easy')).toBe('medium');
    expect(getNextDifficulty('medium')).toBe('hard');
    expect(getNextDifficulty('hard')).toBe('evil');
    expect(getNextDifficulty('evil')).toBeNull();
  });

  it('falls back to easy when difficulty is missing', () => {
    expect(getNextDifficulty(null)).toBe('easy');
  });
});

describe('getGameGuidanceLinks', () => {
  it('returns localized Chinese guide links', () => {
    expect(getGameGuidanceLinks('zh').map((link) => link.href)).toEqual([
      '/zh/games/samurai/solving-tips',
      '/zh/games/samurai/first-move-strategy',
      '/zh/games/samurai/candidate-notes',
      '/zh/games/samurai/overlap-boxes',
    ]);
  });

  it('falls back to English copy for unknown locales', () => {
    const links = getGameGuidanceLinks('fr');
    expect(links[0].href).toBe('/en/games/samurai/solving-tips');
    expect(links[0].label).toBe('Solving tips');
  });
});
```

- [ ] **Step 2: Run CI and verify the test fails because the helper module is missing**

Open a draft PR targeting `main`. Expected CI result: TypeScript/Vitest failure for missing `./game-guidance`.

- [ ] **Step 3: Implement the minimal helper module**

Define the four guide links and the ordered difficulty progression with no UI dependencies.

- [ ] **Step 4: Run CI and verify helper tests pass**

Expected: Vitest passes the new helper tests.

### Task 2: Reusable in-game guidance panel

**Files:**
- Create: `components/sudoku/GameGuidancePanel.tsx`
- Modify: `components/sudoku/ActionBar.tsx`

**Interfaces:**
- Consumes: `getGameGuidanceLinks(locale)`
- Props: `{ difficulty: Difficulty | null; location: 'desktop_action_bar' | 'mobile_action_bar'; puzzleId: string | null }`

- [ ] **Step 1: Implement a focused client component**

Render a compact bordered panel titled `遇到困难？` / `Stuck?` and four `TrackedLink` items. Emit `game_help_link_click` with destination, difficulty, locale, location, and puzzle ID.

- [ ] **Step 2: Render the panel in both ActionBar layouts**

Place it after the control buttons on desktop and after the mobile control section. Do not duplicate the link definitions.

- [ ] **Step 3: Verify responsive rendering through TypeScript and Vercel build**

Expected: no import cycles, no server/client boundary errors, and successful preview build.

### Task 3: Completion next-step card

**Files:**
- Modify: `app/[locale]/games/samurai/[id]/SamuraiGameClient.tsx`

**Interfaces:**
- Consumes: `getNextDifficulty(initialPuzzle.difficulty)`
- Uses existing `TrackedLink`

- [ ] **Step 1: Replace the single-line completion notice**

Keep the congratulations message and add actions for:

- Same-difficulty puzzle hub.
- Next difficulty when available.
- All puzzles archive.
- Solving tips.

- [ ] **Step 2: Add analytics properties**

Use `game_completion_cta_click` with `destination`, `difficulty`, `locale`, `puzzle_id`, and `next_difficulty` when relevant.

- [ ] **Step 3: Verify Evil omits the upgrade action**

Use `getNextDifficulty('evil') === null`; no disabled or dead button should render.

### Task 4: Final verification and PR

**Files:**
- No additional production files.

- [ ] **Step 1: Confirm backup branch remains unchanged**

Compare `backup/20260725-before-game-guidance-fix` against `main` at creation point.

- [ ] **Step 2: Confirm the repair branch diff contains only scoped files**

Expected files: design/plan docs, helper/tests, guidance panel, ActionBar, SamuraiGameClient.

- [ ] **Step 3: Require all checks**

Expected: Vercel success and GitHub CI success for lint, `tsc --noEmit`, Vitest, and puzzle validation.

- [ ] **Step 4: Leave PR as draft**

Do not merge into `main` without explicit user approval.
