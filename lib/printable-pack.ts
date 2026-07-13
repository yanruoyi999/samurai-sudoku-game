import type { Difficulty, PuzzleMetadata } from "@/lib/sudoku/types";

export const PRINTABLE_STARTER_DIFFICULTIES = ["easy", "medium", "hard", "evil"] as const satisfies readonly Difficulty[];
export const PRINTABLE_STARTER_PER_DIFFICULTY = 5;

export function getPrintableDifficultyLabel(difficulty: Difficulty, locale: string) {
  if (locale === "zh") {
    return difficulty === "evil" ? "Expert 极难" : {
      easy: "Easy 简单",
      medium: "Medium 中等",
      hard: "Hard 困难",
      evil: "Expert 极难",
    }[difficulty];
  }

  return difficulty === "evil" ? "Expert" : {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    evil: "Expert",
  }[difficulty];
}

export function selectPrintableStarterPack(
  puzzles: PuzzleMetadata[],
  perDifficulty = PRINTABLE_STARTER_PER_DIFFICULTY,
) {
  return PRINTABLE_STARTER_DIFFICULTIES.flatMap((difficulty) =>
    puzzles.filter((puzzle) => puzzle.difficulty === difficulty).slice(0, perDifficulty),
  );
}

export function groupPrintablePackByDifficulty(puzzles: PuzzleMetadata[]) {
  return PRINTABLE_STARTER_DIFFICULTIES.map((difficulty) => ({
    difficulty,
    puzzles: puzzles.filter((puzzle) => puzzle.difficulty === difficulty),
  }));
}
