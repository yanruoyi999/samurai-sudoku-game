export type KidsSudokuGrid = number[][];
export type KidsSudokuStatus = 'incomplete' | 'incorrect' | 'complete';
export type KidsSudokuLevel = 'easy' | 'medium' | 'challenge';

export interface KidsSudokuSpec {
  size: number;
  boxRows: number;
  boxColumns: number;
}

export interface KidsSudokuPuzzle {
  id: string;
  level: KidsSudokuLevel;
  spec: KidsSudokuSpec;
  grid: KidsSudokuGrid;
  solution: KidsSudokuGrid;
  clueCount: number;
}

export interface BuildKidsSudokuPuzzleOptions {
  id: string;
  level: KidsSudokuLevel;
  spec: KidsSudokuSpec;
  solution: KidsSudokuGrid;
  targetClues: number;
  seed: string;
}

export const KIDS_4X4_SPEC: KidsSudokuSpec = {
  size: 4,
  boxRows: 2,
  boxColumns: 2,
};

export const KIDS_6X6_SPEC: KidsSudokuSpec = {
  size: 6,
  boxRows: 2,
  boxColumns: 3,
};

export function cloneKidsSudokuGrid(grid: KidsSudokuGrid): KidsSudokuGrid {
  return grid.map((row) => [...row]);
}

function isValidSpec(spec: KidsSudokuSpec) {
  return Number.isInteger(spec.size)
    && spec.size > 0
    && Number.isInteger(spec.boxRows)
    && spec.boxRows > 0
    && Number.isInteger(spec.boxColumns)
    && spec.boxColumns > 0
    && spec.boxRows * spec.boxColumns === spec.size
    && spec.size % spec.boxRows === 0
    && spec.size % spec.boxColumns === 0;
}

function hasValidShape(grid: KidsSudokuGrid, spec: KidsSudokuSpec) {
  return isValidSpec(spec)
    && Array.isArray(grid)
    && grid.length === spec.size
    && grid.every((row) => Array.isArray(row) && row.length === spec.size);
}

function isAllowedValue(value: number, spec: KidsSudokuSpec, allowEmpty: boolean) {
  return Number.isInteger(value)
    && value >= (allowEmpty ? 0 : 1)
    && value <= spec.size;
}

function hasNoDuplicates(values: number[]) {
  const nonZero = values.filter((value) => value !== 0);
  return new Set(nonZero).size === nonZero.length;
}

function getBoxValues(
  grid: KidsSudokuGrid,
  spec: KidsSudokuSpec,
  row: number,
  column: number,
) {
  const startRow = Math.floor(row / spec.boxRows) * spec.boxRows;
  const startColumn = Math.floor(column / spec.boxColumns) * spec.boxColumns;
  const values: number[] = [];

  for (let boxRow = startRow; boxRow < startRow + spec.boxRows; boxRow += 1) {
    for (let boxColumn = startColumn; boxColumn < startColumn + spec.boxColumns; boxColumn += 1) {
      values.push(grid[boxRow][boxColumn]);
    }
  }

  return values;
}

function isValidPartialGrid(grid: KidsSudokuGrid, spec: KidsSudokuSpec) {
  if (!hasValidShape(grid, spec)) return false;
  if (!grid.every((row) => row.every((value) => isAllowedValue(value, spec, true)))) return false;

  for (let row = 0; row < spec.size; row += 1) {
    if (!hasNoDuplicates(grid[row])) return false;
  }

  for (let column = 0; column < spec.size; column += 1) {
    if (!hasNoDuplicates(grid.map((row) => row[column]))) return false;
  }

  for (let row = 0; row < spec.size; row += spec.boxRows) {
    for (let column = 0; column < spec.size; column += spec.boxColumns) {
      if (!hasNoDuplicates(getBoxValues(grid, spec, row, column))) return false;
    }
  }

  return true;
}

