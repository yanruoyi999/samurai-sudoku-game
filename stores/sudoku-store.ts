import { create } from 'zustand';
import { SudokuEngine } from '@/lib/sudoku/engine';
import { GlobalPosition, getAffectedCells } from '@/lib/sudoku/coordinates';
import { Puzzle, Move, GameStatus, Difficulty } from '@/lib/sudoku/types';
import {
  getInProgressGames,
  removeInProgressGame,
  saveGameToHistory,
  saveInProgressGame,
  type InProgressGame,
} from '@/lib/storage/game-history';

interface SudokuStore {
  // Puzzle info
  puzzleId: string | null;
  difficulty: Difficulty | null;
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
  mistakesMade: number;

  // Actions
  loadPuzzle: (puzzle: Puzzle) => void;
  loadInProgressGame: (game: InProgressGame) => void;
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

const CURRENT_PROGRESS_KEY = 'samurai-sudoku-current-progress';
const MAX_IN_PROGRESS_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const MIN_PROGRESS_SAVE_INTERVAL_MS = 15_000;
let lastProgressSaveAt = 0;

interface PersistedSudokuProgress {
  puzzleId: string;
  puzzle: Puzzle;
  board: number[][];
  history: Move[];
  historyIndex: number;
  elapsedTime: number;
  hintsUsed: number;
  mistakesMade: number;
  status: GameStatus;
  candidates: Array<[string, number[]]>;
  showCandidates: boolean;
  showConflicts: boolean;
  savedAt: string;
}

const serializeCandidates = (candidates: Map<string, Set<number>>) =>
  Array.from(candidates.entries()).map(
    ([key, values]) => [key, Array.from(values)] as [string, number[]]
  );

const deserializeCandidates = (candidates?: Array<[string, number[]]>) =>
  new Map(
    (candidates ?? []).map(
      ([key, values]) => [key, new Set(values)] as [string, Set<number>]
    )
  );

const getCandidateKey = (pos: GlobalPosition) => `${pos.row},${pos.col}`;

const normalizeStatusForPlay = (status?: GameStatus): GameStatus =>
  status === 'completed' ? 'completed' : 'playing';

const removePlacedValueFromCandidates = (
  candidates: Map<string, Set<number>>,
  pos: GlobalPosition,
  value: number
) => {
  const nextCandidates = new Map(candidates);
  nextCandidates.delete(getCandidateKey(pos));

  if (value === 0) return nextCandidates;

  const affected = getAffectedCells(pos);
  const peers = [
    ...affected.row,
    ...affected.col,
    ...affected.box,
    ...affected.overlap,
  ];

  for (const peer of peers) {
    const key = getCandidateKey(peer);
    const peerCandidates = nextCandidates.get(key);
    if (!peerCandidates?.has(value)) continue;

    const updatedPeerCandidates = new Set(peerCandidates);
    updatedPeerCandidates.delete(value);

    if (updatedPeerCandidates.size > 0) {
      nextCandidates.set(key, updatedPeerCandidates);
    } else {
      nextCandidates.delete(key);
    }
  }

  return nextCandidates;
};

const getCurrentElapsedTime = (state: SudokuStore) =>
  state.startTime && !state.isPaused
    ? Math.floor((Date.now() - state.startTime) / 1000)
    : state.elapsedTime;

const rebuildEngine = (puzzle: Puzzle, board: number[][]) => {
  const engine = new SudokuEngine(puzzle);

  for (let row = 0; row < 21; row++) {
    for (let col = 0; col < 21; col++) {
      const value = board[row]?.[col] ?? 0;
      if (value !== 0 && !engine.isInitial({ row, col })) {
        engine.setValue({ row, col }, value);
      }
    }
  }

  return engine;
};

const saveCurrentProgress = (
  state: SudokuStore,
  options: { throttle?: boolean } = {}
) => {
  if (typeof window === 'undefined' || !state.puzzle || !state.puzzleId) return;

  const now = Date.now();
  if (
    options.throttle &&
    now - lastProgressSaveAt < MIN_PROGRESS_SAVE_INTERVAL_MS
  ) {
    return;
  }

  if (state.status === 'completed') {
    localStorage.removeItem(CURRENT_PROGRESS_KEY);
    removeInProgressGame(state.puzzleId);
    lastProgressSaveAt = now;
    return;
  }

  const elapsedTime = getCurrentElapsedTime(state);
  const savedAt = new Date().toISOString();
  const candidates = serializeCandidates(state.candidates);
  const progress: PersistedSudokuProgress = {
    puzzleId: state.puzzleId,
    puzzle: state.puzzle,
    board: state.board,
    history: state.history,
    historyIndex: state.historyIndex,
    elapsedTime,
    hintsUsed: state.hintsUsed,
    mistakesMade: state.mistakesMade,
    status: state.status,
    candidates,
    showCandidates: state.showCandidates,
    showConflicts: state.showConflicts,
    savedAt,
  };

  try {
    localStorage.setItem(CURRENT_PROGRESS_KEY, JSON.stringify(progress));
    saveInProgressGame({
      puzzle: state.puzzle,
      currentTime: elapsedTime,
      hintsUsed: state.hintsUsed,
      lastPlayed: savedAt,
      difficulty: state.puzzle.difficulty,
      board: state.board,
      history: state.history,
      historyIndex: state.historyIndex,
      status: state.status,
      candidates,
      showCandidates: state.showCandidates,
      showConflicts: state.showConflicts,
      mistakesMade: state.mistakesMade,
      savedAt,
    });
    lastProgressSaveAt = now;
  } catch (error) {
    console.error('Failed to save current Sudoku progress:', error);
  }
};

const loadCurrentProgress = (puzzle: Puzzle): Partial<SudokuStore> | null => {
  if (typeof window === 'undefined') return null;

  const loadMatchingInProgressGame = () => {
    const matchingGame = getInProgressGames().find(
      (game) => game.puzzle.id === puzzle.id
    );
    if (!matchingGame) return null;

    const savedAt = new Date(matchingGame.savedAt ?? matchingGame.lastPlayed).getTime();
    if (
      Number.isNaN(savedAt) ||
      Date.now() - savedAt > MAX_IN_PROGRESS_AGE_MS
    ) {
      removeInProgressGame(puzzle.id);
      return null;
    }

    return buildStateFromInProgressGame(matchingGame);
  };

  try {
    const data = localStorage.getItem(CURRENT_PROGRESS_KEY);
    if (!data) return loadMatchingInProgressGame();

    const progress = JSON.parse(data) as PersistedSudokuProgress;
    const savedAt = new Date(progress.savedAt).getTime();

    if (
      progress.puzzleId !== puzzle.id ||
      progress.status === 'completed' ||
      Number.isNaN(savedAt) ||
      Date.now() - savedAt > MAX_IN_PROGRESS_AGE_MS
    ) {
      if (progress.puzzleId === puzzle.id) {
        localStorage.removeItem(CURRENT_PROGRESS_KEY);
      }
      return loadMatchingInProgressGame();
    }

    const engine = rebuildEngine(puzzle, progress.board);
    const elapsedTime = progress.elapsedTime ?? 0;

    return {
      puzzleId: puzzle.id,
      difficulty: puzzle.difficulty,
      puzzle,
      board: engine.getBoard(),
      initial: engine.getInitial(),
      engine,
      history: progress.history ?? [],
      historyIndex: progress.historyIndex ?? -1,
      startTime: Date.now() - elapsedTime * 1000,
      elapsedTime,
      isPaused: false,
      status: 'playing',
      hintsUsed: progress.hintsUsed ?? 0,
      mistakesMade: progress.mistakesMade ?? 0,
      selectedCell: null,
      candidates: deserializeCandidates(progress.candidates),
      showCandidates: progress.showCandidates ?? false,
      showConflicts: progress.showConflicts ?? true,
    };
  } catch (error) {
    console.error('Failed to load current Sudoku progress:', error);
    return null;
  }
};

const buildStateFromInProgressGame = (
  game: InProgressGame
): Partial<SudokuStore> => {
  const board = game.board ?? createEmptyBoard();
  const engine = rebuildEngine(game.puzzle, board);
  const elapsedTime = game.currentTime ?? 0;

  return {
    puzzleId: game.puzzle.id,
    difficulty: game.difficulty,
    puzzle: game.puzzle,
    board: engine.getBoard(),
    initial: engine.getInitial(),
    engine,
    history: game.history ?? [],
    historyIndex: game.historyIndex ?? -1,
    startTime: Date.now() - elapsedTime * 1000,
    elapsedTime,
    isPaused: false,
    status: normalizeStatusForPlay(game.status),
    hintsUsed: game.hintsUsed ?? 0,
    mistakesMade: game.mistakesMade ?? 0,
    selectedCell: null,
    candidates: deserializeCandidates(game.candidates),
    showCandidates: game.showCandidates ?? false,
    showConflicts: game.showConflicts ?? true,
  };
};

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
      showCandidates: false,
      history: [],
      historyIndex: -1,
      startTime: null,
      elapsedTime: 0,
      isPaused: false,
      selectedCell: null,
      showConflicts: true,
      status: 'playing',
      hintsUsed: 0,
      mistakesMade: 0,

