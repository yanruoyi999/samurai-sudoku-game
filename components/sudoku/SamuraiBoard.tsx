"use client";

import { useEffect, useCallback, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSudokuStore } from "@/stores/sudoku-store";
import { GlobalPosition, globalToLocal, getAffectedCells, positionsEqual } from "@/lib/sudoku/coordinates";
import { trackInteraction } from "@/lib/analytics/events";
import { Cell } from "./Cell";

const BOARD_SIZE = 21;

// Origins (row, col) of the five overlapping 9x9 grids
const SUBGRIDS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0, 12],
  [12, 0],
  [12, 12],
  [6, 6],
];

const VALID_CELL_KEYS = (() => {
  const keys = new Set<string>();

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (globalToLocal({ row, col }).length > 0) {
        keys.add(`${row},${col}`);
      }
    }
  }

  return keys;
})();

const BOARD_CELLS: Array<{
  key: string;
  coordinateKey: string;
  isValid: boolean;
  position: GlobalPosition;
}> = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, idx) => {
  const row = Math.floor(idx / BOARD_SIZE);
  const col = idx % BOARD_SIZE;
  const coordinateKey = `${row},${col}`;
  const position: GlobalPosition = { row, col };

  return {
    key: `${row}-${col}`,
    coordinateKey,
    isValid: VALID_CELL_KEYS.has(coordinateKey),
    position,
  };
});

export function SamuraiBoard() {
  const t = useTranslations("game");
  const locale = useLocale();
  const puzzleId = useSudokuStore((state) => state.puzzleId);
  const board = useSudokuStore((state) => state.board);
  const initial = useSudokuStore((state) => state.initial);
  const selectedCell = useSudokuStore((state) => state.selectedCell);
  const showConflicts = useSudokuStore((state) => state.showConflicts);
  const showCandidates = useSudokuStore((state) => state.showCandidates);
  const engine = useSudokuStore((state) => state.engine);
  const candidates = useSudokuStore((state) => state.candidates);
  const selectCell = useSudokuStore((state) => state.selectCell);
  const setCell = useSudokuStore((state) => state.setCell);
  const clearCell = useSudokuStore((state) => state.clearCell);
  const toggleCandidate = useSudokuStore((state) => state.toggleCandidate);
  const undo = useSudokuStore((state) => state.undo);
  const redo = useSudokuStore((state) => state.redo);
  const trackedFirstSelectionPuzzleId = useRef<string | null>(null);
  const trackedFirstKeyboardInputPuzzleId = useRef<string | null>(null);

  const highlightedCellKeys = useMemo(() => {
    if (!selectedCell) return new Set<string>();

    const affected = getAffectedCells(selectedCell);
    return new Set(
      [...affected.row, ...affected.col, ...affected.box, ...affected.overlap]
        .filter((pos) => !positionsEqual(pos, selectedCell))
        .map((pos) => `${pos.row},${pos.col}`)
    );
  }, [selectedCell]);

  const conflictCellKeys = useMemo(() => {
    if (!showConflicts || !engine) return new Set<string>();

    const conflicts = new Set<string>();

    for (const { coordinateKey, isValid, position } of BOARD_CELLS) {
      if (!isValid) continue;

      const value = board[position.row][position.col];
      if (value !== 0 && engine.hasConflict(position, value)) {
        conflicts.add(coordinateKey);
      }
    }

    return conflicts;
  }, [showConflicts, engine, board]);

  const findNextSelectableCell = useCallback(
    (start: GlobalPosition, delta: { row: number; col: number }) => {
      let row = start.row + delta.row;
      let col = start.col + delta.col;

      while (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
        if (VALID_CELL_KEYS.has(`${row},${col}`) && !initial[row][col]) {
          return { row, col };
        }

        row += delta.row;
        col += delta.col;
      }

      return start;
    },
    [initial]
  );

  const trackFirstCellSelection = useCallback(
    (pos: GlobalPosition, source: "click" | "keyboard") => {
      if (!puzzleId || trackedFirstSelectionPuzzleId.current === puzzleId) return;

      trackedFirstSelectionPuzzleId.current = puzzleId;
      trackInteraction("sudoku_first_cell_select", {
        locale,
        puzzle_id: puzzleId,
        row: pos.row + 1,
        col: pos.col + 1,
        source,
      });
    },
    [locale, puzzleId]
  );

  const trackFirstKeyboardInput = useCallback(
    (value: number) => {
      if (!puzzleId || trackedFirstKeyboardInputPuzzleId.current === puzzleId) return;

      trackedFirstKeyboardInputPuzzleId.current = puzzleId;
      trackInteraction("sudoku_first_number_input", {
        locale,
        puzzle_id: puzzleId,
        value,
        note_mode: showCandidates,
        source: "keyboard",
      });
    },
    [locale, puzzleId, showCandidates]
  );

  // Handle cell click
  const handleCellClick = useCallback(
    (pos: GlobalPosition) => {
      if (initial[pos.row][pos.col]) return; // Can't select initial cells
      selectCell(pos);
      trackFirstCellSelection(pos, "click");
    },
    [initial, selectCell, trackFirstCellSelection]
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
        trackFirstKeyboardInput(num);
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
        const nextCell = findNextSelectableCell(selectedCell, delta);
        selectCell(nextCell);
        trackFirstCellSelection(nextCell, "keyboard");
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
      trackFirstCellSelection,
      trackFirstKeyboardInput,
      undo,
      redo,
    ]
  );

  // Add keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative w-full aspect-square">
      <div
        className="grid grid-cols-21 gap-0 w-full aspect-square"
        style={{
          gridTemplateColumns: 'repeat(21, minmax(0, 1fr))'
        }}
      >
        {BOARD_CELLS.map(({ coordinateKey, isValid, key, position }) => {
          const { row, col } = position;

          // Skip cells that don't belong to any grid
          if (!isValid) {
            return (
              <div
                key={key}
                className="bg-muted/50"
              />
            );
          }

          // Show user-entered candidate notes. Engine candidates are surfaced in the number pad.
          const candidateNotes = candidates.get(coordinateKey);

          return (
            <Cell
              key={key}
              position={position}
              value={board[row][col]}
              isInitial={initial[row][col]}
              isSelected={
                selectedCell?.row === row && selectedCell?.col === col
              }
              isHighlighted={
                !!selectedCell && highlightedCellKeys.has(coordinateKey)
              }
              hasConflict={conflictCellKeys.has(coordinateKey)}
              candidates={candidateNotes}
              showCandidates={showCandidates}
              onClick={() => handleCellClick(position)}
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
