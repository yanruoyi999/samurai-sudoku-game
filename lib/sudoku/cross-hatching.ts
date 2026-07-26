export interface SudokuCellPosition {
  row: number;
  column: number;
}

export interface CrossHatchingAnalysis {
  digit: number;
  boxRow: number;
  boxColumn: number;
  rowBlocked: number[];
  columnBlocked: number[];
  candidates: SudokuCellPosition[];
  isForced: boolean;
}

export interface CrossHatchingExample {
  id: string;
  digit: number;
  boxRow: number;
  boxColumn: number;
  board: readonly (readonly number[])[];
  solutionCell: SudokuCellPosition;
}

function validateBoard(board: readonly (readonly number[])[]) {
  if (board.length !== 9) {
    throw new Error('A Sudoku board must have 9 rows.');
  }

  for (const row of board) {
    if (row.length !== 9) {
      throw new Error('Every Sudoku row must have 9 cells.');
    }
    if (row.some((cell) => !Number.isInteger(cell) || cell < 0 || cell > 9)) {
      throw new Error('Sudoku cells must be integers from 0 through 9.');
    }
  }
}

export function analyzeCrossHatching(
  board: readonly (readonly number[])[],
  digit: number,
  boxRow: number,
  boxColumn: number,
): CrossHatchingAnalysis {
  validateBoard(board);

  if (!Number.isInteger(digit) || digit < 1 || digit > 9) {
    throw new Error('The cross-hatching digit must be from 1 through 9.');
  }
  if (
    !Number.isInteger(boxRow)
    || !Number.isInteger(boxColumn)
    || boxRow < 0
    || boxRow > 2
    || boxColumn < 0
    || boxColumn > 2
  ) {
    throw new Error('The box row and box column must be from 0 through 2.');
  }

  const rowStart = boxRow * 3;
  const columnStart = boxColumn * 3;
  const targetRows = [rowStart, rowStart + 1, rowStart + 2];
  const targetColumns = [columnStart, columnStart + 1, columnStart + 2];
  const rowBlocked = targetRows.filter((row) => board[row].includes(digit));
  const columnBlocked = targetColumns.filter((column) =>
    board.some((row) => row[column] === digit),
  );
  const candidates: SudokuCellPosition[] = [];

  for (const row of targetRows) {
    for (const column of targetColumns) {
      if (
        board[row][column] === 0
        && !rowBlocked.includes(row)
        && !columnBlocked.includes(column)
      ) {
        candidates.push({ row, column });
      }
    }
  }

  return {
    digit,
    boxRow,
    boxColumn,
    rowBlocked,
    columnBlocked,
    candidates,
    isForced: candidates.length === 1,
  };
}

const BASE_PUZZLE = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
] as const;

function copyBoard() {
  return BASE_PUZZLE.map((row) => [...row]);
}

const topLeftSeven = copyBoard();
topLeftSeven[2][8] = 7;
topLeftSeven[7][2] = 7;

const bottomRightFour = copyBoard();
bottomRightFour[1][7] = 4;
bottomRightFour[3][6] = 4;
bottomRightFour[8][1] = 4;

const centerSix = copyBoard();
centerSix[3][4] = 0;
centerSix[0][3] = 6;
centerSix[4][2] = 6;
centerSix[8][5] = 6;

export const CROSS_HATCHING_EXAMPLES: readonly CrossHatchingExample[] = [
  {
    id: 'top-left-seven',
    digit: 7,
    boxRow: 0,
    boxColumn: 0,
    board: topLeftSeven,
    solutionCell: { row: 1, column: 1 },
  },
  {
    id: 'bottom-right-four',
    digit: 4,
    boxRow: 2,
    boxColumn: 2,
    board: bottomRightFour,
    solutionCell: { row: 6, column: 8 },
  },
  {
    id: 'center-six',
    digit: 6,
    boxRow: 1,
    boxColumn: 1,
    board: centerSix,
    solutionCell: { row: 3, column: 4 },
  },
];
