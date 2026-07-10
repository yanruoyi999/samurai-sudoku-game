interface PuzzleLinkItem {
  id: string;
}

export function getNearbyPuzzles<T extends PuzzleLinkItem>(
  puzzles: T[],
  currentId: string,
  limit = 6,
): T[] {
  if (limit <= 0) return [];

  const currentIndex = puzzles.findIndex((puzzle) => puzzle.id === currentId);
  if (currentIndex < 0) return puzzles.slice(0, limit);

  return puzzles
    .map((puzzle, index) => ({
      puzzle,
      index,
      distance: Math.abs(index - currentIndex),
    }))
    .filter(({ index }) => index !== currentIndex)
    .sort((left, right) => left.distance - right.distance || left.index - right.index)
    .slice(0, limit)
    .map(({ puzzle }) => puzzle);
}
