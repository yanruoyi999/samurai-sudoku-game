import { describe, expect, it } from 'vitest';
import { isSolvedSuguru, isSuguruProgress, suguruBoards } from './suguru';

const solution = [
  Array.from('13141242321351524243', Number),
  Array.from('21232434141252553131', Number),
];

describe('Suguru practice boards', () => {
  it.each(suguruBoards.map((board, index) => ({ board, index })))(
    'accepts the independently verified solution for board $index',
    ({ board, index }) => {
      expect(isSolvedSuguru(board, solution[index])).toBe(true);
      expect(isSolvedSuguru(board, board.givens)).toBe(false);
    },
  );

  it('rejects modified givens on validation and restore', () => {
    const changed = [...solution[0]];
    changed[3] = 2;
    expect(isSuguruProgress(suguruBoards[0], changed)).toBe(false);
    expect(isSolvedSuguru(suguruBoards[0], changed)).toBe(false);
  });

  it('rejects a board whose regions are correct but adjacent diagonals repeat', () => {
    const touching = [...solution[0]];
    [touching[13], touching[17]] = [touching[17], touching[13]];
    expect(isSuguruProgress(suguruBoards[0], touching)).toBe(true);
    expect(isSolvedSuguru(suguruBoards[0], touching)).toBe(false);
  });
});
