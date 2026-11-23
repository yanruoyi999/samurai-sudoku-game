'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { trackInteraction } from '@/lib/analytics/events';
import { isSolvedSuguru, isSuguruProgress, suguruBoards, suguruColumns, suguruRows } from '@/lib/suguru';

const copy = {
  en: {
    lesson: '1. Pick a square and explain why',
    second: '2. Solve a new board without hints',
    question: 'Which empty square in region B must contain 1 because a diagonal 2 rules out its other possible number? Pick the square on the board.',
    why: 'Why must that square be 1?',
    reasons: ['A diagonal 2 rules out the only other candidate.', 'Every four-square region starts with 1 in the top empty square.', 'Numbers in different regions may touch diagonally.'],
    submit: 'Check my reasoning',
    correct: 'Correct square and reason.',
    retry: 'Review the explanation before moving on.',
    explanation: 'Region B already has 3 and 4, leaving 1 and 2. At R3C4, the 2 at R2C5 touches diagonally, leaving only 1.',
    firstBoard: 'Play puzzle 1',
    secondBoard: 'Try puzzle 2 without hints',
    firstPractice: 'Puzzle 1',
    secondPractice: 'Puzzle 2',
    play: 'Select an empty square, then type or tap a number. Submit the filled board to check all the rules.',
    clear: 'Clear square',
    check: 'Check full board',
    reset: 'Restart this puzzle',
    wrong: 'The board still breaks a rule. Check the numbers in each region and every touching pair.',
    solved: 'Solved! Every region and touching pair follows the rules.',
    empty: 'empty',
    given: 'given',
    region: 'region',
    board: 'Suguru grid',
  },
  zh: {
    lesson: '1. 选格并说明理由',
    second: '2. 无提示解一道新题',
    question: 'B 区哪个空格能用斜邻的 2 排除另一个候选，从而确定填 1？请在棋盘上选格。',
    why: '为什么这个格子只能填 1？',
    reasons: ['斜邻的 2 排除了唯一的另一个候选。', '每个四格区最上方的空格总是填 1。', '不同区的相同数字可以斜角相邻。'],
    submit: '检查推理',
    correct: '格子和理由都选对了。',
    retry: '先看验算，再继续。',
    explanation: 'B 区已有 3 和 4，只剩 1 和 2。R2C5 的 2 和 R3C4 共角，因此 R3C4 只能填 1。',
    firstBoard: '完整试玩第一题',
    secondBoard: '无提示试第二题',
    firstPractice: '第一题',
    secondPractice: '第二题',
    play: '选一个空格，再键入或点数字。填完后提交，核对整盘是否满足规则。',
    clear: '清空当前格',
    check: '检查整盘',
    reset: '重开这道题',
    wrong: '还有规则未满足。请检查每区数字和各个相邻格。',
    solved: '完成！各区数字和所有相邻格都符合规则。',
    empty: '空格',
    given: '给定值',
    region: '区',
    board: 'Suguru 棋盘',
  },
};

type Locale = keyof typeof copy;
type BoardIndex = 0 | 1;
type Saved = {
  boards: [number[], number[]];
  lessonCorrect: boolean | null;
  secondStarted: boolean;
  completionReported: [boolean, boolean];
};
const storageKey = 'samurai-suguru-v1';

function initialProgress(): Saved {
  return {
    boards: [Array.from(suguruBoards[0].givens), Array.from(suguruBoards[1].givens)],
    lessonCorrect: null,
    secondStarted: false,
    completionReported: [false, false],
  };
}

function readProgress(fallback = initialProgress()): Saved {
  try {
    const value: Partial<Saved> | null = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (value && (value.lessonCorrect === null || typeof value.lessonCorrect === 'boolean') &&
        typeof value.secondStarted === 'boolean' &&
        Array.isArray(value.boards) && value.boards.length === 2 &&
        suguruBoards.every((board, index) => isSuguruProgress(board, value.boards?.[index])) &&
        Array.isArray(value.completionReported) && value.completionReported.length === 2 &&
        value.completionReported.every(flag => typeof flag === 'boolean')) {
      return value as Saved;
    }
  } catch {}
  return fallback;
}

