import { create } from 'zustand';
import { SudokuEngine } from '@/lib/sudoku/engine';
import { GlobalPosition } from '@/lib/sudoku/coordinates';
import { Puzzle, Move, GameStatus } from '@/lib/sudoku/types';
import { saveGameToHistory } from '@/lib/storage/game-history';

interface SudokuStore {
  // Puzzle info
  puzzleId: string | null;
  difficulty: string | null;
  puzzle: Puzzle | null;

  // Board state
  board: number[][];
  initial: boolean[][];
  engine: SudokuEngine | null;

  // Candidates
  candidates: Map<string, Set<number>>;
  showCandidates: boolean;

  // History
  history: Move[];
  historyIndex: number;

  // Timer
  startTime: number | null;
  elapsedTime: number;
  isPaused: boolean;

  // UI state
  selectedCell: GlobalPosition | null;
  showConflicts: boolean;
  status: GameStatus;
  hintsUsed: number;

  // Actions
  loadPuzzle: (puzzle: Puzzle) => void;
  setCell: (pos: GlobalPosition, value: number) => void;
  clearCell: (pos: GlobalPosition) => void;
  selectCell: (pos: GlobalPosition | null) => void;
  toggleCandidate: (pos: GlobalPosition, value: number) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  togglePause: () => void;
  toggleShowConflicts: () => void;
  toggleShowCandidates: () => void;
  updateElapsedTime: (time: number) => void;
  incrementHints: () => void;

  // Cache management
  pruneOldCache: () => void;
}

const createEmptyBoard = () =>
  Array(21)
    .fill(0)
    .map(() => Array(21).fill(0));

export const useSudokuStore = create<SudokuStore>()((set, get) => ({
      // Initial state
      puzzleId: null,
      difficulty: null,
      puzzle: null,
      board: createEmptyBoard(),
      initial: Array(21)
        .fill(false)
        .map(() => Array(21).fill(false)),
      engine: null,
      candidates: new Map(),
      showCandidates: true,
      history: [],
      historyIndex: -1,
      startTime: null,
      elapsedTime: 0,
      isPaused: false,
      selectedCell: null,
      showConflicts: true,
      status: 'playing',
      hintsUsed: 0,

      // Load puzzle
      loadPuzzle: (puzzle) => {
        const engine = new SudokuEngine(puzzle);

        set({
          puzzleId: puzzle.id,
          difficulty: puzzle.difficulty,
          puzzle,
          board: engine.getBoard(),
          initial: engine.getInitial(),
          engine,
          history: [],
          historyIndex: -1,
          startTime: Date.now(),
          elapsedTime: 0,
          isPaused: false,
          status: 'playing',
          hintsUsed: 0,
          selectedCell: null,
          candidates: new Map(),
        });

        // Note: Zustand persist middleware will automatically save the state
        // No need to manually call saveInProgressGame anymore
      },

      // Set cell value
      setCell: (pos, value) => {
        const { engine, history, historyIndex, board } = get();

        if (!engine) return;
        if (engine.isInitial(pos)) return;

        const oldValue = engine.getValue(pos);

        // Update engine
        engine.setValue(pos, value);

        // Add to history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          position: pos,
          oldValue,
          newValue: value,
          timestamp: Date.now(),
        });

        const newBoard = engine.getBoard();

        set({
          board: newBoard,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });

        // Check if completed
        if (engine.isComplete()) {
          const state = get();
          const timeSpent = state.startTime
            ? Math.floor((Date.now() - state.startTime) / 1000)
            : state.elapsedTime;

          set({ status: 'completed' });

          // Save to completed history
          if (state.puzzle) {
            saveGameToHistory({
              puzzle: state.puzzle,
              stats: {
                puzzleId: state.puzzle.id,
                timeSpent,
                hintsUsed: state.hintsUsed,
                mistakesMade: 0, // TODO: track mistakes
                completedAt: new Date().toISOString(),
              },
              completedAt: new Date().toISOString(),
              difficulty: state.puzzle.difficulty,
            });
          }
        }
        // Note: Zustand persist automatically saves progress after each move
        // No need to manually save to localStorage on every cell change
      },

      // Clear cell
      clearCell: (pos) => {
        get().setCell(pos, 0);
      },

      // Select cell
      selectCell: (pos) => {
        set({ selectedCell: pos });
      },

      // Toggle candidate
      toggleCandidate: (pos, value) => {
        const { candidates } = get();
        const key = `${pos.row},${pos.col}`;
        const cellCandidates = candidates.get(key) || new Set();

        if (cellCandidates.has(value)) {
          cellCandidates.delete(value);
        } else {
          cellCandidates.add(value);
        }

        const newCandidates = new Map(candidates);
        newCandidates.set(key, cellCandidates);

        set({ candidates: newCandidates });
      },

      // Undo
      undo: () => {
        const { history, historyIndex, engine } = get();

        if (historyIndex < 0 || !engine) return;

        const move = history[historyIndex];
        engine.setValue(move.position, move.oldValue);

        set({
          board: engine.getBoard(),
          historyIndex: historyIndex - 1,
        });
      },

      // Redo
      redo: () => {
        const { history, historyIndex, engine } = get();

        if (historyIndex >= history.length - 1 || !engine) return;

        const move = history[historyIndex + 1];
        engine.setValue(move.position, move.newValue);

        set({
          board: engine.getBoard(),
          historyIndex: historyIndex + 1,
        });
      },

      // Reset
      reset: () => {
        const { engine } = get();

        if (!engine) return;

        engine.reset();

        set({
          board: engine.getBoard(),
          history: [],
          historyIndex: -1,
          elapsedTime: 0,
          startTime: Date.now(),
          status: 'playing',
          hintsUsed: 0,
          candidates: new Map(),
        });
      },

      // Toggle pause
      togglePause: () => {
        const { isPaused, startTime, elapsedTime } = get();

        if (isPaused) {
          // Resume
          set({
            isPaused: false,
            startTime: Date.now() - elapsedTime * 1000,
          });
        } else {
          // Pause
          const currentElapsed = startTime
            ? Math.floor((Date.now() - startTime) / 1000)
            : elapsedTime;

          set({
            isPaused: true,
            elapsedTime: currentElapsed,
          });
        }
      },

      // Toggle show conflicts
      toggleShowConflicts: () => {
        set((state) => ({ showConflicts: !state.showConflicts }));
      },

      // Toggle show candidates
      toggleShowCandidates: () => {
        set((state) => ({ showCandidates: !state.showCandidates }));
      },

      // Update elapsed time
      updateElapsedTime: (time) => {
        set({ elapsedTime: time });
      },

      // Increment hints
      incrementHints: () => {
        set((state) => ({ hintsUsed: state.hintsUsed + 1 }));
      },

      // Prune old cache
      pruneOldCache: () => {
        if (typeof window === 'undefined') return;

        const keys = Object.keys(localStorage).filter((k) =>
          k.startsWith('puzzle:')
        );

        if (keys.length > 30) {
          keys
            .sort()
            .slice(0, keys.length - 30)
            .forEach((key) => localStorage.removeItem(key));
        }
      },
    })
);
