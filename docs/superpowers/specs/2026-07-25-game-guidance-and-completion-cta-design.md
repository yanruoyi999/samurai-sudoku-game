# Game Guidance and Completion CTA Design

## Goal

Keep players inside the Samurai Sudoku learning loop when they are stuck or finish a puzzle, instead of sending them back to the homepage or making them restart randomly.

## Scope

This change adds two UI surfaces only:

1. A reusable in-game help panel with links to the most relevant guides.
2. A completion panel with clear next actions after a puzzle is solved.

The existing completion event, game controls, puzzle generation, storage, and scoring logic remain unchanged.

## In-game help panel

The panel appears above the board in the shared game body, so desktop, tablet, and mobile layouts all use the same component without duplicating ActionBar code. It contains four contextual links:

- Solving tips: complete start-to-finish workflow.
- First move guide: select a cell before entering a number.
- Candidate notes: help for stalled mid-game positions.
- Overlap boxes: explanation of the shared 3x3 regions.

Every link uses `TrackedLink` and emits `game_help_link_click` with:

- `destination`
- `difficulty`
- `locale`
- `location`
- `puzzle_id`

## Completion panel

When `status === "completed"`, replace the current one-line success message with a richer completion card containing:

- Congratulations message.
- Start another puzzle at the current difficulty.
- Move up one difficulty when possible.
- Browse all puzzles.
- Review solving tips.

The panel must not generate a new puzzle automatically. It links to canonical difficulty/archive/guide pages so the user remains in a predictable URL and the action is measurable.

## Architecture

Create a focused client component at `components/sudoku/GameGuidancePanel.tsx` for the reusable help links. Render it from `SamuraiGameClient.tsx` so every responsive game layout receives the same panel. Keep completion actions in `SamuraiGameClient.tsx`, because completion state and the current puzzle difficulty already live there.

Create pure helper functions in `lib/sudoku/game-guidance.ts` for difficulty progression and localized guidance link metadata. Unit-test these helpers with Vitest before wiring the UI.

## Error handling

- Missing difficulty falls back to Easy for next-puzzle actions.
- Evil has no higher difficulty; the upgrade action is omitted.
- Links remain normal Next.js navigation links and require no network mutation.
- Analytics failure must not block navigation because `TrackedLink` already handles navigation separately.

## Verification

- Unit tests cover difficulty progression and guide link destinations.
- CI must pass lint, TypeScript, Vitest, and puzzle validation.
- Vercel preview must build successfully.

## Non-goals

- No changes to puzzle generation.
- No changes to completion detection or completion analytics.
- No account, subscription, payment, or share feature.
- No redesign of the entire ActionBar.
