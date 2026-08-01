"use client";

import { useMemo, useState } from 'react';

import { PrintablePageStyle } from '@/components/printable/PrintableSamuraiBoard';

import { StandardSudokuPrintGrid } from '@/components/sudoku/StandardSudokuPrintGrid';
import { trackInteraction } from '@/lib/analytics/events';
import {
  selectStandardSudokuPuzzles,
  type StandardSudokuDifficulty,
} from '@/lib/standard-sudoku/puzzles';

interface PrintableSudokuGeneratorProps {
  locale: string;
}

type DifficultyOption = StandardSudokuDifficulty | 'mixed';
type PaperSize = 'a4' | 'letter';
type PuzzleCount = 1 | 2 | 4 | 6;

const DIFFICULTIES: DifficultyOption[] = ['mixed', 'easy', 'medium', 'hard', 'expert'];
const COUNTS: PuzzleCount[] = [1, 2, 4, 6];

function difficultyLabel(difficulty: DifficultyOption, isZh: boolean) {
  if (isZh) {
    return {
      mixed: '混合难度',
      easy: '简单',
      medium: '中等',
      hard: '困难',
      expert: '专家',
    }[difficulty];
  }

  return {
    mixed: 'Mixed',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Expert',
  }[difficulty];
}

export function PrintableSudokuGenerator({ locale }: PrintableSudokuGeneratorProps) {
  const normalizedLocale = locale === 'zh' ? 'zh' : 'en';
  const isZh = normalizedLocale === 'zh';
  const [difficulty, setDifficulty] = useState<DifficultyOption>('mixed');
  const [count, setCount] = useState<PuzzleCount>(4);
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [largePrint, setLargePrint] = useState(false);
  const [seed, setSeed] = useState(1);

  const puzzles = useMemo(() => selectStandardSudokuPuzzles({
    difficulty,
    count,
    seed: `standard-printable-${seed}`,
  }), [count, difficulty, seed]);

  const generateAnotherSet = () => {
    setSeed((current) => current + 1);
    trackInteraction('printable_sudoku_generate', {
      locale: normalizedLocale,
      difficulty,
      count,
      paper_size: paperSize,
      include_answers: includeAnswers,
      large_print: largePrint,
    });
  };

  const printPuzzles = () => {
    trackInteraction('printable_sudoku_print', {
      locale: normalizedLocale,
      difficulty,
      count,
      paper_size: paperSize,
      include_answers: includeAnswers,
      large_print: largePrint,
    });
    window.print();
  };

  return (
    <>
      <PrintablePageStyle paperSize={paperSize} />
      <section className="border bg-card p-5 md:p-7">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 print:hidden">
        <label className="grid gap-2 text-sm font-medium">
          <span>{isZh ? '难度' : 'Difficulty'}</span>
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as DifficultyOption)}
            className="rounded-md border bg-background px-3 py-2"
          >
            {DIFFICULTIES.map((option) => (
              <option key={option} value={option}>{difficultyLabel(option, isZh)}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          <span>{isZh ? '每组题数' : 'Puzzles per set'}</span>
          <select
            value={count}
            onChange={(event) => setCount(Number(event.target.value) as PuzzleCount)}
            className="rounded-md border bg-background px-3 py-2"
          >
            {COUNTS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          <span>{isZh ? '纸张' : 'Paper'}</span>
          <select
            value={paperSize}
            onChange={(event) => setPaperSize(event.target.value as PaperSize)}
            className="rounded-md border bg-background px-3 py-2"
          >
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
          </select>
        </label>

        <label className="flex items-center gap-3 self-end rounded-md border bg-background px-4 py-2.5 text-sm font-medium">
          <input
            type="checkbox"
            checked={includeAnswers}
            onChange={(event) => setIncludeAnswers(event.target.checked)}
            className="h-4 w-4"
          />
          <span>{isZh ? '附答案页' : 'Answer keys'}</span>
        </label>

        <label className="flex items-center gap-3 self-end rounded-md border bg-background px-4 py-2.5 text-sm font-medium">
          <input
            type="checkbox"
            checked={largePrint}
            onChange={(event) => setLargePrint(event.target.checked)}
            className="h-4 w-4"
          />
          <span>{isZh ? '大字单题版' : 'Large-print mode'}</span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={printPuzzles}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {isZh ? '打印或另存为 PDF' : 'Print or save as PDF'}
        </button>
        <button
          type="button"
          onClick={generateAnotherSet}
          className="inline-flex items-center gap-2 rounded-md border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10"
        >
          {isZh ? '换一组题' : 'Generate another set'}
        </button>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground print:hidden">
        {isZh
          ? '所有题目都经过程序唯一解验证。选择浏览器打印后，可直接打印，也可在目标打印机中选择“另存为 PDF”。'
          : 'Every puzzle is programmatically checked for a unique solution. In the browser print dialog, choose a printer or select Save as PDF.'}
      </p>

      <section
        className="mt-8"
        data-paper-size={paperSize}
        aria-label={isZh ? '可打印数独题目' : 'Printable Sudoku puzzles'}
      >
        <div className={[
          'grid gap-6',
          largePrint || count === 1 ? 'grid-cols-1' : 'md:grid-cols-2 print:grid-cols-2 print:gap-3',
        ].join(' ')}>
          {puzzles.map((puzzle, index) => (
            <StandardSudokuPrintGrid
              key={`${puzzle.id}-${seed}`}
              puzzle={puzzle}
              label={`${isZh ? '题目' : 'Puzzle'} ${index + 1} · ${difficultyLabel(puzzle.difficulty, isZh)}`}
              compact={!largePrint && count >= 4}
              largePrint={largePrint}
            />
          ))}
        </div>
      </section>

      {includeAnswers && (
        <section className="mt-10 break-before-page">
          <h2 className="text-2xl font-semibold">{isZh ? '答案' : 'Answer keys'}</h2>
          <div className={[
            'mt-5 grid gap-6',
            largePrint || count === 1 ? 'grid-cols-1' : 'md:grid-cols-2 print:grid-cols-2 print:gap-3',
          ].join(' ')}>
            {puzzles.map((puzzle, index) => (
              <StandardSudokuPrintGrid
                key={`${puzzle.id}-${seed}-answer`}
                puzzle={puzzle}
                showSolution
                label={`${isZh ? '答案' : 'Answer'} ${index + 1} · ${difficultyLabel(puzzle.difficulty, isZh)}`}
                compact={!largePrint && count >= 4}
                largePrint={largePrint}
              />
            ))}
          </div>
        </section>
      )}
      </section>
    </>
  );
}
