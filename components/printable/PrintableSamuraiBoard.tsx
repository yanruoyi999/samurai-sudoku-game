import type { CSSProperties } from "react";

import { globalToLocal } from "@/lib/sudoku/coordinates";

const BOARD_SIZE = 21;

export function PrintablePageStyle() {
  return (
    <style>
      {`
        @media print {
          @page { size: letter portrait; margin: 0.35in; }
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}
    </style>
  );
}

function getCellBorderStyle(row: number, col: number): CSSProperties {
  const locals = globalToLocal({ row, col });
  const hasTopEdge = locals.some((local) => local.row === 0 || local.row % 3 === 0);
  const hasLeftEdge = locals.some((local) => local.col === 0 || local.col % 3 === 0);
  const hasBottomEdge = locals.some((local) => local.row === 8);
  const hasRightEdge = locals.some((local) => local.col === 8);

  return {
    borderTopWidth: hasTopEdge ? 2 : 1,
    borderLeftWidth: hasLeftEdge ? 2 : 1,
    borderBottomWidth: hasBottomEdge ? 2 : 1,
    borderRightWidth: hasRightEdge ? 2 : 1,
  };
}

export function PrintableSamuraiBoard({
  board,
  title,
  isAnswer = false,
  forcePageBreak = false,
}: {
  board: number[][];
  title: string;
  isAnswer?: boolean;
  forcePageBreak?: boolean;
}) {
  return (
    <section className={forcePageBreak ? "break-before-page pt-8 print:pt-0" : ""}>
      <h2 className="mb-3 text-xl font-semibold print:text-base">{title}</h2>
      <div
        className="grid w-full max-w-[9.2in] border-2 border-foreground bg-white text-foreground shadow-sm print:max-w-none print:shadow-none"
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
          const row = Math.floor(index / BOARD_SIZE);
          const col = index % BOARD_SIZE;
          const locals = globalToLocal({ row, col });
          const isPlayable = locals.length > 0;
          const value = board[row]?.[col] ?? 0;
          const isOverlap = locals.length > 1;

          if (!isPlayable) {
            return (
              <div
                key={`${row}-${col}`}
                className="aspect-square bg-transparent"
                aria-hidden="true"
              />
            );
          }

          return (
            <div
              key={`${row}-${col}`}
              className={[
                "flex aspect-square items-center justify-center border-slate-700 text-center font-semibold",
                "text-[clamp(0.48rem,2.1vw,1.05rem)] print:text-[9px]",
                isOverlap ? "bg-primary/10" : "bg-white",
                isAnswer ? "text-slate-700" : "text-slate-950",
              ].join(" ")}
              style={getCellBorderStyle(row, col)}
            >
              {value === 0 ? "" : value}
            </div>
          );
        })}
      </div>
    </section>
  );
}
