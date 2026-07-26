"use client";

import { useMemo, useState } from "react";

import { trackInteraction } from "@/lib/analytics/events";
import {
  CROSS_HATCHING_EXAMPLES,
  analyzeCrossHatching,
} from "@/lib/sudoku/cross-hatching";
import { cn } from "@/lib/utils";

interface CrossHatchingTrainerProps {
  locale: string;
}

const STEP_COUNT = 4;

export function CrossHatchingTrainer({ locale }: CrossHatchingTrainerProps) {
  const normalizedLocale = locale === "zh" ? "zh" : "en";
  const isZh = normalizedLocale === "zh";
  const [exampleIndex, setExampleIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [attempt, setAttempt] = useState<{ row: number; column: number } | null>(null);
  const [solved, setSolved] = useState(false);
  const example = CROSS_HATCHING_EXAMPLES[exampleIndex];
  const analysis = useMemo(
    () =>
      analyzeCrossHatching(
        example.board,
        example.digit,
        example.boxRow,
        example.boxColumn,
      ),
    [example],
  );

  const stepLabels = isZh
    ? ["确定目标", "排除所在行", "排除所在列", "选择落点"]
    : ["Choose target", "Scan rows", "Scan columns", "Place digit"];
  const boxLabel = isZh
    ? `第 ${example.boxRow * 3 + 1}-${example.boxRow * 3 + 3} 行、第 ${example.boxColumn * 3 + 1}-${example.boxColumn * 3 + 3} 列的 3×3 宫`
    : `the 3×3 box at rows ${example.boxRow * 3 + 1}-${example.boxRow * 3 + 3}, columns ${example.boxColumn * 3 + 1}-${example.boxColumn * 3 + 3}`;

  const instruction = [
    isZh
      ? `目标是在${boxLabel}中放置数字 ${example.digit}。先只关注这个宫。`
      : `Place digit ${example.digit} in ${boxLabel}. Focus on this box first.`,
    isZh
      ? `扫描整个棋盘中已有的 ${example.digit}。蓝色行已经包含它，因此目标宫中的对应格不能再填 ${example.digit}。`
      : `Scan the existing ${example.digit}s. Each blue row already contains one, so its cells in the target box are excluded.`,
    isZh
      ? `再扫描列。黄色列也不能放 ${example.digit}；行列排除后只剩一个合法空格。`
      : `Now scan columns. Yellow columns cannot take another ${example.digit}; one legal empty cell survives both scans.`,
    isZh
      ? `点击目标宫中唯一剩下的空格。若仍有两个以上候选，就不应猜测，而要继续寻找其他线索。`
      : `Click the only surviving cell in the target box. If two or more cells survived, you would stop and find another clue instead of guessing.`,
  ][step];

  const changeStep = (nextStep: number) => {
    setStep(nextStep);
    setAttempt(null);
    setSolved(false);
    trackInteraction("cross_hatching_step_view", {
      locale: normalizedLocale,
      example_id: example.id,
      step: nextStep + 1,
    });
  };

  const changeExample = (nextIndex: number) => {
    setExampleIndex(nextIndex);
    setStep(0);
    setAttempt(null);
    setSolved(false);
    trackInteraction("cross_hatching_step_view", {
      locale: normalizedLocale,
      example_id: CROSS_HATCHING_EXAMPLES[nextIndex].id,
      step: 1,
      source: "example_selector",
    });
  };

  const tryCell = (row: number, column: number) => {
    const isCorrect =
      row === example.solutionCell.row && column === example.solutionCell.column;
    setAttempt({ row, column });
    setSolved(isCorrect);
    trackInteraction("cross_hatching_cell_attempt", {
      locale: normalizedLocale,
      example_id: example.id,
      row: row + 1,
      column: column + 1,
      correct: isCorrect,
    });
  };

  return (
    <section
      className="border-y bg-background py-7"
      aria-labelledby="cross-hatching-trainer-title"
    >
      <div className="mx-auto grid max-w-5xl gap-7 px-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">
                {isZh ? "互动 9×9 图解" : "Interactive 9×9 walkthrough"}
              </p>
              <h2
                id="cross-hatching-trainer-title"
                className="mt-1 text-2xl font-semibold"
              >
                {isZh ? "亲手完成一次交叉排除" : "Try cross hatching yourself"}
              </h2>
            </div>
            <div
              className="inline-flex overflow-hidden rounded-lg border"
              aria-label={isZh ? "选择练习题" : "Choose an example"}
            >
              {CROSS_HATCHING_EXAMPLES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => changeExample(index)}
                  aria-pressed={exampleIndex === index}
                  className={cn(
                    "h-9 min-w-12 border-r px-3 text-sm font-semibold last:border-r-0",
                    exampleIndex === index
                      ? "bg-foreground text-background"
                      : "bg-background hover:bg-muted",
                  )}
                >
                  {isZh ? `题 ${index + 1}` : `Ex. ${index + 1}`}
                </button>
              ))}
            </div>
          </div>

          <div
            className="mt-5 grid aspect-square w-full max-w-[38rem] grid-cols-9 overflow-hidden border-2 border-foreground bg-background"
            role="grid"
            aria-label={
              isZh
                ? `交叉排除练习棋盘，目标数字 ${example.digit}`
                : `Cross-hatching practice board for digit ${example.digit}`
            }
          >
            {example.board.flatMap((boardRow, row) =>
              boardRow.map((value, column) => {
                const inTargetBox =
                  Math.floor(row / 3) === example.boxRow
                  && Math.floor(column / 3) === example.boxColumn;
                const rowExcluded = step >= 1 && analysis.rowBlocked.includes(row);
                const columnExcluded =
                  step >= 2 && analysis.columnBlocked.includes(column);
                const candidate =
                  step >= 2
                  && analysis.candidates.some(
                    (cell) => cell.row === row && cell.column === column,
                  );
                const attempted =
                  attempt?.row === row && attempt.column === column;
                const correct = attempted && solved;
                const incorrect = attempted && !solved;
                const isTargetDigit = value === example.digit;
                const interactive =
                  inTargetBox && value === 0 && step === STEP_COUNT - 1;

                return (
                  <button
                    key={`${row}-${column}`}
                    type="button"
                    role="gridcell"
                    aria-disabled={!interactive}
                    tabIndex={interactive ? 0 : -1}
                    onClick={() => {
                      if (interactive) tryCell(row, column);
                    }}
                    aria-label={
                      value
                        ? isZh
                          ? `第 ${row + 1} 行第 ${column + 1} 列，数字 ${value}`
                          : `Row ${row + 1}, column ${column + 1}, digit ${value}`
                        : isZh
                          ? `第 ${row + 1} 行第 ${column + 1} 列，空格`
                          : `Row ${row + 1}, column ${column + 1}, empty`
                    }
                    className={cn(
                      "relative flex aspect-square min-w-0 items-center justify-center border-b border-r text-sm font-semibold sm:text-lg",
                      column % 3 === 2 && column !== 8 && "border-r-2 border-r-foreground",
                      row % 3 === 2 && row !== 8 && "border-b-2 border-b-foreground",
                      column === 8 && "border-r-0",
                      row === 8 && "border-b-0",
                      inTargetBox && !rowExcluded && !columnExcluded && "bg-emerald-50 dark:bg-emerald-950/30",
                      rowExcluded && "bg-sky-100 text-sky-950 dark:bg-sky-950/60 dark:text-sky-100",
                      columnExcluded && !rowExcluded && "bg-amber-100 text-amber-950 dark:bg-amber-950/60 dark:text-amber-100",
                      rowExcluded && columnExcluded && "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100",
                      candidate && "outline outline-2 -outline-offset-4 outline-emerald-600",
                      isTargetDigit && step >= 1 && "font-black text-primary",
                      interactive && "cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
                      correct && "bg-emerald-600 text-white outline-0",
                      incorrect && "bg-red-100 text-red-900 outline outline-2 -outline-offset-4 outline-red-600 dark:bg-red-950 dark:text-red-100",
                    )}
                  >
                    {correct ? example.digit : value || ""}
                    {candidate && !correct && (
                      <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 sm:text-xs">
                        {example.digit}
                      </span>
                    )}
                  </button>
                );
              }),
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 border border-sky-400 bg-sky-100" aria-hidden />
              {isZh ? "已有目标数字的行" : "Row already contains digit"}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 border border-amber-400 bg-amber-100" aria-hidden />
              {isZh ? "已有目标数字的列" : "Column already contains digit"}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 border-2 border-emerald-600 bg-emerald-50" aria-hidden />
              {isZh ? "仍可放置的位置" : "Surviving position"}
            </span>
          </div>
        </div>

        <aside className="border-l-4 border-primary bg-muted/40 p-5">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {isZh ? `第 ${step + 1} 步，共 ${STEP_COUNT} 步` : `Step ${step + 1} of ${STEP_COUNT}`}
          </p>
          <p className="mt-3 text-base leading-7">{instruction}</p>

          <div className="mt-5 grid gap-2" aria-label={isZh ? "图解步骤" : "Walkthrough steps"}>
            {stepLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => changeStep(index)}
                aria-pressed={step === index}
                className={cn(
                  "min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-semibold",
                  step === index
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:border-primary",
                )}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>

          {step === STEP_COUNT - 1 && (
            <p
              className={cn(
                "mt-5 rounded-lg border p-3 text-sm leading-6",
                solved
                  ? "border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100"
                  : attempt
                    ? "border-red-400 bg-red-50 text-red-950 dark:bg-red-950/40 dark:text-red-100"
                    : "bg-background text-muted-foreground",
              )}
              aria-live="polite"
            >
              {solved
                ? isZh
                  ? `正确。${example.digit} 只能放在第 ${example.solutionCell.row + 1} 行第 ${example.solutionCell.column + 1} 列。`
                  : `Correct. ${example.digit} can only go in row ${example.solutionCell.row + 1}, column ${example.solutionCell.column + 1}.`
                : attempt
                  ? isZh
                    ? "这个格子仍被已有数字排除。再检查蓝色行和黄色列。"
                    : "That cell is still excluded. Check the blue rows and yellow columns again."
                  : isZh
                    ? "现在点击目标宫中唯一合法的空格。"
                    : "Now click the only legal empty cell in the target box."}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
