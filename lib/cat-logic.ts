export const catRegions = [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3] as const;

export function canPlaceCat(placed: readonly number[], cell: number) {
  const row = Math.floor(cell / 4);
  const column = cell % 4;
  return placed.every(other => {
    const rowDistance = Math.abs(row - Math.floor(other / 4));
    const columnDistance = Math.abs(column - other % 4);
    return rowDistance !== 0 && columnDistance !== 0 &&
      (rowDistance > 1 || columnDistance > 1) && catRegions[cell] !== catRegions[other];
  });
}
