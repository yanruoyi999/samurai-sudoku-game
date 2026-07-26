# Sudoku for Kids Page Design

## Goal

Create one localized, useful landing page at `/{locale}/sudoku-for-kids` that targets the English search intent `sudoku for kids` without creating a new site or a thin article.

## Audience

The page is written primarily for parents, teachers, and family educators looking for a safe, simple Sudoku introduction for children. It does not ask children to register, submit a name, provide an email address, or create a profile.

## Search intent

Primary English keyword: `sudoku for kids`.

Supporting English phrases:

- `easy sudoku for kids`
- `4x4 sudoku for kids`
- `sudoku for kids printable`
- `how to play sudoku for kids`
- `free sudoku for kids`

The Chinese locale provides equivalent useful content but does not compete for the English keyword.

## Page route and ownership

- English: `/en/sudoku-for-kids`
- Chinese: `/zh/sudoku-for-kids`
- One canonical URL per locale with hreflang alternates.
- This page owns the broad kids-Sudoku intent. No second page targeting the same phrase will be created in this task.

## User value

The page must contain a real 4×4 Sudoku activity, not only explanatory text.

The interactive activity includes:

- three predefined 4×4 puzzles;
- fixed clues that cannot be edited;
- number buttons 1–4;
- clear selected cell;
- check progress;
- reset current puzzle;
- move to the next puzzle;
- print the current worksheet through the browser;
- localized success, incomplete, and incorrect feedback.

All three puzzles must have one verified solution. The implementation stores only in-memory component state and does not persist personal data.

## Content structure

1. Breadcrumbs.
2. Hero section with the exact English H1 `Sudoku for Kids: Free Easy 4×4 Puzzle`.
3. Interactive 4×4 puzzle.
4. Explanation of 4×4 rules: each row, column, and 2×2 box contains 1–4 once.
5. Age and progression guidance:
   - ages 5–7: 4×4 with more clues;
   - ages 7–9: 4×4 with fewer clues, then 6×6 later;
   - ages 9+: standard 9×9 when ready.
6. Parent and teacher guidance for short, low-pressure sessions.
7. FAQ section.
8. Related internal resources.

## SEO and structured data

The page includes:

- title and meta description with the primary phrase near the beginning;
- canonical and hreflang;
- Open Graph and Twitter metadata;
- `WebPage` structured data;
- `LearningResource` structured data;
- `HowTo` structured data for the four-step solving process;
- `FAQPage` structured data;
- breadcrumb structured data.

The sitemap includes both locale URLs. `llms.txt` includes the English canonical page and describes the 4×4 learning purpose.

## Internal links from the page

The page links to:

- the site homepage;
- Daily Samurai Sudoku for older or advanced learners;
- the Samurai Sudoku rules page;
- the printable Samurai Sudoku hub for advanced paper practice;
- the puzzle methodology page.

The copy must make clear that Samurai Sudoku is a later challenge, not the recommended first puzzle for young beginners.

## Internal backlinks to the page

Add contextual links from:

- homepage learning section;
- homepage footer;
- `how-to-play` page;
- canonical printable page;
- README production links.

Anchor text should vary naturally among `Sudoku for Kids`, `easy 4×4 Sudoku for kids`, `kids Sudoku`, and the Chinese equivalents.

## External backlink under project control

Add a normal production link in `README.md`:

- `Play Sudoku for Kids`
- `https://www.samuraisudoku.net/en/sudoku-for-kids`

This is a legitimate GitHub-to-production link. The task will not create spam directory listings, fake reviews, or unrelated GitHub issues.

## Testing and quality gates

Use TDD for the puzzle model before building the UI.

Required tests:

- every puzzle is 4×4;
- every solution obeys row, column, and 2×2 box rules;
- givens match the stored solution;
- each puzzle has exactly one solution under a bounded 4×4 solver;
- grid checking returns `incomplete`, `incorrect`, or `complete` correctly;
- sitemap contains both localized kids pages;
- the existing production build, internal-link audit, and page-quality audit pass.

## Scope exclusions

This first page does not include:

- a 6×6 engine;
- accounts or child profiles;
- email collection;
- classroom dashboards;
- animal or image Sudoku;
- downloadable generated PDF files;
- paid kids products.

Browser printing of the page is sufficient for the first validation version.
