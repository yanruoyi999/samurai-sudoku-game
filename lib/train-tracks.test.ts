import { describe, expect, it } from 'vitest';
import { addTrackCell, isSolvedTrack, tracksBoards } from './train-tracks';

function enumerate(board: (typeof tracksBoards)[number]) {
  const results: number[][] = [];
  const length = board.rows.reduce((sum, count) => sum + count, 0);
  function visit(path: number[]) {
    const last = path[path.length - 1];
    if (last === board.end) {
      if (path.length !== length || !path.includes(board.given)) return;
      const rows = Array(5).fill(0);
      const columns = Array(5).fill(0);
      for (const cell of path) {
        rows[Math.floor(cell / 5)]++;
        columns[cell % 5]++;
      }
      if (rows.every((count, index) => count === board.rows[index]) &&
          columns.every((count, index) => count === board.columns[index])) results.push(path);
      return;
    }
    if (path.length >= length) return;
    for (const step of [-5, -1, 1, 5]) {
      const next = last + step;
      if (next < 0 || next > 24 || path.includes(next)) continue;
      if (Math.abs(step) === 1 && Math.floor(last / 5) !== Math.floor(next / 5)) continue;
      visit([...path, next]);
    }
  }
  visit([board.start]);
  return results;
}

describe('original Train Tracks boards', () => {
  it('independently enumerates one legal A-to-B route per board', () => {
    for (const board of tracksBoards) {
      const solutions = enumerate(board);
      expect(solutions).toHaveLength(1);
      expect(isSolvedTrack(board, solutions[0])).toBe(true);
    }
  });

  it('blocks row wrapping, gaps, repeated cells and extending past B', () => {
    const [, board] = tracksBoards;
    const [solution] = enumerate(board);
    for (const cell of [5, 12]) expect(addTrackCell(board, [4], cell)).toEqual([4]);
    expect(addTrackCell(board, [4], 3)).toEqual([4, 3]);
    expect(addTrackCell(board, [4], 9)).toEqual([4, 9]);
    expect(addTrackCell(board, [4, 3], 4)).toEqual([4, 3]);
    expect(addTrackCell(board, solution, 21)).toEqual(solution);
    expect(isSolvedTrack(board, solution.slice(0, -1))).toBe(false);
    expect(isSolvedTrack(board, [4, 9, 8, 7, 12, 17, 16, 15, 20])).toBe(false);
  });
});
