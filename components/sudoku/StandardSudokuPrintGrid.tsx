import type { StandardSudokuPuzzle } from '@/lib/standard-sudoku/puzzles';

interface StandardSudokuPrintGridProps {
  puzzle: StandardSudokuPuzzle;
  label: string;
  showSolution?: boolean;
  compact?: boolean;
  largePrint?: boolean;
}

export function StandardSudokuPrintGrid({
  puzzle,
  label,
  showSolution = false,
  compact = false,
  largePrint = false,
}: StandardSudokuPrintGridProps) {
  const grid = showSolution ? puzzle.solution : puzzle.grid;

  return (
    <figure className="break-inside-avoid border bg-background p-4 print:border-0 print:p-2">
      <figcaption className="mb-3 flex items-center justify-between gap-3 text-sm font-semibold">
        <span>{label}</span>
        <span className="text-xs font-normal uppercase text-muted-foreground">
          {puzzle.id}
        </span>
      </figcaption>
      <div
        className={[
          'mx-auto grid aspect-square w-full grid-cols-9 border-2 border-foreground bg-background',
          largePrint ? 'max-w-[38rem]' : compact ? 'max-w-[22rem]' : 'max-w-[30rem]',
        ].join(' ')}
        role="img"
        aria-label={label}
      >
        {grid.flatMap((row, rowIndex) => row.map((value, columnIndex) => {
          const isRightBoxEdge = columnIndex === 2 || columnIndex === 5;
          const isBottomBoxEdge = rowIndex === 2 || rowIndex === 5;

          return (
            <span
              key={`${rowIndex}-${columnIndex}`}
              className={[
                'flex aspect-square items-center justify-center border-b border-r border-foreground/35 font-semibold tabular-nums',
                largePrint ? 'text-xl md:text-2xl print:text-xl' : 'text-base md:text-lg print:text-base',
                isRightBoxEdge ? 'border-r-2 border-r-foreground' : '',
                isBottomBoxEdge ? 'border-b-2 border-b-foreground' : '',
                columnIndex === 8 ? 'border-r-0' : '',
                rowIndex === 8 ? 'border-b-0' : '',
                showSolution && puzzle.grid[rowIndex][columnIndex] === 0
                  ? 'text-primary print:text-black'
                  : 'text-foreground',
              ].join(' ')}
            >
              {value === 0 ? '' : value}
            </span>
          );
        }))}
      </div>
    </figure>
  );
}
