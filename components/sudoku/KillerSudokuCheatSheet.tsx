"use client";

import { useMemo, useState } from "react";

import { trackInteraction } from "@/lib/analytics/events";
import {
  buildKillerCheatSheet,
  findKillerSudokuCombinations,
  getKillerSumRange,
} from "@/lib/killer-sudoku/combinations";

interface KillerSudokuCheatSheetProps {
  locale: string;
}

const CAGE_SIZES = [2, 3, 4, 5, 6] as const;
const PRINTABLE_CAGE_SIZES = [2, 3, 4] as const;

function formatCombination(combination: number[]) {
  return combination.join(" + ");
}

export function KillerSudokuCheatSheet({
  locale,
}: KillerSudokuCheatSheetProps) {
  const normalizedLocale = locale === "zh" ? "zh" : "en";
  const isZh = normalizedLocale === "zh";
  const [cageSize, setCageSize] = useState(2);
  const [targetSum, setTargetSum] = useState(10);
  const [activeQuery, setActiveQuery] = useState({ cageSize: 2, targetSum: 10 });
  const result = useMemo(
    () => findKillerSudokuCombinations(activeQuery),
    [activeQuery],
  );
  const cheatSheet = useMemo(() => buildKillerCheatSheet(), []);

  const updateCageSize = (nextCageSize: number) => {
    const range = getKillerSumRange(nextCageSize);
    setCageSize(nextCageSize);
    if (range) {
      setTargetSum(
        Math.min(
          Math.max(targetSum, range.minimumSum),
          range.maximumSum,
        ),
      );
    }
  };

  const calculate = () => {
    setActiveQuery({ cageSize, targetSum });
    trackInteraction("killer_sudoku_combination_calculate", {
      locale: normalizedLocale,
      cage_size: cageSize,
      target_sum: targetSum,
    });
  };

  const printCheatSheet = () => {
    trackInteraction("killer_sudoku_cheat_sheet_print", {
      locale: normalizedLocale,
      selected_cage_size: activeQuery.cageSize,
      selected_target_sum: activeQuery.targetSum,
    });
    window.print();
  };

  return (
    <section className="border-y bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <section className="border bg-card p-5 md:p-7 print:hidden">
            <p className="text-sm font-semibold text-primary">
              {isZh ? "笼格组合计算器" : "Cage combination calculator"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {isZh ? "按格数与总和查组合" : "Find combinations by size and sum"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {isZh
                ? "结果只列出 1–9 中互不重复的数字组合，不考虑数字在笼格内的排列顺序。"
                : "Results use distinct digits from 1–9 and ignore their order inside the cage."}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                <span>{isZh ? "笼格数量" : "Cage size"}</span>
                <select
                  value={cageSize}
                  onChange={(event) => updateCageSize(Number(event.target.value))}
                  className="rounded-md border bg-background px-3 py-2"
                >
                  {CAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} {isZh ? "格" : "cells"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                <span>{isZh ? "目标总和" : "Target sum"}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={targetSum}
                  onChange={(event) => setTargetSum(Number(event.target.value))}
                  className="rounded-md border bg-background px-3 py-2"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={calculate}
              className="mt-4 w-full rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {isZh ? "查找组合" : "Find combinations"}
            </button>

            <div className="mt-6 border-t pt-5" aria-live="polite">
              <p className="text-sm font-semibold">
                {isZh
                  ? `${activeQuery.cageSize} 格，总和 ${activeQuery.targetSum}`
                  : `${activeQuery.cageSize} cells, sum ${activeQuery.targetSum}`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isZh
                  ? `合法范围：${result.minimumSum}–${result.maximumSum}`
                  : `Valid range: ${result.minimumSum}–${result.maximumSum}`}
              </p>
              {result.combinations.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.combinations.map((combination) => (
                    <span
                      key={combination.join("-")}
                      className="rounded-md border bg-background px-3 py-2 font-mono text-sm font-semibold"
                    >
                      {formatCombination(combination)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  {isZh
                    ? "这个格数与总和没有不重复数字组合。请调整总和。"
                    : "No distinct-digit combination exists for this cage size and sum."}
                </p>
              )}
            </div>
          </section>

          <section className="min-w-0" aria-labelledby="printable-cheat-sheet">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
              <div>
                <p className="text-sm font-semibold text-primary">
                  {isZh ? "免费打印资源" : "Free printable reference"}
                </p>
                <h2 id="printable-cheat-sheet" className="mt-2 text-2xl font-semibold">
                  {isZh
                    ? "Killer Sudoku 组合速查表"
                    : "Killer Sudoku combination cheat sheet"}
                </h2>
              </div>
              <button
                type="button"
                onClick={printCheatSheet}
                className="rounded-md border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10"
              >
                {isZh ? "打印或另存 PDF" : "Print or save PDF"}
              </button>
            </div>

            <header className="hidden print:block">
              <h1 className="text-2xl font-bold">
                Killer Sudoku Combination Cheat Sheet
              </h1>
              <p className="mt-1 text-sm">
                Distinct digits only. Order inside a cage does not matter.
              </p>
            </header>

            <div className="mt-5 space-y-7 print:mt-4 print:space-y-4">
              {PRINTABLE_CAGE_SIZES.map((size) => (
                <section key={size} className="break-inside-avoid">
                  <h3 className="mb-2 text-lg font-semibold">
                    {isZh ? `${size} 格笼` : `${size}-cell cages`}
                  </h3>
                  <div className="overflow-x-auto border">
                    <table className="w-full min-w-[34rem] border-collapse text-left text-xs">
                      <thead className="bg-muted">
                        <tr>
                          <th className="w-20 border-b px-3 py-2">
                            {isZh ? "总和" : "Sum"}
                          </th>
                          <th className="border-b px-3 py-2">
                            {isZh ? "不重复组合" : "Distinct combinations"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cheatSheet
                          .filter((row) => row.cageSize === size)
                          .map((row) => (
                            <tr key={`${size}-${row.targetSum}`} className="border-b last:border-b-0">
                              <th className="px-3 py-2 font-semibold">{row.targetSum}</th>
                              <td className="px-3 py-2 font-mono">
                                {row.combinations.map(formatCombination).join(" · ")}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
