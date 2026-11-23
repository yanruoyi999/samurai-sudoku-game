export type SuguruBoard = {
  regions: string;
  givens: readonly number[];
};

export const suguruColumns = 5;
export const suguruRows = 4;
export const suguruBoards = [
  {
    regions: 'AAECC' + 'AAEBC' + 'DDDBC' + 'DDBBC',
    givens: [
      0, 0, 0, 4, 0,
      2, 0, 0, 3, 2,
      0, 3, 0, 0, 0,
      0, 0, 0, 4, 0,
    ],
  },
  {
    regions: 'CDDBB' + 'CCAAB' + 'CEAAB' + 'CEEAB',
    givens: [
      0, 0, 0, 0, 0,
      4, 0, 0, 0, 4,
      1, 2, 5, 2, 0,
      0, 0, 0, 0, 0,
    ],
  },
] as const satisfies readonly SuguruBoard[];

export function isSuguruProgress(board: SuguruBoard, value: unknown): value is number[] {
  return Array.isArray(value) && value.length === board.givens.length &&
    value.every((digit, cell) => Number.isInteger(digit) && digit >= 0 && digit <= 5 &&
      (board.givens[cell] === 0 || digit === board.givens[cell]));
}

export function isSolvedSuguru(board: SuguruBoard, cells: readonly number[]): boolean {
  if (!isSuguruProgress(board, cells) || cells.includes(0)) return false;
  const regions = Array.from(board.regions);
  return cells.every((digit, cell) => {
    const region = regions[cell];
    const row = Math.floor(cell / suguruColumns);
    const column = cell % suguruColumns;
    return digit <= regions.filter(label => label === region).length &&
      cells.slice(0, cell).every((previous, index) => {
        if (previous !== digit) return true;
        const adjacent = Math.abs(row - Math.floor(index / suguruColumns)) <= 1 &&
          Math.abs(column - index % suguruColumns) <= 1;
        return regions[index] !== region && !adjacent;
      });
  });
}
