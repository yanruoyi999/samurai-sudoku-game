import { describe, expect, it } from "vitest";

import {
  analyzeNakedTriple,
  getNakedTripleExample,
  type SudokuUnitType,
} from "./naked-triple";

describe("analyzeNakedTriple", () => {
  it.each(["row", "column", "box"] as SudokuUnitType[])(
    "recognizes a valid triple in a %s",
    (unitType) => {
      const example = getNakedTripleExample(unitType, true);
      const result = analyzeNakedTriple(example.members, example.peers);

      expect(result.valid).toBe(true);
      expect(result.union).toHaveLength(3);
      expect(result.eliminations.length).toBeGreaterThan(0);
      expect(result.eliminations.every((item) => item.digits.length > 0)).toBe(true);
    },
  );

  it.each(["row", "column", "box"] as SudokuUnitType[])(
    "rejects a near-miss triple in a %s",
    (unitType) => {
      const example = getNakedTripleExample(unitType, false);
      const result = analyzeNakedTriple(example.members, example.peers);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("union-size");
      expect(result.eliminations).toEqual([]);
    },
  );

  it("rejects three cells when one has only one candidate", () => {
    const result = analyzeNakedTriple([[2, 5], [2], [5, 7]], [[2, 7, 9]]);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("member-size");
  });
});
