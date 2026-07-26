export type FishOrientation = "row" | "column";

export interface FishCandidate {
  row: number;
  column: number;
}

export interface FishAnalysis {
  valid: boolean;
  order: number;
  orientation: FishOrientation;
  baseLines: number[];
  coverLines: number[];
  patternCandidates: FishCandidate[];
  eliminations: FishCandidate[];
  reason: "valid" | "base-line-count" | "candidate-count" | "cover-line-count";
}

export interface FishExample {
  id: string;
  order: number;
  orientation: FishOrientation;
  baseLines: number[];
  candidates: FishCandidate[];
  expectedValid: boolean;
}

function uniqueSorted(values: number[]) {
  return Array.from(new Set(values)).sort((left, right) => left - right);
}

function cellKey(cell: FishCandidate) {
  return `${cell.row}-${cell.column}`;
}

export function analyzeFishPattern({
  candidates,
  order,
  orientation,
  baseLines,
}: {
  candidates: FishCandidate[];
  order: number;
  orientation: FishOrientation;
  baseLines: number[];
}): FishAnalysis {
  const normalizedBaseLines = uniqueSorted(baseLines);
  const baseLineSet = new Set(normalizedBaseLines);
  const inBaseLine = (cell: FishCandidate) =>
    baseLineSet.has(orientation === "row" ? cell.row : cell.column);
  const patternCandidates = candidates.filter(inBaseLine);
  const coverLines = uniqueSorted(
    patternCandidates.map((cell) =>
      orientation === "row" ? cell.column : cell.row,
    ),
  );

  if (normalizedBaseLines.length !== order) {
    return {
      valid: false,
      order,
      orientation,
      baseLines: normalizedBaseLines,
      coverLines,
      patternCandidates,
      eliminations: [],
      reason: "base-line-count",
    };
  }

  const everyBaseLineHasValidCount = normalizedBaseLines.every((line) => {
    const lineCandidates = patternCandidates.filter(
      (cell) => (orientation === "row" ? cell.row : cell.column) === line,
    );
    return lineCandidates.length >= 2 && lineCandidates.length <= order;
  });

  if (!everyBaseLineHasValidCount) {
    return {
      valid: false,
      order,
      orientation,
      baseLines: normalizedBaseLines,
      coverLines,
      patternCandidates,
      eliminations: [],
      reason: "candidate-count",
    };
  }

  if (coverLines.length !== order) {
    return {
      valid: false,
      order,
      orientation,
      baseLines: normalizedBaseLines,
      coverLines,
      patternCandidates,
      eliminations: [],
      reason: "cover-line-count",
    };
  }

  const coverLineSet = new Set(coverLines);
  const patternKeys = new Set(patternCandidates.map(cellKey));
  const eliminations = candidates.filter((cell) => {
    const onCoverLine = coverLineSet.has(
      orientation === "row" ? cell.column : cell.row,
    );
    return onCoverLine && !inBaseLine(cell) && !patternKeys.has(cellKey(cell));
  });

  return {
    valid: true,
    order,
    orientation,
    baseLines: normalizedBaseLines,
    coverLines,
    patternCandidates,
    eliminations,
    reason: "valid",
  };
}

function transpose(cells: FishCandidate[]) {
  return cells.map((cell) => ({ row: cell.column, column: cell.row }));
}

function buildValidExample(order: number, orientation: FishOrientation): FishExample {
  const baseLinesByOrder: Record<number, number[]> = {
    2: [1, 6],
    3: [0, 3, 7],
    4: [0, 2, 5, 8],
  };
  const coverLinesByOrder: Record<number, number[]> = {
    2: [2, 7],
    3: [1, 5, 8],
    4: [0, 3, 6, 8],
  };
  const baseLines = baseLinesByOrder[order];
  const coverLines = coverLinesByOrder[order];
  const pattern: FishCandidate[] = baseLines.flatMap((baseLine, index) => {
    const first = coverLines[index % order];
    const second = coverLines[(index + 1) % order];
    return [
      { row: baseLine, column: first },
      { row: baseLine, column: second },
    ];
  });
  const nonBaseLines = Array.from({ length: 9 }, (_, index) => index).filter(
    (line) => !baseLines.includes(line),
  );
  const eliminations = coverLines.map((coverLine, index) => ({
    row: nonBaseLines[index],
    column: coverLine,
  }));
  const unrelated = [{ row: nonBaseLines.at(-1) ?? 4, column: 4 }];
  const rowCandidates = [...pattern, ...eliminations, ...unrelated];

  return {
    id: `${orientation}-${order}-valid`,
    order,
    orientation,
    baseLines,
    candidates: orientation === "row" ? rowCandidates : transpose(rowCandidates),
    expectedValid: true,
  };
}

function buildInvalidExample(
  order: number,
  orientation: FishOrientation,
): FishExample {
  const valid = buildValidExample(order, "row");
  const changed = valid.candidates.map((cell, index) =>
    index === 0
      ? { ...cell, column: 4 }
      : cell,
  );

  return {
    id: `${orientation}-${order}-invalid`,
    order,
    orientation,
    baseLines: valid.baseLines,
    candidates: orientation === "row" ? changed : transpose(changed),
    expectedValid: false,
  };
}

export function getFishExample(
  order: number,
  orientation: FishOrientation,
  valid: boolean,
) {
  if (![2, 3, 4].includes(order)) {
    throw new Error(`Unsupported fish order: ${order}`);
  }
  return valid
    ? buildValidExample(order, orientation)
    : buildInvalidExample(order, orientation);
}
