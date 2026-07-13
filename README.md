# Samurai Sudoku

A modern, feature-rich Samurai Sudoku web application built with Next.js 15, React 18, TypeScript, next-intl, and PWA support.

## 🎯 Project Status

**Current status** ✅ **Production-oriented game app**

The implementation includes the core Samurai Sudoku game, localized SEO pages, daily puzzle data, offline support, local progress persistence, analytics hooks, printable PDF packs, PayPal order verification, and automated puzzle validation.

### ✅ Completed Features

1. **Project Setup**
   - Next.js 15 with App Router
   - TypeScript configuration
   - Tailwind CSS + custom theme with dark mode support
   - next-intl locale routing
   - Zustand state management
   - Vitest testing setup

2. **Coordinate System** (✅ 34/34 tests passing)
   - 21×21 global coordinate system
   - 5-grid local coordinate system
   - Overlap zone mapping between grids
   - Bidirectional coordinate conversion
   - Comprehensive test coverage

3. **Sudoku Engine**
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
   - Responsive 21×21 grid board
   - Interactive cells with keyboard navigation
   - Timer display
   - Action bar (undo, redo, reset, pause)
   - Progress indicator
   - Conflict highlighting

6. **Daily Puzzle Library**
   - Public puzzle archive under `public/puzzles`
   - Generated index for archive, sitemap, and difficulty pages
   - Structural validation and difficulty analysis scripts

7. **PWA / SEO**
   - Offline fallback and service worker
   - Locale-aware metadata, sitemap, robots, canonical, and structured data
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

Open [http://localhost:3000](http://localhost:3000) in your browser, or pass `-p 3001` if port 3000 is already in use.

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
```

### Build

```bash
pnpm build
pnpm start
```

`pnpm build` rebuilds the puzzle index, validates every puzzle, verifies the PDF artifact checksums, and then runs the production Next.js build.

### Printable PDF packs

The repository contains four public 20-puzzle starter PDFs and one private 100-puzzle ZIP. Both A4 and US Letter are available in one-puzzle-per-page and two-puzzles-per-page layouts. To regenerate them deterministically:

```bash
python3 -m pip install -r scripts/requirements-pdf.txt
pnpm generate-pdf-packs
pnpm validate-pdf-packs
```

The paid ZIP stays under `private-assets/` and is served only by the signed download route after a completed PayPal order is verified.

### PayPal automatic delivery

Copy the PayPal variables documented in `.env.example`. Use sandbox credentials first. Automatic checkout requires all of these values:

```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_ENVIRONMENT="sandbox"
PDF_DOWNLOAD_TOKEN_SECRET="at-least-32-random-characters"
```

When any REST credential is absent, the product page pauses payment and directs customers to support instead of exposing a personal payment link.

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── [locale]/page.tsx        # Localized home page
│   ├── globals.css              # Global styles & CSS variables
│   └── [locale]/games/samurai/ # Game, archive, puzzle, and SEO pages
│
├── components/                   # React components
│   ├── theme-provider.tsx      # Theme context
│   └── sudoku/
│       ├── SamuraiBoard.tsx    # 21×21 game board
│       ├── Cell.tsx            # Individual cell component
│       ├── TimerDisplay.tsx    # Timer component
│       └── ActionBar.tsx       # Control buttons
│
├── lib/                         # Core logic
│   ├── utils.ts                # Utility functions
│   └── sudoku/
│       ├── coordinates.ts      # Coordinate system
│       ├── coordinates.test.ts # Coordinate tests
│       ├── engine.ts           # Game engine
│       ├── types.ts            # Type definitions
│       └── sample-puzzle.ts    # Test puzzle data
│
├── stores/                      # State management
│   └── sudoku-store.ts         # Zustand store
│
└── public/                      # Static assets
    └── puzzles/                # Daily puzzle data and generated index
```

## 🎮 How to Play

1. **Navigate**: Use arrow keys or click/tap cells
2. **Fill cells**: Press 1-9 or use number pad (mobile)
3. **Clear**: Press Backspace or Delete
4. **Undo/Redo**: Use the action bar buttons
5. **Conflicts**: Highlighted automatically (toggle in action bar)

## 🧪 Testing

The coordinate system has comprehensive test coverage:

- ✅ Local to global conversion
- ✅ Global to local conversion
- ✅ Overlap zone detection
- ✅ Overlapping cell mapping
- ✅ Grid, box, row, column cell queries
- ✅ Affected cells calculation
- ✅ Position validation
- ✅ Position equality

Run tests with:
```bash
pnpm test:sudoku
```

## 🎨 Features

### Current
- 21×21 Samurai Sudoku grid
- Keyboard and mouse/touch input
- Real-time conflict detection
- Undo/redo functionality
- Timer with pause
- Progress tracking
- Dark mode support
- Responsive design

### Included
- Daily puzzle generation
- Puzzle archive and difficulty landing pages
- Hint system
- Candidate marking
- Mobile optimization
- Offline support
- Statistics and in-progress tracking
- Multiple difficulty levels

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl
- **State Management**: Zustand
- **Testing**: Vitest
- **Theme**: next-themes

## 📝 Development Notes

### Coordinate System
The Samurai Sudoku uses a dual coordinate system:

1. **Global Coordinates**: 21×21 grid (row, col: 0-20)
2. **Local Coordinates**: Grid index (0-4) + position within grid (row, col: 0-8)

Grid layout:
```
Grid 0 (Top-Left)      Grid 1 (Top-Right)
       Grid 2 (Center)
Grid 3 (Bottom-Left)   Grid 4 (Bottom-Right)
```

Overlap zones connect the grids at their corners.

### State Management
The Zustand store persists to localStorage:
- Current board state
- Move history
- Timer state
- Candidates
- Game status

## 🔧 Configuration

### Tailwind CSS Variables
Custom CSS variables in `app/globals.css`:
- `--cell-bg`: Cell background
- `--cell-border`: Cell border
- `--cell-highlight`: Highlighted cells
- `--cell-selected`: Selected cell
- `--conflict`: Conflict indicator
- `--candidate-color`: Candidate numbers

### Next.js Config
Cache headers configured for puzzle data in `next.config.js`.

## 📄 License

MIT

## 🤝 Contributing

This is a development project. Contributions welcome!

---

**Status**: Ready for local development and production builds.

Last Updated: 2026-07-13
