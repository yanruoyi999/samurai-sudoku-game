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
  position,
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
  const ariaLabel = value
    ? `Row ${position.row + 1}, column ${position.col + 1}, value ${value}${isInitial ? ', given' : ''}`
    : `Row ${position.row + 1}, column ${position.col + 1}, empty`;

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
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      data-invalid={hasConflict || undefined}
      title={ariaLabel}
    >
      {value ? (
        // Display main value — given clues in ink, player entries in vermilion/maple
        <span
          className={cn(
            "text-[clamp(0.65rem,2.6vw,1.25rem)] tabular leading-none",
            hasConflict
              ? "text-destructive font-semibold"
              : isInitial
              ? "sudoku-num-given"
              : "sudoku-num-entered"
          )}
        >
          {value}
        </span>
      ) : displayCandidates ? (
        // Display candidates in a 3x3 grid
        <div className="grid grid-cols-3 gap-0 w-full h-full p-px text-[clamp(0.3rem,1.1vw,0.65rem)] md:p-0.5">
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
