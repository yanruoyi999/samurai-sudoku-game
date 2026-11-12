import { solveSudoku, sudokuDigits } from '@/lib/sudoku-step-solver/solve';

export interface GeneratedSudoku {
  grid: number[];
  solution: number[];
}

const targetClues = 34;
const maxAttempts = 3;
const groups = [0, 1, 2];
const cells = Array.from({ length: 81 }, (_, index) => index);

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createSolution(random: () => number): number[] {
  const digits = shuffled(sudokuDigits, random);
  // Permuting bands, stacks, and the lines within them preserves 3×3 boxes.
  const lineOrder = () => shuffled(groups, random).flatMap(group =>
    shuffled(groups, random).map(line => group * 3 + line),
  );
  const rows = lineOrder();
  const columns = lineOrder();
  const transpose = random() < 0.5;

  return rows.flatMap(row => columns.map(column => {
    const sourceRow = transpose ? column : row;
    const sourceColumn = transpose ? row : column;
    return digits[(sourceRow * 3 + Math.floor(sourceRow / 3) + sourceColumn) % 9];
  }));
}

export function formatSudokuPuzzle(grid: readonly number[]): string {
  return grid.join('');
}

export function generateStandardSudoku({
  random = Math.random,
  previous,
}: { random?: () => number; previous?: string } = {}): GeneratedSudoku | null {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const solution = createSolution(random);
    const grid = [...solution];
    let clues = grid.length;

    for (const cell of shuffled(cells, random)) {
      grid[cell] = 0;
      if (solveSudoku(grid).status !== 'unique') {
        grid[cell] = solution[cell];
        continue;
      }

      clues -= 1;
      if (clues === targetClues) break;
    }

    if (clues === targetClues && formatSudokuPuzzle(grid) !== previous) {
      return { grid, solution };
    }
  }

  return null;
}
