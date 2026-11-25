'use client';

import { useRef, useState } from 'react';
import clsx from 'clsx';

import { checkBoard, checkDeduction, deductions, lessonClues, practiceClues, SIZE } from '@/lib/nurikabe/puzzles';
import type { Mark, Reason } from '@/lib/nurikabe/puzzles';

const copy = {
  en: {
    lesson: 'Puzzle 1: Learn three deductions',
    practice: 'Puzzle 2: Solve on your own',
    instructions: [
      'Choose the square between the two 1s in row 3. Mark it and pick the rule that explains your move.',
      'This position starts with two sea squares. Choose the square that connects the top one to the rest of the sea, then pick the rule.',
      'This position starts with three sea squares near the bottom left. Choose the fourth square of that 2 × 2 block.',
    ],
    explanations: [
      'A 1 already fills its own island. A square next to it must be sea.',
      'The top sea square has just one exit. Sea squares must connect along edges.',
      'Four sea squares cannot form a 2 × 2 block, so this square is island.',
    ],
    reasons: { size: 'Island size', connected: 'Connected sea', square: 'No 2 × 2 sea block' },
    marks: { blank: 'Blank', sea: 'Sea', island: 'Island' },
    cell: (row: number, column: number, value: string) => `Row ${row}, column ${column}: ${value}`,
    step: (position: number) => `Deduction ${position} of 3`,
    board: 'Nurikabe board',
    markTitle: 'Choose a mark',
    reasonTitle: 'Choose the reason',
    checkStep: 'Check deduction',
    next: 'Next deduction',
    start: 'Start puzzle 2',
    errors: {
      cell: 'Try a different square in this deduction.',
      mark: 'Keep the square and try the other mark.',
      reason: 'The square and mark fit. Try a rule that explains both.',
    },
    practiceNote: 'Choose Sea, Island or Erase, then select squares. Check once all squares are marked. Undo also works after a reset.',
    erase: 'Erase',
    undo: 'Undo',
    reset: 'Reset board',
    check: 'Check puzzle',
    results: {
      incomplete: 'Mark every empty square before checking.',
      invalid: 'Some marks break the rules. Review the islands, sea connections and 2 × 2 blocks.',
      solved: 'Solved! All islands match their clues and the sea follows both rules.',
    },
  },
  zh: {
    lesson: '第 1 题：练三种推理',
    practice: '第 2 题：独立解题',
    instructions: [
      '选中第 3 行两个 1 中间的格子，标记它，再选能解释这一步的规则。',
      '这个局面预标了两个海格。选出把最上方海格接入其余海格的格子，然后选择规则。',
      '这个局面预标了靠左下的三个海格。选中这个 2 × 2 区域的第四格。',
    ],
    explanations: [
      '标 1 的格单独就是一座岛，它的邻格必须是海。',
      '第一行的海格只有一个出口。海格必须沿边相连。',
      '海不能填满一个 2 × 2 区域，所以第四格是岛。',
    ],
    reasons: { size: '岛的大小', connected: '海必须连通', square: '不能有 2 × 2 海块' },
    marks: { blank: '空白', sea: '海', island: '岛' },
    cell: (row: number, column: number, value: string) => `第 ${row} 行，第 ${column} 列：${value}`,
    step: (position: number) => `第 ${position} 步，共 3 步`,
    board: '海岛谜题棋盘',
    markTitle: '选择标记',
    reasonTitle: '选择理由',
    checkStep: '检查推理',
    next: '下一步推理',
    start: '开始第 2 题',
    errors: {
      cell: '试试这一步里的另一个格子。',
      mark: '格子选对了，试试另一种标记。',
      reason: '格子和标记都对了，再选能解释这一步的规则。',
    },
    practiceNote: '选海、岛或擦除，再点格子。填完后检查。重置后也可以撤销。',
    erase: '擦除',
    undo: '撤销',
    reset: '重置棋盘',
    check: '检查答案',
    results: {
      incomplete: '先标记所有空格，再检查。',
      invalid: '有标记违反规则。检查岛的大小、海的连通和 2 × 2 海块。',
      solved: '解开了！每座岛都符合数字，海格也满足两条规则。',
    },
  },
};

type Locale = keyof typeof copy;
type DeductionResult = ReturnType<typeof checkDeduction>;
type BoardResult = ReturnType<typeof checkBoard>;
const reasons = ['size', 'connected', 'square'] as const;
const seaOrIsland = ['sea', 'island'] as const;
const drawingModes = ['sea', 'island', 'blank'] as const;
const button = 'min-h-10 rounded-md border border-border px-3 py-2 text-sm font-medium enabled:hover:border-primary disabled:opacity-50';
const primary = `${button} border-transparent bg-primary text-primary-foreground`;
const pressed = 'border-primary bg-primary/10';

function emptyBoard(clues: typeof lessonClues): Mark[] {
  return Array.from({ length: SIZE * SIZE }, (_, cell) => clues[cell] === undefined ? 'blank' : 'island');
}

const initialPractice = emptyBoard(practiceClues);

