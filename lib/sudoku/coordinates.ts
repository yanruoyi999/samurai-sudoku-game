/**
 * Coordinate System for Samurai Sudoku
 *
 * Samurai Sudoku consists of 5 overlapping 9x9 grids arranged as:
 *  Grid 0 (Top-Left)      Grid 1 (Top-Right)
 *         Grid 2 (Center)
 *  Grid 3 (Bottom-Left)   Grid 4 (Bottom-Right)
 *
 * The global coordinate system is 21x21.
 * Each grid overlaps with the center grid in a 3x3 area.
 */

// Global position: 21x21 abstract board
export interface GlobalPosition {
  row: number; // 0-20
  col: number; // 0-20
}

// Local position: grid + position within grid
export interface LocalPosition {
  grid: 0 | 1 | 2 | 3 | 4; // 0: top-left, 1: top-right, 2: center, 3: bottom-left, 4: bottom-right
  row: number; // 0-8
  col: number; // 0-8
}

// Overlap zone definition
interface OverlapZone {
  grid1: number;
  rows1: number[];
  cols1: number[];
  grid2: number;
  rows2: number[];
  cols2: number[];
}

/**
 * Overlap zones between grids
 * Each zone defines a 3x3 area where two grids share cells
 */
export const OVERLAP_ZONES: readonly OverlapZone[] = [
  // Top-left (0) ↔ Center (2): bottom-right corner of 0 = top-left corner of 2
  {
    grid1: 0,
    rows1: [6, 7, 8],
    cols1: [6, 7, 8],
    grid2: 2,
    rows2: [0, 1, 2],
    cols2: [0, 1, 2],
  },
  // Top-right (1) ↔ Center (2): bottom-left corner of 1 = top-right corner of 2
  {
    grid1: 1,
    rows1: [6, 7, 8],
    cols1: [0, 1, 2],
    grid2: 2,
    rows2: [0, 1, 2],
    cols2: [6, 7, 8],
  },
  // Center (2) ↔ Bottom-left (3): bottom-left corner of 2 = top-right corner of 3
  {
    grid1: 2,
    rows1: [6, 7, 8],
    cols1: [0, 1, 2],
    grid2: 3,
    rows2: [0, 1, 2],
    cols2: [6, 7, 8],
  },
  // Center (2) ↔ Bottom-right (4): bottom-right corner of 2 = top-left corner of 4
  {
    grid1: 2,
    rows1: [6, 7, 8],
    cols1: [6, 7, 8],
    grid2: 4,
    rows2: [0, 1, 2],
    cols2: [0, 1, 2],
  },
] as const;

/**
 * Grid offsets in the global coordinate system
 */
const GRID_OFFSETS: readonly { row: number; col: number }[] = [
  { row: 0, col: 0 },    // 0: top-left
  { row: 0, col: 12 },   // 1: top-right
  { row: 6, col: 6 },    // 2: center
  { row: 12, col: 0 },   // 3: bottom-left
  { row: 12, col: 12 },  // 4: bottom-right
] as const;

/**
 * Convert local position to global position
 */
export function localToGlobal(local: LocalPosition): GlobalPosition {
  const offset = GRID_OFFSETS[local.grid];
  return {
    row: offset.row + local.row,
    col: offset.col + local.col,
  };
}

/**
 * Convert global position to local position(s)
 * Returns an array because overlap cells belong to two grids
 */
export function globalToLocal(global: GlobalPosition): LocalPosition[] {
  const results: LocalPosition[] = [];

  for (let grid = 0; grid < 5; grid++) {
    const offset = GRID_OFFSETS[grid];
    const localRow = global.row - offset.row;
    const localCol = global.col - offset.col;

    // Check if position is within this grid's bounds
    if (localRow >= 0 && localRow < 9 && localCol >= 0 && localCol < 9) {
      results.push({
        grid: grid as 0 | 1 | 2 | 3 | 4,
        row: localRow,
        col: localCol,
      });
    }
  }

  return results;
}

/**
 * Check if a local position is in an overlap zone
 */
