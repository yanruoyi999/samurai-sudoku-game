import fixtures from './fixtures';

export const classicRegions = Array.from({ length: 81 }, (_, i) => Math.floor(i / 27) * 3 + Math.floor((i % 9) / 3)).join('');

export const diagonalPuzzles = fixtures.map(([id, givens, solution]) => ({
  id, givens, solution, regions: classicRegions,
}));

export function diagonalOf(index: number) {
  const r = Math.floor(index / 9);
  const c = index % 9;
  return (r === c ? 1 : 0) | (r + c === 8 ? 2 : 0);
}

export function isDiagonalPeer(a: number, b: number) {
  return a !== b && (diagonalOf(a) & diagonalOf(b)) !== 0;
}

export function dailyPuzzleIndex(date: Date) {
  const day = Math.floor(date.getTime() / 86_400_000);
  return ((day % diagonalPuzzles.length) + diagonalPuzzles.length) % diagonalPuzzles.length;
}
