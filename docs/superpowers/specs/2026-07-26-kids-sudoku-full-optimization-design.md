# Kids Sudoku Full Optimization Design

## Goal

Turn the existing `/[locale]/sudoku-for-kids` landing page into a reusable small product for parents and teachers while preserving the current Samurai Sudoku site, printable funnel, privacy posture, and Draft PR workflow.

## Scope

This design covers every optimization approved after the first Kids Sudoku page review:

1. Save and restore a child's current puzzle locally for 30 days.
2. Improve completion feedback and next-step actions.
3. Replace the unstable keyboard listener with a stable callback/effect.
4. Expand long-tail FAQ coverage without creating thin duplicate pages.
5. Expand the verified 4×4 library from 3 puzzles to 24 puzzles across Easy, Medium, and Challenge levels.
6. Add a dedicated printable Kids Sudoku worksheet page.
7. Add a separate answer-key page.
8. Add a playable 6×6 Kids Sudoku page.
9. Add a teacher worksheet generator that assembles printable sets from verified puzzles.
10. Add a parent and teacher resource center.
11. Connect every new page with canonical URLs, hreflang, sitemap entries, structured data, and contextual internal links.

## Product boundaries

- The product is presented to parents, teachers, and beginner learners, not as an account service for children.
- No name, email, school, birthday, child profile, comment, account, or personalized advertising data is collected.
- Progress is stored only in the current browser with a 30-day expiry.
- Existing Samurai Sudoku puzzle generation, payment, download authorization, analytics consent, and storage behavior remain unchanged.
- The existing `/[locale]/sudoku-for-kids` URL remains the canonical hub for the broad keyword `sudoku for kids`.
- Subpages target distinct intent: printable worksheets, answers, 6×6 practice, worksheet generation, and teaching resources.

## Architecture

### Shared puzzle engine

Create a size-aware Kids Sudoku core that supports:

- 4×4 boards with 2×2 boxes.
- 6×6 boards with 2×3 boxes.
- Board cloning.
- Solution counting with a configurable limit.
- Puzzle checking with incomplete, incorrect, and complete states.
- Deterministic clue removal that preserves a unique solution.

The existing 4×4 fixtures will migrate to the shared definition without changing the public page URL.

### Verified puzzle libraries

Build deterministic libraries from valid completed boards and seeded clue-removal orders:

- 24 verified 4×4 puzzles: 8 Easy, 8 Medium, 8 Challenge.
- 12 verified 6×6 puzzles: 4 Easy, 4 Medium, 4 Challenge.

Every library item records its level, clue count, dimensions, box shape, puzzle grid, and solution. Tests must confirm dimensions, givens, valid completed boards, and exactly one solution.

### Local progress

Use one versioned localStorage record:

- Key: `kids_sudoku_progress_v1`.
- Saved fields: puzzle ID, current grid, completed puzzle IDs, updated timestamp.
- Expiry: 30 days.
- Invalid, mismatched, malformed, or expired records are ignored and removed.
- No personal information is stored.

### Interactive activity

Refactor the current component into a shared interactive board with wrappers for 4×4 and 6×6.

The board supports:

- Touch, pointer, and keyboard input.
- Fixed givens.
- Clear, check, reset, next puzzle, level selection, and print.
- Local progress restoration.
- Completion celebration with solved count and direct actions for another puzzle, printable worksheets, and the next grid size.
- Stable keyboard event registration using memoized callbacks.

### Printable and answer pages

`/[locale]/sudoku-for-kids/printable` renders a print-friendly curated set from the verified 4×4 library. It includes browser-print controls and a clear link to the answer page.

`/[locale]/sudoku-for-kids/answers` renders matching answer grids. It is indexable because answer intent is distinct and useful, but its title, description, and H1 must clearly target answer keys rather than the broad Kids Sudoku term.

### 6×6 page

`/[locale]/sudoku-for-kids/6x6` provides a playable 6×6 board and explains 2×3 boxes. It links back to 4×4 for learners who need an easier starting point and forward to the worksheet generator.

### Teacher worksheet generator

`/[locale]/sudoku-for-kids/worksheet-generator` assembles a printable worksheet from the verified libraries. Controls:

- Grid size: 4×4 or 6×6.
- Level: Easy, Medium, Challenge, or Mixed.
- Puzzle count: 2, 4, or 6.
- Include answer keys: yes or no.
- Generate another set.
- Print.

The generator selects from verified puzzles only; it does not create unvalidated puzzles in the browser.

### Resource center

`/[locale]/sudoku-for-kids/resources` contains:

- 10-minute lesson structure.
- Parent prompting examples.
- Classroom differentiation.
- Printable and generator links.
- Progression from 4×4 to 6×6 and easy 9×9.
- Privacy and child-safety explanation.

## SEO and internal links

The hub remains the main target for `sudoku for kids` and links to all subpages.

Subpage target intent:

- `/sudoku-for-kids/printable`: `sudoku for kids printable`, `easy sudoku worksheets`.
- `/sudoku-for-kids/answers`: `sudoku for kids answers`, `4x4 sudoku answer key`.
- `/sudoku-for-kids/6x6`: `6x6 sudoku for kids`.
- `/sudoku-for-kids/worksheet-generator`: `sudoku worksheet generator`, `teacher sudoku worksheets`.
- `/sudoku-for-kids/resources`: `how to teach sudoku to kids`, `sudoku classroom activity`.

Each page must have:

- One canonical URL.
- English and Chinese hreflang alternates.
- Unique title, description, H1, and primary intent.
- At least two contextual outbound internal links.
- At least two inbound sources from sitemap pages.
- Appropriate structured data: LearningResource, HowTo, FAQPage, ItemList, or CollectionPage as relevant.

The global navigation keeps one Kids 4×4 hub link rather than adding every subpage. The hub, printable page, 6×6 page, generator, answers, and resource center form the internal cluster.

## Analytics

Add non-personal interaction events:

- `kids_sudoku_progress_restored`
- `kids_sudoku_level_change`
- `kids_sudoku_completed`
- `kids_sudoku_completion_cta_click`
- `kids_sudoku_worksheet_generate`
- `kids_sudoku_worksheet_print`

Events include locale, puzzle ID or grid size, level, and UI location only.

## Testing and release gates

Tests must cover:

- Shared 4×4 and 6×6 validation and solution counting.
- 24 unique-solution 4×4 puzzles and 12 unique-solution 6×6 puzzles.
- Progress serialization, restoration, expiry, and malformed-data rejection.
- Stable activity component contracts and completion CTAs.
- Page metadata and structured-data contracts.
- Sitemap inclusion and low-intent trust-page exclusions.
- Global navigation continuing to link only to the Kids hub.
- Full lint, TypeScript, Vitest, puzzle corpus validation, production build, internal-link audit, and page-quality audit.

All work stays in Draft PR #4 until explicit merge approval.