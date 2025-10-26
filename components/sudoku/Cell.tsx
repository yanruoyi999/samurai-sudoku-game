import { GlobalPosition } from "@/lib/sudoku/coordinates";
import { cn } from "@/lib/utils";

interface CellProps {
  position: GlobalPosition;
  value: number;
  isInitial: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  hasConflict: boolean;
  candidates?: Set<number>;
  showCandidates?: boolean;
  onClick: () => void;
}

export function Cell({
  value,
  isInitial,
  isSelected,
  isHighlighted,
  hasConflict,
  candidates,
  showCandidates,
  onClick,
}: CellProps) {
  // Show candidates only if cell is empty, showCandidates is true, and we have candidates
  const displayCandidates = !value && showCandidates && candidates && candidates.size > 0;

  return (
    <button
      className={cn(
        "sudoku-cell relative",
        "focus:outline-none focus:ring-1 focus:ring-primary",
        isInitial && "sudoku-cell-initial",
        isSelected && "sudoku-cell-selected",
        isHighlighted && !isSelected && "sudoku-cell-highlighted",
        hasConflict && "sudoku-cell-conflict",
        !isInitial && "cursor-pointer"
      )}
      onClick={onClick}
      disabled={isInitial}
      type="button"
    >
      {value ? (
        // Display main value
        <span className="text-lg md:text-xl font-medium">{value}</span>
      ) : displayCandidates ? (
        // Display candidates in a 3x3 grid
        <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5 text-[0.5rem] md:text-xs">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <div
              key={num}
              className={cn(
                "flex items-center justify-center",
                candidates.has(num)
                  ? "text-muted-foreground font-normal"
                  : "opacity-0"
              )}
            >
              {num}
            </div>
          ))}
        </div>
      ) : null}
    </button>
  );
}
