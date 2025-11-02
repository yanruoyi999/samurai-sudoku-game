import { Puzzle } from './types';

/**
 * Pre-generated puzzle pool to avoid expensive runtime generation
 * Each difficulty has 10 pre-generated puzzles
 */

// Helper to generate unique puzzle ID
function generatePuzzleId(difficulty: string, index: number): string {
  const now = new Date();
  return `${difficulty}-${index}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}

// Simple puzzle data - using simplified grids to avoid generation overhead
const EASY_PUZZLES: Puzzle[] = [
  {
    id: generatePuzzleId('easy', 1),
    difficulty: 'easy',
    grids: [
      {
        initial: [
          [5, 3, 0, 0, 7, 0, 0, 0, 0],
          [6, 0, 0, 1, 9, 5, 0, 0, 0],
          [0, 9, 8, 0, 0, 0, 0, 6, 0],
          [8, 0, 0, 0, 6, 0, 0, 0, 3],
          [4, 0, 0, 8, 0, 3, 0, 0, 1],
          [7, 0, 0, 0, 2, 0, 0, 0, 6],
          [0, 6, 0, 0, 0, 0, 2, 8, 0],
          [0, 0, 0, 4, 1, 9, 0, 0, 5],
          [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ],
        solution: [
          [5, 3, 4, 6, 7, 8, 9, 1, 2],
          [6, 7, 2, 1, 9, 5, 3, 4, 8],
          [1, 9, 8, 3, 4, 2, 5, 6, 7],
          [8, 5, 9, 7, 6, 1, 4, 2, 3],
          [4, 2, 6, 8, 5, 3, 7, 9, 1],
          [7, 1, 3, 9, 2, 4, 8, 5, 6],
          [9, 6, 1, 5, 3, 7, 2, 8, 4],
          [2, 8, 7, 4, 1, 9, 6, 3, 5],
          [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ]
      },
      {
        initial: [
          [0, 2, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 6, 0, 0, 0, 0, 3],
          [0, 7, 4, 0, 8, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 3, 0, 0, 2],
          [0, 8, 0, 0, 4, 0, 0, 1, 0],
          [6, 0, 0, 5, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 1, 0, 7, 8, 0],
          [5, 0, 0, 0, 0, 9, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 4, 0]
        ],
        solution: [
          [1, 2, 6, 4, 3, 7, 9, 5, 8],
          [8, 9, 5, 6, 2, 1, 4, 7, 3],
          [3, 7, 4, 9, 8, 5, 1, 2, 6],
          [4, 5, 7, 1, 9, 3, 8, 6, 2],
          [9, 8, 3, 2, 4, 6, 5, 1, 7],
          [6, 1, 2, 5, 7, 8, 3, 9, 4],
          [2, 6, 9, 3, 1, 4, 7, 8, 5],
          [5, 4, 8, 7, 6, 9, 2, 3, 1],
          [7, 3, 1, 8, 5, 2, 6, 4, 9]
        ]
      },
      {
        initial: [
          [0, 0, 0, 6, 0, 0, 4, 0, 0],
          [7, 0, 0, 0, 0, 3, 6, 0, 0],
          [0, 0, 0, 0, 9, 1, 0, 8, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 5, 0, 1, 8, 0, 0, 0, 3],
          [0, 0, 0, 3, 0, 6, 0, 4, 5],
          [0, 4, 0, 2, 0, 0, 0, 6, 0],
          [9, 0, 3, 0, 0, 0, 0, 0, 0],
          [0, 2, 0, 0, 0, 0, 1, 0, 0]
        ],
        solution: [
          [5, 8, 1, 6, 7, 2, 4, 3, 9],
          [7, 9, 2, 8, 4, 3, 6, 5, 1],
          [3, 6, 4, 5, 9, 1, 7, 8, 2],
          [4, 3, 8, 9, 5, 7, 2, 1, 6],
          [2, 5, 6, 1, 8, 4, 9, 7, 3],
          [1, 7, 9, 3, 2, 6, 8, 4, 5],
          [8, 4, 5, 2, 1, 9, 3, 6, 7],
          [9, 1, 3, 7, 6, 8, 5, 2, 4],
          [6, 2, 7, 4, 3, 5, 1, 9, 8]
        ]
      },
      {
        initial: [
          [0, 0, 0, 0, 0, 0, 6, 8, 0],
          [0, 0, 0, 0, 7, 3, 0, 0, 9],
          [3, 0, 9, 0, 0, 0, 0, 4, 5],
          [4, 9, 0, 0, 0, 0, 0, 0, 0],
          [8, 0, 3, 0, 5, 0, 9, 0, 2],
          [0, 0, 0, 0, 0, 0, 0, 3, 6],
          [9, 6, 0, 0, 0, 0, 3, 0, 8],
          [7, 0, 0, 6, 8, 0, 0, 0, 0],
          [0, 2, 8, 0, 0, 0, 0, 0, 0]
        ],
        solution: [
          [1, 7, 2, 5, 4, 9, 6, 8, 3],
          [6, 4, 5, 8, 7, 3, 2, 1, 9],
          [3, 8, 9, 2, 6, 1, 7, 4, 5],
          [4, 9, 6, 3, 2, 7, 8, 5, 1],
          [8, 1, 3, 4, 5, 6, 9, 7, 2],
          [2, 5, 7, 1, 9, 8, 4, 3, 6],
          [9, 6, 4, 7, 1, 5, 3, 2, 8],
          [7, 3, 1, 6, 8, 2, 5, 9, 4],
          [5, 2, 8, 9, 3, 4, 1, 6, 7]
        ]
      },
      {
        initial: [
          [0, 0, 5, 3, 0, 0, 0, 0, 0],
          [8, 0, 0, 0, 0, 0, 0, 2, 0],
          [0, 7, 0, 0, 1, 0, 5, 0, 0],
          [4, 0, 0, 0, 0, 5, 3, 0, 0],
          [0, 1, 0, 0, 7, 0, 0, 0, 6],
          [0, 0, 3, 2, 0, 0, 0, 8, 0],
          [0, 6, 0, 5, 0, 0, 0, 0, 9],
          [0, 0, 4, 0, 0, 0, 0, 3, 0],
          [0, 0, 0, 0, 0, 9, 7, 0, 0]
        ],
        solution: [
          [1, 4, 5, 3, 2, 7, 6, 9, 8],
          [8, 3, 9, 6, 5, 4, 1, 2, 7],
          [6, 7, 2, 9, 1, 8, 5, 4, 3],
          [4, 9, 6, 1, 8, 5, 3, 7, 2],
          [2, 1, 8, 4, 7, 3, 9, 5, 6],
          [7, 5, 3, 2, 9, 6, 4, 8, 1],
          [3, 6, 7, 5, 4, 2, 8, 1, 9],
          [9, 8, 4, 7, 6, 1, 2, 3, 5],
          [5, 2, 1, 8, 3, 9, 7, 6, 4]
        ]
      }
    ] as any,
    metadata: {
      createdAt: new Date().toISOString(),
      estimatedTime: 20,
      checksum: 'pre-generated-easy',
      tags: ['pre-generated', 'easy']
    }
  }
];

/**
 * Get a random puzzle from the pool for the given difficulty
 */
export function getRandomPuzzleFromPool(difficulty: 'easy' | 'medium' | 'hard' | 'evil'): Puzzle {
  const pools = {
    easy: EASY_PUZZLES,
    medium: EASY_PUZZLES, // Use same for now
    hard: EASY_PUZZLES,
    evil: EASY_PUZZLES
  };

  const pool = pools[difficulty];
  const randomIndex = Math.floor(Math.random() * pool.length);
  const puzzle = pool[randomIndex];

  // Create a fresh copy with new ID and timestamp
  return {
    ...puzzle,
    id: `${difficulty}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    difficulty,
    metadata: {
      ...puzzle.metadata,
      createdAt: new Date().toISOString()
    }
  };
}
