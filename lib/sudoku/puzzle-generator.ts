import { localToGlobal } from './coordinates';
import {
  SAMURAI_PLAYABLE_CELLS,
  cloneSamuraiBoard,
  countBoardClues,
  countGridClues,
  createEmptySamuraiBoard,
  hasUniqueSamuraiSolution,
} from './solution-counter';
import { GridData, Puzzle } from './types';

type Difficulty = 'easy' | 'medium' | 'hard' | 'evil';

interface DifficultyConfig {
  targetGlobalClues: number;
  minGridClues: number;
  estimatedTime: number;
}

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    targetGlobalClues: 185,
    minGridClues: 35,
    estimatedTime: 20,
  },
  medium: {
    targetGlobalClues: 155,
    minGridClues: 30,
    estimatedTime: 35,
  },
  hard: {
    targetGlobalClues: 135,
    minGridClues: 27,
    estimatedTime: 60,
  },
  evil: {
    targetGlobalClues: 120,
    minGridClues: 24,
    estimatedTime: 90,
  },
};

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createBaseSolution(): number[][] {
  return Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => ((row * 3 + Math.floor(row / 3) + col) % 9) + 1),
  );
}

function createRandomSolution(): number[][] {
  const base = createBaseSolution();
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const bandOrder = shuffle([0, 1, 2]);
  const stackOrder = shuffle([0, 1, 2]);
  const rowOrder = bandOrder.flatMap((band) =>
    shuffle([0, 1, 2]).map((row) => band * 3 + row)
  );
  const colOrder = stackOrder.flatMap((stack) =>
    shuffle([0, 1, 2]).map((col) => stack * 3 + col)
  );
  const transposed = Math.random() < 0.5;

  return Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => {
      const sourceRow = transposed ? rowOrder[col] : rowOrder[row];
      const sourceCol = transposed ? colOrder[row] : colOrder[col];
      return digits[base[sourceRow][sourceCol] - 1];
    })
  );
}

function transformBandsAndStacks(
  solution: number[][],
  bandOrder: [number, number, number],
  stackOrder: [number, number, number],
): number[][] {
  const rows = bandOrder.flatMap((band) => [band * 3, band * 3 + 1, band * 3 + 2]);
  const cols = stackOrder.flatMap((stack) => [stack * 3, stack * 3 + 1, stack * 3 + 2]);

  return rows.map((row) => cols.map((col) => solution[row][col]));
}

function buildSamuraiSolutions(): [number[][], number[][], number[][], number[][], number[][]] {
  const center = createRandomSolution();

  return [
    transformBandsAndStacks(center, [1, 2, 0], [1, 2, 0]),
    transformBandsAndStacks(center, [1, 2, 0], [2, 0, 1]),
    center,
    transformBandsAndStacks(center, [2, 0, 1], [1, 2, 0]),
    transformBandsAndStacks(center, [2, 0, 1], [2, 0, 1]),
  ];
}

function buildGlobalSolution(
  solutions: [number[][], number[][], number[][], number[][], number[][]],
): number[][] {
  const board = createEmptySamuraiBoard();

  for (let grid = 0; grid < 5; grid++) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const global = localToGlobal({ grid: grid as 0 | 1 | 2 | 3 | 4, row, col });
        board[global.row][global.col] = solutions[grid][row][col];
      }
    }
  }

  return board;
}

function buildGridData(
  initialBoard: number[][],
  solutions: [number[][], number[][], number[][], number[][], number[][]],
): [GridData, GridData, GridData, GridData, GridData] {
  return solutions.map((solution, grid) => ({
    initial: Array.from({ length: 9 }, (_, row) =>
      Array.from({ length: 9 }, (_, col) => {
        const global = localToGlobal({ grid: grid as 0 | 1 | 2 | 3 | 4, row, col });
        return initialBoard[global.row][global.col];
      })
    ),
    solution,
  })) as [GridData, GridData, GridData, GridData, GridData];
}

function canRemoveClue(board: number[][], config: DifficultyConfig): boolean {
  if (countBoardClues(board) < config.targetGlobalClues) {
    return false;
  }

  if (countGridClues(board).some((gridClues) => gridClues < config.minGridClues)) {
    return false;
  }

  return hasUniqueSamuraiSolution(board);
}

function createPuzzleBoard(solutionBoard: number[][], config: DifficultyConfig): number[][] {
  const puzzleBoard = cloneSamuraiBoard(solutionBoard);
  const positions = shuffle(SAMURAI_PLAYABLE_CELLS);

  for (const pos of positions) {
    if (countBoardClues(puzzleBoard) <= config.targetGlobalClues) {
      break;
    }

    const value = puzzleBoard[pos.row][pos.col];
    puzzleBoard[pos.row][pos.col] = 0;

    if (!canRemoveClue(puzzleBoard, config)) {
      puzzleBoard[pos.row][pos.col] = value;
    }
  }

  return puzzleBoard;
}

/**
 * 生成一个新的武士数独谜题。
 *
 * 生成流程：
 * 1. 随机化完整解盘，避免每日谜题共用同一个答案。
 * 2. 在 21x21 全局棋盘上挖空，重叠区只当作一个真实单元。
 * 3. 每次挖空后用回溯求解器确认仍然只有唯一解。
 */
export function generateSamuraiPuzzle(difficulty: Difficulty = 'medium'): Puzzle {
  const config = DIFFICULTY_CONFIG[difficulty];
  const solutions = buildSamuraiSolutions();
  const solutionBoard = buildGlobalSolution(solutions);
  const initialBoard = createPuzzleBoard(solutionBoard, config);
  const grids = buildGridData(initialBoard, solutions);
  const now = new Date();

  return {
    id: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${Date.now()}`,
    difficulty,
    grids,
    metadata: {
      createdAt: now.toISOString(),
      estimatedTime: config.estimatedTime,
      checksum: `generated-${Date.now()}`,
      tags: ['generated', difficulty],
    },
  };
}

/**
 * 快速生成一个新谜题（用于"新游戏"按钮）
 */
export function generateQuickPuzzle(): Puzzle {
  return generateSamuraiPuzzle('medium');
}
