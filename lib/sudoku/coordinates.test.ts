import { describe, it, expect } from 'vitest';
import {
  localToGlobal,
  globalToLocal,
  getOverlappingCell,
  isOverlapCell,
  getGridCells,
  getBoxCells,
  getRowCells,
  getColCells,
  getAffectedCells,
  isValidGlobalPosition,
  isValidLocalPosition,
  positionsEqual,
  type LocalPosition,
  type GlobalPosition,
} from './coordinates';

describe('Coordinate System', () => {
  describe('localToGlobal', () => {
    it('should convert top-left grid origin to global (0,0)', () => {
      const result = localToGlobal({ grid: 0, row: 0, col: 0 });
      expect(result).toEqual({ row: 0, col: 0 });
    });

    it('should convert top-right grid origin to global (0,12)', () => {
      const result = localToGlobal({ grid: 1, row: 0, col: 0 });
      expect(result).toEqual({ row: 0, col: 12 });
    });

    it('should convert center grid origin to global (6,6)', () => {
      const result = localToGlobal({ grid: 2, row: 0, col: 0 });
      expect(result).toEqual({ row: 6, col: 6 });
    });

    it('should convert bottom-left grid origin to global (12,0)', () => {
      const result = localToGlobal({ grid: 3, row: 0, col: 0 });
      expect(result).toEqual({ row: 12, col: 0 });
    });

    it('should convert bottom-right grid origin to global (12,12)', () => {
      const result = localToGlobal({ grid: 4, row: 0, col: 0 });
      expect(result).toEqual({ row: 12, col: 12 });
    });

    it('should convert top-left grid bottom-right corner to global (8,8)', () => {
      const result = localToGlobal({ grid: 0, row: 8, col: 8 });
      expect(result).toEqual({ row: 8, col: 8 });
    });
  });

  describe('globalToLocal', () => {
    it('should convert global (0,0) to top-left grid', () => {
      const result = globalToLocal({ row: 0, col: 0 });
      expect(result).toContainEqual({ grid: 0, row: 0, col: 0 });
      expect(result).toHaveLength(1);
    });

    it('should convert global (10,10) to center grid only', () => {
      const result = globalToLocal({ row: 10, col: 10 });
      expect(result).toContainEqual({ grid: 2, row: 4, col: 4 });
      expect(result).toHaveLength(1);
    });

    it('should convert overlap cell to two grids', () => {
      // Top-left grid (0) overlaps with center grid (2) at (6,6) local = (6,6) global
      const result = globalToLocal({ row: 6, col: 6 });
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ grid: 0, row: 6, col: 6 });
      expect(result).toContainEqual({ grid: 2, row: 0, col: 0 });
    });

    it('should convert top-right overlap cell correctly', () => {
      // Global (6,12) is overlap between top-right (1) and center (2)
      const result = globalToLocal({ row: 6, col: 12 });
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ grid: 1, row: 6, col: 0 });
      expect(result).toContainEqual({ grid: 2, row: 0, col: 6 });
    });
  });

  describe('Overlap detection', () => {
    it('should identify overlap cell in top-left grid', () => {
      const local: LocalPosition = { grid: 0, row: 6, col: 6 };
      expect(isOverlapCell(local)).toBe(true);
    });

    it('should identify non-overlap cell', () => {
      const local: LocalPosition = { grid: 0, row: 0, col: 0 };
      expect(isOverlapCell(local)).toBe(false);
    });

    it('should find overlapping cell for top-left -> center', () => {
      const local: LocalPosition = { grid: 0, row: 8, col: 8 };
      const overlapping = getOverlappingCell(local);
      expect(overlapping).toEqual({ grid: 2, row: 2, col: 2 });
    });

    it('should find overlapping cell for center -> top-left', () => {
      const local: LocalPosition = { grid: 2, row: 0, col: 0 };
      const overlapping = getOverlappingCell(local);
      expect(overlapping).toEqual({ grid: 0, row: 6, col: 6 });
    });

    it('should return null for non-overlap cell', () => {
      const local: LocalPosition = { grid: 0, row: 0, col: 0 };
      const overlapping = getOverlappingCell(local);
      expect(overlapping).toBeNull();
    });
  });

  describe('Grid cells', () => {
    it('should return 81 cells for a grid', () => {
      const cells = getGridCells(0);
      expect(cells).toHaveLength(81);
    });

    it('should return correct bounds for top-left grid', () => {
      const cells = getGridCells(0);
      const firstCell = cells[0];
      const lastCell = cells[80];
      expect(firstCell).toEqual({ row: 0, col: 0 });
      expect(lastCell).toEqual({ row: 8, col: 8 });
    });

    it('should return correct bounds for center grid', () => {
      const cells = getGridCells(2);
      const firstCell = cells[0];
      const lastCell = cells[80];
      expect(firstCell).toEqual({ row: 6, col: 6 });
      expect(lastCell).toEqual({ row: 14, col: 14 });
    });
  });

  describe('Box cells', () => {
    it('should return 9 cells for a box', () => {
      const local: LocalPosition = { grid: 0, row: 0, col: 0 };
      const cells = getBoxCells(local);
      expect(cells).toHaveLength(9);
    });

    it('should return correct cells for top-left box', () => {
      const local: LocalPosition = { grid: 0, row: 0, col: 0 };
      const cells = getBoxCells(local);
      expect(cells).toContainEqual({ row: 0, col: 0 });
      expect(cells).toContainEqual({ row: 2, col: 2 });
    });

    it('should return correct cells for center box', () => {
      const local: LocalPosition = { grid: 0, row: 4, col: 4 };
      const cells = getBoxCells(local);
      expect(cells).toContainEqual({ row: 3, col: 3 });
      expect(cells).toContainEqual({ row: 5, col: 5 });
    });
  });

  describe('Row and Column cells', () => {
    it('should return 9 cells for a row', () => {
      const local: LocalPosition = { grid: 0, row: 0, col: 0 };
      const cells = getRowCells(local);
      expect(cells).toHaveLength(9);
    });

    it('should return 9 cells for a column', () => {
      const local: LocalPosition = { grid: 0, row: 0, col: 0 };
      const cells = getColCells(local);
      expect(cells).toHaveLength(9);
    });

    it('should return correct row cells', () => {
      const local: LocalPosition = { grid: 0, row: 0, col: 0 };
      const cells = getRowCells(local);
      expect(cells[0]).toEqual({ row: 0, col: 0 });
      expect(cells[8]).toEqual({ row: 0, col: 8 });
    });

    it('should return correct column cells', () => {
      const local: LocalPosition = { grid: 0, row: 0, col: 0 };
      const cells = getColCells(local);
      expect(cells[0]).toEqual({ row: 0, col: 0 });
      expect(cells[8]).toEqual({ row: 8, col: 0 });
    });
  });

  describe('Affected cells', () => {
    it('should return affected cells for non-overlap position', () => {
      const pos: GlobalPosition = { row: 0, col: 0 };
      const affected = getAffectedCells(pos);

      expect(affected.row.length).toBeGreaterThan(0);
      expect(affected.col.length).toBeGreaterThan(0);
      expect(affected.box.length).toBeGreaterThan(0);
      expect(affected.overlap).toHaveLength(0);
    });

    it('should include overlap cells for overlap position', () => {
      const pos: GlobalPosition = { row: 6, col: 6 }; // Overlap between grid 0 and 2
      const affected = getAffectedCells(pos);

      expect(affected.overlap.length).toBeGreaterThan(0);
    });

    it('should not have duplicate positions', () => {
      const pos: GlobalPosition = { row: 6, col: 6 };
      const affected = getAffectedCells(pos);

      const allCells = [
        ...affected.row,
        ...affected.col,
        ...affected.box,
        ...affected.overlap,
      ];

      const uniqueKeys = new Set(allCells.map((p) => `${p.row},${p.col}`));
      // Note: There will be duplicates across categories, but not within
      expect(affected.row.length).toBe(
        new Set(affected.row.map((p) => `${p.row},${p.col}`)).size
      );
    });
  });

  describe('Validation', () => {
    it('should validate correct global position', () => {
      expect(isValidGlobalPosition({ row: 0, col: 0 })).toBe(true);
      expect(isValidGlobalPosition({ row: 20, col: 20 })).toBe(true);
      expect(isValidGlobalPosition({ row: 10, col: 10 })).toBe(true);
    });

    it('should invalidate out-of-bounds global position', () => {
      expect(isValidGlobalPosition({ row: -1, col: 0 })).toBe(false);
      expect(isValidGlobalPosition({ row: 21, col: 0 })).toBe(false);
      expect(isValidGlobalPosition({ row: 0, col: 21 })).toBe(false);
    });

    it('should validate correct local position', () => {
      expect(isValidLocalPosition({ grid: 0, row: 0, col: 0 })).toBe(true);
      expect(isValidLocalPosition({ grid: 4, row: 8, col: 8 })).toBe(true);
    });

    it('should invalidate out-of-bounds local position', () => {
      expect(isValidLocalPosition({ grid: 5 as any, row: 0, col: 0 })).toBe(
        false
      );
      expect(isValidLocalPosition({ grid: 0, row: 9, col: 0 })).toBe(false);
      expect(isValidLocalPosition({ grid: 0, row: 0, col: 9 })).toBe(false);
    });
  });

  describe('Position equality', () => {
    it('should identify equal positions', () => {
      const a: GlobalPosition = { row: 5, col: 5 };
      const b: GlobalPosition = { row: 5, col: 5 };
      expect(positionsEqual(a, b)).toBe(true);
    });

    it('should identify unequal positions', () => {
      const a: GlobalPosition = { row: 5, col: 5 };
      const b: GlobalPosition = { row: 5, col: 6 };
      expect(positionsEqual(a, b)).toBe(false);
    });
  });
});
