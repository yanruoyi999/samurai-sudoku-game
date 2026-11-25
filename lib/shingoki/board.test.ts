import { describe, expect, it } from 'vitest';
import { dots, isSolvedLoop, puzzles } from './board';

const solutionPaths = [
  'A1 A2 A3 A4 B4 B3 C3 C4 D4 D3 D2 C2 C1 B1',
  'A2 A3 A4 B4 C4 C3 D3 D2 D1 C1 B1 B2',
];

function loopEdges(path: string[]) {
  return path.map((dot, i) => [dot, path[(i + 1) % path.length]].sort().join('-')).sort();
}

function enumerateCycles() {
  const result: string[][] = [];
  function visit(path: number[]) {
    const current = path[path.length - 1];
    for (let neighbor = 0; neighbor < 16; neighbor++) {
      const dx = current % 4 - neighbor % 4;
      const dy = Math.floor(current / 4) - Math.floor(neighbor / 4);
      if (Math.abs(dx) + Math.abs(dy) !== 1) continue;
      if (neighbor === path[0] && path.length >= 4 && path[1] < current) {
        result.push(loopEdges(path.map(i => dots[i])));
      } else if (neighbor > path[0] && !path.includes(neighbor)) {
        visit([...path, neighbor]);
      }
    }
  }
  dots.forEach((_, i) => visit([i]));
  return result;
}

describe('original Shingoki puzzles', () => {
  it('accepts exactly the verified original solution on each board', () => {
    const cycles = enumerateCycles();
    expect(cycles).toHaveLength(213);
    puzzles.forEach((clues, i) => {
      expect(cycles.filter(cycle => isSolvedLoop(clues, cycle))).toEqual([loopEdges(solutionPaths[i].split(' '))]);
    });
  });

  it('rejects open ends, branches, separate loops, bad edges and duplicate edges', () => {
    const square = loopEdges('A1 B1 B2 A2'.split(' '));
    expect(isSolvedLoop([], square)).toBe(true);
    for (const invalid of [
      [], square.slice(1), [...square, 'B2-C2'], [...square, ...loopEdges('C3 D3 D4 C4'.split(' '))],
      [...square, 'B1-C2'], [...square, square[0]],
    ]) expect(isSolvedLoop([], invalid)).toBe(false);
  });
});
