# Samurai Sudoku

A modern, feature-rich Sudoku application built with Next.js 15, React 18, TypeScript, next-intl, and PWA support.

## 🌐 Live Pages

- [Play Samurai Sudoku](https://www.samuraisudoku.net/en/games/samurai)
- [Play Daily Samurai Sudoku](https://www.samuraisudoku.net/en/games/samurai/daily)
- [Play Sudoku for Kids](https://www.samuraisudoku.net/en/sudoku-for-kids)
- [Print Sudoku for Kids Worksheets](https://www.samuraisudoku.net/en/sudoku-for-kids/printable)
- [Play 6×6 Sudoku for Kids](https://www.samuraisudoku.net/en/sudoku-for-kids/6x6)
- [Build a Kids Sudoku Worksheet](https://www.samuraisudoku.net/en/sudoku-for-kids/worksheet-generator)
- [Download Printable Samurai Sudoku](https://www.samuraisudoku.net/en/printable-samurai-sudoku)

## 🎯 Project Status

**Current status** ✅ **Production-oriented game and learning app**

The implementation includes the core Samurai Sudoku game, localized SEO pages, daily puzzle data, offline support, local progress persistence, a verified 4×4/6×6 Sudoku for Kids learning cluster, printable PDF packs, PayPal order verification, analytics hooks, and automated puzzle validation.

### ✅ Completed Features

1. **Project Setup**
   - Next.js 15 with App Router
   - TypeScript configuration
   - Tailwind CSS + custom theme with dark mode support
   - next-intl locale routing
   - Zustand state management
   - Vitest testing setup

2. **Coordinate System**
   - 21×21 global coordinate system
   - 5-grid local coordinate system
   - Overlap zone mapping between grids
   - Bidirectional coordinate conversion
   - Comprehensive test coverage

3. **Samurai Sudoku Engine**
   - Board initialization from puzzle data
   - Cell value management
   - Conflict detection (row, column, box, overlap)
   - Candidate calculation
   - Completion checking
   - Board validation

4. **State Management**
   - Zustand store with localStorage persistence
   - Move history (undo/redo)
   - Timer management
   - Candidate tracking
   - Game status tracking

5. **UI Components**
   - Responsive 21×21 Samurai board
   - Interactive cells with keyboard navigation
   - Timer display
   - Action bar (undo, redo, reset, pause)
   - Progress indicator
   - Conflict highlighting

6. **Daily Puzzle Library**
   - Public puzzle archive under `public/puzzles`
   - Generated index for archive, sitemap, and difficulty pages
   - Structural validation and difficulty analysis scripts

7. **Sudoku for Kids**
   - 24 verified 4×4 puzzles across Easy, Medium, and Challenge
   - 12 verified 6×6 puzzles using 2×3 boxes
   - Touch and keyboard play, answer checking, level selection, and printing
   - Browser-only progress with a 30-day expiry
   - Printable worksheets and matching answer keys
   - Deterministic teacher worksheet generator using verified puzzles only
   - Parent and teacher lesson resources
   - No child name, email, school, class, or profile collection

8. **PWA / SEO**
   - Offline fallback and service worker
   - Locale-aware metadata, sitemap, robots, canonical, and structured data
   - Internal-link and page-quality audits in CI
   - Vercel Analytics, Speed Insights, and optional Clarity consent handling

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Python 3.10+ and ReportLab only when regenerating PDF packs

### Installation

```bash
cd ~/ai-native/active/251027_web_数独_samuraisudoku
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), or pass `-p 3001` if port 3000 is already in use.

### Testing

```bash
# Run all tests
pnpm test

# Run Sudoku tests only
pnpm test:sudoku

# Validate generated puzzle JSON files
pnpm validate-puzzles

# Validate committed free and paid PDF artifacts
pnpm validate-pdf-packs

# Build and audit the production site locally
pnpm build
pnpm audit:site
```

### Build

```bash
pnpm build
pnpm start
```

`pnpm build` rebuilds the puzzle index, validates every Samurai puzzle, verifies the PDF artifact checksums, and runs the production Next.js build.

### Printable PDF packs

The repository contains four public three-puzzle curated sampler PDFs and one private 100-puzzle ZIP. The sampler progresses through one Easy, one Medium, and one unanswered Expert preview with a verified first-step hint. The paid PDFs unlock that preview's verified 12-step opening and full answer as puzzle 076. Both A4 and US Letter are available in one-puzzle-per-page and two-puzzles-per-page layouts.

To regenerate them deterministically:

```bash
python3 -m pip install -r scripts/requirements-pdf.txt
pnpm generate-pdf-packs
pnpm validate-pdf-packs
```

The paid ZIP stays under `private-assets/` and is served only by the signed download route after a completed PayPal order is verified. The canonical customer funnel is `/{locale}/printable-samurai-sudoku`; legacy PDF sales and sample URLs permanently redirect to the matching section on that page.

For the printable offer experiment, use these funnel events:

- `download_free_pdf`: a visitor selected one of the public sampler PDFs.
- `free_pack_upgrade_prompt_view`: the post-download upgrade prompt became visible.
- `pdf_expert_preview_arrival`: a visitor returned through the tracked Expert-preview link inside the PDF.
- `paid_pack_view`: a visitor opened the deferred PayPal checkout.
- `paid_pack_checkout_created`: PayPal created the 100-puzzle order.
- `paid_pack_purchase`: the server verified and captured the matching payment.
- `paid_pack_download`: the buyer selected the signed ZIP download.

The canonical hub tags these events with `experiment_id=printable_hub_72h_v3` where applicable.

### PayPal automatic delivery

Copy the PayPal variables documented in `.env.example`. Use sandbox credentials first. Automatic checkout requires all of these values:

```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_ENVIRONMENT="sandbox"
PDF_DOWNLOAD_TOKEN_SECRET="at-least-32-random-characters"
```

When any REST credential is absent, the canonical printable hub pauses payment and directs customers to support instead of exposing a personal payment link.

## 📁 Project Structure

```text
├── app/
│   ├── [locale]/page.tsx
│   ├── [locale]/games/samurai/
│   ├── [locale]/sudoku-for-kids/
│   └── globals.css
├── components/
│   ├── kids/
│   ├── sudoku/
│   └── printable/
├── lib/
│   ├── kids-sudoku/
│   └── sudoku/
├── stores/
│   └── sudoku-store.ts
└── public/
    └── puzzles/
```

## 🎮 How to Play Samurai Sudoku

1. **Navigate**: Use arrow keys or click/tap cells.
2. **Fill cells**: Press 1–9 or use the number pad.
3. **Clear**: Press Backspace or Delete.
4. **Undo/Redo**: Use the action bar buttons.
5. **Conflicts**: Toggle automatic conflict highlighting.

## 🧒 Kids Sudoku Data Boundary

The Kids Sudoku activity stores only the current puzzle ID, grid values, completed puzzle IDs, and an update timestamp in the current browser. The record expires after 30 days. The worksheet tools do not request or store names, email addresses, schools, classes, scores, or child profiles.

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl
- **State Management**: Zustand + browser localStorage
- **Testing**: Vitest
- **Theme**: next-themes

## 🔧 Configuration

### Tailwind CSS Variables

Custom CSS variables in `app/globals.css` include cell backgrounds, borders, highlights, selected states, conflict colors, and candidate colors.

### Next.js Config

Cache headers and PWA runtime caching are configured in `next.config.js`. Dated puzzle JSON is revalidated online while remaining available as an offline fallback.

## 📄 License

MIT

## 🤝 Contributing

This is a development project. Contributions are welcome.

---

**Status**: Ready for local development and production builds.

Last Updated: 2026-07-26
