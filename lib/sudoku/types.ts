import { GlobalPosition, LocalPosition } from './coordinates';

/**
 * Difficulty levels for puzzles
 */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'evil';

/**
 * Single 9x9 grid data
 */
export interface GridData {
  initial: number[][]; // 9x9 array with 0 for empty cells
  solution: number[][]; // 9x9 array with complete solution
}

/**
 * Complete puzzle data
 */
export interface Puzzle {
  id: string; // YYYY-MM-DD format
  difficulty: Difficulty;
  grids: [GridData, GridData, GridData, GridData, GridData]; // 5 grids
  metadata: {
    createdAt: string;
    estimatedTime: number; // in minutes
    checksum: string;
    tags?: string[];
  };
}

/**
 * Puzzle metadata for index
 */
export interface PuzzleMetadata {
  id: string;
  difficulty: Difficulty;
  estimatedTime: number;
  checksum: string;
  tags: string[];
}

/**
 * Puzzle index structure
 */
export interface PuzzleIndex {
  puzzles: PuzzleMetadata[];
  total: number;
  lastUpdated: string;
}

/**
 * Move history entry
 */
export interface Move {
  position: GlobalPosition;
  oldValue: number;
  newValue: number;
  timestamp: number;
}

/**
 * Hint types
 */
export type HintType =
  | 'naked-single'
  | 'hidden-single'
  | 'pointing-pair'
  | 'box-line'
  | 'cross-grid';

/**
 * Hint data
 */
export interface Hint {
  type: HintType;
  position: GlobalPosition;
  value: number;
  explanation: string; // i18n key
  affectedCells?: GlobalPosition[];
}

/**
 * Game status
 */
export type GameStatus = 'playing' | 'paused' | 'completed' | 'abandoned';

/**
 * Statistics for a completed puzzle
 */
export interface PuzzleStats {
  puzzleId: string;
  timeSpent: number; // seconds
  hintsUsed: number;
  mistakesMade: number;
  completedAt: string;
}
