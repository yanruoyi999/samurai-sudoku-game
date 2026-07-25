"use client";

import { useEffect, useState } from "react";

import { trackInteraction } from "@/lib/analytics/events";
import {
  KIDS_SUDOKU_PUZZLES,
  checkKidsSudokuGrid,
  createKidsSudokuGrid,
  type KidsSudokuStatus,
} from "@/lib/kids-sudoku/puzzles";
import { cn } from "@/lib/utils";

interface KidsSudoku4x4Props {
  locale: string;
}

type SelectedCell = { row: number; column: number } | null;

export function KidsSudoku4x4({ locale }: KidsSudoku4x4Props) {
  const isZh = locale === "zh";
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = KIDS_SUDOKU_PUZZLES[puzzleIndex];
  const [grid, setGrid] = useState(() => createKidsSudokuGrid(puzzle));
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [status, setStatus] = useState<KidsSudokuStatus | null>(null);

  function setCellValue(value: number) {
    if (!selectedCell) return;
    const { row, column } = selectedCell;
    if (puzzle.grid[row][column] !== 0) return;

    setGrid((currentGrid) => {
      const nextGrid = currentGrid.map((currentRow) => [...currentRow]);
      nextGrid[row][column] = value;
      return nextGrid;
    });
    setStatus(null);
  }

  function resetPuzzle() {
    setGrid(createKidsSudokuGrid(puzzle));
    setSelectedCell(null);
    setStatus(null);
    trackInteraction("kids_sudoku_reset", {
      locale,
      puzzle_id: puzzle.id,
    });
  }

  function checkPuzzle() {
    const result = checkKidsSudokuGrid(grid, puzzle);
    setStatus(result);
    trackInteraction("kids_sudoku_check", {
      locale,
      puzzle_id: puzzle.id,
      result,
    });
  }

  function nextPuzzle() {
    const nextIndex = (puzzleIndex + 1) % KIDS_SUDOKU_PUZZLES.length;
    const nextPuzzleItem = KIDS_SUDOKU_PUZZLES[nextIndex];
    setPuzzleIndex(nextIndex);
    setGrid(createKidsSudokuGrid(nextPuzzleItem));
    setSelectedCell(null);
    setStatus(null);
    trackInteraction("kids_sudoku_next", {
      locale,
      puzzle_id: puzzle.id,
      next_puzzle_id: nextPuzzleItem.id,
    });
  }

  function printPuzzle() {
    trackInteraction("kids_sudoku_print", {
      locale,
      puzzle_id: puzzle.id,
    });
    window.print();
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (["1", "2", "3", "4"].includes(event.key)) {
        event.preventDefault();
        setCellValue(Number(event.key));
      }
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        setCellValue(0);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const feedback = status
    ? {
        complete: isZh
          ? "完成了！每一行、每一列和每个 2×2 宫都正确。"
          : "Great job! Every row, column, and 2×2 box is correct.",
        incorrect: isZh
          ? "有一个或多个数字不正确。先检查高亮格，再试一次。"
          : "One or more numbers are incorrect. Check the highlighted cells and try again.",
        incomplete: isZh
          ? "还有空格没有填写。继续完成后再检查。"
          : "There are still empty cells. Finish the puzzle, then check again.",
      }[status]
    : null;

  return (
    <section
      className="rounded-2xl border bg-card p-5 shadow-sm print:border-0 print:p-0 print:shadow-none"
      aria-labelledby="kids-sudoku-board-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h2 id="kids-sudoku-board-heading" className="text-2xl font-semibold">
            {isZh ? "免费 4×4 儿童数独" : "Free 4×4 Kids Sudoku"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isZh
              ? `第 ${puzzleIndex + 1} 题，共 ${KIDS_SUDOKU_PUZZLES.length} 题 · ${puzzle.clueCount} 个已知数字`
              : `Puzzle ${puzzleIndex + 1} of ${KIDS_SUDOKU_PUZZLES.length} · ${puzzle.clueCount} clues`}
          </p>
        </div>
        <button
          type="button"
          onClick={printPuzzle}
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-accent"
        >
          {isZh ? "打印练习页" : "Print worksheet"}
        </button>
      </div>

      <p className="mt-4 hidden text-center text-lg font-semibold print:block">
        {isZh ? "4×4 儿童数独练习" : "4×4 Sudoku for Kids Worksheet"}
      </p>

      <div className="mx-auto mt-6 grid aspect-square w-full max-w-sm grid-cols-4 overflow-hidden rounded-xl border-2 border-foreground/80 bg-background">
        {grid.map((row, rowIndex) =>
          row.map((value, columnIndex) => {
            const isGiven = puzzle.grid[rowIndex][columnIndex] !== 0;
            const isSelected =
              selectedCell?.row === rowIndex && selectedCell.column === columnIndex;
            const isWrong =
              status === "incorrect" &&
              value !== 0 &&
              value !== puzzle.solution[rowIndex][columnIndex];

            return (
              <button
                key={`${rowIndex}-${columnIndex}`}
                type="button"
                disabled={isGiven}
                onClick={() => setSelectedCell({ row: rowIndex, column: columnIndex })}
                aria-label={
                  isZh
                    ? `第 ${rowIndex + 1} 行，第 ${columnIndex + 1} 列${isGiven ? `，已知数字 ${value}` : value ? `，数字 ${value}` : "，空格"}`
                    : `Row ${rowIndex + 1}, column ${columnIndex + 1}${isGiven ? `, given ${value}` : value ? `, value ${value}` : ", empty"}`
                }
                className={cn(
                  "flex items-center justify-center border-b border-r text-3xl font-semibold transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary print:text-black",
                  columnIndex === 1 && "border-r-2 border-r-foreground/80",
                  columnIndex === 3 && "border-r-0",
                  rowIndex === 1 && "border-b-2 border-b-foreground/80",
                  rowIndex === 3 && "border-b-0",
                  isGiven && "cursor-default bg-secondary/70 font-bold text-foreground",
                  !isGiven && "hover:bg-primary/5",
                  isSelected && !isGiven && "bg-primary/15 ring-2 ring-inset ring-primary",
                  isWrong && "bg-destructive/15 text-destructive",
                )}
              >
                {value || ""}
              </button>
            );
          }),
        )}
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2 print:hidden" aria-label={isZh ? "数字键盘" : "Number pad"}>
        {[1, 2, 3, 4].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setCellValue(value)}
            className="rounded-lg bg-primary px-4 py-3 text-xl font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-4 print:hidden">
        <button
          type="button"
          onClick={() => setCellValue(0)}
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-accent"
        >
          {isZh ? "清除" : "Clear"}
        </button>
        <button
          type="button"
          onClick={checkPuzzle}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          {isZh ? "检查答案" : "Check puzzle"}
        </button>
        <button
          type="button"
          onClick={resetPuzzle}
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-accent"
        >
          {isZh ? "重新开始" : "Reset"}
        </button>
        <button
          type="button"
          onClick={nextPuzzle}
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-accent"
        >
          {isZh ? "下一题" : "Next puzzle"}
        </button>
      </div>

      {feedback && (
        <p
          className={cn(
            "mt-4 rounded-lg border px-4 py-3 text-sm font-medium print:hidden",
            status === "complete" && "border-primary/40 bg-primary/10 text-primary",
            status === "incorrect" && "border-destructive/40 bg-destructive/10 text-destructive",
            status === "incomplete" && "bg-secondary/40 text-foreground",
          )}
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      )}
    </section>
  );
}
