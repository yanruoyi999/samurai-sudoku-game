export type KidsSudokuGrid = number[][];
export type KidsSudokuStatus = 'incomplete' | 'incorrect' | 'complete';

export interface KidsSudokuPuzzle {
  id: string;
  grid: KidsSudokuGrid;
  solution: KidsSudokuGrid;
  clueCount: number;
}

export const KIDS_SUDOKU_PUZZLES: readonly KidsSudokuPuzzle[] = [
  {
    id: 'kids-4x4-1',
    clueCount: 8,
    grid: [
      [1, 0, 3, 0],
      [0, 4, 1, 2],
      [0, 0, 4, 3],
      [0, 3, 0, 0],
    ],
    solution: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1],
    ],
  },
  {
    id: 'kids-4x4-2',
    clueCount: 7,
    grid: [
      [0, 4, 0, 0],
      [1, 0, 0, 0],
      [4, 2, 0, 1],
      [3, 0, 4, 0],
    ],
    solution: [
      [2, 4, 1, 3],
      [1, 3, 2, 4],
      [4, 2, 3, 1],
      [3, 1, 4, 2],
    ],
  },
  {
    id: 'kids-4x4-3',
    clueCount: 6,
    grid: [
      [0, 0, 2, 0],
      [0, 4, 1, 0],
      [0, 1, 0, 0],
      [4, 0, 3, 0],
    ],
    solution: [
      [1, 3, 2, 4],
      [2, 4, 1, 3],
      [3, 1, 4, 2],
      [4, 2, 3, 1],
    ],
  },
] as const;

export function createKidsSudokuGrid(puzzle: KidsSudokuPuzzle): KidsSudokuGrid {
  return puzzle.grid.map((row) => [...row]);
}

function canPlaceValue(grid: KidsSudokuGrid, row: number, column: number, value: number) {
  if (grid[row].includes(value)) return false;
  if (grid.some((currentRow) => currentRow[column] === value)) return false;

  const startRow = Math.floor(row / 2) * 2;
  const startColumn = Math.floor(column / 2) * 2;
  for (let boxRow = startRow; boxRow < startRow + 2; boxRow += 1) {
    for (let boxColumn = startColumn; boxColumn < startColumn + 2; boxColumn += 1) {
      if (grid[boxRow][boxColumn] === value) return false;
    }
  }

  return true;
}

export function countKidsSudokuSolutions(input: KidsSudokuGrid, limit = 2): number {
  const grid = input.map((row) => [...row]);
  let solutions = 0;

  function solve() {
    if (solutions >= limit) return;

    let bestCell: { row: number; column: number; candidates: number[] } | null = null;
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        if (grid[row][column] !== 0) continue;

        const candidates = [1, 2, 3, 4].filter((value) =>
          canPlaceValue(grid, row, column, value),
        );
        if (!bestCell || candidates.length < bestCell.candidates.length) {
          bestCell = { row, column, candidates };
        }
      }
    }

    if (!bestCell) {
      solutions += 1;
      return;
    }

    for (const value of bestCell.candidates) {
      grid[bestCell.row][bestCell.column] = value;
      solve();
      grid[bestCell.row][bestCell.column] = 0;
    }
  }

  solve();
  return solutions;
}

export function checkKidsSudokuGrid(
  grid: KidsSudokuGrid,
  puzzle: KidsSudokuPuzzle,
): KidsSudokuStatus {
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const value = grid[row]?.[column] ?? 0;
      if (value !== 0 && value !== puzzle.solution[row][column]) {
        return 'incorrect';
      }
    }
  }

  if (grid.some((row) => row.some((value) => value === 0))) {
    return 'incomplete';
  }

  return 'complete';
}
