import { describe, expect, it } from 'vitest';
import { STANDARD_9X9_SPEC, STANDARD_SUDOKU_PUZZLES } from '@/lib/standard-sudoku/puzzles';
import { countKidsSudokuSolutions, isValidKidsSudokuSolution } from '@/lib/kids-sudoku/core';
import { parseSudoku, solveSudoku, type SudokuStep } from './solve';

const example = STANDARD_SUDOKU_PUZZLES[0];
const clueGrid = example.grid.flat();
const solution = example.solution.flat();

function units(cell: number) {
  const row = Math.floor(cell / 9);
  const col = cell % 9;
  return [row, 9 + col, 18 + Math.floor(row / 3) * 3 + Math.floor(col / 3)];
}

const digits = Array.from({ length: 9 }, (_, index) => index + 1);
const cells = Array.from({ length: 81 }, (_, index) => index);

function verifyTrace(input: number[], expected: number[], steps: SudokuStep[]) {
  const board = [...input];
  const eliminations = cells.map(() => new Set<number>());
  function candidate(cell: number, value: number) {
    return !board[cell] && !eliminations[cell].has(value)
      && !cells.some(other => board[other] === value && units(other).some(unit => units(cell).includes(unit)));
  }
  const possibilities = (unit: number, value: number) => cells.filter(cell => units(cell).includes(unit) && candidate(cell, value));

  for (const step of steps) {
    if (step.type === 'locked-candidate') {
      const source = possibilities(step.source, step.digit);
      expect(source).toEqual(step.anchors);
      expect(source.length).toBeGreaterThan(1);
      expect(source.every(cell => units(cell).includes(step.target))).toBe(true);
      const target = possibilities(step.target, step.digit).filter(cell => !units(cell).includes(step.source));
      expect(target).toEqual(step.removed);
      for (const cell of target) {
        expect(expected[cell]).not.toBe(step.digit);
        eliminations[cell].add(step.digit);
      }
      continue;
    }

    expect(expected[step.cell]).toBe(step.digit);
    expect(candidate(step.cell, step.digit)).toBe(true);
    if (step.type === 'naked-single') {
      expect(digits.filter(digit => candidate(step.cell, digit))).toEqual([step.digit]);
    } else {
      expect(possibilities(step.unit, step.digit)).toEqual([step.cell]);
    }
    board[step.cell] = step.digit;
  }
  return board;
}

describe('classic Sudoku solver with steps', () => {
  it('parses exactly 81 values, including dots and formatted lines, and rejects other text', () => {
    const formatted = example.grid.map(row => row.map(value => value || '.').join(' ')).join('\n');
    expect(parseSudoku(formatted)).toEqual(clueGrid);
    expect(parseSudoku(clueGrid.join(''))).toEqual(clueGrid);
    expect(parseSudoku('0'.repeat(80))).toBeNull();
    expect(parseSudoku('0'.repeat(81) + '1')).toBeNull();
    expect(parseSudoku('0'.repeat(80) + 'X')).toBeNull();
  });

  it('identifies row, column and box conflicts and distinguishes a valid-looking grid with no solution', () => {
    const blank = Array<number>(81).fill(0);
    const conflict = [...blank];
    [0, 1, 9].forEach(index => { conflict[index] = 5; });
    const bad = solveSudoku(conflict);
    expect(bad.status).toBe('conflict');
    if (bad.status !== 'conflict') return;
    expect(bad.conflicts.map(({ unit }) => unit)).toEqual([0, 9, 18]);
    expect(solveSudoku([1, 2]).status).toBe('invalid');

    const impossible = [...blank];
    for (let i = 1; i < 9; i += 1) impossible[i] = i;
    impossible[9] = 9;
    expect(solveSudoku(impossible)).toEqual({ status: 'none' });
  });

  it('stops counting at two without exposing an arbitrary solution to a multiple-answer grid', () => {
    expect(solveSudoku(Array<number>(81).fill(0))).toEqual({ status: 'multiple' });
  });

  it('preserves givens and provides a logical trace separate from its unique exact result', () => {
    const input = [...clueGrid];
    const result = solveSudoku(input);
    expect(result.status).toBe('unique');
    if (result.status !== 'unique') return;
    expect(input).toEqual(clueGrid);
    expect(result.solution).toEqual(solution);
    expect(result.logicComplete).toBe(true);
    expect(result.steps).toHaveLength(clueGrid.filter(value => !value).length);
    expect(verifyTrace(input, result.solution, result.steps)).toEqual(solution);
  });

  it('replays sound singles and locked candidates, and reports when those rules stop', () => {
    const techniques = new Set<string>();
    let exhausted = false;
    const lockedGrid = parseSudoku('040700103780000059000400000000000004007000800020130060100008000300500000006300281')!;
    const grids = [...STANDARD_SUDOKU_PUZZLES.filter(({ id }) => id.endsWith('-01')).map(({ grid }) => grid.flat()), lockedGrid];
    for (const grid of grids) {
      const result = solveSudoku(grid);
      expect(result.status).toBe('unique');
      if (result.status !== 'unique') continue;
      const rows = Array.from({ length: 9 }, (_, row) => result.solution.slice(row * 9, row * 9 + 9));
      expect(isValidKidsSudokuSolution(rows, STANDARD_9X9_SPEC)).toBe(true);
      expect(countKidsSudokuSolutions(Array.from({ length: 9 }, (_, row) => grid.slice(row * 9, row * 9 + 9)), STANDARD_9X9_SPEC, 2)).toBe(1);
      const reached = verifyTrace(grid, result.solution, result.steps);
      expect(result.logicComplete).toBe(reached.every(Boolean));
      exhausted ||= !result.logicComplete;
      for (const { type } of result.steps) techniques.add(type);
    }
    expect(techniques).toEqual(new Set(['naked-single', 'hidden-single', 'locked-candidate']));
    expect(exhausted).toBe(true);
  });
});
