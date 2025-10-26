"use client";

import { useEffect, useCallback } from "react";
import { useSudokuStore } from "@/stores/sudoku-store";
import { GlobalPosition, globalToLocal, getAffectedCells, positionsEqual } from "@/lib/sudoku/coordinates";
import { Cell } from "./Cell";

export function SamuraiBoard() {
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

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className="grid grid-cols-21 gap-0 w-full aspect-square border-2 border-border"
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

      {/* Legend for mobile */}
      <div className="mt-4 text-sm text-center text-muted-foreground md:hidden">
        <p>Tap a cell and use the number pad below to fill it</p>
      </div>

      {/* Legend for desktop */}
      <div className="mt-4 text-sm text-center text-muted-foreground hidden md:block">
        <p>Use arrow keys to navigate, 1-9 to fill, Backspace to clear</p>
      </div>
    </div>
  );
}
