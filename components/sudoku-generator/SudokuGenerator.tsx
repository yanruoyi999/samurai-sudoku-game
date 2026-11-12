'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n';
import { formatSudokuPuzzle, type GeneratedSudoku } from '@/lib/standard-sudoku/generate';
import { STANDARD_SUDOKU_PUZZLES } from '@/lib/standard-sudoku/puzzles';

const starter = STANDARD_SUDOKU_PUZZLES[0];
const initialPuzzle: GeneratedSudoku = { grid: starter.grid.flat(), solution: starter.solution.flat() };
const generationTimeout = 8_000;
const button = 'min-h-11 rounded-md border px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const secondary = `${button} border-border bg-background hover:border-primary disabled:opacity-50`;

const text = {
  en: {
    puzzle: '9×9 Sudoku puzzle',
    solution: 'Sudoku solution',
    empty: 'Blank',
    generate: 'Generate new puzzle',
    generating: 'Generating and checking a new puzzle…',
    cancel: 'Cancel generation',
    canceled: 'Generation canceled.',
    ready: 'New puzzle ready.',
    error: 'Couldn’t generate a new puzzle. Please try again.',
    show: 'Show solution',
    hide: 'Hide solution',
    copy: 'Copy puzzle',
    copied: 'Puzzle copied.',
    copyFallback: 'Automatic copy is unavailable. Select and copy the puzzle text below.',
    puzzleText: 'Puzzle text',
    print: 'Print puzzle',
    solverHelp: 'Copy the puzzle into the solver to follow the logical steps. A 0 represents a blank.',
    solver: 'Open Sudoku Solver',
  },
  zh: {
    puzzle: '9×9 数独题目',
    solution: '数独答案',
    empty: '空格',
    generate: '生成新题',
    generating: '正在生成新题并验证唯一解…',
    cancel: '取消生成',
    canceled: '已取消生成。',
    ready: '新题已生成。',
    error: '未能生成新题，请重试。',
    show: '显示答案',
    hide: '隐藏答案',
    copy: '复制题目',
    copied: '已复制题目。',
    copyFallback: '无法自动复制，请选中下方题目文本并手动复制。',
    puzzleText: '题目文本',
    print: '打印题目',
    solverHelp: '将题目复制到求解器，即可查看逻辑推理步骤。0 表示空格。',
    solver: '打开数独求解器',
  },
};