function Board({ clues, marks, locale, onCell, selected, locked = [], readOnly = false }: {
  clues: typeof lessonClues;
  marks: readonly Mark[];
  locale: Locale;
  onCell: (cell: number) => void;
  selected?: number | null;
  locked?: readonly number[];
  readOnly?: boolean;
}) {
  const c = copy[locale];
  return (
    <div role="group" aria-label={c.board} className="grid w-full max-w-[19rem] grid-cols-5 gap-1 rounded-lg border border-border bg-muted p-1.5">
      {marks.map((mark, cell) => {
        const clue = clues[cell];
        const fixed = clue !== undefined || locked.includes(cell);
        return (
          <button
            type="button"
            key={cell}
            disabled={fixed || readOnly}
            aria-label={c.cell(Math.floor(cell / SIZE) + 1, cell % SIZE + 1, clue?.toString() ?? c.marks[mark])}
            aria-pressed={selected === undefined || fixed ? undefined : selected === cell}
            onClick={() => onCell(cell)}
            className={clsx(
              'aspect-square min-w-0 rounded-md border border-border text-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary enabled:hover:border-primary',
              mark === 'sea' && 'border-sky-900 bg-sky-950 text-sky-100 dark:border-sky-700',
              mark === 'island' && 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-400',
              mark === 'blank' && 'bg-card text-foreground',
              selected === cell && 'ring-2 ring-inset ring-primary',
            )}
          >
            <span aria-hidden="true">{clue ?? (mark === 'sea' ? '≈' : mark === 'island' ? '●' : '')}</span>
          </button>
        );
      })}
    </div>
  );
}

export function NurikabeLesson({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [mark, setMark] = useState<Exclude<Mark, 'blank'> | null>(null);
  const [reason, setReason] = useState<Reason | null>(null);
  const [deductionResult, setDeductionResult] = useState<DeductionResult | null>(null);
  const [drawingMode, setDrawingMode] = useState<Mark>('sea');
  const [history, setHistory] = useState<readonly Mark[][]>([initialPractice]);
  const [boardResult, setBoardResult] = useState<BoardResult | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const step = deductions[stepIndex];
  const finishedStep = deductionResult === 'correct';
  const practice = history[history.length - 1];

  function markCell(cell: number) {
    if (practice[cell] === drawingMode) return;
    setHistory((previous) => {
      const next = [...previous[previous.length - 1]];
      next[cell] = drawingMode;
      return [...previous, next];
    });
    setBoardResult(null);
  }

  const lessonBoard = emptyBoard(lessonClues);
  step?.sea.forEach((cell) => { lessonBoard[cell] = 'sea'; });
  if (selected !== null && mark !== null) lessonBoard[selected] = mark;

  return (
    <section aria-labelledby="nurikabe-play" className="space-y-4 rounded-xl border border-border bg-card p-3 sm:p-6">
      <h2 id="nurikabe-play" ref={heading} tabIndex={-1} className="text-2xl font-semibold">
        {step ? c.lesson : c.practice}
      </h2>
      {step ? (
        <>
          <h3 className="font-medium">{c.step(stepIndex + 1)}</h3>
          <p>{c.instructions[stepIndex]}</p>
          <div className="grid items-start gap-5 sm:grid-cols-2">
            <Board clues={lessonClues} marks={lessonBoard} locale={locale} locked={step.sea} selected={selected} readOnly={finishedStep}
              onCell={(cell) => {
                setSelected(cell);
                setDeductionResult(null);
              }}
            />
            <div className="space-y-4">
              <fieldset disabled={finishedStep}>
                <legend className="mb-2 font-semibold">{c.markTitle}</legend>
                <div className="flex flex-wrap gap-2">
                  {seaOrIsland.map((value) => (
                    <button key={value} type="button" aria-pressed={mark === value} className={clsx(button, mark === value && pressed)} onClick={() => {
                      setMark(value);
                      setDeductionResult(null);
                    }}>{c.marks[value]}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset disabled={finishedStep}>
                <legend className="mb-2 font-semibold">{c.reasonTitle}</legend>
                <div className="flex flex-wrap gap-2">
                  {reasons.map((value) => (
                    <button key={value} type="button" aria-pressed={reason === value} className={clsx(button, reason === value && pressed)} onClick={() => {
                      setReason(value);
                      setDeductionResult(null);
                    }}>{c.reasons[value]}</button>
                  ))}
                </div>
              </fieldset>
              {finishedStep ? (
                <button type="button" className={primary} onClick={() => {
                  setStepIndex(stepIndex + 1);
                  setSelected(null);
                  setReason(null);
                  setMark(null);
                  setDeductionResult(null);
                  heading.current?.focus();
                }}>{stepIndex + 1 === deductions.length ? c.start : c.next}</button>
              ) : (
                <button type="button" className={primary} disabled={selected === null || !mark || !reason} onClick={() => {
                  if (selected !== null && mark && reason) setDeductionResult(checkDeduction(step, selected, mark, reason));
                }}>{c.checkStep}</button>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <p>{c.practiceNote}</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={c.markTitle}>
            {drawingModes.map((mode) => (
              <button key={mode} type="button" aria-pressed={drawingMode === mode} className={clsx(button, drawingMode === mode && pressed)} onClick={() => setDrawingMode(mode)}>
                {mode === 'blank' ? c.erase : c.marks[mode]}
              </button>
            ))}
          </div>
          <Board clues={practiceClues} marks={practice} locale={locale} onCell={markCell} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primary} onClick={() => setBoardResult(checkBoard(practiceClues, practice))}>{c.check}</button>
            <button type="button" className={button} disabled={history.length === 1} onClick={() => {
              setHistory((previous) => previous.slice(0, -1));
              setBoardResult(null);
            }}>{c.undo}</button>
            <button type="button" className={button} disabled={practice.every((value, cell) => value === initialPractice[cell])} onClick={() => {
              setHistory((previous) => [...previous, initialPractice]);
              setBoardResult(null);
            }}>{c.reset}</button>
          </div>
        </>
      )}
      <p role="status" className="min-h-6 text-sm font-medium">
        {deductionResult === 'correct' ? c.explanations[stepIndex]
          : deductionResult && c.errors[deductionResult]}
        {boardResult && c.results[boardResult]}
      </p>
    </section>
  );
}
