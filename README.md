# Samurai Sudoku

A modern, feature-rich Samurai Sudoku web application built with Next.js 14, React 18, and TypeScript.

## 🎯 Project Status

**Phase 1: Core Foundation** ✅ **COMPLETED**

The initial implementation is complete with the following features:

### ✅ Completed Features

1. **Project Setup**
   - Next.js 14 with App Router
   - TypeScript configuration
   - Tailwind CSS + custom theme with dark mode support
   - Radix UI components
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

6. **Sample Puzzle**
   - Working test puzzle for development
   - All 5 grids with initial values
   - Complete solutions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
cd ~/Desktop/251027_web_数独_samuraisudoku
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Testing

```bash
# Run all tests
pnpm test

# Run Sudoku tests only
pnpm test:sudoku
```

### Build

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles & CSS variables
│   └── games/
│       └── samurai/
│           └── page.tsx         # Main game page
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
    └── puzzles/                # Puzzle data (to be added)
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

### Planned (Phase 2)
- [ ] Daily puzzle generation
- [ ] Puzzle archive
- [ ] Hint system
- [ ] Candidate marking
- [ ] Mobile optimization
- [ ] Offline support
- [ ] Statistics tracking
- [ ] Multiple difficulty levels

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
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

**Status**: Development Server Running on http://localhost:3001 ✅

Last Updated: 2025-10-27
