import { globalToLocal, localToGlobal } from "./sudoku/coordinates";
import type { Puzzle } from "./sudoku/types";

function collectUniqueGivenCells(puzzle: Puzzle) {
  const givenCells = new Set<string>();

  puzzle.grids.forEach((grid, gridIndex) => {
    grid.initial.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value === 0) return;

        const global = localToGlobal({
          grid: gridIndex as 0 | 1 | 2 | 3 | 4,
          row: rowIndex,
          col: colIndex,
        });
        givenCells.add(`${global.row},${global.col}`);
      });
    });
  });

  return givenCells;
}

export function countUniqueGivenEntries(puzzle: Puzzle) {
  const givenCells = collectUniqueGivenCells(puzzle);

  return givenCells.size;
}

export function countOverlapGivenEntries(puzzle: Puzzle) {
  const givenCells = collectUniqueGivenCells(puzzle);

  return Array.from(givenCells).filter((key) => {
    const [row, col] = key.split(",").map(Number);
    return globalToLocal({ row, col }).length > 1;
  }).length;
}

export function getDensestGivenGrid(puzzle: Puzzle) {
  let densest = { grid: 0, givenCount: 0 };

  puzzle.grids.forEach((grid, gridIndex) => {
    const givenCount = grid.initial.reduce(
      (total, row) => total + row.filter((value) => value !== 0).length,
      0,
    );

    if (givenCount > densest.givenCount) {
      densest = { grid: gridIndex, givenCount };
    }
  });

  return densest;
}
