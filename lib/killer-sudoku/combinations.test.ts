import { describe, expect, it } from "vitest";

import {
  buildKillerCheatSheet,
  findKillerSudokuCombinations,
  getKillerSumRange,
} from "./combinations";

describe("getKillerSumRange", () => {
  it("calculates the no-repeat range for each cage size", () => {
    expect(getKillerSumRange(2)).toEqual({ minimumSum: 3, maximumSum: 17 });
    expect(getKillerSumRange(3)).toEqual({ minimumSum: 6, maximumSum: 24 });
    expect(getKillerSumRange(9)).toEqual({ minimumSum: 45, maximumSum: 45 });
  });

  it("rejects cage sizes outside one to nine", () => {
    expect(getKillerSumRange(0)).toBeNull();
    expect(getKillerSumRange(10)).toBeNull();
    expect(getKillerSumRange(2.5)).toBeNull();
  });
});

describe("findKillerSudokuCombinations", () => {
  it("returns each distinct two-cell combination exactly once", () => {
    expect(
      findKillerSudokuCombinations({ cageSize: 2, targetSum: 10 }).combinations,
    ).toEqual([
      [1, 9],
      [2, 8],
      [3, 7],
      [4, 6],
    ]);
  });

  it("finds all three-cell combinations without repeated digits", () => {
    expect(
      findKillerSudokuCombinations({ cageSize: 3, targetSum: 7 }).combinations,
    ).toEqual([[1, 2, 4]]);
  });

  it("rejects impossible sums and invalid inputs", () => {
    expect(
      findKillerSudokuCombinations({ cageSize: 3, targetSum: 5 }),
    ).toMatchObject({ isValid: false, combinations: [] });
    expect(
      findKillerSudokuCombinations({ cageSize: 10, targetSum: 45 }),
    ).toMatchObject({ isValid: false, combinations: [] });
    expect(
      findKillerSudokuCombinations({ cageSize: 2, targetSum: 8.5 }),
    ).toMatchObject({ isValid: false, combinations: [] });
  });

  it("handles the complete nine-digit cage", () => {
    expect(
      findKillerSudokuCombinations({ cageSize: 9, targetSum: 45 }).combinations,
    ).toEqual([[1, 2, 3, 4, 5, 6, 7, 8, 9]]);
  });
});

describe("buildKillerCheatSheet", () => {
  it("builds deterministic printable rows for selected cage sizes", () => {
    const rows = buildKillerCheatSheet([2]);

    expect(rows).toHaveLength(15);
    expect(rows[0]).toEqual({
      cageSize: 2,
      targetSum: 3,
      combinations: [[1, 2]],
    });
    expect(rows.at(-1)).toEqual({
      cageSize: 2,
      targetSum: 17,
      combinations: [[8, 9]],
    });
  });
});
