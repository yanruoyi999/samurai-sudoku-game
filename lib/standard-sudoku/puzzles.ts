import type { KidsSudokuGrid, KidsSudokuSpec } from '@/lib/kids-sudoku/core';

export type StandardSudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface StandardSudokuPuzzle {
  id: string;
  difficulty: StandardSudokuDifficulty;
  grid: KidsSudokuGrid;
  solution: KidsSudokuGrid;
}

interface PuzzleSeed {
  difficulty: StandardSudokuDifficulty;
  puzzle: string;
  solution: string;
}

export const STANDARD_9X9_SPEC: KidsSudokuSpec = {
  size: 9,
  boxRows: 3,
  boxColumns: 3,
};

const PUZZLE_SEEDS: PuzzleSeed[] = [
  {
    difficulty: 'easy',
    puzzle: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
    solution: '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
  },
  {
    difficulty: 'medium',
    puzzle: '000260701680070090190004500820100040004602900050003028009300074040050036703018000',
    solution: '435269781682571493197834562826195347374682915951743628519326874248957136763418259',
  },
  {
    difficulty: 'hard',
    puzzle: '000000907000420180000705026100904000050000040000507009920108000034059000507000000',
    solution: '462831957795426183381795426173984265659312748248567319926178534834259671517643892',
  },
  {
    difficulty: 'expert',
    puzzle: '005300000800000020070010500400005300010070006003200080060500009004000030000009700',
    solution: '145327698839654127672918543496185372218473956753296481367542819984761235521839764',
  },
];

function parseGrid(value: string): KidsSudokuGrid {
  if (!/^\d{81}$/.test(value)) {
    throw new Error('Standard Sudoku grids must contain exactly 81 digits');
  }

  return Array.from({ length: 9 }, (_, row) => (
    value
      .slice(row * 9, row * 9 + 9)
      .split('')
      .map(Number)
  ));
}

function shiftDigit(value: number, offset: number) {
  if (value === 0) return 0;
  return ((value - 1 + offset) % 9) + 1;
}

function shiftGrid(grid: KidsSudokuGrid, offset: number) {
  return grid.map((row) => row.map((value) => shiftDigit(value, offset)));
}

export const STANDARD_SUDOKU_PUZZLES: StandardSudokuPuzzle[] = PUZZLE_SEEDS.flatMap((seed) => {
  const grid = parseGrid(seed.puzzle);
  const solution = parseGrid(seed.solution);

  return Array.from({ length: 6 }, (_, index) => ({
    id: `${seed.difficulty}-${String(index + 1).padStart(2, '0')}`,
    difficulty: seed.difficulty,
    grid: shiftGrid(grid, index),
    solution: shiftGrid(solution, index),
  }));
});

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rotate<T>(values: T[], seed: string) {
  if (values.length === 0) return [];
  const offset = hashSeed(seed) % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}

export function selectStandardSudokuPuzzles({
  difficulty,
  count,
  seed = 'printable-sudoku',
}: {
  difficulty: StandardSudokuDifficulty | 'mixed';
  count: number;
  seed?: string;
}) {
  const safeCount = Math.max(1, Math.min(24, Math.floor(count)));
  const pool = difficulty === 'mixed'
    ? STANDARD_SUDOKU_PUZZLES
    : STANDARD_SUDOKU_PUZZLES.filter((puzzle) => puzzle.difficulty === difficulty);
  const ordered = rotate(pool, `${seed}:${difficulty}:${safeCount}`);

  return Array.from({ length: safeCount }, (_, index) => ordered[index % ordered.length]);
}
