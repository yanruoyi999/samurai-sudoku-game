import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.stubGlobal("React", React);

import { SwordfishTrainer } from "../../components/sudoku/SwordfishTrainer";
import { analyzeFishPattern, type FishCandidate } from "./swordfish";

async function lesson() {
  const path = "./x-wing-lesson";
  const lessonModule = await import(path).catch(() => null);
  expect(lessonModule, "the original lesson must exist").not.toBeNull();
  expect(lessonModule?.xWingLesson, "the fixed lesson data must be exported").toBeDefined();
  return lessonModule?.xWingLesson;
}

// Independent local placements: one 7 per base row; no shared column or box.
function placements(candidates: FishCandidate[], rows: number[]) {
  return candidates.filter((cell) => cell.row === rows[0]).flatMap((first) =>
    candidates.filter((cell) => cell.row === rows[1]).filter((second) =>
      first.column !== second.column &&
      !(Math.floor(first.row / 3) === Math.floor(second.row / 3) &&
        Math.floor(first.column / 3) === Math.floor(second.column / 3)),
    ).map((second) => [first, second]),
  );
}
const key = (cell: FishCandidate) => `r${cell.row + 1}c${cell.column + 1}`;

describe("original X-Wing lesson", () => {
  it("has exactly two feasible diagonals and its proof covers both", async () => {
    const data = await lesson();
    if (!data) return;
    const choices = placements(data.rowExample.candidates, [1, 6]);
    expect(choices.map((pair) => pair.map(key))).toEqual([
      ["r2c3", "r7c8"], ["r2c8", "r7c3"],
    ]);
    expect(data.proofCases.map((pair: FishCandidate[]) => pair.map(key))).toEqual(
      choices.map((pair) => pair.map(key)),
    );
    for (const pair of choices) {
      expect(pair.map((cell) => cell.column).sort()).toEqual([2, 7]);
    }
  });

  it("removes the two targets but preserves corners and the unrelated candidate", async () => {
    const data = await lesson();
    if (!data) return;
    const result = analyzeFishPattern(data.rowExample);
    expect(result.valid).toBe(true);
    expect(result.eliminations.map(key)).toEqual(["r1c3", "r3c8"]);
    expect(data.rowExample.candidates.filter((cell: FishCandidate) =>
      !result.eliminations.some((removed) => key(removed) === key(cell)),
    ).map(key)).toEqual(["r2c3", "r2c8", "r7c3", "r7c8", "r9c5"]);
  });

  it("transposes every candidate and eliminates only the transposed targets", async () => {
    const data = await lesson();
    if (!data) return;
    expect(data.columnExample.candidates.map(key)).toEqual([
      "r3c2", "r8c2", "r3c7", "r8c7", "r3c1", "r8c3", "r5c9",
    ]);
    const result = analyzeFishPattern(data.columnExample);
    expect(result.valid).toBe(true);
    expect(result.baseLines).toEqual([1, 6]);
    expect(result.coverLines).toEqual([2, 7]);
    expect(result.eliminations.map(key)).toEqual(["r3c1", "r8c3"]);
  });

  it("rejects an extra r2c5 and admits a local placement retaining r1c3", async () => {
    const data = await lesson();
    if (!data) return;
    const result = analyzeFishPattern(data.extraCandidateExample);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("candidate-count");
    expect(result.eliminations).toEqual([]);
    const alternative = placements(data.extraCandidateExample.candidates, [1, 6])
      .find((pair) => pair.map(key).join() === "r2c5,r7c8");
    expect(alternative).toBeDefined();
    const witness = [...alternative!, { row: 0, column: 2 }];
    expect(new Set(witness.map((cell) => cell.row)).size).toBe(3);
    expect(new Set(witness.map((cell) => cell.column)).size).toBe(3);
    expect(new Set(witness.map((cell) => `${Math.floor(cell.row / 3)}-${Math.floor(cell.column / 3)}`)).size).toBe(3);
  });
});

describe("trainer initial order", () => {
  it("renders order 2 before hydration when requested while preserving default order 3", () => {
    const initialTwo = renderToStaticMarkup(createElement(SwordfishTrainer, { locale: "en", initialOrder: 2 }));
    const legacy = renderToStaticMarkup(createElement(SwordfishTrainer, { locale: "en" }));
    expect(initialTwo).toMatch(/aria-pressed="true"[^>]*>X-Wing<\/button>/);
    expect(initialTwo).toContain("row-based X-Wing candidate map");
    expect(legacy).toMatch(/aria-pressed="true"[^>]*>Swordfish<\/button>/);
    expect(legacy).toContain("row-based Swordfish candidate map");
  });
});
