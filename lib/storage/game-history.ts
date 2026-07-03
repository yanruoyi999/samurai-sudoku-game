import { Puzzle, PuzzleStats, Difficulty, Move, GameStatus } from '@/lib/sudoku/types';

/**
 * Game history entry stored in localStorage
 */
export interface GameHistoryEntry {
  puzzle: Puzzle;
  stats: PuzzleStats;
  completedAt: string;
  difficulty: Difficulty;
}

const HISTORY_KEY = 'sudoku-game-history';
const IN_PROGRESS_HISTORY_KEY = 'sudoku-in-progress-history';
const MAX_HISTORY_SIZE = 100; // 最多保存100条历史记录
const MAX_IN_PROGRESS_SIZE = 50; // 最多保存50条进行中的游戏
export const SUDOKU_STORAGE_EVENT = 'sudoku-storage-updated';

function notifyStorageUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SUDOKU_STORAGE_EVENT));
}

/**
 * Get game history from localStorage
 */
export function getGameHistory(): GameHistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];

    const history = JSON.parse(data) as GameHistoryEntry[];
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Failed to load game history:', error);
    return [];
  }
}

/**
 * Save a completed game to history
 */
export function saveGameToHistory(entry: GameHistoryEntry): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getGameHistory();

    // Add new entry at the beginning
    history.unshift(entry);

    // Keep only the most recent MAX_HISTORY_SIZE entries
    const trimmedHistory = history.slice(0, MAX_HISTORY_SIZE);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
    notifyStorageUpdated();
  } catch (error) {
    console.error('Failed to save game to history:', error);
  }
}

/**
 * Get game history filtered by difficulty
 */
export function getGameHistoryByDifficulty(difficulty?: Difficulty): GameHistoryEntry[] {
  const history = getGameHistory();

  if (!difficulty) return history;

  return history.filter(entry => entry.difficulty === difficulty);
}

/**
 * Get unique puzzles from history (for archive display)
 */
export function getUniquePuzzlesFromHistory(): Array<{
  id: string;
  difficulty: Difficulty;
  estimatedTime: number;
  tags: string[];
  playCount: number;
  bestTime?: number;
  lastPlayed: string;
}> {
  const history = getGameHistory();
  const puzzleMap = new Map<string, {
    id: string;
    difficulty: Difficulty;
    estimatedTime: number;
    tags: string[];
    playCount: number;
    bestTime?: number;
    lastPlayed: string;
  }>();

  for (const entry of history) {
    const existing = puzzleMap.get(entry.puzzle.id);

    if (!existing) {
      puzzleMap.set(entry.puzzle.id, {
        id: entry.puzzle.id,
        difficulty: entry.difficulty,
        estimatedTime: entry.puzzle.metadata.estimatedTime,
        tags: entry.puzzle.metadata.tags || [],
        playCount: 1,
        bestTime: entry.stats.timeSpent,
        lastPlayed: entry.completedAt,
      });
    } else {
      existing.playCount++;
      if (!existing.bestTime || entry.stats.timeSpent < existing.bestTime) {
        existing.bestTime = entry.stats.timeSpent;
      }
      // Update last played if this is more recent
      if (new Date(entry.completedAt) > new Date(existing.lastPlayed)) {
        existing.lastPlayed = entry.completedAt;
      }
    }
  }

  // Convert to array and sort by last played (most recent first)
  return Array.from(puzzleMap.values()).sort((a, b) =>
    new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
  );
}

/**
 * Clear all game history
 */
export function clearGameHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(HISTORY_KEY);
    notifyStorageUpdated();
  } catch (error) {
    console.error('Failed to clear game history:', error);
  }
}

/**
 * Get statistics for a specific difficulty
 */
export function getDifficultyStats(difficulty: Difficulty): {
  gamesPlayed: number;
  averageTime: number;
  bestTime: number;
  totalHintsUsed: number;
} {
  const history = getGameHistoryByDifficulty(difficulty);

  if (history.length === 0) {
    return {
      gamesPlayed: 0,
      averageTime: 0,
      bestTime: 0,
      totalHintsUsed: 0,
    };
  }

  const totalTime = history.reduce((sum, entry) => sum + entry.stats.timeSpent, 0);
  const bestTime = Math.min(...history.map(entry => entry.stats.timeSpent));
  const totalHints = history.reduce((sum, entry) => sum + entry.stats.hintsUsed, 0);

  return {
    gamesPlayed: history.length,
    averageTime: Math.round(totalTime / history.length),
    bestTime,
    totalHintsUsed: totalHints,
  };
}

/**
 * Save an in-progress game (not completed yet)
 */
export interface InProgressGame {
  puzzle: Puzzle;
  currentTime: number;
  hintsUsed: number;
  lastPlayed: string;
  difficulty: Difficulty;
  board?: number[][];
  history?: Move[];
  historyIndex?: number;
  status?: GameStatus;
  candidates?: Array<[string, number[]]>;
  showCandidates?: boolean;
  showConflicts?: boolean;
  mistakesMade?: number;
  savedAt?: string;
}

export function saveInProgressGame(game: InProgressGame): void {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(IN_PROGRESS_HISTORY_KEY);
    let history: InProgressGame[] = data ? JSON.parse(data) : [];

    // Remove existing entry for this puzzle if exists
    history = history.filter(g => g.puzzle.id !== game.puzzle.id);

    // Add new entry at the beginning
    history.unshift(game);

    // Keep only the most recent MAX_IN_PROGRESS_SIZE entries
    const trimmedHistory = history.slice(0, MAX_IN_PROGRESS_SIZE);

    localStorage.setItem(IN_PROGRESS_HISTORY_KEY, JSON.stringify(trimmedHistory));
    notifyStorageUpdated();
  } catch (error) {
    console.error('Failed to save in-progress game:', error);
  }
}

/**
 * Get all in-progress games
 */
export function getInProgressGames(): InProgressGame[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(IN_PROGRESS_HISTORY_KEY);
    if (!data) return [];

    const history = JSON.parse(data) as InProgressGame[];
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Failed to load in-progress games:', error);
    return [];
  }
}

/**
 * Remove an in-progress game (when completed or abandoned)
 */
export function removeInProgressGame(puzzleId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getInProgressGames();
    const filtered = history.filter(g => g.puzzle.id !== puzzleId);
    localStorage.setItem(IN_PROGRESS_HISTORY_KEY, JSON.stringify(filtered));
    notifyStorageUpdated();
  } catch (error) {
    console.error('Failed to remove in-progress game:', error);
  }
}
