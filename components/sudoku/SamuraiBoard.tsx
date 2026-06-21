"use client";

import { useEffect, useCallback, useMemo } from "react";
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
    candidates,
    selectCell,
    setCell,
    clearCell,
    toggleCandidate,
    undo,
    redo,
  } = useSudokuStore();

  const validCellKeys = useMemo(() => {
    const keys = new Set<string>();

    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        if (globalToLocal({ row, col }).length > 0) {
          keys.add(`${row},${col}`);
        }
      }
    }

    return keys;
  }, []);

  const highlightedCellKeys = useMemo(() => {
    if (!selectedCell) return new Set<string>();

    const affected = getAffectedCells(selectedCell);
    return new Set(
      [...affected.row, ...affected.col, ...affected.box, ...affected.overlap]
        .filter((pos) => !positionsEqual(pos, selectedCell))
        .map((pos) => `${pos.row},${pos.col}`)
    );
  }, [selectedCell]);

  const findNextSelectableCell = useCallback(
    (start: GlobalPosition, delta: { row: number; col: number }) => {
      let row = start.row + delta.row;
      let col = start.col + delta.col;

      while (row >= 0 && row < 21 && col >= 0 && col < 21) {
        if (validCellKeys.has(`${row},${col}`) && !initial[row][col]) {
          return { row, col };
        }

        row += delta.row;
        col += delta.col;
      }

      return start;
    },
    [initial, validCellKeys]
  );

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
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      if (!selectedCell) return;

      // Number keys (1-9)
      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const num = parseInt(e.key);
        if (showCandidates) {
          toggleCandidate(selectedCell, num);
        } else {
          setCell(selectedCell, num);
        }
        return;
      }

      // Backspace or Delete to clear
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        e.preventDefault();
        clearCell(selectedCell);
        return;
      }

      // Arrow keys for navigation
      const navigation: Record<string, { row: number; col: number }> = {
        ArrowUp: { row: -1, col: 0 },
        ArrowDown: { row: 1, col: 0 },
        ArrowLeft: { row: 0, col: -1 },
        ArrowRight: { row: 0, col: 1 },
      };
      const delta = navigation[e.key];
      if (delta) {
        e.preventDefault();
        selectCell(findNextSelectableCell(selectedCell, delta));
      }
    },
    [
      selectedCell,
      showCandidates,
      setCell,
      clearCell,
      toggleCandidate,
      selectCell,
      findNextSelectableCell,
      undo,
      redo,
    ]
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

      return highlightedCellKeys.has(`${pos.row},${pos.col}`);
    },
    [highlightedCellKeys, selectedCell]
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
    return validCellKeys.has(`${pos.row},${pos.col}`);
  }, [validCellKeys]);

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

          // Show user-entered candidate notes. Engine candidates are surfaced in the number pad.
          const candidateNotes = candidates.get(`${row},${col}`);

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
              candidates={candidateNotes}
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
