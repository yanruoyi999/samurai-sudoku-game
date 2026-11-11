import { describe, expect, it } from 'vitest';
import { isComplete } from '../jigsaw/puzzles';
import { killerPuzzles, matchesKillerCages, type KillerCage } from './puzzles';

function box(index: number) {
  return Math.floor(index / 27) * 3 + Math.floor((index % 9) / 3);
}

function adjacent(a: number, b: number) {
  return Math.abs(Math.floor(a / 9) - Math.floor(b / 9)) + Math.abs(a % 9 - b % 9) === 1;
}

// Exact cover over whole-cage assignments. Each possible assignment covers its
// cage and one occurrence of each assigned digit in its row, column and box.
function solveCages(cages: readonly KillerCage[]) {
  const columns = new Map(Array.from({ length: 243 + cages.length }, (_, i) => [i, new Set<number>()]));
  const assignments: { cells: readonly number[]; digits: number[]; columns: number[] }[] = [];
  cages.forEach(({ total, cells }, cage) => {
    function enumerate(digits: number[], left: number) {
      if (digits.length === cells.length) {
        if (left !== 0) return;
        const units = [243 + cage];
        cells.forEach((cell, i) => {
          const digit = digits[i] - 1;
          units.push(9 * Math.floor(cell / 9) + digit, 81 + 9 * (cell % 9) + digit, 162 + 9 * box(cell) + digit);
        });
        const key = assignments.push({ cells, digits, columns: units }) - 1;
        for (const unit of units) columns.get(unit)!.add(key);
        return;
      }
      for (let digit = 1; digit <= Math.min(9, left); digit += 1) {
        if (!digits.includes(digit)) enumerate([...digits, digit], left - digit);
      }
    }
    enumerate([], total);
  });

  const selected: number[] = [];
  const solutions: string[] = [];
  function search() {
    if (columns.size === 0) {
      const grid = Array<number>(81);
      for (const key of selected) {
        const { cells, digits } = assignments[key];
        cells.forEach((cell, i) => { grid[cell] = digits[i]; });
      }
      solutions.push(grid.join(''));
      return;
    }

    const candidates = [...columns.values()].reduce((best, rows) => rows.size < best.size ? rows : best);
    for (const key of [...candidates]) {
      const removed: [number, Set<number>][] = [];
      selected.push(key);
      for (const unit of assignments[key].columns) {
        const affected = columns.get(unit)!;
        for (const row of affected) {
          for (const other of assignments[row].columns) {
            if (other !== unit) columns.get(other)?.delete(row);
          }
        }
        removed.push([unit, affected]);
        columns.delete(unit);
      }
      search();
      for (const [unit, affected] of removed.reverse()) {
        columns.set(unit, affected);
        for (const row of affected) {
          for (const other of assignments[row].columns) {
            if (other !== unit) columns.get(other)?.add(row);
          }
        }
      }
      selected.pop();
      if (solutions.length === 2) return;
    }
  }
  search();
  return solutions;
}

describe('Killer Sudoku', () => {
  it('ships distinct, wholly covered grids with connected cages and exactly one solution each', () => {
    expect(killerPuzzles.length).toBeGreaterThanOrEqual(3);
    expect(new Set(killerPuzzles.map(({ id }) => id)).size).toBe(killerPuzzles.length);
    expect(new Set(killerPuzzles.map(({ solution }) => solution)).size).toBe(killerPuzzles.length);
    for (const { cages, givens, regions, solution } of killerPuzzles) {
      expect(givens).toBe('0'.repeat(81));
      expect(cages.flatMap(({ cells }) => cells).sort((a, b) => a - b)).toEqual(Array.from({ length: 81 }, (_, i) => i));
      for (const { cells } of cages) {
        const visited = new Set([cells[0]]);
        for (const cell of visited) {
          for (const next of cells) if (adjacent(cell, next)) visited.add(next);
        }
        expect(visited.size).toBe(cells.length);
      }
      expect(solveCages(cages)).toEqual([solution]);
      const values = [...solution].map(Number);
      expect(isComplete(regions, values)).toBe(true);
      expect(matchesKillerCages(cages, values)).toBe(true);
      const classicAlternative = values.map(value => value === 1 ? 2 : value === 2 ? 1 : value);
      expect(isComplete(regions, classicAlternative)).toBe(true);
      expect(matchesKillerCages(cages, classicAlternative)).toBe(false);
    }
  });

  it('rejects a repeated or empty digit even if the filled cells have the right sum', () => {
    const cage = [{ total: 4, cells: [0, 1] }];
    expect(matchesKillerCages(cage, [2, 2])).toBe(false);
    expect(matchesKillerCages(cage, [4, 0])).toBe(false);
    expect(matchesKillerCages(cage, [1, 3])).toBe(true);
  });
});