      // Load puzzle
      loadPuzzle: (puzzle) => {
        const savedProgress = loadCurrentProgress(puzzle);
        if (savedProgress) {
          set(savedProgress);
          return;
        }

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
          mistakesMade: 0,
          selectedCell: null,
          candidates: new Map(),
        });

        saveCurrentProgress(get());
      },

      loadInProgressGame: (game) => {
        set(buildStateFromInProgressGame(game));
        saveCurrentProgress(get());
      },

      // Set cell value
      setCell: (pos, value) => {
        const { engine, history, historyIndex, mistakesMade, candidates, isPaused, status } = get();

        if (isPaused || status === 'completed') return;
        if (!engine) return;
        if (engine.isInitial(pos)) return;
        if (!Number.isInteger(value) || value < 0 || value > 9) return;

        const oldValue = engine.getValue(pos);
        if (oldValue === value) return;
        const solution = engine.getSolution();
        const expectedValue = solution?.[pos.row]?.[pos.col] ?? 0;
        const isMistake =
          value !== 0 && expectedValue !== 0 && value !== expectedValue;

        // Update engine
        engine.setValue(pos, value);

        const newBoard = engine.getBoard();
        const newCandidates = removePlacedValueFromCandidates(candidates, pos, value);
        const candidatesBefore = serializeCandidates(candidates);
        const candidatesAfter = serializeCandidates(newCandidates);

        // Add to history after candidate changes are known so undo restores notes exactly.
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          position: pos,
          oldValue,
          newValue: value,
          timestamp: Date.now(),
          candidatesBefore,
          candidatesAfter,
        });

        set({
          board: newBoard,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          mistakesMade: mistakesMade + (isMistake ? 1 : 0),
          candidates: newCandidates,
        });

        // Check if completed
        if (engine.isComplete()) {
          const state = get();
          const timeSpent = getCurrentElapsedTime(state);

          set({ status: 'completed', elapsedTime: timeSpent });

          // Save to completed history
          const completedState = get();
          if (completedState.puzzle) {
            const completedAt = new Date().toISOString();
            saveGameToHistory({
              puzzle: completedState.puzzle,
              stats: {
                puzzleId: completedState.puzzle.id,
                timeSpent,
                hintsUsed: completedState.hintsUsed,
                mistakesMade: completedState.mistakesMade,
                completedAt,
              },
              completedAt,
              difficulty: completedState.puzzle.difficulty,
            });
          }

          saveCurrentProgress(get());
        } else {
          saveCurrentProgress(get());
        }
      },

      // Clear cell
      clearCell: (pos) => {
        const { engine, candidates, history, historyIndex, isPaused, status } = get();
        if (isPaused || status === 'completed') return;
        if (!engine || engine.isInitial(pos)) return;

        const oldValue = engine.getValue(pos);
        const key = getCandidateKey(pos);

        if (oldValue === 0) {
          if (!candidates.has(key)) return;
          const newCandidates = new Map(candidates);
          newCandidates.delete(key);
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push({
            position: pos,
            oldValue: 0,
            newValue: 0,
            timestamp: Date.now(),
            candidatesBefore: serializeCandidates(candidates),
            candidatesAfter: serializeCandidates(newCandidates),
          });
          set({
            candidates: newCandidates,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          });
          saveCurrentProgress(get());
          return;
        }

        get().setCell(pos, 0);
      },

      // Select cell
      selectCell: (pos) => {
        set({ selectedCell: pos });
      },

      // Toggle candidate
      toggleCandidate: (pos, value) => {
        const { candidates, engine, history, historyIndex, isPaused, status } = get();
        if (isPaused || status === 'completed') return;
        if (!engine || engine.isInitial(pos) || engine.getValue(pos) !== 0) return;
        if (!Number.isInteger(value) || value < 1 || value > 9) return;

        const key = getCandidateKey(pos);
        const cellCandidates = new Set(candidates.get(key) ?? []);

        if (cellCandidates.has(value)) {
          cellCandidates.delete(value);
        } else {
          cellCandidates.add(value);
        }

        const newCandidates = new Map(candidates);
        if (cellCandidates.size > 0) {
          newCandidates.set(key, cellCandidates);
        } else {
          newCandidates.delete(key);
        }

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          position: pos,
          oldValue: 0,
          newValue: 0,
          timestamp: Date.now(),
          candidatesBefore: serializeCandidates(candidates),
          candidatesAfter: serializeCandidates(newCandidates),
        });

        set({
          candidates: newCandidates,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
        saveCurrentProgress(get());
      },

      // Undo
      undo: () => {
        const { history, historyIndex, engine, isPaused, status, candidates } = get();

        if (isPaused || status === 'completed') return;
        if (historyIndex < 0 || !engine) return;

        const move = history[historyIndex];
        engine.setValue(move.position, move.oldValue);
        const newCandidates = move.candidatesBefore
          ? deserializeCandidates(move.candidatesBefore)
          : removePlacedValueFromCandidates(
              candidates,
              move.position,
              move.oldValue
            );

        set({
          board: engine.getBoard(),
          historyIndex: historyIndex - 1,
          candidates: newCandidates,
        });
        saveCurrentProgress(get());
      },

      // Redo
      redo: () => {
        const { history, historyIndex, engine, isPaused, status, candidates } = get();

        if (isPaused || status === 'completed') return;
        if (historyIndex >= history.length - 1 || !engine) return;

        const move = history[historyIndex + 1];
        engine.setValue(move.position, move.newValue);
        const newCandidates = move.candidatesAfter
          ? deserializeCandidates(move.candidatesAfter)
          : removePlacedValueFromCandidates(
              candidates,
              move.position,
              move.newValue
            );

        set({
          board: engine.getBoard(),
          historyIndex: historyIndex + 1,
          candidates: newCandidates,
        });
        saveCurrentProgress(get());
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
          mistakesMade: 0,
          candidates: new Map(),
        });
        saveCurrentProgress(get());
      },

      // Toggle pause
      togglePause: () => {
        const { isPaused, startTime, elapsedTime } = get();

        if (isPaused) {
          // Resume
          set({
            isPaused: false,
            startTime: Date.now() - elapsedTime * 1000,
            status: 'playing',
          });
        } else {
          // Pause
          const currentElapsed = startTime
            ? Math.floor((Date.now() - startTime) / 1000)
            : elapsedTime;

          set({
            isPaused: true,
            elapsedTime: currentElapsed,
            status: 'paused',
          });
        }
        saveCurrentProgress(get());
      },

      // Toggle show conflicts
      toggleShowConflicts: () => {
        set((state) => ({ showConflicts: !state.showConflicts }));
        saveCurrentProgress(get());
      },

      // Toggle show candidates
      toggleShowCandidates: () => {
        set((state) => ({ showCandidates: !state.showCandidates }));
        saveCurrentProgress(get());
      },

      // Update elapsed time
      updateElapsedTime: (time) => {
        set({ elapsedTime: time });
        saveCurrentProgress(get(), { throttle: true });
      },

      // Increment hints
      incrementHints: () => {
        set((state) => ({ hintsUsed: state.hintsUsed + 1 }));
        saveCurrentProgress(get());
      },

      // Prune old cache
      pruneOldCache: () => {
        if (typeof window === 'undefined') return;

        try {
          const currentProgress = localStorage.getItem(CURRENT_PROGRESS_KEY);
          if (currentProgress) {
            const parsed = JSON.parse(currentProgress) as PersistedSudokuProgress;
            const savedAt = new Date(parsed.savedAt).getTime();
            if (Number.isNaN(savedAt) || Date.now() - savedAt > MAX_IN_PROGRESS_AGE_MS) {
              localStorage.removeItem(CURRENT_PROGRESS_KEY);
            }
          }

          for (const game of getInProgressGames()) {
            const lastPlayed = new Date(game.lastPlayed).getTime();
            if (Number.isNaN(lastPlayed) || Date.now() - lastPlayed > MAX_IN_PROGRESS_AGE_MS) {
              removeInProgressGame(game.puzzle.id);
            }
          }
        } catch (error) {
          console.error('Failed to prune old Sudoku progress:', error);
        }
      },
    })
);
