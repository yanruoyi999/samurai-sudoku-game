import { cn } from '@/lib/utils';
import type { KidsSudokuPuzzle } from '@/lib/kids-sudoku/core';

interface KidsSudokuPrintGridProps {
  puzzle: KidsSudokuPuzzle;
  label: string;
  showSolution?: boolean;
  compact?: boolean;
}

export function KidsSudokuPrintGrid({
  puzzle,
  label,
  showSolution = false,
  compact = false,
}: KidsSudokuPrintGridProps) {
  const values = showSolution ? puzzle.solution : puzzle.grid;

  return (
    <figure className="break-inside-avoid rounded-xl border bg-background p-4 print:rounded-none print:border-0 print:p-2">
      <figcaption className="mb-3 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-muted-foreground">
          {puzzle.spec.size}×{puzzle.spec.size} · {puzzle.level}
        </span>
      </figcaption>
      <div
        className={cn(
          'mx-auto grid aspect-square overflow-hidden border-2 border-foreground bg-white text-black',
          compact ? 'max-w-[220px]' : 'max-w-xs',
        )}
        style={{ gridTemplateColumns: `repeat(${puzzle.spec.size}, minmax(0, 1fr))` }}
        aria-label={label}
      >
        {values.map((row, rowIndex) =>
          row.map((value, columnIndex) => {
            const thickRight =
              (columnIndex + 1) % puzzle.spec.boxColumns === 0
              && columnIndex < puzzle.spec.size - 1;
            const thickBottom =
              (rowIndex + 1) % puzzle.spec.boxRows === 0
              && rowIndex < puzzle.spec.size - 1;

            return (
              <div
                key={`${rowIndex}-${columnIndex}`}
                className={cn(
                  'flex items-center justify-center border-b border-r border-foreground/50 font-semibold',
                  puzzle.spec.size === 4 ? 'text-2xl' : 'text-lg',
                  columnIndex === puzzle.spec.size - 1 && 'border-r-0',
                  rowIndex === puzzle.spec.size - 1 && 'border-b-0',
                  thickRight && 'border-r-2 border-r-foreground',
                  thickBottom && 'border-b-2 border-b-foreground',
                )}
              >
                {value || ''}
              </div>
            );
          }),
        )}
      </div>
    </figure>
  );
}
