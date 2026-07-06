export type MinesweeperDifficulty = "beginner" | "intermediate" | "expert";
export type MinesweeperStatus = "ready" | "playing" | "won" | "lost";

export interface MinesweeperPreset {
  key: MinesweeperDifficulty;
  label: string;
  rows: number;
  cols: number;
  mines: number;
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface MinesweeperCell extends CellPosition {
  isMine: boolean;
  adjacentMines: number;
  isRevealed: boolean;
  isFlagged: boolean;
}

export type MinesweeperBoard = MinesweeperCell[][];

export const MINESWEEPER_PRESETS: readonly MinesweeperPreset[] = [
  { key: "beginner", label: "Beginner", rows: 9, cols: 9, mines: 10 },
  { key: "intermediate", label: "Intermediate", rows: 16, cols: 16, mines: 40 },
  { key: "expert", label: "Expert", rows: 16, cols: 30, mines: 99 },
] as const;

export function getMinesweeperPreset(key: string): MinesweeperPreset {
  return MINESWEEPER_PRESETS.find((preset) => preset.key === key) ?? MINESWEEPER_PRESETS[0];
}

export function createEmptyMinesweeperBoard(rows: number, cols: number): MinesweeperBoard {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      isMine: false,
      adjacentMines: 0,
      isRevealed: false,
      isFlagged: false,
    })),
  );
}

export function createBoardFromMinePositions(
  rows: number,
  cols: number,
  minePositions: readonly CellPosition[],
): MinesweeperBoard {
  const mineKeys = new Set(minePositions.map(positionKey));

  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      isMine: mineKeys.has(positionKey({ row, col })),
      adjacentMines: countAdjacentMines(row, col, rows, cols, mineKeys),
      isRevealed: false,
      isFlagged: false,
    })),
  );
}

export function createMinesweeperBoard({
  rows,
  cols,
  mines,
  safeCell,
  seed,
}: {
  rows: number;
  cols: number;
  mines: number;
  safeCell?: CellPosition;
  seed?: string;
}): MinesweeperBoard {
  const excluded = new Set<string>();
  if (safeCell && isInsideBoard(rows, cols, safeCell)) {
    excluded.add(positionKey(safeCell));
  }

  const positions: CellPosition[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const position = { row, col };
      if (!excluded.has(positionKey(position))) {
        positions.push(position);
      }
    }
  }

  if (mines >= positions.length + excluded.size || mines > positions.length) {
    throw new Error("Too many mines for the available board cells.");
  }

  const shuffled = shufflePositions(positions, seed);
  return createBoardFromMinePositions(rows, cols, shuffled.slice(0, mines));
}

export function revealCell(
  board: MinesweeperBoard,
  position: CellPosition,
): { board: MinesweeperBoard; hitMine: boolean; won: boolean } {
  const next = cloneBoard(board);
  const target = getCell(next, position);

  if (!target || target.isRevealed || target.isFlagged) {
    return { board: next, hitMine: false, won: isBoardWon(next) };
  }

  target.isRevealed = true;

  if (target.isMine) {
    return { board: next, hitMine: true, won: false };
  }

  if (target.adjacentMines === 0) {
    const queue: MinesweeperCell[] = [target];

    while (queue.length > 0) {
      const cell = queue.shift();
      if (!cell || cell.adjacentMines !== 0) continue;

      for (const neighborPosition of getNeighborPositions(next.length, next[0]?.length ?? 0, cell)) {
        const neighbor = getCell(next, neighborPosition);
        if (!neighbor || neighbor.isRevealed || neighbor.isFlagged || neighbor.isMine) continue;

        neighbor.isRevealed = true;
        if (neighbor.adjacentMines === 0) {
          queue.push(neighbor);
        }
      }
    }
  }

  return { board: next, hitMine: false, won: isBoardWon(next) };
}

export function toggleFlag(board: MinesweeperBoard, position: CellPosition): MinesweeperBoard {
  const next = cloneBoard(board);
  const target = getCell(next, position);
  if (!target || target.isRevealed) return next;

  target.isFlagged = !target.isFlagged;
  return next;
}

export function revealAllMines(board: MinesweeperBoard): MinesweeperBoard {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      isRevealed: cell.isMine ? true : cell.isRevealed,
    })),
  );
}

export function countFlags(board: MinesweeperBoard): number {
  return board.flat().filter((cell) => cell.isFlagged).length;
}

export function countMines(board: MinesweeperBoard): number {
  return board.flat().filter((cell) => cell.isMine).length;
}

export function countRevealedSafeCells(board: MinesweeperBoard): number {
  return board.flat().filter((cell) => cell.isRevealed && !cell.isMine).length;
}

export function isBoardWon(board: MinesweeperBoard): boolean {
  const cells = board.flat();
  return cells.some((cell) => cell.isMine) && cells.every((cell) => cell.isMine || cell.isRevealed);
}

function cloneBoard(board: MinesweeperBoard): MinesweeperBoard {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function getCell(board: MinesweeperBoard, position: CellPosition): MinesweeperCell | undefined {
  return board[position.row]?.[position.col];
}

function isInsideBoard(rows: number, cols: number, position: CellPosition): boolean {
  return position.row >= 0 && position.row < rows && position.col >= 0 && position.col < cols;
}

function getNeighborPositions(rows: number, cols: number, position: CellPosition): CellPosition[] {
  const neighbors: CellPosition[] = [];
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) continue;

      const neighbor = {
        row: position.row + rowOffset,
        col: position.col + colOffset,
      };

      if (isInsideBoard(rows, cols, neighbor)) {
        neighbors.push(neighbor);
      }
    }
  }
  return neighbors;
}

function countAdjacentMines(
  row: number,
  col: number,
  rows: number,
  cols: number,
  mineKeys: Set<string>,
): number {
  return getNeighborPositions(rows, cols, { row, col }).filter((position) =>
    mineKeys.has(positionKey(position)),
  ).length;
}

function positionKey(position: CellPosition): string {
  return `${position.row}:${position.col}`;
}

function shufflePositions(positions: CellPosition[], seed?: string): CellPosition[] {
  const shuffled = [...positions];
  const random = createSeededRandom(seed ?? `${Date.now()}-${Math.random()}`);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function createSeededRandom(seed: string): () => number {
  let state = hashSeed(seed) || 1;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
