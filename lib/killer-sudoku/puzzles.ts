import fixtures from './fixtures';

export type KillerCage = { total: number; cells: readonly number[] };

const regions = Array.from({ length: 81 }, (_, index) =>
  Math.floor(index / 27) * 3 + Math.floor((index % 9) / 3),
).join('');

export const killerPuzzles = fixtures.map(({ id, solution, cages: source }) => {
  const cages: KillerCage[] = source.map(([total, ...cells]) => ({ total, cells }));
  const cageByCell: KillerCage[] = [];
  for (const cage of cages) {
    for (const index of cage.cells) cageByCell[index] = cage;
  }
  return { id, solution, regions, givens: '0'.repeat(81), cages, cageByCell };
});

export function matchesKillerCages(cages: readonly KillerCage[], values: readonly number[]) {
  return cages.every(({ total, cells }) => {
    const entries = cells.map(index => values[index]);
    return entries.every(value => Number.isInteger(value) && value >= 1 && value <= 9)
      && new Set(entries).size === entries.length
      && entries.reduce((sum, value) => sum + value, 0) === total;
  });
}
