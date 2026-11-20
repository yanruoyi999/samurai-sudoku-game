export type TracksBoard = {
  rows: readonly number[];
  columns: readonly number[];
  start: number;
  end: number;
  given: number;
};

export const tracksBoards: readonly [TracksBoard, TracksBoard] = [
  { rows: [1, 2, 1, 3, 4], columns: [2, 4, 1, 2, 2], start: 0, end: 24, given: 11 },
  { rows: [2, 1, 2, 3, 1], columns: [2, 1, 2, 3, 1], start: 4, end: 20, given: 8 },
];

export function addTrackCell(board: TracksBoard, path: number[], cell: number): number[] {
  const last = path[path.length - 1];
  const distance = Math.abs(Math.floor(last / 5) - Math.floor(cell / 5)) + Math.abs(last % 5 - cell % 5);
  if (!Number.isInteger(cell) || cell < 0 || cell >= 25 || last === board.end || distance !== 1 || path.includes(cell)) {
    return path;
  }
  return [...path, cell];
}

export function isSolvedTrack(board: TracksBoard, path: number[]): boolean {
  const start = [board.start];
  const legalPath = path.slice(1).reduce((route, cell) => addTrackCell(board, route, cell), start);
  if (path[0] !== board.start || legalPath.length !== path.length ||
      path[path.length - 1] !== board.end || !path.includes(board.given)) return false;
  return board.rows.every((count, row) => path.filter(cell => Math.floor(cell / 5) === row).length === count) &&
    board.columns.every((count, column) => path.filter(cell => cell % 5 === column).length === count);
}
