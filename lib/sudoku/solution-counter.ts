import { GlobalPosition, getAffectedCells, globalToLocal, localToGlobal } from './coordinates';
import type { Puzzle } from './types';

const BOARD_SIZE = 21;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const cellKey = (pos: GlobalPosition) => pos.row * BOARD_SIZE + pos.col;
const fromKey = (key: number): GlobalPosition => ({
  row: Math.floor(key / BOARD_SIZE),
  col: key % BOARD_SIZE,
});

function buildPlayableCells(): GlobalPosition[] {
  const cells: GlobalPosition[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (globalToLocal({ row, col }).length > 0) {
        cells.push({ row, col });
      }
    }
  }

  return cells;
}

export const SAMURAI_PLAYABLE_CELLS = buildPlayableCells();

const PLAYABLE_KEYS = new Set(SAMURAI_PLAYABLE_CELLS.map(cellKey));
const PEER_MAP = new Map<number, GlobalPosition[]>(
  SAMURAI_PLAYABLE_CELLS.map((pos) => {
    const affected = getAffectedCells(pos);
    const peers = [
      ...affected.row,
      ...affected.col,
      ...affected.box,
      ...affected.overlap,
    ].filter((peer) => {
      const key = cellKey(peer);
      return key !== cellKey(pos) && PLAYABLE_KEYS.has(key);
    });

    const uniquePeers = new Map<number, GlobalPosition>();
    for (const peer of peers) {
      uniquePeers.set(cellKey(peer), peer);
    }

    return [cellKey(pos), Array.from(uniquePeers.values())];
  })
);

export function createEmptySamuraiBoard(): number[][] {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

export function cloneSamuraiBoard(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

export function getGlobalSolutionBoard(puzzle: Puzzle): number[][] {
  const board = createEmptySamuraiBoard();

  for (let grid = 0; grid < 5; grid++) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const global = localToGlobal({ grid: grid as 0 | 1 | 2 | 3 | 4, row, col });
        board[global.row][global.col] = puzzle.grids[grid].solution[row][col];
      }
    }
  }

  return board;
}

export function getGlobalInitialBoard(puzzle: Puzzle): number[][] {
  const board = createEmptySamuraiBoard();

  for (let grid = 0; grid < 5; grid++) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = puzzle.grids[grid].initial[row][col];
        if (value !== 0) {
          const global = localToGlobal({ grid: grid as 0 | 1 | 2 | 3 | 4, row, col });
          board[global.row][global.col] = value;
        }
      }
    }
  }

  return board;
}

export function countBoardClues(board: number[][]): number {
  return SAMURAI_PLAYABLE_CELLS.reduce(
    (total, pos) => total + (board[pos.row][pos.col] !== 0 ? 1 : 0),
    0
  );
}

export function countGridClues(board: number[][]): number[] {
  return Array.from({ length: 5 }, (_, grid) => {
    let clues = 0;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const global = localToGlobal({ grid: grid as 0 | 1 | 2 | 3 | 4, row, col });
        if (board[global.row][global.col] !== 0) {
          clues += 1;
        }
      }
    }

    return clues;
  });
}

function getCandidates(board: number[][], pos: GlobalPosition): number[] {
  if (board[pos.row][pos.col] !== 0) {
    return [];
  }

  const used = new Set<number>();
  for (const peer of PEER_MAP.get(cellKey(pos)) ?? []) {
    const value = board[peer.row][peer.col];
    if (value !== 0) {
      used.add(value);
    }
  }

  return DIGITS.filter((digit) => !used.has(digit));
}

function isConsistent(board: number[][]): boolean {
  for (const pos of SAMURAI_PLAYABLE_CELLS) {
    const value = board[pos.row][pos.col];
    if (value === 0) continue;

    for (const peer of PEER_MAP.get(cellKey(pos)) ?? []) {
      if (board[peer.row][peer.col] === value) {
        return false;
      }
    }
  }

  return true;
}

function findBestEmptyCell(board: number[][]): { pos: GlobalPosition; candidates: number[] } | null {
  let best: { pos: GlobalPosition; candidates: number[] } | null = null;

  for (const pos of SAMURAI_PLAYABLE_CELLS) {
    if (board[pos.row][pos.col] !== 0) continue;

    const candidates = getCandidates(board, pos);
    if (candidates.length === 0) {
      return { pos, candidates };
    }

    if (!best || candidates.length < best.candidates.length) {
      best = { pos, candidates };
      if (candidates.length === 1) {
        return best;
      }
    }
  }

  return best;
}

export function countSamuraiSolutions(board: number[][], limit = 2): number {
  const workingBoard = cloneSamuraiBoard(board);

  if (!isConsistent(workingBoard)) {
    return 0;
  }

  function search(solutionCount: number): number {
    if (solutionCount >= limit) {
      return solutionCount;
    }

    const next = findBestEmptyCell(workingBoard);
    if (!next) {
      return solutionCount + 1;
    }

    if (next.candidates.length === 0) {
      return solutionCount;
    }

    for (const candidate of next.candidates) {
      workingBoard[next.pos.row][next.pos.col] = candidate;
      solutionCount = search(solutionCount);
      workingBoard[next.pos.row][next.pos.col] = 0;

      if (solutionCount >= limit) {
        return solutionCount;
      }
    }

    return solutionCount;
  }

  return search(0);
}

export function hasUniqueSamuraiSolution(board: number[][]): boolean {
  return countSamuraiSolutions(board, 2) === 1;
}

export function getCellKey(pos: GlobalPosition): number {
  return cellKey(pos);
}

export function getCellFromKey(key: number): GlobalPosition {
  return fromKey(key);
}
