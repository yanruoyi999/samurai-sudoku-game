import { describe, expect, it } from "vitest";

import {
  countFlags,
  countMines,
  createBoardFromMinePositions,
  createMinesweeperBoard,
  revealCell,
  toggleFlag,
} from "./engine";

describe("minesweeper engine", () => {
  it("creates deterministic boards while keeping the first clicked cell safe", () => {
    const first = createMinesweeperBoard({
      rows: 9,
      cols: 9,
      mines: 10,
      safeCell: { row: 4, col: 4 },
      seed: "fixed-board",
    });
    const second = createMinesweeperBoard({
      rows: 9,
      cols: 9,
      mines: 10,
      safeCell: { row: 4, col: 4 },
      seed: "fixed-board",
    });

    expect(first[4][4].isMine).toBe(false);
    expect(countMines(first)).toBe(10);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it("counts adjacent mines around each cell", () => {
    const board = createBoardFromMinePositions(3, 3, [
      { row: 0, col: 0 },
      { row: 2, col: 2 },
    ]);

    expect(board[1][1].adjacentMines).toBe(2);
    expect(board[0][1].adjacentMines).toBe(1);
    expect(board[2][1].adjacentMines).toBe(1);
  });

  it("flood reveals empty cells and wins when all safe cells are open", () => {
    const board = createBoardFromMinePositions(3, 3, [{ row: 2, col: 2 }]);
    const result = revealCell(board, { row: 0, col: 0 });

    expect(result.hitMine).toBe(false);
    expect(result.won).toBe(true);
    expect(result.board[2][2].isRevealed).toBe(false);
  });

  it("keeps flagged cells hidden when a reveal is attempted", () => {
    const board = createBoardFromMinePositions(2, 2, [{ row: 1, col: 1 }]);
    const flagged = toggleFlag(board, { row: 0, col: 0 });
    const result = revealCell(flagged, { row: 0, col: 0 });

    expect(countFlags(result.board)).toBe(1);
    expect(result.board[0][0].isRevealed).toBe(false);
    expect(result.hitMine).toBe(false);
  });

  it("reports a hit when a mine is revealed", () => {
    const board = createBoardFromMinePositions(2, 2, [{ row: 1, col: 1 }]);
    const result = revealCell(board, { row: 1, col: 1 });

    expect(result.hitMine).toBe(true);
    expect(result.won).toBe(false);
  });
});