const action = 'rounded-md bg-primary px-3 py-2 text-primary-foreground disabled:opacity-50';
const secondary = 'rounded-md border border-border px-3 py-2 disabled:opacity-50';

export function SuguruLesson({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [progress, setProgress] = useState(initialProgress);
  const [loaded, setLoaded] = useState(false);
  const [reason, setReason] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [active, setActive] = useState<BoardIndex>(0);
  const [feedback, setFeedback] = useState<'wrong' | 'solved' | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLParagraphElement>(null);
  const showExplanation = useRef(false);

  useEffect(() => {
    const previous = readProgress();
    setProgress(previous);
    setActive(previous.secondStarted ? 1 : 0);
    setLoaded(true);
    function syncProgress(event: StorageEvent) {
      if (event.storageArea === localStorage && (event.key === storageKey || event.key === null)) {
        setProgress(readProgress());
        setFeedback(null);
      }
    }
    window.addEventListener('storage', syncProgress);
    return () => window.removeEventListener('storage', syncProgress);
  }, []);

  useEffect(() => {
    if (progress.lessonCorrect === null || !showExplanation.current) return;
    showExplanation.current = false;
    explanationRef.current?.focus();
  }, [progress.lessonCorrect]);

  const teaching = progress.lessonCorrect === null;
  const board = suguruBoards[active];
  const values = progress.boards[active];
  const editable = loaded && !teaching && selected !== null && board.givens[selected] === 0;
  const canAnswer = loaded && teaching && selected !== null &&
    board.regions[selected] === 'B' && board.givens[selected] === 0 && reason !== null;

  function changeProgress(change: (latest: Saved) => Saved) {
    const latest = readProgress(progress);
    const next = change(latest);
    if (next !== latest) {
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
    }
    setProgress(next);
  }

  function submitReason() {
    if (!canAnswer) return;
    const correct = selected === 13 && reason === 0;
    changeProgress(latest => {
      if (latest.lessonCorrect !== null) return latest;
      trackInteraction('suguru_reason_submit', { locale });
      if (correct) trackInteraction('suguru_reason_correct', { locale });
      return { ...latest, lessonCorrect: correct };
    });
    showExplanation.current = true;
    setSelected(null);
  }

  function switchBoard(index: BoardIndex) {
    if (teaching || !loaded) return;
    if (index === 1) {
      changeProgress(latest => {
        if (latest.secondStarted) return latest;
        trackInteraction('suguru_second_start', { locale });
        return { ...latest, secondStarted: true };
      });
    }
    setActive(index);
    setSelected(null);
    setFeedback(null);
  }

  function updateBoard(update: (cells: number[]) => number[]) {
    changeProgress(latest => {
      const boards: Saved['boards'] = [...latest.boards];
      boards[active] = update(boards[active]);
      return { ...latest, boards };
    });
    setFeedback(null);
  }

  function enterDigit(cell: number, digit: number) {
    if (!loaded || teaching || board.givens[cell] !== 0) return;
    updateBoard(cells => cells.map((old, index) => index === cell ? digit : old));
  }

  function handleCellKey(event: KeyboardEvent<HTMLButtonElement>, cell: number) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const directions: Record<string, number> = {
      ArrowUp: -suguruColumns,
      ArrowDown: suguruColumns,
      ArrowLeft: -1,
      ArrowRight: 1,
    };
    const offset = directions[event.key];
    if (offset !== undefined) {
      event.preventDefault();
      const target = cell + offset;
      if ((event.key === 'ArrowLeft' && cell % suguruColumns === 0) ||
          (event.key === 'ArrowRight' && cell % suguruColumns === suguruColumns - 1) ||
          target < 0 || target >= values.length) return;
      setSelected(target);
      boardRef.current?.querySelector<HTMLButtonElement>(`[data-suguru-cell="${target}"]`)?.focus();
    } else if (/^[1-5]$/.test(event.key) || event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      enterDigit(cell, /^[1-5]$/.test(event.key) ? Number(event.key) : 0);
    }
  }

  function checkBoard() {
    if (teaching || values.includes(0)) return;
    changeProgress(latest => {
      const solved = isSolvedSuguru(board, latest.boards[active]);
      setFeedback(solved ? 'solved' : 'wrong');
      if (!solved || latest.completionReported[active]) return latest;
      trackInteraction(active === 0 ? 'suguru_first_complete' : 'suguru_second_complete', { locale });
      const completionReported: Saved['completionReported'] = [...latest.completionReported];
      completionReported[active] = true;
      return { ...latest, completionReported };
    });
  }

  return <div className="space-y-4">
    <h2 className="text-xl font-semibold">{active === 0 ? c.lesson : c.second}</h2>
    {teaching ? <p>{c.question}</p> : <>
      {active === 0 && <p ref={explanationRef} role="status" tabIndex={-1}><strong>{progress.lessonCorrect ? c.correct : c.retry}</strong> {c.explanation}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={secondary} aria-pressed={active === 0} onClick={() => switchBoard(0)}>{c.firstBoard}</button>
        <button type="button" className={secondary} aria-pressed={active === 1} onClick={() => switchBoard(1)}>{c.secondBoard}</button>
      </div>
      <p>{c.play}</p>
    </>}
    <div ref={boardRef} role="group" aria-label={`${c.board} · ${active === 0 ? c.firstPractice : c.secondPractice}`}
      className="grid w-full max-w-xs grid-cols-5 overflow-hidden rounded-sm border-2 border-foreground">
      {values.map((digit, cell) => {
        const row = Math.floor(cell / suguruColumns);
        const col = cell % suguruColumns;
        const region = board.regions[cell];
        const fixed = board.givens[cell] !== 0;
        const right = col < suguruColumns - 1 && region !== board.regions[cell + 1];
        const below = row < suguruRows - 1 && region !== board.regions[cell + suguruColumns];
        const label = `R${row + 1}C${col + 1} · ${c.region} ${region} · ${digit || c.empty}${fixed ? ` · ${c.given}` : ''}`;
        return <button key={cell} type="button" aria-label={label} aria-pressed={selected === cell}
          data-suguru-cell={cell} tabIndex={cell === (selected ?? 0) ? 0 : -1} disabled={!loaded}
          className={`relative grid aspect-square min-w-0 place-content-center border-border text-lg focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 ${right ? 'border-r-[3px] border-r-foreground' : 'border-r'} ${below ? 'border-b-[3px] border-b-foreground' : 'border-b'} ${selected === cell ? 'bg-primary/15' : fixed ? 'bg-muted font-bold' : 'bg-background'}`}
          onClick={() => setSelected(cell)} onKeyDown={event => handleCellKey(event, cell)}>
          <span aria-hidden="true" className="absolute left-0.5 top-0.5 text-[9px] leading-none text-muted-foreground">{region}</span>
          <span aria-hidden="true">{digit || ''}</span>
        </button>;
      })}
    </div>
    {teaching ? <>
      <fieldset disabled={!loaded} className="space-y-1">
        <legend className="font-medium">{c.why}</legend>
        {c.reasons.map((option, index) => <label key={option} className="flex min-h-10 items-center gap-2">
          <input type="radio" name="suguru-reason" checked={reason === index} onChange={() => setReason(index)} />{option}
        </label>)}
      </fieldset>
      <button type="button" className={action} disabled={!canAnswer} onClick={submitReason}>{c.submit}</button>
    </> : <>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 0].map(digit => <button key={digit} type="button" className={secondary}
          disabled={!editable} onClick={() => { if (selected !== null) enterDigit(selected, digit); }}>
          {digit || c.clear}
        </button>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={action} disabled={values.includes(0)} onClick={checkBoard}>{c.check}</button>
        <button type="button" className={secondary} onClick={() => { updateBoard(() => Array.from(board.givens)); setSelected(null); }}>{c.reset}</button>
      </div>
      <p role="status">{feedback ? c[feedback] : ''}</p>
    </>}
  </div>;
}
