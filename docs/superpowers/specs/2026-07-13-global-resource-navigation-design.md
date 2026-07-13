# Global Resource Navigation Design

## Goal

Make the free printable Samurai Sudoku center discoverable from the first viewport of the home page and every localized inner page without obscuring gameplay or printed output.

## Evidence

- Sudoku.com exposes daily challenges, difficulty, rules, printable puzzles, and solver entry points in its primary navigation.
- Krazydad connects printable books, interactive puzzles, daily puzzles, and difficulty selection near the top of its Sudoku resource page.
- DadsWorksheets explicitly uses top navigation to help visitors browse printable resources.

The shared pattern is task-first navigation: play, print, browse, learn, and buy are easier to find than company or policy links. Privacy, terms, refunds, and contact remain footer content.

## Approved Direction

Use a two-level site header on every localized page:

1. A 32px offer strip links to the free 20-puzzle printable pack and states the concrete value: solutions, A4/US Letter support, and no registration.
2. A 56px primary navigation contains the brand plus Today, Free Printables, Archive, Guides, and the priced PDF Pack.

Free Printables receives the strongest visual emphasis. The PDF Pack displays the real configured price. Mobile navigation stays one line and scrolls horizontally instead of hiding high-intent links behind a menu.

## Behavior

- All destinations use localized URLs.
- The offer strip and each navigation item emit a distinct analytics event.
- The site header is sticky on normal web pages.
- Print media hides the complete header.
- The game viewport subtracts the fixed 88px site header height so the board controls do not gain unintended page overflow.
- Existing page-specific breadcrumbs and contextual links remain in place.

## Accessibility And SEO

- Use semantic `header` and `nav` elements with localized accessible labels.
- Preserve keyboard focus styles and minimum touch target height.
- Keep labels descriptive and stable so the links reinforce internal anchor text.
- Avoid duplicated policy links in the primary navigation.

## Verification

- Unit-test navigation destinations, localized labels, and the configured PDF price.
- Run lint, TypeScript, unit tests, build, internal-link audit, and page-quality audit.
- Inspect home, game, guide, and printable pages at desktop and mobile widths.
- Confirm print preview omits both header rows.
