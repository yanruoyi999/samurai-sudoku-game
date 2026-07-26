import { describe, expect, it } from "vitest";

import {
  analyzeFishPattern,
  getFishExample,
  type FishOrientation,
} from "./swordfish";

describe("analyzeFishPattern", () => {
  it.each([
    [2, "row"],
    [3, "row"],
    [4, "row"],
    [2, "column"],
    [3, "column"],
    [4, "column"],
  ] as Array<[number, FishOrientation]>)(
    "recognizes a valid order-%s %s pattern",
    (order, orientation) => {
      const example = getFishExample(order, orientation, true);
      const result = analyzeFishPattern(example);

      expect(result.valid).toBe(true);
      expect(result.coverLines).toHaveLength(order);
      expect(result.eliminations.length).toBeGreaterThan(0);
    },
  );

  it.each([
    [2, "row"],
    [3, "row"],
    [4, "row"],
    [2, "column"],
    [3, "column"],
    [4, "column"],
  ] as Array<[number, FishOrientation]>)(
    "rejects a near-miss order-%s %s pattern",
    (order, orientation) => {
      const example = getFishExample(order, orientation, false);
      const result = analyzeFishPattern(example);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("cover-line-count");
      expect(result.eliminations).toEqual([]);
    },
  );

  it("rejects an incomplete set of base lines", () => {
    const example = getFishExample(3, "row", true);
    const result = analyzeFishPattern({
      ...example,
      baseLines: example.baseLines.slice(0, 2),
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("base-line-count");
  });
});
