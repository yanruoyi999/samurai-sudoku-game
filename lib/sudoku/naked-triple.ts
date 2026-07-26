export type SudokuUnitType = "row" | "column" | "box";

export interface NakedTripleAnalysis {
  valid: boolean;
  union: number[];
  eliminations: Array<{ peerIndex: number; digits: number[] }>;
  reason: "valid" | "member-count" | "member-size" | "union-size";
}

export interface NakedTripleExample {
  id: string;
  unitType: SudokuUnitType;
  members: number[][];
  peers: number[][];
  expectedValid: boolean;
}

function normalizeCandidates(candidates: number[]) {
  return Array.from(
    new Set(candidates.filter((digit) => Number.isInteger(digit) && digit >= 1 && digit <= 9)),
  ).sort((left, right) => left - right);
}

export function analyzeNakedTriple(
  members: number[][],
  peers: number[][],
): NakedTripleAnalysis {
  const normalizedMembers = members.map(normalizeCandidates);
  const union = normalizeCandidates(normalizedMembers.flat());

  if (normalizedMembers.length !== 3) {
    return { valid: false, union, eliminations: [], reason: "member-count" };
  }

  if (normalizedMembers.some((member) => member.length < 2 || member.length > 3)) {
    return { valid: false, union, eliminations: [], reason: "member-size" };
  }

  if (union.length !== 3) {
    return { valid: false, union, eliminations: [], reason: "union-size" };
  }

  const unionSet = new Set(union);
  const eliminations = peers
    .map(normalizeCandidates)
    .map((peer, peerIndex) => ({
      peerIndex,
      digits: peer.filter((digit) => unionSet.has(digit)),
    }))
    .filter((item) => item.digits.length > 0);

  return { valid: true, union, eliminations, reason: "valid" };
}

const examples: Record<SudokuUnitType, NakedTripleExample> = {
  row: {
    id: "row-valid",
    unitType: "row",
    members: [[2, 5], [2, 7], [5, 7]],
    peers: [[1, 2, 8], [3, 5, 9], [4, 6], [1, 7]],
    expectedValid: true,
  },
  column: {
    id: "column-valid",
    unitType: "column",
    members: [[1, 4], [1, 9], [4, 9]],
    peers: [[1, 3, 6], [2, 4, 8], [5, 7], [6, 9]],
    expectedValid: true,
  },
  box: {
    id: "box-valid",
    unitType: "box",
    members: [[3, 6], [3, 8], [6, 8]],
    peers: [[1, 3, 5], [2, 6, 9], [4, 7], [1, 8]],
    expectedValid: true,
  },
};

export function getNakedTripleExample(
  unitType: SudokuUnitType,
  valid: boolean,
): NakedTripleExample {
  const example = examples[unitType];
  if (valid) return example;
  const originalUnion = new Set(example.members.flat());
  const outsider =
    Array.from({ length: 9 }, (_, index) => index + 1).find(
      (digit) => !originalUnion.has(digit),
    ) ?? 9;

  return {
    ...example,
    id: `${unitType}-invalid`,
    members: example.members.map((member, index) =>
      index === 2 ? [...member.slice(0, 1), outsider] : member,
    ),
    expectedValid: false,
  };
}
