"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { trackInteraction } from "@/lib/analytics/events";
import {
  ALL_KIDS_SUDOKU_PUZZLES,
  checkKidsSudokuGrid,
  cloneKidsSudokuGrid,
  type KidsSudokuGrid,
  type KidsSudokuLevel,
  type KidsSudokuPuzzle,
  type KidsSudokuStatus,
} from "@/lib/kids-sudoku/puzzles";
import {
  readKidsSudokuProgress,
  writeKidsSudokuProgress,
} from "@/lib/kids-sudoku/progress";
import { cn } from "@/lib/utils";

interface KidsSudokuActivityProps {
  locale: string;
  puzzles: readonly KidsSudokuPuzzle[];
  nextStageHref: string;
  nextStageLabel: { en: string; zh: string };
  storageEnabled?: boolean;
}

type SelectedCell = { row: number; column: number } | null;

const LEVEL_ORDER: KidsSudokuLevel[] = ["easy", "medium", "challenge"];

function getLevelLabel(level: KidsSudokuLevel, isZh: boolean) {
  if (isZh) {
    return { easy: "简单", medium: "中等", challenge: "挑战" }[level];
  }
  return { easy: "Easy", medium: "Medium", challenge: "Challenge" }[level];
}

export function KidsSudokuActivity({
  locale,
  puzzles,
  nextStageHref,
  nextStageLabel,
  storageEnabled = true,
}: KidsSudokuActivityProps) {
  const normalizedLocale = locale === "zh" ? "zh" : "en";
  const isZh = normalizedLocale === "zh";
  const firstPuzzle = puzzles[0];
  const [level, setLevel] = useState<KidsSudokuLevel>(firstPuzzle.level);
  const [puzzleId, setPuzzleId] = useState(firstPuzzle.id);
  const [grid, setGrid] = useState<KidsSudokuGrid>(() => cloneKidsSudokuGrid(firstPuzzle.grid));
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [status, setStatus] = useState<KidsSudokuStatus | null>(null);
  const [completedPuzzleIds, setCompletedPuzzleIds] = useState<string[]>([]);
  const [hasRestored, setHasRestored] = useState(false);
  const completedIdsRef = useRef(new Set<string>());

  const levelPuzzles = useMemo(
    () => puzzles.filter((puzzle) => puzzle.level === level),
    [level, puzzles],
  );
  const puzzle = useMemo(
    () => puzzles.find((item) => item.id === puzzleId) ?? levelPuzzles[0] ?? firstPuzzle,
    [firstPuzzle, levelPuzzles, puzzleId, puzzles],
  );
  const availableLevels = useMemo(
    () => LEVEL_ORDER.filter((item) => puzzles.some((puzzleItem) => puzzleItem.level === item)),
    [puzzles],
  );
  const solvedInLibrary = completedPuzzleIds.filter((id) => puzzles.some((puzzleItem) => puzzleItem.id === id)).length;

  const setCellValue = useCallback((value: number) => {
    if (!selectedCell) return;
    const { row, column } = selectedCell;
    if (puzzle.grid[row][column] !== 0) return;

    setGrid((currentGrid) => {
      const nextGrid = cloneKidsSudokuGrid(currentGrid);
      nextGrid[row][column] = value;
      return nextGrid;
    });
    setStatus(null);
  }, [puzzle, selectedCell]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const allowed = Array.from({ length: puzzle.spec.size }, (_, index) => String(index + 1));
    if (allowed.includes(event.key)) {
      event.preventDefault();
      setCellValue(Number(event.key));
    } else if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
      event.preventDefault();
      setCellValue(0);
    }
  }, [puzzle.spec.size, setCellValue]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!storageEnabled) {
      setHasRestored(true);
      return;
    }

    const restored = readKidsSudokuProgress(
      window.localStorage,
      ALL_KIDS_SUDOKU_PUZZLES,
    );
    if (restored) {
      const restoredPuzzle = puzzles.find((item) => item.id === restored.puzzleId);
      completedIdsRef.current = new Set(restored.completedPuzzleIds);
      setCompletedPuzzleIds(restored.completedPuzzleIds);

      if (restoredPuzzle) {
        setLevel(restoredPuzzle.level);
        setPuzzleId(restoredPuzzle.id);
        setGrid(cloneKidsSudokuGrid(restored.grid));
        trackInteraction("kids_sudoku_progress_restored", {
          locale: normalizedLocale,
          puzzle_id: restoredPuzzle.id,
          size: restoredPuzzle.spec.size,
          level: restoredPuzzle.level,
        });
      }
    }
    setHasRestored(true);
  }, [normalizedLocale, puzzles, storageEnabled]);

  useEffect(() => {
    if (!storageEnabled || !hasRestored) return;
    writeKidsSudokuProgress(window.localStorage, {
      version: 1,
      puzzleId: puzzle.id,
      grid,
      completedPuzzleIds,
      updatedAt: Date.now(),
    });
  }, [completedPuzzleIds, grid, hasRestored, puzzle.id, storageEnabled]);

  const selectPuzzle = useCallback((nextPuzzle: KidsSudokuPuzzle) => {
    setPuzzleId(nextPuzzle.id);
    setGrid(cloneKidsSudokuGrid(nextPuzzle.grid));
    setSelectedCell(null);
    setStatus(null);
  }, []);

  const resetPuzzle = useCallback(() => {
    setGrid(cloneKidsSudokuGrid(puzzle.grid));
    setSelectedCell(null);
    setStatus(null);
    trackInteraction("kids_sudoku_reset", {
      locale: normalizedLocale,
      puzzle_id: puzzle.id,
      size: puzzle.spec.size,
      level: puzzle.level,
    });
  }, [normalizedLocale, puzzle]);

  const nextPuzzle = useCallback((location = "activity_controls") => {
    const currentIndex = Math.max(0, levelPuzzles.findIndex((item) => item.id === puzzle.id));
    const nextItem = levelPuzzles[(currentIndex + 1) % levelPuzzles.length] ?? firstPuzzle;
    selectPuzzle(nextItem);
    trackInteraction(
      location === "completion" ? "kids_sudoku_completion_cta_click" : "kids_sudoku_next",
      {
        locale: normalizedLocale,
        puzzle_id: puzzle.id,
        next_puzzle_id: nextItem.id,
        size: puzzle.spec.size,
        level: puzzle.level,
        action: "another_puzzle",
        location,
      },
    );
  }, [firstPuzzle, levelPuzzles, normalizedLocale, puzzle, selectPuzzle]);

  const checkPuzzle = useCallback(() => {
    const result = checkKidsSudokuGrid(grid, puzzle);
    setStatus(result);
    trackInteraction("kids_sudoku_check", {
      locale: normalizedLocale,
      puzzle_id: puzzle.id,
      size: puzzle.spec.size,
      level: puzzle.level,
      result,
    });

    if (result === "complete" && !completedIdsRef.current.has(puzzle.id)) {
      completedIdsRef.current.add(puzzle.id);
      const nextCompleted = [...completedIdsRef.current];
      setCompletedPuzzleIds(nextCompleted);
      trackInteraction("kids_sudoku_completed", {
        locale: normalizedLocale,
        puzzle_id: puzzle.id,
        size: puzzle.spec.size,
        level: puzzle.level,
        completed_count: nextCompleted.length,
      });
    }
  }, [grid, normalizedLocale, puzzle]);

  const changeLevel = useCallback((nextLevel: KidsSudokuLevel) => {
    const nextPuzzleItem = puzzles.find((item) => item.level === nextLevel);
    if (!nextPuzzleItem) return;
    setLevel(nextLevel);
    selectPuzzle(nextPuzzleItem);
    trackInteraction("kids_sudoku_level_change", {
      locale: normalizedLocale,
      size: nextPuzzleItem.spec.size,
      level: nextLevel,
    });
  }, [normalizedLocale, puzzles, selectPuzzle]);

  const printPuzzle = useCallback(() => {
    trackInteraction("kids_sudoku_print", {
      locale: normalizedLocale,
      puzzle_id: puzzle.id,
      size: puzzle.spec.size,
      level: puzzle.level,
    });
    window.print();
  }, [normalizedLocale, puzzle]);

  const feedback = status
    ? {
        complete: isZh
          ? "完成了！每一行、每一列和每个宫都正确。"
          : "Great job! Every row, column, and box is correct.",
        incorrect: isZh
          ? "有一个或多个数字不正确。先检查高亮格，再试一次。"
          : "One or more numbers are incorrect. Check the highlighted cells and try again.",
        incomplete: isZh
          ? "还有空格没有填写。继续完成后再检查。"
          : "There are still empty cells. Finish the puzzle, then check again.",
      }[status]
    : null;

  const sizeLabel = `${puzzle.spec.size}×${puzzle.spec.size}`;
  const numberPadValues = Array.from({ length: puzzle.spec.size }, (_, index) => index + 1);

  return (
    <section
      className="rounded-2xl border bg-card p-5 shadow-sm print:border-0 print:p-0 print:shadow-none"
      aria-labelledby="kids-sudoku-board-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h2 id="kids-sudoku-board-heading" className="text-2xl font-semibold">
            {isZh ? `免费 ${sizeLabel} 儿童数独` : `Free ${sizeLabel} Kids Sudoku`}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isZh
              ? `${getLevelLabel(puzzle.level, true)} · ${puzzle.clueCount} 个已知数字 · 已完成 ${solvedInLibrary}/${puzzles.length}`
              : `${getLevelLabel(puzzle.level, false)} · ${puzzle.clueCount} clues · ${solvedInLibrary}/${puzzles.length} solved`}
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

      <div className="mt-4 flex flex-wrap items-center gap-2 print:hidden">
        <label htmlFor={`kids-sudoku-level-${puzzle.spec.size}`} className="text-sm font-medium">
          {isZh ? "难度" : "Level"}
        </label>
        <select
          id={`kids-sudoku-level-${puzzle.spec.size}`}
          value={level}
          onChange={(event) => changeLevel(event.target.value as KidsSudokuLevel)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          {availableLevels.map((item) => (
            <option key={item} value={item}>{getLevelLabel(item, isZh)}</option>
          ))}
        </select>
      </div>

      <p className="mt-4 hidden text-center text-lg font-semibold print:block">
        {isZh ? `${sizeLabel} 儿童数独练习` : `${sizeLabel} Sudoku for Kids Worksheet`}
      </p>

      <div
        className={cn(
          "mx-auto mt-6 grid aspect-square w-full overflow-hidden rounded-xl border-2 border-foreground/80 bg-background",
          puzzle.spec.size === 4 ? "max-w-sm" : "max-w-lg",
        )}
        style={{ gridTemplateColumns: `repeat(${puzzle.spec.size}, minmax(0, 1fr))` }}
      >
        {grid.map((row, rowIndex) =>
          row.map((value, columnIndex) => {
            const isGiven = puzzle.grid[rowIndex][columnIndex] !== 0;
            const isSelected = selectedCell?.row === rowIndex && selectedCell.column === columnIndex;
            const isWrong = status === "incorrect" && value !== 0 && value !== puzzle.solution[rowIndex][columnIndex];
            const thickRight = (columnIndex + 1) % puzzle.spec.boxColumns === 0 && columnIndex < puzzle.spec.size - 1;
            const thickBottom = (rowIndex + 1) % puzzle.spec.boxRows === 0 && rowIndex < puzzle.spec.size - 1;

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
                  "flex items-center justify-center border-b border-r font-semibold transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary print:text-black",
                  puzzle.spec.size === 4 ? "text-3xl" : "text-xl sm:text-2xl",
                  columnIndex === puzzle.spec.size - 1 && "border-r-0",
                  rowIndex === puzzle.spec.size - 1 && "border-b-0",
                  thickRight && "border-r-2 border-r-foreground/80",
                  thickBottom && "border-b-2 border-b-foreground/80",
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

      <div
        className="mt-5 grid gap-2 print:hidden"
        style={{ gridTemplateColumns: `repeat(${puzzle.spec.size}, minmax(0, 1fr))` }}
        aria-label={isZh ? "数字键盘" : "Number pad"}
      >
        {numberPadValues.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setCellValue(value)}
            className="rounded-lg bg-primary px-3 py-3 text-xl font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-4 print:hidden">
        <button type="button" onClick={() => setCellValue(0)} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-accent">
          {isZh ? "清除" : "Clear"}
        </button>
        <button type="button" onClick={checkPuzzle} className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
          {isZh ? "检查答案" : "Check puzzle"}
        </button>
        <button type="button" onClick={resetPuzzle} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-accent">
          {isZh ? "重新开始" : "Reset"}
        </button>
        <button type="button" onClick={() => nextPuzzle()} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-accent">
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

      {status === "complete" && (
        <section className="mt-4 rounded-xl border bg-primary/5 p-4 print:hidden">
          <h3 className="text-lg font-semibold">
            {isZh ? `🎉 已完成 ${solvedInLibrary}/${puzzles.length} 题` : `🎉 ${solvedInLibrary}/${puzzles.length} puzzles completed`}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => nextPuzzle("completion")}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {isZh ? "再做一题" : "Another puzzle"}
            </button>
            <TrackedLink
              href={`/${normalizedLocale}/sudoku-for-kids/printable`}
              eventName="kids_sudoku_completion_cta_click"
              eventProperties={{ locale: normalizedLocale, action: "printable_worksheets", size: puzzle.spec.size, level: puzzle.level, location: "completion" }}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              {isZh ? "可打印练习" : "Printable worksheets"}
            </TrackedLink>
            <TrackedLink
              href={nextStageHref}
              eventName="kids_sudoku_completion_cta_click"
              eventProperties={{ locale: normalizedLocale, action: "next_stage", size: puzzle.spec.size, level: puzzle.level, location: "completion" }}
              className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-accent"
            >
              {isZh ? nextStageLabel.zh : nextStageLabel.en}
            </TrackedLink>
          </div>
        </section>
      )}

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground print:hidden">
        {isZh
          ? "进度只保存在当前浏览器，30 天后自动过期；不会保存姓名、邮箱或儿童档案。"
          : "Progress stays only in this browser and expires after 30 days. No name, email, or child profile is saved."}
        {" "}
        <Link href={`/${normalizedLocale}/privacy`} className="font-medium text-primary hover:underline">
          {isZh ? "隐私说明" : "Privacy details"}
        </Link>
      </p>
    </section>
  );
}
