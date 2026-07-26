"use client";

import { useMemo, useState } from "react";

import { trackInteraction } from "@/lib/analytics/events";
import {
  analyzeNakedTriple,
  getNakedTripleExample,
  type SudokuUnitType,
} from "@/lib/sudoku/naked-triple";
import { cn } from "@/lib/utils";

interface NakedTripleTrainerProps {
  locale: string;
}

function CandidateCell({
  candidates,
  highlighted,
  removed,
  label,
}: {
  candidates: number[];
  highlighted?: boolean;
  removed?: number[];
  label: string;
}) {
  const removedSet = new Set(removed ?? []);
  return (
    <div
      className={cn(
        "grid aspect-square min-w-0 grid-cols-3 grid-rows-3 border bg-background p-1",
        highlighted && "border-2 border-primary bg-primary/5",
      )}
      aria-label={label}
    >
      {Array.from({ length: 9 }, (_, index) => {
        const digit = index + 1;
        const visible = candidates.includes(digit);
        const isRemoved = removedSet.has(digit);
        return (
          <span
            key={digit}
            className={cn(
              "flex items-center justify-center text-[9px] font-semibold sm:text-xs",
              !visible && "invisible",
              isRemoved && "text-red-600 line-through dark:text-red-300",
              highlighted && visible && "text-primary",
            )}
          >
            {digit}
          </span>
        );
      })}
    </div>
  );
}