export function isValidKidsSudokuSolution(grid: KidsSudokuGrid, spec: KidsSudokuSpec) {
  if (!isValidPartialGrid(grid, spec)) return false;
  return grid.every((row) => row.every((value) => isAllowedValue(value, spec, false)));
}

function getCandidates(
  grid: KidsSudokuGrid,
  spec: KidsSudokuSpec,
  row: number,
  column: number,
) {
  const used = new Set<number>();
  grid[row].forEach((value) => used.add(value));
  grid.forEach((currentRow) => used.add(currentRow[column]));
  getBoxValues(grid, spec, row, column).forEach((value) => used.add(value));

  return Array.from({ length: spec.size }, (_, index) => index + 1)
    .filter((value) => !used.has(value));
}

export function countKidsSudokuSolutions(
  input: KidsSudokuGrid,
  spec: KidsSudokuSpec,
  limit = 2,
): number {
  if (!Number.isInteger(limit) || limit < 1) return 0;
  if (!isValidPartialGrid(input, spec)) return 0;

  const grid = cloneKidsSudokuGrid(input);
  let solutions = 0;

  function solve() {
    if (solutions >= limit) return;

    let bestCell: { row: number; column: number; candidates: number[] } | null = null;
    for (let row = 0; row < spec.size; row += 1) {
      for (let column = 0; column < spec.size; column += 1) {
        if (grid[row][column] !== 0) continue;
        const candidates = getCandidates(grid, spec, row, column);
        if (candidates.length === 0) return;
        if (!bestCell || candidates.length < bestCell.candidates.length) {
          bestCell = { row, column, candidates };
          if (candidates.length === 1) break;
        }
      }
      if (bestCell?.candidates.length === 1) break;
    }

    if (!bestCell) {
      solutions += 1;
      return;
    }

    for (const value of bestCell.candidates) {
      grid[bestCell.row][bestCell.column] = value;
      solve();
      grid[bestCell.row][bestCell.column] = 0;
      if (solutions >= limit) return;
    }
  }

  solve();
  return solutions;
}

export function checkKidsSudokuGrid(
  grid: KidsSudokuGrid,
  puzzle: KidsSudokuPuzzle,
): KidsSudokuStatus {
  const { size } = puzzle.spec;
  if (!hasValidShape(grid, puzzle.spec)) return 'incorrect';

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const value = grid[row][column];
      if (!isAllowedValue(value, puzzle.spec, true)) return 'incorrect';
      if (value !== 0 && value !== puzzle.solution[row][column]) return 'incorrect';
    }
  }

  if (grid.some((row) => row.some((value) => value === 0))) return 'incomplete';
  return 'complete';
}

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededShuffle<T>(values: T[], seed: string) {
  const result = [...values];
  let state = hashSeed(seed) || 1;

  function nextRandom() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  }

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

export function buildKidsSudokuPuzzle({
  id,
  level,
  spec,
  solution,
  targetClues,
  seed,
}: BuildKidsSudokuPuzzleOptions): KidsSudokuPuzzle {
  if (!isValidKidsSudokuSolution(solution, spec)) {
    throw new Error(`Invalid completed Kids Sudoku solution for ${id}`);
  }

  const grid = cloneKidsSudokuGrid(solution);
  const positions = seededShuffle(
    Array.from({ length: spec.size * spec.size }, (_, index) => ({
      row: Math.floor(index / spec.size),
      column: index % spec.size,
    })),
    seed,
  );
  let clueCount = spec.size * spec.size;
  const minimumClues = Math.max(1, Math.min(targetClues, clueCount));

  for (const position of positions) {
    if (clueCount <= minimumClues) break;
    const previous = grid[position.row][position.column];
    grid[position.row][position.column] = 0;

    if (countKidsSudokuSolutions(grid, spec, 2) === 1) {
      clueCount -= 1;
    } else {
      grid[position.row][position.column] = previous;
    }
  }

  return {
    id,
    level,
    spec,
    grid,
    solution: cloneKidsSudokuGrid(solution),
    clueCount,
  };
}
