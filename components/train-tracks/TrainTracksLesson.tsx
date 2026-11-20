'use client';

import { Fragment, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { trackInteraction } from '@/lib/analytics/events';
import { addTrackCell, isSolvedTrack, tracksBoards, type TracksBoard } from '@/lib/train-tracks';

const copy = {
  en: {
    first: '1. Pick the required connection and its reason',
    second: '2. Solve a new board without hints',
    question: 'Which of these squares must R3C2 connect to?',
    reason: 'Why is that connection required?',
    reasons: ['Row 3 can contain only one track square, and the endpoints lie on opposite sides of that row.', 'Column 2 has the largest clue.', 'The shortest route is always correct.'],
    checkAnswer: 'Check my answer',
    correct: 'Both answers are correct.',
    review: 'The required connection is R2C2, for the first reason.',
    explanation: 'A and B are above and below row 3. Its only track square must be R3C2, so the track has to pass vertically through it. A turn would use another square in row 3.',
    next: 'Try the second board',
    play: 'Start at A. Select an adjacent square each time, working toward B. Submit the whole route when ready.',
    undo: 'Undo last move',
    submit: 'Submit route',
    reset: 'Restart both puzzles',
    invalid: 'Choose an unused square next to the end of your route.',
    retry: 'This route does not satisfy all the clues. You can undo moves and try again.',
    solved: 'Solved! Your route satisfies every row and column clue.',
    entry: ['A enters from the left, and B exits to the right.', 'A enters from the right, and B exits to the left.'],
    start: 'entrance A',
    finish: 'exit B',
    given: 'given track square',
    lay: 'track selected',
    blank: 'empty square',
  },
  zh: {
    first: '1. 选出必走边和推理依据',
    second: '2. 无提示解新题',
    question: '这三个选项中，哪一格必须与 R3C2 相连？',
    reason: '这条边为什么必走？',
    reasons: ['第 3 行只能占一个格子，而起终点分居这行的两侧。', '第 2 列的提示数最大。', '最短的路线总是对的。'],
    checkAnswer: '检查答案',
    correct: '必走边和理由都选对了。',
    review: '必走边连向 R2C2，理由是第一项。',
    explanation: 'A 和 B 分别在第 3 行的上下两侧。这一行只能占 R3C2，所以必须垂直穿过它。转弯会多占第 3 行的一个格子。',
    next: '试试第二题',
    play: '从 A 开始，每次选相邻的一格，连到 B 后可以提交整条路线。',
    undo: '撤销上一步',
    submit: '提交路线',
    reset: '重新开始两道题',
    invalid: '请选择路线末端旁边一个还没走过的格子。',
    retry: '这条路线还没满足所有线索。可以撤销再试。',
    solved: '完成！路线满足所有行列线索。',
    entry: ['A 从左侧进入，B 向右侧出去。', 'A 从右侧进入，B 向左侧出去。'],
    start: '起点 A',
    finish: '终点 B',
    given: '必经格',
    lay: '已选轨道',
    blank: '空格',
  },
};

type Locale = keyof typeof copy;
type Progress = {
  stage: 'choose' | 'explain' | 'solve' | 'done';
  edge: number;
  reason: number;
  path: number[];
  attempts: number;
  lastAttempt: string;
};

const storageKey = 'samurai-train-tracks-v1';
const initial: Progress = { stage: 'choose', edge: -1, reason: -1, path: [tracksBoards[1].start], attempts: 0, lastAttempt: '' };
const shifts: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -5, ArrowDown: 5 };

function moveFocus(event: KeyboardEvent<HTMLButtonElement>, cell: number) {
  const shift = shifts[event.key];
  if (shift === undefined) return;
  event.preventDefault();
  if ((shift === -1 && cell % 5 === 0) || (shift === 1 && cell % 5 === 4)) return;
  const target = event.currentTarget.closest('[data-tracks-board]')?.querySelector<HTMLButtonElement>(`[data-cell="${cell + shift}"]`);
  target?.focus();
}

