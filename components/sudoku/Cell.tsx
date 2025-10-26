import { GlobalPosition } from "@/lib/sudoku/coordinates";
import { cn } from "@/lib/utils";

interface CellProps {
  position: GlobalPosition;
  value: number;
  isInitial: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  hasConflict: boolean;
  onClick: () => void;
}

export function Cell({
  value,
  isInitial,
  isSelected,
  isHighlighted,
  hasConflict,
  onClick,
}: CellProps) {
  return (
    <button
      className={cn(
        "sudoku-cell",
        "text-lg md:text-xl font-medium",
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
      {value || ""}
    </button>
  );
}
