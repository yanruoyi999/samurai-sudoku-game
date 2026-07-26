"use client";

import { useMemo, useState } from "react";

import { trackInteraction } from "@/lib/analytics/events";
import {
  analyzeFishPattern,
  getFishExample,
  type FishOrientation,
} from "@/lib/sudoku/swordfish";
import { cn } from "@/lib/utils";

interface SwordfishTrainerProps {
  locale: string;
}

const techniqueNames: Record<number, string> = {
  2: "X-Wing",
  3: "Swordfish",
  4: "Jellyfish",
};

export function SwordfishTrainer({ locale }: SwordfishTrainerProps) {
  const normalizedLocale = locale === "zh" ? "zh" : "en";
  const isZh = normalizedLocale === "zh";
  const [order, setOrder] = useState(3);
  const [orientation, setOrientation] = useState<FishOrientation>("row");
  const [showValid, setShowValid] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const example = useMemo(
    () => getFishExample(order, orientation, showValid),
    [order, orientation, showValid],
  );
  const analysis = useMemo(() => analyzeFishPattern(example), [example]);
  const candidateKeys = useMemo(
    () => new Set(example.candidates.map((cell) => `${cell.row}-${cell.column}`)),
    [example],
  );
  const patternKeys = useMemo(
    () => new Set(analysis.patternCandidates.map((cell) => `${cell.row}-${cell.column}`)),
    [analysis],
  );
  const eliminationKeys = useMemo(
    () => new Set(analysis.eliminations.map((cell) => `${cell.row}-${cell.column}`)),
    [analysis],
  );

  const changeExample = ({
    nextOrder = order,
    nextOrientation = orientation,
    nextValid = showValid,
  }: {
    nextOrder?: number;
    nextOrientation?: FishOrientation;
    nextValid?: boolean;
  }) => {
    setOrder(nextOrder);
    setOrientation(nextOrientation);
    setShowValid(nextValid);
    setRevealed(false);
    trackInteraction("sudoku_fish_example_change", {
      locale: normalizedLocale,
      order: nextOrder,
      orientation: nextOrientation,
      expected_valid: nextValid,
    });
  };

  const reveal = () => {
    setRevealed(true);
    trackInteraction("sudoku_fish_reveal", {
      locale: normalizedLocale,
      order,
      orientation,
      valid: analysis.valid,
      elimination_count: analysis.eliminations.length,
    });
  };

  return (
    <section className="border-y bg-muted/20 py-8" aria-labelledby="fish-trainer-title">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <p className="text-sm font-semibold text-primary">
            {isZh ? "互动候选图" : "Interactive candidate map"}
          </p>
          <h2 id="fish-trainer-title" className="mt-1 text-2xl font-semibold">
            {isZh ? "判断鱼形结构是否成立" : "Decide whether the fish is valid"}
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="inline-flex overflow-hidden rounded-lg border">
              {[2, 3, 4].map((nextOrder) => (
                <button
                  key={nextOrder}
                  type="button"
                  onClick={() => changeExample({ nextOrder })}
                  aria-pressed={order === nextOrder}
                  className={cn(
                    "min-h-11 border-r px-3 text-sm font-semibold last:border-r-0",
                    order === nextOrder
                      ? "bg-foreground text-background"
                      : "bg-background hover:bg-muted",
                  )}
                >
                  {techniqueNames[nextOrder]}
                </button>
              ))}
            </div>
            <div className="inline-flex overflow-hidden rounded-lg border">
              {(["row", "column"] as const).map((nextOrientation) => (
                <button
                  key={nextOrientation}
                  type="button"
                  onClick={() => changeExample({ nextOrientation })}
                  aria-pressed={orientation === nextOrientation}
                  className={cn(
                    "min-h-11 border-r px-3 text-sm font-semibold last:border-r-0",
                    orientation === nextOrientation
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted",
                  )}
                >
                  {nextOrientation === "row"
                    ? isZh ? "按行" : "Rows"
                    : isZh ? "按列" : "Columns"}
                </button>
              ))}
            </div>
            <div className="inline-flex overflow-hidden rounded-lg border">
              {[true, false].map((nextValid) => (
                <button
                  key={String(nextValid)}
                  type="button"
                  onClick={() => changeExample({ nextValid })}
                  aria-pressed={showValid === nextValid}
                  className={cn(
                    "min-h-11 border-r px-3 text-sm font-semibold last:border-r-0",
                    showValid === nextValid
                      ? "bg-amber-500 text-amber-950"
                      : "bg-background hover:bg-muted",
                  )}
                >
                  {nextValid
                    ? isZh ? "标准例" : "Valid"
                    : isZh ? "反例" : "Near miss"}
                </button>
              ))}
            </div>
          </div>

          <div
            className="mt-5 grid aspect-square w-full max-w-[38rem] grid-cols-9 overflow-hidden border-2 border-foreground bg-background"
            role="img"
            aria-label={
              isZh
                ? `${techniqueNames[order]} 候选数字 7 的${orientation === "row" ? "行" : "列"}结构`
                : `${orientation}-based ${techniqueNames[order]} candidate map for digit 7`
            }
          >
            {Array.from({ length: 81 }, (_, index) => {
              const row = Math.floor(index / 9);
              const column = index % 9;
              const key = `${row}-${column}`;
              const hasCandidate = candidateKeys.has(key);
              const inBase = analysis.baseLines.includes(
                orientation === "row" ? row : column,
              );
              const onCover = analysis.coverLines.includes(
                orientation === "row" ? column : row,
              );
              const pattern = patternKeys.has(key);
              const elimination = revealed && eliminationKeys.has(key);

              return (
                <div
                  key={key}
                  className={cn(
                    "relative flex aspect-square items-center justify-center border-b border-r",
                    column % 3 === 2 && column !== 8 && "border-r-2 border-r-foreground",
                    row % 3 === 2 && row !== 8 && "border-b-2 border-b-foreground",
                    column === 8 && "border-r-0",
                    row === 8 && "border-b-0",
                    revealed && inBase && "bg-sky-50 dark:bg-sky-950/40",
                    revealed && onCover && "outline outline-1 -outline-offset-2 outline-amber-500",
                  )}
                >
                  {hasCandidate && (
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold sm:h-7 sm:w-7 sm:text-sm",
                        revealed && pattern
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground text-foreground",
                        elimination
                          && "border-red-600 bg-red-100 text-red-800 line-through dark:bg-red-950 dark:text-red-100",
                      )}
                    >
                      7
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span>{isZh ? "蓝色：基准行/列" : "Blue: base lines"}</span>
            <span>{isZh ? "黄色框：覆盖列/行" : "Amber: cover lines"}</span>
            <span>{isZh ? "红色删除线：可排除候选" : "Red strike: eliminations"}</span>
          </div>
        </div>

        <aside className="border-l-4 border-primary bg-background p-5">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {techniqueNames[order]} · {orientation === "row" ? (isZh ? "按行" : "Rows") : (isZh ? "按列" : "Columns")}
          </p>
          <h3 className="mt-2 text-xl font-semibold">
            {revealed
              ? analysis.valid
                ? isZh ? "结构成立" : "Valid pattern"
                : isZh ? "结构不成立" : "Not a fish"
              : isZh ? "先观察，再揭晓" : "Inspect before revealing"}
          </h3>
          <p className="mt-3 leading-7 text-muted-foreground">
            {revealed
              ? analysis.valid
                ? isZh
                  ? `${order} 条基准线上的候选只落在 ${order} 条覆盖线上，因此覆盖线在其他位置的 ${analysis.eliminations.length} 个候选可以删除。`
                  : `${order} base lines restrict digit 7 to ${order} cover lines, so ${analysis.eliminations.length} candidates elsewhere on those cover lines can be removed.`
                : isZh
                  ? `这些候选扩散到了 ${analysis.coverLines.length} 条覆盖线，不满足 ${order}×${order} 的约束。不能据此删除任何候选。`
                  : `The candidates spread across ${analysis.coverLines.length} cover lines instead of ${order}. No elimination is justified.`
              : isZh
                ? `数一数 ${order} 条基准线上的候选，确认它们的覆盖线并集是否刚好也是 ${order}。`
                : `Count the candidates on the ${order} base lines and check whether their union uses exactly ${order} cover lines.`}
          </p>
          <button
            type="button"
            onClick={reveal}
            className="mt-5 min-h-11 w-full rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isZh ? "显示基准线、覆盖线与排除项" : "Reveal lines and eliminations"}
          </button>
          <ol className="mt-5 space-y-3 text-sm leading-6">
            <li>{isZh ? "1. 固定一个候选数字。" : "1. Fix one candidate digit."}</li>
            <li>{isZh ? `2. 找到 ${order} 条基准线。` : `2. Choose ${order} base lines.`}</li>
            <li>{isZh ? `3. 候选并集必须正好落在 ${order} 条覆盖线。` : `3. Their union must use exactly ${order} cover lines.`}</li>
            <li>{isZh ? "4. 只删除覆盖线在基准线之外的同数字候选。" : "4. Remove that digit only outside the base lines."}</li>
          </ol>
        </aside>
      </div>
    </section>
  );
}
