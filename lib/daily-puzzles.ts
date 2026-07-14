import type { PuzzleMetadata } from "@/lib/sudoku/types";

export function selectRecentDailyPuzzles(
  puzzles: PuzzleMetadata[],
  limit: number,
): PuzzleMetadata[] {
  const safeLimit = Math.max(0, Math.floor(limit));

  return [...puzzles]
    .sort((left, right) => right.id.localeCompare(left.id))
    .slice(0, safeLimit);
}
