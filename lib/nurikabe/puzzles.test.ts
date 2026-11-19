import { describe, expect, it } from 'vitest';
import { checkBoard, checkDeduction, deductions, practiceClues, lessonClues, SIZE } from './puzzles';
import type { Mark } from './puzzles';

function board(rows: string[]): Mark[] {
  return rows.join('').split('').map((cell) => cell === '#' ? 'sea' : 'island');
}

describe('Nurikabe lesson', () => {
  it('checks the location, mark and reason independently', () => {
    expect(checkDeduction(deductions[0], 0, 'sea', 'size')).toBe('cell');
    expect(checkDeduction(deductions[0], 12, 'island', 'size')).toBe('mark');
    expect(checkDeduction(deductions[0], 12, 'sea', 'connected')).toBe('reason');
    expect(checkDeduction(deductions[0], 12, 'sea', 'size')).toBe('correct');
    expect(checkDeduction(deductions[1], 7, 'sea', 'connected')).toBe('correct');
    expect(checkDeduction(deductions[2], 21, 'island', 'square')).toBe('correct');
  });

  it('agrees with the verified lesson solution in each teaching position', () => {
    const solution = board(['.2#3.', '####.', '#1#1#', '.####', '3.#2.']);
    expect(checkBoard(lessonClues, solution)).toBe('solved');
    for (const step of deductions) {
      expect(solution[step.cell]).toBe(step.mark);
      expect(step.sea.every((cell) => solution[cell] === 'sea')).toBe(true);
    }
  });
});

describe('Nurikabe final submission', () => {
  it('checks the practice grid only when all 25 cells are marked', () => {
    const solution = board(['#1#.2', '#####', '1#.2#', '####2', '.3.#.']);
    expect(checkBoard(practiceClues, Array<Mark>(SIZE * SIZE).fill('blank'))).toBe('incomplete');
    expect(checkBoard(practiceClues, solution.slice(0, -1))).toBe('incomplete');
    expect(checkBoard(practiceClues, solution)).toBe('solved');
    solution[0] = 'island';
    expect(checkBoard(practiceClues, solution)).toBe('invalid');
  });

  it('rejects disconnected sea, solid sea squares and islands without exactly one clue', () => {
    expect(checkBoard({ 12: 21 }, board(['..#..', '..#..', '.....', '..#..', '..#..']))).toBe('invalid');
    expect(checkBoard({ 24: 1 }, board(['#####', '#####', '#####', '#####', '####.']))).toBe('invalid');
    const solution = board(['#1#.2', '#####', '1#.2#', '####2', '.3.#.']);
    expect(checkBoard({ ...practiceClues, 3: 1 }, solution)).toBe('invalid');
    expect(checkBoard({ ...practiceClues, 21: undefined }, solution)).toBe('invalid');
  });
});
