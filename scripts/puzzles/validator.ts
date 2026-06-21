#!/usr/bin/env tsx

import { Puzzle, GridData } from '@/lib/sudoku/types';
import { SudokuEngine } from '@/lib/sudoku/engine';
import { GlobalPosition, globalToLocal, localToGlobal, getOverlappingCell } from '@/lib/sudoku/coordinates';
import { countBoardClues, countSamuraiSolutions, getGlobalInitialBoard } from '@/lib/sudoku/solution-counter';

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  hasSolution: boolean;
  hasUniqueSolution: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a puzzle
 */
export function validatePuzzle(puzzle: Puzzle): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    hasSolution: true,
    hasUniqueSolution: true,
    errors: [],
    warnings: [],
  };

  // 1. Validate puzzle structure
  if (!puzzle.id || !puzzle.difficulty || !puzzle.grids || puzzle.grids.length !== 5) {
    result.isValid = false;
    result.errors.push('Invalid puzzle structure');
    return result;
  }

  // 2. Validate each grid
  for (let i = 0; i < 5; i++) {
    const grid = puzzle.grids[i];

    if (!grid.initial || !Array.isArray(grid.initial) || grid.initial.length !== 9) {
      result.isValid = false;
      result.errors.push(`Grid ${i}: Invalid initial array`);
      continue;
    }

    if (!grid.solution || !Array.isArray(grid.solution) || grid.solution.length !== 9) {
      result.isValid = false;
      result.errors.push(`Grid ${i}: Invalid solution array`);
      continue;
    }

    // Check dimensions
    for (let row = 0; row < 9; row++) {
      if (!Array.isArray(grid.initial[row]) || grid.initial[row].length !== 9) {
        result.isValid = false;
        result.errors.push(`Grid ${i}, row ${row}: Invalid initial row`);
      }
      if (!Array.isArray(grid.solution[row]) || grid.solution[row].length !== 9) {
        result.isValid = false;
        result.errors.push(`Grid ${i}, row ${row}: Invalid solution row`);
      }
    }

    // Check values
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const initVal = grid.initial[row][col];
        const solVal = grid.solution[row][col];

        // Initial values must be 0-9
        if (!Number.isInteger(initVal) || initVal < 0 || initVal > 9) {
          result.isValid = false;
          result.errors.push(`Grid ${i} (${row},${col}): Invalid initial value ${initVal}`);
        }

        // Solution values must be 1-9
        if (!Number.isInteger(solVal) || solVal < 1 || solVal > 9) {
          result.isValid = false;
          result.errors.push(`Grid ${i} (${row},${col}): Invalid solution value ${solVal}`);
        }

        // Initial clue must match solution
        if (initVal !== 0 && initVal !== solVal) {
          result.isValid = false;
          result.errors.push(`Grid ${i} (${row},${col}): Initial ${initVal} doesn't match solution ${solVal}`);
        }
      }
    }
  }

  if (!result.isValid) {
    return result;
  }

  // 3. Validate solution correctness
  try {
    const engine = new SudokuEngine(puzzle);
    const solution = puzzle.grids;
    const solutionBoard: number[][] = Array(21).fill(0).map(() => Array(21).fill(0));

    for (let gridIdx = 0; gridIdx < 5; gridIdx++) {
      const grid = solution[gridIdx];
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const localPos = { grid: gridIdx as 0 | 1 | 2 | 3 | 4, row, col };
          const global = localToGlobal(localPos);
          const solutionValue = grid.solution[row][col];

          if (solutionBoard[global.row][global.col] !== 0 && solutionBoard[global.row][global.col] !== solutionValue) {
            result.isValid = false;
            result.errors.push(
              `Global solution inconsistency at (${global.row},${global.col}): ${solutionBoard[global.row][global.col]} !== ${solutionValue}`,
            );
          }

          solutionBoard[global.row][global.col] = solutionValue;

          // For overlap cells, check consistency with the overlapping cell
          const overlapping = getOverlappingCell(localPos);
          if (overlapping) {
            const val1 = grid.solution[row][col];
            const grid2 = solution[overlapping.grid];
            const val2 = grid2.solution[overlapping.row][overlapping.col];

            if (val1 !== val2) {
              result.isValid = false;
              result.errors.push(`Overlap cell inconsistency at grid ${gridIdx} (${row},${col}): ${val1} !== ${val2}`);
            }
          }
        }
      }
    }

    // Check if solution is valid (no conflicts)
    engine.loadState(solutionBoard);

    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        const pos: GlobalPosition = { row, col };
        const locals = globalToLocal(pos);

        if (locals.length === 0) continue;

        const value = engine.getValue(pos);
        if (value === 0) {
          result.errors.push(`Solution incomplete at (${row},${col})`);
          result.hasSolution = false;
          continue;
        }

        if (engine.hasConflict(pos, value)) {
          result.errors.push(`Solution has conflict at (${row},${col}) with value ${value}`);
          result.hasSolution = false;
        }
      }
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Engine validation failed: ${error}`);
  }

  // 4. Check minimum clues (warning only)
  const initialBoard = getGlobalInitialBoard(puzzle);
  const totalClues = countBoardClues(initialBoard);

  if (totalClues < 50) {
    result.warnings.push(`Very few clues (${totalClues}). Puzzle may have multiple solutions.`);
  }

  if (totalClues > 150) {
    result.warnings.push(`Many clues (${totalClues}). Puzzle may be too easy.`);
  }

  // 5. Check uniqueness with a bounded Samurai Sudoku solver.
  const solutionCount = countSamuraiSolutions(initialBoard, 2);
  if (solutionCount === 0) {
    result.hasSolution = false;
    result.hasUniqueSolution = false;
    result.errors.push('Puzzle has no valid solution.');
  } else if (solutionCount > 1) {
    result.hasUniqueSolution = false;
    result.errors.push('Puzzle has multiple valid solutions.');
  } else {
    result.hasUniqueSolution = true;
  }

  result.isValid = result.errors.length === 0;
  result.hasSolution = result.hasSolution && result.isValid;

  return result;
}

/**
 * Validate a puzzle file
 */
export async function validatePuzzleFile(filePath: string): Promise<ValidationResult> {
  const fs = await import('fs/promises');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const puzzle: Puzzle = JSON.parse(content);

    return validatePuzzle(puzzle);
  } catch (error) {
    return {
      isValid: false,
      hasSolution: false,
      hasUniqueSolution: false,
      errors: [`Failed to read/parse file: ${error}`],
      warnings: [],
    };
  }
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: tsx validator.ts <puzzle-file.json>');
    process.exit(1);
  }

  const filePath = args[0];

  validatePuzzleFile(filePath).then((result) => {
    console.log('Validation Result:');
    console.log('==================');
    console.log(`Valid: ${result.isValid ? '✅' : '❌'}`);
    console.log(`Has Solution: ${result.hasSolution ? '✅' : '❌'}`);
    console.log(`Unique Solution: ${result.hasUniqueSolution ? '✅' : '❌'}`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach((err) => console.log(`  - ${err}`));
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach((warn) => console.log(`  - ${warn}`));
    }

    if (result.isValid && result.hasSolution) {
      console.log('\n✅ Puzzle is valid!');
    }

    process.exit(result.isValid ? 0 : 1);
  });
}