export function NakedTripleTrainer({ locale }: NakedTripleTrainerProps) {
  const normalizedLocale = locale === "zh" ? "zh" : "en";
  const isZh = normalizedLocale === "zh";
  const [unitType, setUnitType] = useState<SudokuUnitType>("row");
  const [showValid, setShowValid] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const example = useMemo(
    () => getNakedTripleExample(unitType, showValid),
    [unitType, showValid],
  );
  const analysis = useMemo(
    () => analyzeNakedTriple(example.members, example.peers),
    [example],
  );
  const cells = [
    ...example.members.map((candidates, index) => ({
      type: "member" as const,
      index,
      candidates,
    })),
    ...example.peers.map((candidates, index) => ({
      type: "peer" as const,
      index,
      candidates,
    })),
    { type: "peer" as const, index: example.peers.length, candidates: [1, 4, 9] },
    { type: "peer" as const, index: example.peers.length + 1, candidates: [2, 6, 8] },
  ].slice(0, 9);

  const changeExample = ({
    nextUnit = unitType,
    nextValid = showValid,
  }: {
    nextUnit?: SudokuUnitType;
    nextValid?: boolean;
  }) => {
    setUnitType(nextUnit);
    setShowValid(nextValid);
    setRevealed(false);
    trackInteraction("naked_triple_example_change", {
      locale: normalizedLocale,
      unit_type: nextUnit,
      expected_valid: nextValid,
    });
  };

  const reveal = () => {
    setRevealed(true);
    trackInteraction("naked_triple_reveal", {
      locale: normalizedLocale,
      unit_type: unitType,
      valid: analysis.valid,
      union: analysis.union.join(""),
      affected_peers: analysis.eliminations.length,
    });
  };

  return (
    <section className="border-y bg-muted/20 py-8" aria-labelledby="triple-trainer-title">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <p className="text-sm font-semibold text-primary">
            {isZh ? "互动候选并集" : "Interactive candidate union"}
          </p>
          <h2 id="triple-trainer-title" className="mt-1 text-2xl font-semibold">
            {isZh ? "这三个格子真的是显性三数组吗？" : "Do these three cells form a naked triple?"}
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="inline-flex overflow-hidden rounded-lg border">
              {(["row", "column", "box"] as const).map((nextUnit) => (
                <button
                  key={nextUnit}
                  type="button"
                  onClick={() => changeExample({ nextUnit })}
                  aria-pressed={unitType === nextUnit}
                  className={cn(
                    "min-h-11 border-r px-4 text-sm font-semibold last:border-r-0",
                    unitType === nextUnit
                      ? "bg-foreground text-background"
                      : "bg-background hover:bg-muted",
                  )}
                >
                  {nextUnit === "row"
                    ? isZh ? "行" : "Row"
                    : nextUnit === "column"
                      ? isZh ? "列" : "Column"
                      : isZh ? "宫" : "Box"}
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
                    "min-h-11 border-r px-4 text-sm font-semibold last:border-r-0",
                    showValid === nextValid
                      ? "bg-amber-500 text-amber-950"
                      : "bg-background hover:bg-muted",
                  )}
                >
                  {nextValid ? (isZh ? "标准例" : "Valid") : (isZh ? "反例" : "Near miss")}
                </button>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "mt-6 grid max-w-[42rem] gap-2",
              unitType === "box" ? "grid-cols-3" : "grid-cols-9",
            )}
          >
            {cells.map((cell, cellIndex) => {
              const elimination = analysis.eliminations.find(
                (item) => item.peerIndex === cell.index,
              );
              return (
                <CandidateCell
                  key={`${cell.type}-${cell.index}-${cellIndex}`}
                  candidates={cell.candidates}
                  highlighted={revealed && cell.type === "member"}
                  removed={
                    revealed && analysis.valid && cell.type === "peer"
                      ? elimination?.digits
                      : undefined
                  }
                  label={
                    cell.type === "member"
                      ? isZh
                        ? `三数组成员 ${cell.index + 1}，候选 ${cell.candidates.join("、")}`
                        : `Triple member ${cell.index + 1}, candidates ${cell.candidates.join(", ")}`
                      : isZh
                        ? `同单位格，候选 ${cell.candidates.join("、")}`
                        : `Peer cell, candidates ${cell.candidates.join(", ")}`
                  }
                />
              );
            })}
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {isZh
              ? "粗蓝框标出三数组成员；揭晓后，红色删除线表示能从同一行、列或宫的其他格中移除的候选。"
              : "Blue borders mark the three member cells. After reveal, red strike-through digits are candidates that can be removed from the other cells in the same unit."}
          </p>
        </div>

        <aside className="border-l-4 border-primary bg-background p-5">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {unitType === "row"
              ? isZh ? "行内检查" : "Row check"
              : unitType === "column"
                ? isZh ? "列内检查" : "Column check"
                : isZh ? "宫内检查" : "Box check"}
          </p>
          <h3 className="mt-2 text-xl font-semibold">
            {revealed
              ? analysis.valid
                ? isZh ? `并集是 {${analysis.union.join("、")}}` : `Union = {${analysis.union.join(", ")}}`
                : isZh ? "并集不等于 3" : "The union is not three"
              : isZh ? "先合并三格候选" : "Merge the three candidate sets"}
          </h3>
          <p className="mt-3 leading-7 text-muted-foreground">
            {revealed
              ? analysis.valid
                ? isZh
                  ? `三个格子的全部候选正好只有三个数字。因此这三个数字必须占据这三个格，可从 ${analysis.eliminations.length} 个同单位格中删除它们。`
                  : `The three cells contain exactly three digits in total. Those digits must occupy these cells, so they can be removed from ${analysis.eliminations.length} peer cells.`
                : isZh
                  ? `三个格子的候选并集是 {${analysis.union.join("、")}}，共有 ${analysis.union.length} 个数字。它只是看起来相似，不能执行删除。`
                  : `Their union is {${analysis.union.join(", ")}}, which contains ${analysis.union.length} digits. It is only a visual near miss, so no elimination is valid.`
              : isZh
                ? "不要要求三个格都写着完全相同的三个数字。只要每格候选都是同一个三数字集合的子集，而且三格并集恰好为 3，就可能成立。"
                : "The cells do not need identical notes. Each set must be a subset of the same three digits, and the union across all three cells must contain exactly three digits."}
          </p>
          <button
            type="button"
            onClick={reveal}
            className="mt-5 min-h-11 w-full rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isZh ? "计算并集并显示可删除候选" : "Calculate union and show eliminations"}
          </button>
          <ol className="mt-5 space-y-3 text-sm leading-6">
            <li>{isZh ? "1. 只看同一行、列或宫。" : "1. Stay within one row, column, or box."}</li>
            <li>{isZh ? "2. 选择三个各含 2–3 个候选的格。" : "2. Choose three cells with 2–3 candidates each."}</li>
            <li>{isZh ? "3. 合并后必须正好是三个数字。" : "3. Their union must be exactly three digits."}</li>
            <li>{isZh ? "4. 只从同单位其他格删除这三个数字。" : "4. Remove those digits only from other cells in that unit."}</li>
          </ol>
        </aside>
      </div>
    </section>
  );
}
