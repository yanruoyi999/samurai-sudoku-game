import { describe, expect, it } from 'vitest';
import { puzzles, arePeers, conflicts, isComplete, restoreProgress } from './puzzles';

function countSolutions(regions: string, givens: string) {
  const values = [...givens].map(Number);
  const groups = values.map((_, i) => [Math.floor(i / 9), 9 + i % 9, 18 + Number(regions[i])]);
  const used = Array.from({ length: 27 }, () => new Set<number>());
  values.forEach((value, i) => { if (value) groups[i].forEach(g => used[g].add(value)); });
  const solutions: string[] = [];
  function search() {
    let pick = -1;
    let choices: number[] = [];
    values.forEach((value, i) => {
      if (value) return;
      const next = [1,2,3,4,5,6,7,8,9].filter(d => groups[i].every(g => !used[g].has(d)));
      if (pick === -1 || next.length < choices.length) { pick = i; choices = next; }
    });
    if (pick === -1) { solutions.push(values.join('')); return; }
    for (const value of choices) {
      values[pick] = value;
      groups[pick].forEach(g => used[g].add(value));
      search();
      groups[pick].forEach(g => used[g].delete(value));
      values[pick] = 0;
      if (solutions.length === 2) break;
    }
  }
  search();
  return solutions;
}

describe('original irregular Sudoku', () => {
  it('ships three distinct layouts with nine connected regions and one solution each', () => {
    expect(puzzles).toHaveLength(3);
    expect(new Set(puzzles.map(p => p.regions)).size).toBe(3);
    expect(new Set(puzzles.map(p => p.id)).size).toBe(3);
    for (const {regions, givens, solution} of puzzles) {
      expect(regions).toMatch(/^[0-8]{81}$/);
      expect(givens).toMatch(/^[0-9]{81}$/);
      expect(givens).toContain('0');
      expect(solution).toMatch(/^[1-9]{81}$/);
      for (const label of '012345678') {
        const cells = [...regions].flatMap((value, i) => value === label ? [i] : []);
        expect(cells).toHaveLength(9);
        const seen = new Set([cells[0]]);
        for (const i of seen) {
          for (const j of cells) if (Math.abs(Math.floor(i / 9) - Math.floor(j / 9)) + Math.abs(i % 9 - j % 9) === 1) seen.add(j);
        }
        expect(seen.size).toBe(9);
        const boxes = new Set(cells.map(i => Math.floor(i / 27) * 3 + Math.floor(i % 9 / 3)));
        expect(boxes.size).toBeGreaterThan(1);
      }
      expect(conflicts(regions, [...givens].map(Number)).size).toBe(0);
      expect(conflicts(regions, [...solution].map(Number)).size).toBe(0);
      expect(countSolutions(regions, givens)).toEqual([solution]);
      expect(isComplete(regions, [...solution].map(Number))).toBe(true);
      expect(isComplete(regions, [...givens].map(Number))).toBe(false);
    }
  });

  it('flags a duplicate across a former box boundary, and permits a non-peer inside a former box', () => {
    const { regions } = puzzles[0];
    const a = [...regions].findIndex((r, i) => [...regions].some((s, j) => s === r && Math.floor(i / 9) !== Math.floor(j / 9) && i % 9 !== j % 9 && Math.floor(i % 9 / 3) !== Math.floor(j % 9 / 3)));
    const b = [...regions].findIndex((s, j) => s === regions[a] && Math.floor(a / 9) !== Math.floor(j / 9) && a % 9 !== j % 9 && Math.floor(a % 9 / 3) !== Math.floor(j % 9 / 3));
    expect(a).toBeGreaterThanOrEqual(0);
    expect(b).toBeGreaterThanOrEqual(0);
    expect(arePeers(regions, a, b)).toBe(true);
    const sameBox = [...regions].findIndex((r, i) => r !== regions[a] && Math.floor(i / 27) === Math.floor(a / 27) && Math.floor(i % 9 / 3) === Math.floor(a % 9 / 3) && Math.floor(i / 9) !== Math.floor(a / 9) && i % 9 !== a % 9);
    expect(sameBox).toBeGreaterThanOrEqual(0);
    const values = Array<number>(81).fill(0);
    values[a] = values[b] = 4;
    expect(conflicts(regions, values)).toEqual(new Set([a, b]));
    values[b] = 0;
    values[sameBox] = 4;
    expect(conflicts(regions, values).size).toBe(0);
  });

  it('never restores a forged given or malformed notes, and safely discards corrupt JSON', () => {
    const {givens} = puzzles[0];
    const empty = givens.indexOf('0');
    const clue = [...givens].findIndex(x => x !== '0');
    const values = [...givens].map(Number);
    values[clue] = (values[clue] % 9) + 1;
    const notes = Array.from({length: 81}, () => [2, 2, 10, 3]);
    const restored = restoreProgress(givens, JSON.stringify({ values, notes }));
    expect(restored.values[clue]).toBe(Number(givens[clue]));
    expect(restored.notes[clue]).toEqual([]);
    expect(restored.notes[empty]).toEqual([2,3]);
    expect(restoreProgress(givens, '{oops').values).toEqual([...givens].map(Number));
  });
});