function Board({ board, path = [], onSelect, locale, variant }: {
  board: TracksBoard;
  path?: number[];
  onSelect?: (cell: number) => void;
  locale: Locale;
  variant: number;
}) {
  const c = copy[locale];
  return <figure className="w-full max-w-xs space-y-2">
    <figcaption className="text-sm">{c.entry[variant]}</figcaption>
    <div data-tracks-board className="grid grid-cols-[1.5rem_repeat(5,minmax(0,1fr))] gap-1 text-center text-sm font-medium">
      <span />
      {board.columns.map((count, col) => <span className="tabular-nums" key={col}>{count}</span>)}
      {board.rows.map((count, row) => <Fragment key={row}>
        <span className="self-center tabular-nums">{count}</span>
        {board.columns.map((_, col) => {
          const cell = row * 5 + col;
          const position = path.indexOf(cell);
          const selected = position !== -1;
          const mark = cell === board.start ? 'A' : cell === board.end ? 'B' : cell === board.given ? '●' : '';
          const description = cell === board.start ? c.start : cell === board.end ? c.finish : cell === board.given ? c.given : c.blank;
          const label = `R${row + 1}C${col + 1} · ${description}${selected ? ` · ${c.lay} ${position + 1}` : ''}`;
          const className = `grid aspect-square min-w-0 place-content-center rounded border border-border text-base ${selected ? 'bg-primary text-primary-foreground' : mark ? 'bg-muted' : 'bg-background'}`;
          return onSelect
            ? <button key={cell} type="button" data-cell={cell} aria-label={label} aria-pressed={selected}
                tabIndex={position >= 0 && position === path.length - 1 ? 0 : -1}
                className={`${className} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1`}
                onKeyDown={event => moveFocus(event, cell)} onClick={() => onSelect(cell)}>{mark || (selected ? position + 1 : '')}</button>
            : <span key={cell} className={className} title={label}>{mark}</span>;
        })}
      </Fragment>)}
    </div>
  </figure>;
}

const action = 'rounded-md bg-primary px-3 py-2 text-primary-foreground disabled:opacity-50';
const secondary = 'rounded-md border border-border px-3 py-2 disabled:opacity-50';

