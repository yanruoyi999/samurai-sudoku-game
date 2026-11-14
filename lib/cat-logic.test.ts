import { describe, expect, it } from 'vitest';
import { canPlaceCat, catRegions } from './cat-logic';

describe('original cat puzzle', () => {
  it('has exactly one solution across all possible row choices', () => {
    let states: number[][] = [[]];
    for (let row = 0; row < 4; row++) {
      const candidates = Array.from({ length: 4 }, (_, col) => row * 4 + col);
      states = states.flatMap(placed => candidates.filter(cell => canPlaceCat(placed, cell)).map(cell => [...placed, cell]));
    }
    expect(states).toEqual([[1, 7, 8, 14]]);
  });

  it('rejects a shared row, column, region or diagonal contact', () => {
    expect(canPlaceCat([1], 3)).toBe(false);
    expect(canPlaceCat([1], 9)).toBe(false);
    expect(canPlaceCat([7], 10)).toBe(false);
    expect(canPlaceCat([8], 13)).toBe(false);
    expect(canPlaceCat([1], 7)).toBe(true);
    expect(new Set(catRegions).size).toBe(4);
  });
});
