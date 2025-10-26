import {
  GlobalPosition,
  LocalPosition,
  localToGlobal,
  globalToLocal,
  getAffectedCells,
  getOverlappingCell,
} from './coordinates';
import { Puzzle, GridData } from './types';

/**
 * Sudoku Engine - Core game logic
 * Manages the 21x21 board state for Samurai Sudoku
 */
export class SudokuEngine {
  private board: number[][]; // 21x21 grid
  private initial: boolean[][]; // Marks initial/given cells
  private solution: number[][] | null = null;

  constructor(puzzle: Puzzle) {
    this.board = this.createEmptyBoard();
    this.initial = this.createEmptyBooleanBoard();
    this.initializeFromPuzzle(puzzle);
  }

  /**
   * Create empty 21x21 board
   */
  private createEmptyBoard(): number[][] {
    return Array(21)
      .fill(0)
      .map(() => Array(21).fill(0));
  }

  /**
   * Create empty boolean board
   */
  private createEmptyBooleanBoard(): boolean[][] {
    return Array(21)
      .fill(false)
      .map(() => Array(21).fill(false));
  }

  /**
   * Initialize board from puzzle data
   */
  private initializeFromPuzzle(puzzle: Puzzle): void {
    // Initialize each of the 5 grids
    for (let gridIdx = 0; gridIdx < 5; gridIdx++) {
      const grid = puzzle.grids[gridIdx];

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const value = grid.initial[row][col];
          if (value !== 0) {
            const global = localToGlobal({
              grid: gridIdx as 0 | 1 | 2 | 3 | 4,
              row,
              col,
            });

            this.board[global.row][global.col] = value;
            this.initial[global.row][global.col] = true;
          }
        }
      }
    }

    // Store solution if provided
    if (puzzle.grids[0].solution) {
      this.solution = this.createEmptyBoard();
      for (let gridIdx = 0; gridIdx < 5; gridIdx++) {
        const grid = puzzle.grids[gridIdx];

        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            const global = localToGlobal({
              grid: gridIdx as 0 | 1 | 2 | 3 | 4,
              row,
              col,
            });

            this.solution[global.row][global.col] = grid.solution[row][col];
          }
        }
      }
    }
  }

  /**
   * Get current board state
   */
  getBoard(): number[][] {
    return this.board.map((row) => [...row]);
  }

  /**
   * Get initial cell markers
   */
  getInitial(): boolean[][] {
    return this.initial.map((row) => [...row]);
  }

  /**
   * Get solution if available
   */
  getSolution(): number[][] | null {
    return this.solution ? this.solution.map((row) => [...row]) : null;
  }

  /**
   * Get value at position
   */
  getValue(pos: GlobalPosition): number {
    return this.board[pos.row][pos.col];
  }

  /**
   * Set value at position (only if not initial cell)
   */
  setValue(pos: GlobalPosition, value: number): boolean {
    if (this.initial[pos.row][pos.col]) {
      return false; // Cannot modify initial cells
    }

    this.board[pos.row][pos.col] = value;

    // If in overlap zone, update the overlapping cell
    const locals = globalToLocal(pos);
    if (locals.length > 1) {
      // This is an overlap cell
      for (const local of locals) {
        const overlapping = getOverlappingCell(local);
        if (overlapping) {
          const overlapGlobal = localToGlobal(overlapping);
          this.board[overlapGlobal.row][overlapGlobal.col] = value;
        }
      }
    }

    return true;
  }

  /**
   * Clear value at position
   */
  clearValue(pos: GlobalPosition): boolean {
    if (this.initial[pos.row][pos.col]) {
      return false; // Cannot clear initial cells
    }

    this.setValue(pos, 0);
    return true;
  }

  /**
   * Check if position is an initial/given cell
   */
  isInitial(pos: GlobalPosition): boolean {
    return this.initial[pos.row][pos.col];
  }

  /**
   * Get all conflicts for a value at a position
   * Returns array of positions that conflict
   */
  getConflicts(pos: GlobalPosition, value: number): GlobalPosition[] {
    if (value === 0) return [];

    const conflicts: GlobalPosition[] = [];
    const affected = getAffectedCells(pos);

    // Check row conflicts
    for (const cell of affected.row) {
      if (
        this.board[cell.row][cell.col] === value &&
        !(cell.row === pos.row && cell.col === pos.col)
      ) {
        conflicts.push(cell);
      }
    }

    // Check column conflicts
    for (const cell of affected.col) {
      if (
        this.board[cell.row][cell.col] === value &&
        !(cell.row === pos.row && cell.col === pos.col)
      ) {
        conflicts.push(cell);
      }
    }

    // Check box conflicts
    for (const cell of affected.box) {
      if (
        this.board[cell.row][cell.col] === value &&
        !(cell.row === pos.row && cell.col === pos.col)
      ) {
        conflicts.push(cell);
      }
    }

    // Remove duplicates
    const uniqueConflicts: GlobalPosition[] = [];
    const seen = new Set<string>();

    for (const conflict of conflicts) {
      const key = `${conflict.row},${conflict.col}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueConflicts.push(conflict);
      }
    }

    return uniqueConflicts;
  }

  /**
   * Check if a value at position creates conflicts
   */
  hasConflict(pos: GlobalPosition, value: number): boolean {
    return this.getConflicts(pos, value).length > 0;
  }

  /**
   * Get all current conflicts on the board
   */
  getAllConflicts(): GlobalPosition[] {
    const conflicts: GlobalPosition[] = [];

    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        const pos = { row, col };
        const value = this.board[row][col];

        if (value !== 0 && this.getConflicts(pos, value).length > 0) {
          conflicts.push(pos);
        }
      }
    }

    return conflicts;
  }

  /**
   * Calculate possible candidates for a position
   */
  getCandidates(pos: GlobalPosition): Set<number> {
    const candidates = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    // If cell is filled, no candidates
    if (this.board[pos.row][pos.col] !== 0) {
      return new Set();
    }

    const affected = getAffectedCells(pos);

    // Remove values that appear in row
    for (const cell of affected.row) {
      const value = this.board[cell.row][cell.col];
      if (value !== 0) {
        candidates.delete(value);
      }
    }

    // Remove values that appear in column
    for (const cell of affected.col) {
      const value = this.board[cell.row][cell.col];
      if (value !== 0) {
        candidates.delete(value);
      }
    }

    // Remove values that appear in box
    for (const cell of affected.box) {
      const value = this.board[cell.row][cell.col];
      if (value !== 0) {
        candidates.delete(value);
      }
    }

    return candidates;
  }

  /**
   * Check if board is complete (all cells filled)
   */
  isComplete(): boolean {
    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        // Check if cell belongs to any grid
        const locals = globalToLocal({ row, col });
        if (locals.length > 0 && this.board[row][col] === 0) {
          return false;
        }
      }
    }

    // Check if no conflicts exist
    return this.getAllConflicts().length === 0;
  }

  /**
   * Check if board is valid (no conflicts)
   */
  isValid(): boolean {
    return this.getAllConflicts().length === 0;
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(): number {
    let filled = 0;
    let total = 0;

    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        const locals = globalToLocal({ row, col });
        if (locals.length > 0) {
          total++;
          if (this.board[row][col] !== 0) {
            filled++;
          }
        }
      }
    }

    return total > 0 ? Math.floor((filled / total) * 100) : 0;
  }

  /**
   * Reset board to initial state
   */
  reset(): void {
    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        if (!this.initial[row][col]) {
          this.board[row][col] = 0;
        }
      }
    }
  }

  /**
   * Load board state
   */
  loadState(board: number[][]): void {
    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        if (!this.initial[row][col]) {
          this.board[row][col] = board[row][col];
        }
      }
    }
  }
}
