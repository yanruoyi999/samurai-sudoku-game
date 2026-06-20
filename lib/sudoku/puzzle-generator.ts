import { Puzzle, GridData } from './types';

// Fisher-Yates 洗牌算法
function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 从完整的数独网格生成谜题（移除一些数字）
function createPuzzleFromSolution(solution: number[][], cellsToRemove: number): number[][] {
  const puzzle = solution.map(row => [...row]);

  const positions: Array<[number, number]> = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      positions.push([i, j]);
    }
  }

  shuffle(positions);

  for (let i = 0; i < Math.min(cellsToRemove, positions.length); i++) {
    const [row, col] = positions[i];
    puzzle[row][col] = 0;
  }

  return puzzle;
}

function createBaseSolution(): number[][] {
  return Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => ((row * 3 + Math.floor(row / 3) + col) % 9) + 1),
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
  const center = createBaseSolution();

  return [
    // Grid 0 bottom-right = center top-left
    transformBandsAndStacks(center, [1, 2, 0], [1, 2, 0]),
    // Grid 1 bottom-left = center top-right
    transformBandsAndStacks(center, [1, 2, 0], [2, 0, 1]),
    center,
    // Grid 3 top-right = center bottom-left
    transformBandsAndStacks(center, [2, 0, 1], [1, 2, 0]),
    // Grid 4 top-left = center bottom-right
    transformBandsAndStacks(center, [2, 0, 1], [2, 0, 1]),
  ];
}

/**
 * 生成一个新的武士数独谜题
 * @param difficulty 难度：easy (简单), medium (中等), hard (困难), evil (极难)
 * @returns 完整的武士数独谜题
 */
export function generateSamuraiPuzzle(difficulty: 'easy' | 'medium' | 'hard' | 'evil' = 'medium'): Puzzle {
  // 根据难度决定要移除的单元格数量
  const cellsToRemove = {
    easy: 35,      // 移除35个单元格（保留46个）
    medium: 45,    // 移除45个单元格（保留36个）
    hard: 55,      // 移除55个单元格（保留26个）
    evil: 65,      // 移除65个单元格（保留16个）- Evil 难度！
  }[difficulty];

  const finalSolutions = buildSamuraiSolutions();

  // 为每个网格创建谜题
  const grids = finalSolutions.map(solution => ({
    initial: createPuzzleFromSolution(solution, cellsToRemove),
    solution: solution,
  })) as [GridData, GridData, GridData, GridData, GridData];

  // 生成谜题ID
  const now = new Date();
  const id = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${Date.now()}`;

  // 估计完成时间（分钟）
  const estimatedTime = {
    easy: 20,
    medium: 35,
    hard: 60,
    evil: 90,    // Evil 难度预计需要 90 分钟！
  }[difficulty];

  return {
    id,
    difficulty,
    grids,
    metadata: {
      createdAt: now.toISOString(),
      estimatedTime,
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
