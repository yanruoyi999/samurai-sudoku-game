import { memo } from "react";
import { GlobalPosition } from "@/lib/sudoku/coordinates";
import { cn } from "@/lib/utils";

const CANDIDATE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

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

function areCandidateSetsEqual(a?: Set<number>, b?: Set<number>) {
  if (a === b) return true;
  if (!a || !b || a.size !== b.size) return false;

  for (const value of a) {
    if (!b.has(value)) return false;
  }

  return true;
}

function areCellPropsEqual(prev: CellProps, next: CellProps) {
  return (
    prev.position.row === next.position.row &&
    prev.position.col === next.position.col &&
    prev.value === next.value &&
    prev.isInitial === next.isInitial &&
    prev.isSelected === next.isSelected &&
    prev.isHighlighted === next.isHighlighted &&
    prev.hasConflict === next.hasConflict &&
    prev.showCandidates === next.showCandidates &&
    areCandidateSetsEqual(prev.candidates, next.candidates)
  );
}

function CellComponent({
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
            "text-lg md:text-xl tabular leading-none",
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
        <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5 text-[0.5rem] md:text-xs">
          {CANDIDATE_VALUES.map((num) => (
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

export const Cell = memo(CellComponent, areCellPropsEqual);