function SudokuGrid({ puzzle, labels, reveal = false }: {
  puzzle: GeneratedSudoku;
  labels: (typeof text)[Locale];
  reveal?: boolean;
}) {
  const digits = reveal ? puzzle.solution : puzzle.grid;
  const label = reveal ? labels.solution : labels.puzzle;

  return (
    <table aria-label={label} className="w-full table-fixed border-collapse border-2 border-foreground bg-background print:border-black print:bg-white">
      <tbody>
        {Array.from({ length: 9 }, (_, row) => (
          <tr key={row} className={row === 2 || row === 5 ? 'border-b-2 border-foreground print:border-black' : ''}>
            {digits.slice(row * 9, row * 9 + 9).map((digit, column) => (
              <td key={column} className={
                column === 2 || column === 5
                  ? 'border border-r-2 border-border border-r-foreground p-0 print:border-black'
                  : 'border border-border p-0 print:border-black'
              }>
                <span className={`flex aspect-square items-center justify-center text-base tabular-nums sm:text-xl print:text-xl print:text-black ${
                  puzzle.grid[row * 9 + column] ? 'font-bold' : 'font-medium text-primary'
                }`}>
                  {digit || <span className="sr-only print:hidden">{labels.empty}</span>}
                </span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SudokuGenerator({ locale }: { locale: Locale }) {
  const labels = text[locale];
  const [puzzle, setPuzzle] = useState(initialPuzzle);
  const [revealed, setRevealed] = useState(false);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState('');
  const [copyFallback, setCopyFallback] = useState(false);
  const pendingGeneration = useRef<(() => void) | null>(null);
  const copyAttempt = useRef(0);
  const puzzleText = formatSudokuPuzzle(puzzle.grid);

  useEffect(() => () => pendingGeneration.current?.(), []);

  function cancelGeneration() {
    pendingGeneration.current?.();
    setRunning(false);
    setNotice(labels.canceled);
  }

  function generate() {
    if (pendingGeneration.current) return;

    copyAttempt.current += 1;
    setCopyFallback(false);
    setRunning(true);
    setNotice(labels.generating);

    try {
      const worker = new Worker(new URL('../../lib/standard-sudoku/generator-worker.ts', import.meta.url));
      const timeout = window.setTimeout(() => finish(null), generationTimeout);

      function stop() {
        window.clearTimeout(timeout);
        worker.terminate();
        pendingGeneration.current = null;
      }

      function finish(result: GeneratedSudoku | null) {
        if (pendingGeneration.current !== stop) return;
        stop();
        setRunning(false);
        if (result) {
          setPuzzle(result);
          setRevealed(false);
        }
        setNotice(result ? labels.ready : labels.error);
      }

      pendingGeneration.current = stop;
      worker.onmessage = (event: MessageEvent<GeneratedSudoku | null>) => finish(event.data);
      worker.onerror = () => finish(null);
      worker.postMessage(puzzleText);
    } catch {
      pendingGeneration.current?.();
      setRunning(false);
      setNotice(labels.error);
    }
  }

  async function copyPuzzle() {
    const attempt = ++copyAttempt.current;
    try {
      await navigator.clipboard.writeText(puzzleText);
      if (copyAttempt.current !== attempt) return;
      setCopyFallback(false);
      setNotice(labels.copied);
    } catch {
      if (copyAttempt.current !== attempt) return;
      setCopyFallback(true);
      setNotice(labels.copyFallback);
    }
  }

  return (
    <section aria-label={labels.puzzle} className="grid items-start gap-5 rounded-xl border border-border bg-card p-2 min-[360px]:p-3 sm:p-5 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-7 print:block print:rounded-none print:border-0 print:bg-white print:p-0">
      <div className="w-full max-w-[30rem] print:mx-auto print:max-w-[6in] print:break-inside-avoid">
        <h2 className="mb-3 text-xl font-semibold print:mb-5 print:text-black">
          <span className="print:hidden">{revealed ? labels.solution : labels.puzzle}</span>
          <span className="hidden print:inline">{labels.puzzle}</span>
        </h2>
        <div className={revealed ? 'hidden print:block' : undefined}>
          <SudokuGrid puzzle={puzzle} labels={labels} />
        </div>
        {revealed && (
          <div className="print:hidden">
            <SudokuGrid puzzle={puzzle} labels={labels} reveal />
          </div>
        )}
      </div>
      <div className="min-w-0 space-y-3 print:hidden">
        <div className="grid gap-2">
          <button
            className={`${button} border-primary bg-primary text-primary-foreground hover:bg-primary/90`}
            type="button"
            onClick={running ? cancelGeneration : generate}
          >
            {running ? labels.cancel : labels.generate}
          </button>
          <button className={secondary} type="button" onClick={() => setRevealed(value => !value)}>
            {revealed ? labels.hide : labels.show}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className={secondary} type="button" onClick={copyPuzzle} disabled={running}>{labels.copy}</button>
            <button className={secondary} type="button" onClick={() => window.print()}>{labels.print}</button>
          </div>
        </div>
        <p role="status" className="min-h-5 text-sm text-muted-foreground">{notice}</p>
        {copyFallback && (
          <label className="block space-y-1.5 text-sm font-semibold">
            <span>{labels.puzzleText}</span>
            <textarea
              readOnly
              value={puzzleText}
              onFocus={event => event.currentTarget.select()}
              rows={3}
              className="w-full rounded-md border border-border bg-background p-2 font-mono text-sm"
            />
          </label>
        )}
        <p className="text-sm leading-6 text-muted-foreground">{labels.solverHelp}</p>
        <Link href={`/${locale}/sudoku-solver`} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline underline-offset-4">
          {labels.solver}
        </Link>
      </div>
    </section>
  );
}
