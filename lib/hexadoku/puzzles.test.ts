import { describe, expect, it } from 'vitest';
import { hexadokuPuzzles, readHexadokuProgress } from './puzzles';

const full = (1 << 16) - 1;

function solve(board: number[], answers: number[][]) {
  let choice = -1;
  let options = 0;
  let smallest = 17;
  for (let position = 0; position < 256; position += 1) {
    if (board[position]) continue;
    const row = Math.floor(position / 16);
    const column = position % 16;
    const firstRow = row - (row % 4);
    const firstColumn = column - (column % 4);
    let mask = full;
    for (let index = 0; index < 16; index += 1) {
      for (const value of [
        board[row * 16 + index], board[index * 16 + column],
        board[(firstRow + Math.floor(index / 4)) * 16 + firstColumn + index % 4],
      ]) {
        if (value) mask &= ~(1 << (value - 1));
      }
    }
    let count = 0;
    for (let available = mask; available; available &= available - 1) count += 1;
    if (count === 0) return;
    if (count < smallest) [choice, options, smallest] = [position, mask, count];
  }
  if (choice < 0) {
    answers.push([...board]);
    return;
  }
  for (let value = 1; value <= 16 && answers.length < 2; value += 1) {
    if ((options & (1 << (value - 1))) === 0) continue;
    board[choice] = value;
    solve(board, answers);
  }
  board[choice] = 0;
}

describe('original 16×16 puzzle set', () => {
  it('has six different boards with one solution each, independently checked', () => {
    expect(new Set(hexadokuPuzzles.map(puzzle => puzzle.givens.join(','))).size).toBe(6);
    for (const puzzle of hexadokuPuzzles) {
      expect(puzzle.givens).toHaveLength(256);
      expect(puzzle.solution).toHaveLength(256);
      expect(puzzle.givens.filter(value => value === 0)).toHaveLength(puzzle.blanks);
      expect(puzzle.blanks).toBeGreaterThanOrEqual(44);
      const target = Array.from({ length: 16 }, (_, i) => i + 1);
      for (let i = 0; i < 16; i += 1) {
        const units = [
          puzzle.solution.slice(i * 16, (i + 1) * 16),
          target.map((_, j) => puzzle.solution[j * 16 + i]),
          target.map((_, j) => puzzle.solution[(Math.floor(i / 4) * 4 + Math.floor(j / 4)) * 16 + i % 4 * 4 + j % 4]),
        ];
        for (const unit of units) expect([...unit].sort((a, b) => a - b)).toEqual(target);
      }
      const answers: number[][] = [];
      solve([...puzzle.givens], answers);
      expect(answers).toEqual([puzzle.solution]);
    }
  });

  it('restores only valid entries and notes in editable squares', () => {
    const puzzle = hexadokuPuzzles[0];
    const entries = Array<number>(256).fill(99);
    const notes = Array<number>(256).fill(65536);
    const blank = puzzle.givens.indexOf(0);
    const fixed = puzzle.givens.findIndex(Boolean);
    entries[blank] = 16;
    const data = readHexadokuProgress(JSON.stringify({ entries, notes }), puzzle);
    expect(data.entries[blank]).toBe(16);
    expect(data.entries[fixed]).toBe(0);
    expect(data.notes.every(value => value === 0)).toBe(true);
    expect(readHexadokuProgress('{bad', puzzle).entries).toEqual(Array(256).fill(0));
  });
});
