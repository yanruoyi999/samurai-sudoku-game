import { describe, expect, it } from "vitest";

import { getVisibleMoveCount } from "./player-stats";

describe("getVisibleMoveCount", () => {
  it("counts only currently applied history entries after undo", () => {
    expect(getVisibleMoveCount(3, -1)).toBe(0);
    expect(getVisibleMoveCount(3, 0)).toBe(1);
    expect(getVisibleMoveCount(3, 1)).toBe(2);
    expect(getVisibleMoveCount(3, 2)).toBe(3);
  });
});
