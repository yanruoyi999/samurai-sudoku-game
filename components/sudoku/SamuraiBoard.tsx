"use client";

import { useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSudokuStore } from "@/stores/sudoku-store";
import { GlobalPosition, globalToLocal, getAffectedCells, positionsEqual } from "@/lib/sudoku/coordinates";
import { Cell } from "./Cell";

export function SamuraiBoard() {
  const t = useTranslations("game");
  const {
    board,
    initial,
    selectedCell,
    showConflicts,
    showCandidates,
    engine,
    selectCell,
    setCell,
  } = useSudokuStore();

  // Handle cell click
  const handleCellClick = useCallback(
    (pos: GlobalPosition) => {
      if (initial[pos.row][pos.col]) return; // Can't select initial cells
      selectCell(pos);
    },
    [initial, selectCell]
  );

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedCell) return;

      // Number keys (1-9)
      if (e.key >= "1" && e.key <= "9") {
        const num = parseInt(e.key);
        setCell(selectedCell, num);
      }

      // Backspace or Delete to clear
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        setCell(selectedCell, 0);
      }

      // Arrow keys for navigation
      if (e.key === "ArrowUp" && selectedCell.row > 0) {
        selectCell({ ...selectedCell, row: selectedCell.row - 1 });
      }
      if (e.key === "ArrowDown" && selectedCell.row < 20) {
        selectCell({ ...selectedCell, row: selectedCell.row + 1 });
      }
      if (e.key === "ArrowLeft" && selectedCell.col > 0) {
        selectCell({ ...selectedCell, col: selectedCell.col - 1 });
      }
      if (e.key === "ArrowRight" && selectedCell.col < 20) {
        selectCell({ ...selectedCell, col: selectedCell.col + 1 });
      }
    },
    [selectedCell, setCell, selectCell]
  );

  // Add keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Check if a cell should be highlighted
  const isCellHighlighted = useCallback(
    (pos: GlobalPosition): boolean => {
      if (!selectedCell) return false;
      if (positionsEqual(pos, selectedCell)) return false;

      const affected = getAffectedCells(selectedCell);

      return (
        affected.row.some((p) => positionsEqual(p, pos)) ||
        affected.col.some((p) => positionsEqual(p, pos)) ||
        affected.box.some((p) => positionsEqual(p, pos))
      );
    },
    [selectedCell]
  );

  // Check if a cell has a conflict
  const hasCellConflict = useCallback(
    (pos: GlobalPosition): boolean => {
      if (!showConflicts || !engine) return false;

      const value = board[pos.row][pos.col];
      if (value === 0) return false;

      return engine.hasConflict(pos, value);
    },
    [showConflicts, engine, board]
  );

  // Check if position is in a valid grid
  const isValidPosition = useCallback((pos: GlobalPosition): boolean => {
    const locals = globalToLocal(pos);
    return locals.length > 0;
  }, []);

  // Origins (row, col) of the five overlapping 9x9 grids
  const SUBGRIDS: Array<[number, number]> = [
    [0, 0],
    [0, 12],
    [12, 0],
    [12, 12],
    [6, 6],
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative w-full aspect-square">
      <div
        className="grid grid-cols-21 gap-0 w-full aspect-square"
        style={{
          gridTemplateColumns: 'repeat(21, minmax(0, 1fr))'
        }}
      >
        {Array.from({ length: 21 * 21 }).map((_, idx) => {
          const row = Math.floor(idx / 21);
          const col = idx % 21;
          const pos = { row, col };

          // Skip cells that don't belong to any grid
          if (!isValidPosition(pos)) {
            return (
              <div
                key={`${row}-${col}`}
                className="bg-muted/50"
              />
            );
          }

          // Get candidates for this cell
          const candidates = engine?.getCandidates(pos);

          return (
            <Cell
              key={`${row}-${col}`}
              position={pos}
              value={board[row][col]}
              isInitial={initial[row][col]}
              isSelected={
                selectedCell?.row === row && selectedCell?.col === col
              }
              isHighlighted={isCellHighlighted(pos)}
              hasConflict={hasCellConflict(pos)}
              candidates={candidates}
              showCandidates={showCandidates}
              onClick={() => handleCellClick(pos)}
            />
          );
        })}
      </div>

      {/* Box & sub-grid separators drawn on top so the samurai cross reads clearly */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 21 21"
        preserveAspectRatio="none"
        aria-hidden
      >
        {SUBGRIDS.map(([br, bc], i) => (
          <g key={i} stroke="hsl(var(--cell-box-line))" fill="none" strokeLinecap="square">
            {/* internal 3x3 lines */}
            {[3, 6].map((k) => (
              <line key={`v${k}`} x1={bc + k} y1={br} x2={bc + k} y2={br + 9} strokeWidth={0.1} />
            ))}
            {[3, 6].map((k) => (
              <line key={`h${k}`} x1={bc} y1={br + k} x2={bc + 9} y2={br + k} strokeWidth={0.1} />
            ))}
            {/* outer 9x9 frame */}
            <rect x={bc} y={br} width={9} height={9} strokeWidth={0.18} />
          </g>
        ))}
      </svg>
      </div>

      {/* Legend for mobile */}
      <div className="mt-4 text-sm text-center text-muted-foreground md:hidden">
        <p>{t("hintTapCell")}</p>
      </div>

      {/* Legend for desktop */}
      <div className="mt-4 text-sm text-center text-muted-foreground hidden md:block">
        <p>{t("hintKeyboard")}</p>
      </div>
    </div>
  );
}
