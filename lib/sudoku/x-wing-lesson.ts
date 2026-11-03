import type { FishCandidate, FishExample } from "./swordfish";

// Original partial candidate sketches. Coordinates use the engine's zero-based indexing.
// Base lines are exhaustive for digit 7; other lines show relevant positions only.
const rowExample: FishExample = {
  id: "lesson-x-wing-rows",
  order: 2,
  orientation: "row",
  baseLines: [1, 6],
  candidates: [
    { row: 1, column: 2 }, { row: 1, column: 7 },
    { row: 6, column: 2 }, { row: 6, column: 7 },
    { row: 0, column: 2 }, { row: 2, column: 7 },
    { row: 8, column: 4 },
  ],
  expectedValid: true,
};

const columnExample: FishExample = {
  id: "lesson-x-wing-columns",
  order: 2,
  orientation: "column",
  baseLines: [1, 6],
  candidates: rowExample.candidates.map(({ row, column }) => ({ row: column, column: row })),
  expectedValid: true,
};

export const xWingLesson: {
  digit: number;
  rowExample: FishExample;
  columnExample: FishExample;
  proofCases: FishCandidate[][];
  extraCandidateExample: FishExample;
} = {
  digit: 7,
  rowExample,
  columnExample,
  proofCases: [
    [{ row: 1, column: 2 }, { row: 6, column: 7 }],
    [{ row: 1, column: 7 }, { row: 6, column: 2 }],
  ],
  extraCandidateExample: {
    ...rowExample,
    id: "lesson-x-wing-extra-candidate",
    candidates: [...rowExample.candidates, { row: 1, column: 4 }],
    expectedValid: false,
  },
};
