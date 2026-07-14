import { globalToLocal } from "@/lib/sudoku/coordinates";
import { getGlobalInitialBoard } from "@/lib/sudoku/solution-counter";
import type { Puzzle } from "@/lib/sudoku/types";

interface MiniSamuraiPreviewProps {
  ariaLabel: string;
  puzzle: Puzzle | null;
}

export function MiniSamuraiPreview({
  ariaLabel,
  puzzle,
}: MiniSamuraiPreviewProps) {
  const board = puzzle
    ? getGlobalInitialBoard(puzzle)
    : Array.from({ length: 21 }, () => Array(21).fill(0));

  return (
    <div
      className="grid aspect-square w-full max-w-[420px] border-2 border-foreground bg-white text-[7px] text-slate-950 shadow-sm sm:text-[9px]"
      style={{ gridTemplateColumns: "repeat(21, minmax(0, 1fr))" }}
      aria-label={ariaLabel}
    >
      {Array.from({ length: 21 * 21 }, (_, index) => {
        const row = Math.floor(index / 21);
        const col = index % 21;
        const locals = globalToLocal({ row, col });
        const value = board[row]?.[col] ?? 0;

        if (locals.length === 0) {
          return (
            <span
              key={`${row}-${col}`}
              className="aspect-square bg-transparent"
              aria-hidden
            />
          );
        }

        const hasTopEdge = locals.some(
          (local) => local.row === 0 || local.row % 3 === 0,
        );
        const hasLeftEdge = locals.some(
          (local) => local.col === 0 || local.col % 3 === 0,
        );
        const hasBottomEdge = locals.some((local) => local.row === 8);
        const hasRightEdge = locals.some((local) => local.col === 8);

        return (
          <span
            key={`${row}-${col}`}
            className={[
              "flex aspect-square items-center justify-center border-slate-700 font-semibold",
              locals.length > 1 ? "bg-primary/10" : "bg-white",
            ].join(" ")}
            style={{
              borderTopWidth: hasTopEdge ? 2 : 1,
              borderLeftWidth: hasLeftEdge ? 2 : 1,
              borderBottomWidth: hasBottomEdge ? 2 : 1,
              borderRightWidth: hasRightEdge ? 2 : 1,
            }}
          >
            {value || ""}
          </span>
        );
      })}
    </div>
  );
}
