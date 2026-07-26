import {
  KIDS_4X4_SPEC,
  KIDS_6X6_SPEC,
  buildKidsSudokuPuzzle,
  checkKidsSudokuGrid,
  cloneKidsSudokuGrid,
  countKidsSudokuSolutions,
  type KidsSudokuGrid,
  type KidsSudokuLevel,
  type KidsSudokuPuzzle,
  type KidsSudokuStatus,
  type KidsSudokuSpec,
} from './core';

export {
  KIDS_4X4_SPEC,
  KIDS_6X6_SPEC,
  checkKidsSudokuGrid,
  cloneKidsSudokuGrid,
  countKidsSudokuSolutions,
};
export type {
  KidsSudokuGrid,
  KidsSudokuLevel,
  KidsSudokuPuzzle,
  KidsSudokuSpec,
  KidsSudokuStatus,
};

const LEVELS: readonly KidsSudokuLevel[] = ['easy', 'medium', 'challenge'];

const TARGET_CLUES: Record<number, Record<KidsSudokuLevel, number>> = {
  4: {
    easy: 10,
    medium: 8,
    challenge: 6,
  },
  6: {
    easy: 24,
    medium: 20,
    challenge: 16,
  },
};

function createBaseSolution(spec: KidsSudokuSpec): KidsSudokuGrid {
  return Array.from({ length: spec.size }, (_, row) =>
    Array.from(
      { length: spec.size },
      (_, column) => ((row * spec.boxColumns + Math.floor(row / spec.boxRows) + column) % spec.size) + 1,
    ),
  );
}

function rotate<T>(values: T[], amount: number) {
  if (values.length === 0) return values;
  const normalized = ((amount % values.length) + values.length) % values.length;
  return [...values.slice(normalized), ...values.slice(0, normalized)];
}

function buildGroupedOrder(size: number, groupSize: number, variant: number) {
  const groupCount = size / groupSize;
  let groups = Array.from({ length: groupCount }, (_, index) => index);
  groups = rotate(groups, variant % groupCount);
  if ((variant & 1) === 1) groups.reverse();

  const order: number[] = [];
  for (const group of groups) {
    let within = Array.from({ length: groupSize }, (_, index) => index);
    within = rotate(within, Math.floor(variant / 2) % groupSize);
    if ((variant & 2) === 2) within.reverse();
    order.push(...within.map((index) => group * groupSize + index));
  }
  return order;
}

function transformSolution(
  base: KidsSudokuGrid,
  spec: KidsSudokuSpec,
  variant: number,
): KidsSudokuGrid {
  const rowOrder = buildGroupedOrder(spec.size, spec.boxRows, variant + 1);
  const columnOrder = buildGroupedOrder(spec.size, spec.boxColumns, variant * 3 + 2);
  const digitOffset = variant % spec.size;
  const reverseDigits = (variant & 4) === 4;

  return rowOrder.map((sourceRow) =>
    columnOrder.map((sourceColumn) => {
      const value = base[sourceRow][sourceColumn];
      const shifted = ((value - 1 + digitOffset) % spec.size) + 1;
      return reverseDigits ? spec.size + 1 - shifted : shifted;
    }),
  );
}

function createPuzzleLibrary(
  prefix: string,
  spec: KidsSudokuSpec,
  variantsPerLevel: number,
): readonly KidsSudokuPuzzle[] {
  const base = createBaseSolution(spec);
  const puzzles: KidsSudokuPuzzle[] = [];

  for (const level of LEVELS) {
    for (let index = 0; index < variantsPerLevel; index += 1) {
      const variant = index + LEVELS.indexOf(level) * variantsPerLevel;
      const id = `${prefix}-${level}-${String(index + 1).padStart(2, '0')}`;
      const solution = transformSolution(base, spec, variant);
      puzzles.push(
        buildKidsSudokuPuzzle({
          id,
          level,
          spec,
          solution,
          targetClues: TARGET_CLUES[spec.size][level],
          seed: `${id}-clues`,
        }),
      );
    }
  }

  return puzzles;
}

export const KIDS_SUDOKU_4X4_PUZZLES = createPuzzleLibrary(
  'kids-4x4',
  KIDS_4X4_SPEC,
  8,
);

export const KIDS_SUDOKU_6X6_PUZZLES = createPuzzleLibrary(
  'kids-6x6',
  KIDS_6X6_SPEC,
  4,
);

export const ALL_KIDS_SUDOKU_PUZZLES = [
  ...KIDS_SUDOKU_4X4_PUZZLES,
  ...KIDS_SUDOKU_6X6_PUZZLES,
] as const;

// Backward-compatible alias used by the original 4×4 page and existing imports.
export const KIDS_SUDOKU_PUZZLES = KIDS_SUDOKU_4X4_PUZZLES;

export function createKidsSudokuGrid(puzzle: KidsSudokuPuzzle): KidsSudokuGrid {
  return cloneKidsSudokuGrid(puzzle.grid);
}
