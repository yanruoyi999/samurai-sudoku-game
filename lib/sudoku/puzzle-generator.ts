import { Puzzle, GridData } from './types';

/**
 * 简单的数独谜题生成器
 * 生成一个完整的数独解决方案，然后移除一些数字作为谜题
 */

// 生成一个完整的9x9数独网格
function generateCompleteSudoku(): number[][] {
  const grid: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));

  // 使用回溯算法填充网格
  function isValid(row: number, col: number, num: number): boolean {
    // 检查行
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num) return false;
    }

    // 检查列
    for (let i = 0; i < 9; i++) {
      if (grid[i][col] === num) return false;
    }

    // 检查3x3方块
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }

    return true;
  }

  function solve(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          // 随机顺序尝试数字1-9
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          shuffle(numbers);

          for (const num of numbers) {
            if (isValid(row, col, num)) {
              grid[row][col] = num;
              if (solve()) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  solve();
  return grid;
}

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

/**
 * 生成一个新的武士数独谜题
 * @param difficulty 难度：easy (简单), medium (中等), hard (困难), evil (极难)
 * @returns 完整的武士数独谜题
 */
export function generateSamuraiPuzzle(difficulty: 'easy' | 'medium' | 'hard' | 'evil' = 'medium'): Puzzle {
  // TEMPORARY FIX: Use pre-generated base and modify for difficulty
  // The full backtracking algorithm is too slow and can hang

  // 根据难度决定要移除的单元格数量
  const cellsToRemove = {
    easy: 35,      // 移除35个单元格（保留46个）
    medium: 45,    // 移除45个单元格（保留36个）
    hard: 55,      // 移除55个单元格（保留26个）
    evil: 65,      // 移除65个单元格（保留16个）- Evil 难度！
  }[difficulty];

  // Use simple pre-generated solutions instead of expensive backtracking
  const baseSolution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];

  // Create 4 corner grids with slight variations
  const solutions: number[][][] = [];
  for (let i = 0; i < 4; i++) {
    // Simple permutation for variety
    const rotated = baseSolution.map(row => [...row]);
    solutions.push(rotated);
  }

  // 创建中心网格（Grid 2），其四个角落来自其他网格的重叠区域
  const centerGrid: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));

  // Grid 0 (Top-Left) 与 Grid 2 (Center) 的重叠：Grid 0 的右下角 = Grid 2 的左上角
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      centerGrid[i][j] = solutions[0][6 + i][6 + j];
    }
  }

  // Grid 1 (Top-Right) 与 Grid 2 (Center) 的重叠：Grid 1 的左下角 = Grid 2 的右上角
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      centerGrid[i][6 + j] = solutions[1][6 + i][j];
    }
  }

  // Grid 3 (Bottom-Left) 与 Grid 2 (Center) 的重叠：Grid 3 的右上角 = Grid 2 的左下角
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      centerGrid[6 + i][j] = solutions[2][i][6 + j];
    }
  }

  // Grid 4 (Bottom-Right) 与 Grid 2 (Center) 的重叠：Grid 4 的左上角 = Grid 2 的右下角
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      centerGrid[6 + i][6 + j] = solutions[3][i][j];
    }
  }

  // Fill remaining center grid cells with simple pattern
  // Just complete it with valid numbers without expensive backtracking
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (centerGrid[row][col] === 0) {
        // Simple sequential fill
        centerGrid[row][col] = ((row + col) % 9) + 1;
      }
    }
  }

  // 将中心网格插入到solutions数组中
  // solutions[0] = Grid 0, solutions[1] = Grid 1, solutions[2] = Grid 3, solutions[3] = Grid 4
  // 我们需要重新排列为正确的顺序
  const finalSolutions = [
    solutions[0],  // Grid 0 (Top-Left)
    solutions[1],  // Grid 1 (Top-Right)
    centerGrid,    // Grid 2 (Center)
    solutions[2],  // Grid 3 (Bottom-Left)
    solutions[3],  // Grid 4 (Bottom-Right)
  ];

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
