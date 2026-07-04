const PUZZLE_ID_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isPuzzleId(value: string): boolean {
  if (!PUZZLE_ID_PATTERN.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function getPuzzleYear(puzzleId: string): string {
  if (!isPuzzleId(puzzleId)) {
    throw new Error(`Invalid puzzle ID: ${puzzleId}`);
  }
  return puzzleId.slice(0, 4);
}
