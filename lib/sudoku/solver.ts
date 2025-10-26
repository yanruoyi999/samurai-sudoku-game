import { SudokuEngine } from './engine';
import { GlobalPosition, globalToLocal, getAffectedCells } from './coordinates';
import { Hint, HintType } from './types';

/**
 * Find hints in the puzzle
 */
export class SudokuSolver {
  constructor(private engine: SudokuEngine) {}

  /**
   * Get the next best hint
   */
  getHint(): Hint | null {
    // Try to find hints in order of difficulty
    return (
      this.findNakedSingle() ||
      this.findHiddenSingle() ||
      null
    );
  }

  /**
   * Find a naked single (cell with only one candidate)
   */
  private findNakedSingle(): Hint | null {
    const board = this.engine.getBoard();

    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        const pos: GlobalPosition = { row, col };
        const locals = globalToLocal(pos);

        if (locals.length === 0) continue;
        if (board[row][col] !== 0) continue;

        const candidates = this.engine.getCandidates(pos);

        if (candidates.size === 1) {
          const value = Array.from(candidates)[0];

          return {
            type: 'naked-single',
            position: pos,
            value,
            explanation: 'hint.naked_single',
            affectedCells: this.getRelatedCells(pos),
          };
        }
      }
    }

    return null;
  }

  /**
   * Find a hidden single (value that can only go in one place in a row/col/box)
   */
  private findHiddenSingle(): Hint | null {
    const board = this.engine.getBoard();

    // Check all empty cells
    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        const pos: GlobalPosition = { row, col };
        const locals = globalToLocal(pos);

        if (locals.length === 0) continue;
        if (board[row][col] !== 0) continue;

        const candidates = this.engine.getCandidates(pos);

        if (candidates.size === 0) continue;

        // For each candidate, check if it's the only place in row/col/box
        for (const candidate of candidates) {
          if (this.isHiddenSingleInRow(pos, candidate)) {
            return {
              type: 'hidden-single',
              position: pos,
              value: candidate,
              explanation: 'hint.hidden_single_row',
              affectedCells: this.getRowCells(pos),
            };
          }

          if (this.isHiddenSingleInCol(pos, candidate)) {
            return {
              type: 'hidden-single',
              position: pos,
              value: candidate,
              explanation: 'hint.hidden_single_col',
              affectedCells: this.getColCells(pos),
            };
          }

          if (this.isHiddenSingleInBox(pos, candidate)) {
            return {
              type: 'hidden-single',
              position: pos,
              value: candidate,
              explanation: 'hint.hidden_single_box',
              affectedCells: this.getBoxCells(pos),
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Check if value can only go in this cell in the row
   */
  private isHiddenSingleInRow(pos: GlobalPosition, value: number): boolean {
    const affected = getAffectedCells(pos);
    let count = 0;

    for (const cell of affected.row) {
      const candidates = this.engine.getCandidates(cell);
      if (candidates.has(value)) {
        count++;
      }
    }

    return count === 1;
  }

  /**
   * Check if value can only go in this cell in the column
   */
  private isHiddenSingleInCol(pos: GlobalPosition, value: number): boolean {
    const affected = getAffectedCells(pos);
    let count = 0;

    for (const cell of affected.col) {
      const candidates = this.engine.getCandidates(cell);
      if (candidates.has(value)) {
        count++;
      }
    }

    return count === 1;
  }

  /**
   * Check if value can only go in this cell in the box
   */
  private isHiddenSingleInBox(pos: GlobalPosition, value: number): boolean {
    const affected = getAffectedCells(pos);
    let count = 0;

    for (const cell of affected.box) {
      const candidates = this.engine.getCandidates(cell);
      if (candidates.has(value)) {
        count++;
      }
    }

    return count === 1;
  }

  /**
   * Get all related cells for highlighting
   */
  private getRelatedCells(pos: GlobalPosition): GlobalPosition[] {
    const affected = getAffectedCells(pos);
    return [...affected.row, ...affected.col, ...affected.box];
  }

  /**
   * Get row cells
   */
  private getRowCells(pos: GlobalPosition): GlobalPosition[] {
    const affected = getAffectedCells(pos);
    return affected.row;
  }

  /**
   * Get column cells
   */
  private getColCells(pos: GlobalPosition): GlobalPosition[] {
    const affected = getAffectedCells(pos);
    return affected.col;
  }

  /**
   * Get box cells
   */
  private getBoxCells(pos: GlobalPosition): GlobalPosition[] {
    const affected = getAffectedCells(pos);
    return affected.box;
  }
}