export function TrainTracksLesson({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [progress, setProgress] = useState<Progress>(initial);
  const [loaded, setLoaded] = useState(false);
  const [invalidMove, setInvalidMove] = useState(false);
  const lesson = useRef<HTMLDivElement>(null);
  const focusStage = useRef<Progress['stage'] | null>(null);
  const { stage, edge, reason, path, attempts, lastAttempt } = progress;
  const board = tracksBoards[1];
  const unchangedAttempt = path.join(',') === lastAttempt;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const value = JSON.parse(saved) as Partial<Progress>;
        const validStage = value.stage && ['choose', 'explain', 'solve', 'done'].includes(value.stage);
        const route = value.path;
        if (validStage && Array.isArray(route) && route[0] === board.start &&
            route.slice(1).reduce((cells, cell) => addTrackCell(board, cells, cell), [board.start]).length === route.length &&
            Number.isInteger(value.edge) && Number.isInteger(value.reason) && Number.isInteger(value.attempts) &&
            typeof value.lastAttempt === 'string' &&
            (value.stage !== 'done' || isSolvedTrack(board, route))) {
          setProgress(value as Progress);
        }
      }
    } catch {}
    setLoaded(true);
  }, [board]);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch {}
  }, [loaded, progress]);

  useEffect(() => {
    if (focusStage.current !== stage) return;
    focusStage.current = null;
    lesson.current?.querySelector<HTMLElement>(`[data-stage-focus="${stage}"]`)?.focus();
  }, [stage]);

  function submitAnswer() {
    if (stage !== 'choose' || edge < 0 || reason < 0) return;
    trackInteraction('train_tracks_reason_submit', { locale, edge_correct: edge === 1, reason_correct: reason === 0 });
    focusStage.current = 'explain';
    setProgress({ ...progress, stage: 'explain' });
  }

  function selectCell(cell: number) {
    if (stage !== 'solve') return;
    const next = addTrackCell(board, path, cell);
    setInvalidMove(next === path);
    if (next !== path) setProgress({ ...progress, path: next });
  }

  function submitRoute() {
    if (stage !== 'solve' || path[path.length - 1] !== board.end || unchangedAttempt) return;
    const solved = isSolvedTrack(board, path);
    trackInteraction('train_tracks_route_submit', { locale, solved, first_attempt: attempts === 0 });
    if (solved) focusStage.current = 'done';
    setProgress({ ...progress, lastAttempt: path.join(','), attempts: attempts + 1, stage: solved ? 'done' : 'solve' });
    setInvalidMove(false);
  }

  return <div ref={lesson} className="space-y-4">
    {stage === 'choose' || stage === 'explain' ? <>
      <h2 data-stage-focus="choose" tabIndex={-1} className="text-xl font-semibold">{c.first}</h2>
      <Board board={tracksBoards[0]} locale={locale} variant={0} />
      <fieldset disabled={!loaded || stage !== 'choose'} className="space-y-1">
        <legend className="mb-1 font-medium">{c.question}</legend>
        {['R3C1', 'R2C2', 'R3C3'].map((option, index) => <label key={option} className="flex min-h-9 items-center gap-2">
          <input type="radio" name="track-edge" checked={edge === index} onChange={() => setProgress({ ...progress, edge: index })} />
          {option}
        </label>)}
      </fieldset>
      <fieldset disabled={!loaded || stage !== 'choose'} className="space-y-1">
        <legend className="mb-1 font-medium">{c.reason}</legend>
        {c.reasons.map((option, index) => <label key={option} className="flex min-h-9 items-center gap-2">
          <input type="radio" name="track-reason" checked={reason === index} onChange={() => setProgress({ ...progress, reason: index })} />
          {option}
        </label>)}
      </fieldset>
      {stage === 'choose'
        ? <button type="button" className={action} disabled={!loaded || edge < 0 || reason < 0} onClick={submitAnswer}>{c.checkAnswer}</button>
        : <div className="space-y-2">
          <p role="status" data-stage-focus="explain" tabIndex={-1}><strong>{edge === 1 && reason === 0 ? c.correct : c.review}</strong> {c.explanation}</p>
          <button type="button" className={action} onClick={() => {
            trackInteraction('train_tracks_second_start', { locale });
            focusStage.current = 'solve';
            setProgress({ ...progress, stage: 'solve' });
          }}>{c.next}</button>
        </div>}
    </> : <>
      <h2 data-stage-focus="solve" tabIndex={-1} className="text-xl font-semibold">{c.second}</h2>
      <p>{c.play}</p>
      <Board board={board} path={path} onSelect={stage === 'solve' ? selectCell : undefined} locale={locale} variant={1} />
      {stage === 'solve' && <div className="flex flex-wrap gap-2">
        <button type="button" className={secondary} disabled={path.length < 2}
          onClick={() => { setProgress({ ...progress, path: path.slice(0, -1) }); setInvalidMove(false); }}>{c.undo}</button>
        <button type="button" className={action} disabled={path[path.length - 1] !== board.end || unchangedAttempt} onClick={submitRoute}>{c.submit}</button>
      </div>}
      <p role="status" data-stage-focus="done" tabIndex={-1}>{stage === 'done' ? c.solved : unchangedAttempt ? c.retry : invalidMove ? c.invalid : ''}</p>
    </>}
    {(stage !== 'choose' || edge !== -1 || reason !== -1) && <button type="button" className={secondary}
      onClick={() => { focusStage.current = 'choose'; setInvalidMove(false); setProgress(initial); }}>{c.reset}</button>}
  </div>;
}
