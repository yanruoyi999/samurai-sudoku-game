import type { Difficulty, PuzzleMetadata } from "@/lib/sudoku/types";

export const PRINTABLE_STARTER_DIFFICULTIES = ["easy", "medium", "hard", "evil"] as const satisfies readonly Difficulty[];
export const PRINTABLE_STARTER_PER_DIFFICULTY = 5;
export const PRINTABLE_PAID_PER_DIFFICULTY = 25;
export const PRINTABLE_STARTER_A4_PDF = "/downloads/samurai-sudoku-starter-pack-with-solutions-a4.pdf";
export const PRINTABLE_STARTER_LETTER_PDF = "/downloads/samurai-sudoku-starter-pack-with-solutions-letter.pdf";
export const PRINTABLE_STARTER_A4_TWO_UP_PDF = "/downloads/samurai-sudoku-starter-pack-with-solutions-a4-2-per-page.pdf";
export const PRINTABLE_STARTER_LETTER_TWO_UP_PDF = "/downloads/samurai-sudoku-starter-pack-with-solutions-letter-2-per-page.pdf";

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

export function selectPrintablePaidPack(
  puzzles: PuzzleMetadata[],
  perDifficulty = PRINTABLE_PAID_PER_DIFFICULTY,
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
