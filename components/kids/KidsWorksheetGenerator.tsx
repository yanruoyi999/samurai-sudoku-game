"use client";

import { useCallback, useMemo, useState } from "react";

import { KidsPrintButton } from "@/components/kids/KidsPrintButton";
import { KidsSudokuPrintGrid } from "@/components/kids/KidsSudokuPrintGrid";
import { trackInteraction } from "@/lib/analytics/events";
import {
  selectWorksheetPuzzles,
  type KidsWorksheetCount,
  type KidsWorksheetLevel,
  type KidsWorksheetSize,
} from "@/lib/kids-sudoku/worksheet";

interface KidsWorksheetGeneratorProps {
  locale: string;
}

const LEVEL_OPTIONS: KidsWorksheetLevel[] = ["mixed", "easy", "medium", "challenge"];
const COUNT_OPTIONS: KidsWorksheetCount[] = [2, 4, 6];

function getLevelLabel(level: KidsWorksheetLevel, isZh: boolean) {
  if (isZh) {
    return {
      mixed: "混合难度",
      easy: "简单",
      medium: "中等",
      challenge: "挑战",
    }[level];
  }

  return {
    mixed: "Mixed levels",
    easy: "Easy",
    medium: "Medium",
    challenge: "Challenge",
  }[level];
}

function normalizeCount(
  size: KidsWorksheetSize,
  level: KidsWorksheetLevel,
  count: KidsWorksheetCount,
): KidsWorksheetCount {
  if (size === 6 && level !== "mixed" && count === 6) return 4;
  return count;
}

export function KidsWorksheetGenerator({ locale }: KidsWorksheetGeneratorProps) {
  const normalizedLocale = locale === "zh" ? "zh" : "en";
  const isZh = normalizedLocale === "zh";
  const [size, setSize] = useState<KidsWorksheetSize>(4);
  const [level, setLevel] = useState<KidsWorksheetLevel>("mixed");
  const [count, setCount] = useState<KidsWorksheetCount>(4);
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [seed, setSeed] = useState(1);

  const selection = useMemo(
    () => selectWorksheetPuzzles({ size, level, count, seed, includeAnswers }),
    [count, includeAnswers, level, seed, size],
  );

  const changeSize = useCallback((nextSize: KidsWorksheetSize) => {
    setSize(nextSize);
    setCount((currentCount) => normalizeCount(nextSize, level, currentCount));
  }, [level]);

  const changeLevel = useCallback((nextLevel: KidsWorksheetLevel) => {
    setLevel(nextLevel);
    setCount((currentCount) => normalizeCount(size, nextLevel, currentCount));
  }, [size]);

  const generateAnotherSet = useCallback(() => {
    setSeed((currentSeed) => currentSeed + 1);
    trackInteraction("kids_sudoku_worksheet_generate", {
      locale: normalizedLocale,
      size,
      level,
      count,
      include_answers: includeAnswers,
    });
  }, [count, includeAnswers, level, normalizedLocale, size]);

  return (
    <section className="rounded-2xl border bg-card p-5 md:p-7">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 print:hidden">
        <label className="grid gap-2 text-sm font-medium">
          <span>{isZh ? "网格尺寸" : "Grid size"}</span>
          <select
            value={size}
            onChange={(event) => changeSize(Number(event.target.value) as KidsWorksheetSize)}
            className="rounded-lg border bg-background px-3 py-2"
          >
            <option value={4}>4×4</option>
            <option value={6}>6×6</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          <span>{isZh ? "难度" : "Level"}</span>
          <select
            value={level}
            onChange={(event) => changeLevel(event.target.value as KidsWorksheetLevel)}
            className="rounded-lg border bg-background px-3 py-2"
          >
            {LEVEL_OPTIONS.map((option) => (
              <option key={option} value={option}>{getLevelLabel(option, isZh)}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          <span>{isZh ? "题目数量" : "Puzzle count"}</span>
          <select
            value={count}
            onChange={(event) => setCount(Number(event.target.value) as KidsWorksheetCount)}
            className="rounded-lg border bg-background px-3 py-2"
          >
            {COUNT_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
                disabled={size === 6 && level !== "mixed" && option === 6}
              >
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm font-medium self-end">
          <input
            type="checkbox"
            checked={includeAnswers}
            onChange={(event) => setIncludeAnswers(event.target.checked)}
            className="h-4 w-4"
          />
          <span>{isZh ? "末尾附答案" : "Include answer keys"}</span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={generateAnotherSet}
          className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10"
        >
          {isZh ? "生成另一组" : "Generate another set"}
        </button>
        <KidsPrintButton
          locale={normalizedLocale}
          location="kids_worksheet_generator"
          label={isZh ? "打印练习纸" : "Print worksheet"}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground print:hidden">
        {isZh
          ? "生成器只从经过唯一解验证的题库选题。不会收集姓名、邮箱、班级或儿童档案。"
          : "The generator selects only from verified unique-solution puzzles. It does not collect names, email addresses, classes, or child profiles."}
      </p>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">
          {isZh
            ? `${size}×${size} 儿童数独练习纸`
            : `${size}×${size} Sudoku for Kids Worksheet`}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground print:text-black">
          {isZh
            ? `难度：${getLevelLabel(level, true)} · 共 ${selection.puzzles.length} 题`
            : `Level: ${getLevelLabel(level, false)} · ${selection.puzzles.length} puzzles`}
        </p>
        <div className="mt-5 grid gap-6 md:grid-cols-2 print:grid-cols-2 print:gap-3">
          {selection.puzzles.map((puzzle, index) => (
            <KidsSudokuPrintGrid
              key={puzzle.id}
              puzzle={puzzle}
              compact={selection.puzzles.length >= 4}
              label={isZh ? `题目 ${index + 1}` : `Puzzle ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {includeAnswers && (
        <section className="mt-10 break-before-page">
          <h2 className="text-2xl font-semibold">{isZh ? "答案" : "Answer keys"}</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2 print:grid-cols-2 print:gap-3">
            {selection.puzzles.map((puzzle, index) => (
              <KidsSudokuPrintGrid
                key={`${puzzle.id}-answer`}
                puzzle={puzzle}
                showSolution
                compact={selection.puzzles.length >= 4}
                label={isZh ? `答案 ${index + 1}` : `Answer ${index + 1}`}
              />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