export function isOverlapCell(local: LocalPosition): boolean {
  for (const zone of OVERLAP_ZONES) {
    if (
      (local.grid === zone.grid1 &&
        zone.rows1.includes(local.row) &&
        zone.cols1.includes(local.col)) ||
      (local.grid === zone.grid2 &&
        zone.rows2.includes(local.row) &&
        zone.cols2.includes(local.col))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Get the overlapping cell for a position in an overlap zone
 * Returns null if not in an overlap zone
 */
export function getOverlappingCell(local: LocalPosition): LocalPosition | null {
  for (const zone of OVERLAP_ZONES) {
    // Check if in grid1's overlap area
    if (
      local.grid === zone.grid1 &&
      zone.rows1.includes(local.row) &&
      zone.cols1.includes(local.col)
    ) {
      const idx1 = zone.rows1.indexOf(local.row);
      const idx2 = zone.cols1.indexOf(local.col);
      return {
        grid: zone.grid2 as 0 | 1 | 2 | 3 | 4,
        row: zone.rows2[idx1],
        col: zone.cols2[idx2],
      };
    }

    // Check if in grid2's overlap area
    if (
      local.grid === zone.grid2 &&
      zone.rows2.includes(local.row) &&
      zone.cols2.includes(local.col)
    ) {
      const idx1 = zone.rows2.indexOf(local.row);
      const idx2 = zone.cols2.indexOf(local.col);
      return {
        grid: zone.grid1 as 0 | 1 | 2 | 3 | 4,
        row: zone.rows1[idx1],
        col: zone.cols1[idx2],
      };
    }
  }

  return null;
}

/**
 * Get all cells in a specific grid (9x9)
 */
export function getGridCells(gridIndex: number): GlobalPosition[] {
  const cells: GlobalPosition[] = [];
  const offset = GRID_OFFSETS[gridIndex];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      cells.push({
        row: offset.row + row,
        col: offset.col + col,
      });
    }
  }

  return cells;
}

/**
 * Get all cells in a specific 3x3 box within a grid
 */
export function getBoxCells(local: LocalPosition): GlobalPosition[] {
  const boxRow = Math.floor(local.row / 3);
  const boxCol = Math.floor(local.col / 3);
  const cells: GlobalPosition[] = [];

  for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
    for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
      const global = localToGlobal({ grid: local.grid, row: r, col: c });
      cells.push(global);
    }
  }

  return cells;
}

/**
 * Get all cells in the same row within a grid
 */
export function getRowCells(local: LocalPosition): GlobalPosition[] {
  const cells: GlobalPosition[] = [];

  for (let col = 0; col < 9; col++) {
    const global = localToGlobal({ grid: local.grid, row: local.row, col });
    cells.push(global);
  }

  return cells;
}

/**
 * Get all cells in the same column within a grid
 */
export function getColCells(local: LocalPosition): GlobalPosition[] {
  const cells: GlobalPosition[] = [];

  for (let row = 0; row < 9; row++) {
    const global = localToGlobal({ grid: local.grid, row, col: local.col });
    cells.push(global);
  }

  return cells;
}

/**
 * Get all cells that are affected by a change at the given position
 * This includes: same row, same column, same box, and overlapping cell
 */
export function getAffectedCells(pos: GlobalPosition): {
  row: GlobalPosition[];
  col: GlobalPosition[];
  box: GlobalPosition[];
  overlap: GlobalPosition[];
} {
  const locals = globalToLocal(pos);
  const result = {
    row: [] as GlobalPosition[],
    col: [] as GlobalPosition[],
    box: [] as GlobalPosition[],
    overlap: [] as GlobalPosition[],
  };

  // For each grid this cell belongs to
  for (const local of locals) {
    result.row.push(...getRowCells(local));
    result.col.push(...getColCells(local));
    result.box.push(...getBoxCells(local));

    // Get overlapping cell if in overlap zone
    const overlapping = getOverlappingCell(local);
    if (overlapping) {
      const overlapGlobal = localToGlobal(overlapping);
      result.overlap.push(overlapGlobal);
    }
  }

  // Remove duplicates
  const dedupe = (arr: GlobalPosition[]) => {
    const seen = new Set<string>();
    return arr.filter((pos) => {
      const key = `${pos.row},${pos.col}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  return {
    row: dedupe(result.row),
    col: dedupe(result.col),
    box: dedupe(result.box),
    overlap: dedupe(result.overlap),
  };
}

/**
 * Check if a global position is valid (within bounds)
 */
export function isValidGlobalPosition(pos: GlobalPosition): boolean {
  return pos.row >= 0 && pos.row < 21 && pos.col >= 0 && pos.col < 21;
}

/**
 * Check if a local position is valid
 */
export function isValidLocalPosition(pos: LocalPosition): boolean {
  return (
    pos.grid >= 0 &&
    pos.grid <= 4 &&
    pos.row >= 0 &&
    pos.row < 9 &&
    pos.col >= 0 &&
    pos.col < 9
  );
}

/**
 * Compare two positions for equality
 */
export function positionsEqual(a: GlobalPosition, b: GlobalPosition): boolean {
  return a.row === b.row && a.col === b.col;
}
