'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { trackInteraction } from '@/lib/analytics/events';
import { isForcedFirstSquare, isSolved, side, starBattleBoards } from '@/lib/star-battle';

const SAVE_KEY = 'samurai:star-battle-practice:v1';
const stages = ['reason', 'guided', 'between', 'independent', 'done'] as const;
type Stage = (typeof stages)[number];
type Mark = '' | 'star' | 'cross';
type Session = { stage: Stage; marks: Mark[]; started: boolean; firstAnswered: boolean };
type Notice = 'missing' | 'reasonWrong' | 'reasonRight' | 'incomplete' | 'cleared';
type FocusTarget = 'board' | 'next' | 'status';
const empty = (): Mark[] => Array<Mark>(side * side).fill('');
const fresh = (): Session => ({ stage: 'reason', marks: empty(), started: false, firstAnswered: false });

const copy = {
  en: {
    first: 'Puzzle 1 · Guided', second: 'Puzzle 2 · On your own',
    choose: 'Choose a square you can prove must contain a star, then select your reason.',
    play: 'Use a star for a placement and × to rule out a square. Select the same square again to clear it.',
    solo: 'Solve this new board on your own. Check the board when you have placed five stars.',
    reasons: ['A region has just one square', 'Any square on the outside edge must have a star', 'Stars can touch at their corners'],
    placeholder: 'Choose a reason', submit: 'Check reason', check: 'Check board', next: 'Start puzzle 2',
    star: 'Place stars', cross: 'Mark excluded squares', clear: 'Clear this board', restart: 'Restart both puzzles',
    guidedDone: 'Puzzle 1 solved. Apply the rule on a different board.',
    done: 'Both puzzles solved.',
    missing: 'Select a square and a reason.',
    reasonWrong: 'That choice does not prove a star. Count the squares in each region.',
    reasonRight: 'Correct. This region needs one star and has only one square. Now finish the board.',
    incomplete: 'The board is incomplete or breaks a rule. Check your placements.',
    cleared: 'Board cleared.',
    cell: (r: number, c: number, region: string, mark: Mark, fixed: boolean) =>
      `Row ${r}, column ${c}, region ${region}, ${fixed ? 'fixed star' : mark === 'star' ? 'star' : mark === 'cross' ? 'excluded' : 'empty'}`,
  },
  zh: {
    first: '第 1 题 · 有引导', second: '第 2 题 · 独立解',
    choose: '先选一个能确定放星的格子，再选出能证明这一步的理由。',
    play: '用星标记放置，用 × 排除格子。再次点击同一个格子可清除该标记。',
    solo: '请独立解这张新棋盘。摆好五颗星后，检查棋盘。',
    reasons: ['这个区域只有一个格子', '外边缘的格子一定有星', '两颗星可以斜角相邻'],
    placeholder: '选择理由', submit: '检查理由', check: '检查棋盘', next: '开始第 2 题',
    star: '放置星星', cross: '标记排除格', clear: '清空当前题', restart: '两题重新开始',
    guidedDone: '第 1 题已解开。接下来在不同棋盘上用同样的规则。',
    done: '两题都解开了。',
    missing: '请先选格子和理由。',
    reasonWrong: '这组格子和理由不能证明应当放星。数一数每个区域的格子。',
    reasonRight: '正确。这个区域必须有一颗星，又只有一格。现在请完成这题。',
    incomplete: '棋盘尚未完成或有冲突。请检查星星的位置。',
    cleared: '已清空可编辑的格子。',
    cell: (r: number, c: number, region: string, mark: Mark, fixed: boolean) =>
      `第 ${r} 行第 ${c} 列，${region} 区，${fixed ? '固定星' : mark === 'star' ? '有星' : mark === 'cross' ? '已排除' : '空格'}`,
  },
};

const regionColors: Record<string, string> = {
  A: 'bg-amber-100', B: 'bg-sky-100', C: 'bg-emerald-100', D: 'bg-violet-100', E: 'bg-rose-100',
};

function restore(): Session {
  try {
    const saved: Session | null = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null');
    if (saved && stages.includes(saved.stage) && typeof saved.started === 'boolean' &&
        typeof saved.firstAnswered === 'boolean' && Array.isArray(saved.marks) &&
        saved.marks.length === side * side && saved.marks.every(mark => mark === '' || mark === 'star' || mark === 'cross')) return saved;
  } catch {
    // The game works in memory if storage is unavailable or invalid.
  }
  return fresh();
}

function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
  const offsets: Record<string, number> = { ArrowUp: -side, ArrowDown: side };
  const offset = event.key === 'ArrowLeft' && index % side > 0 ? -1
    : event.key === 'ArrowRight' && index % side < side - 1 ? 1 : offsets[event.key];
  if (offset === undefined || index + offset < 0 || index + offset >= side * side) return;
  event.preventDefault();
  event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-cell="${index + offset}"]`)?.focus();
}

export function StarBattleGame({ locale }: { locale: 'en' | 'zh' }) {
  const c = copy[locale];
  const [session, setSession] = useState<Session>(fresh);
  const [ready, setReady] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState<'star' | 'cross'>('star');
  const [notice, setNotice] = useState<Notice>();
  const afterUpdate = useRef<FocusTarget | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setSession(restore());
    setReady(true);
  }, []);

  useEffect(() => {
    const target = afterUpdate.current;
    afterUpdate.current = null;
    if (target === 'board') boardRef.current?.querySelector<HTMLButtonElement>('[data-cell="0"]')?.focus();
    if (target === 'next') nextRef.current?.focus();
    if (target === 'status') statusRef.current?.focus();
  }, [session]);

  const { stage, marks } = session;
  const board = starBattleBoards[stage === 'independent' || stage === 'done' ? 1 : 0];
  const choosing = stage === 'reason';
  const playing = stage === 'guided' || stage === 'independent';
  const heading = board === starBattleBoards[0] ? c.first : c.second;
  const fixedSquare = stage === 'guided' || stage === 'between' ? board.findIndex((_, i) => isForcedFirstSquare(board, i)) : -1;
  const button = 'min-h-11 rounded-lg border border-border px-3 py-2 text-sm font-medium';
  const modeButton = button + ' aria-pressed:bg-primary aria-pressed:text-primary-foreground';

  function update(next: Session, focus?: FocusTarget) {
    afterUpdate.current = focus ?? null;
    setSession(next);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(next)); } catch { /* In-memory play remains available. */ }
  }

  function select(cell: number) {
    if (choosing) {
      if (!session.started) {
        trackInteraction('star_battle_started', { locale });
        update({ ...session, started: true });
      }
      setPicked(cell);
    } else if (playing && cell !== fixedSquare) {
      update({ ...session, marks: marks.map((mark, i) => i === cell ? (mark === mode ? '' : mode) : mark) });
    }
    setNotice(undefined);
  }

  function checkReason() {
    if (picked === null || !reason) {
      setNotice('missing');
      return;
    }
    const correct = reason === 'singleton' && isForcedFirstSquare(board, picked);
    if (!session.firstAnswered) trackInteraction('star_battle_first_reason', { locale, correct });
    update({
      ...session,
      stage: correct ? 'guided' : 'reason',
      firstAnswered: true,
      marks: correct ? marks.map((mark, i) => i === picked ? 'star' : mark) : marks,
    }, correct ? 'board' : undefined);
    setNotice(correct ? 'reasonRight' : 'reasonWrong');
  }

  function checkBoard() {
    const stars = marks.flatMap((mark, i) => mark === 'star' ? [i] : []);
    if (!isSolved(board, stars)) {
      setNotice('incomplete');
      return;
    }
    const second = stage === 'independent';
    trackInteraction(second ? 'star_battle_puzzle_2_completed' : 'star_battle_puzzle_1_completed', { locale });
    update({ ...session, stage: second ? 'done' : 'between' }, second ? 'status' : 'next');
    setNotice(undefined);
  }

  return <fieldset disabled={!ready} className="min-w-0 space-y-4">
    <legend className="text-xl font-semibold">{heading}</legend>
    {choosing && <p>{c.choose}</p>}
    {stage === 'guided' && <p>{c.play}</p>}
    {stage === 'independent' && <p>{c.solo} {c.play}</p>}
    <div ref={boardRef} role="group" aria-label={heading} className="grid w-full max-w-[20rem] grid-cols-5 gap-1">
      {board.map((region, i) => {
        const mark = marks[i];
        const selected = choosing && i === picked;
        const fixed = i === fixedSquare;
        return <button key={i} data-cell={i} type="button"
          className={`flex min-h-11 items-center justify-center gap-1 rounded border border-slate-500 px-1 font-semibold text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${regionColors[region]} ${selected ? 'ring-2 ring-inset ring-slate-950' : ''}`}
          disabled={!choosing && !playing} aria-disabled={fixed || undefined}
          aria-pressed={choosing ? selected : undefined}
          aria-label={c.cell(Math.floor(i / side) + 1, i % side + 1, region, mark, fixed)}
          onKeyDown={event => moveFocus(event, i)} onClick={() => select(i)}>
          <span aria-hidden="true" className="text-xs">{region}</span>
          <span aria-hidden="true">{mark === 'star' ? '★' : mark === 'cross' ? '×' : ''}</span>
        </button>;
      })}
    </div>
    {choosing && <form className="flex flex-wrap items-end gap-2" onSubmit={event => { event.preventDefault(); checkReason(); }}>
      <label className="grid min-w-0 max-w-full gap-1 text-sm">
        {c.placeholder}
        <select className="min-h-11 w-full max-w-full rounded-lg border border-border bg-background px-2" value={reason} onChange={event => setReason(event.target.value)}>
          <option value="">—</option>
          {c.reasons.map((label, i) => <option value={['singleton', 'edge', 'corners'][i]} key={label}>{label}</option>)}
        </select>
      </label>
      <button type="submit" className={button}>{c.submit}</button>
    </form>}
    {playing && <div className="flex flex-wrap gap-2">
      <button type="button" className={modeButton} aria-pressed={mode === 'star'} onClick={() => setMode('star')}>{c.star}</button>
      <button type="button" className={modeButton} aria-pressed={mode === 'cross'} onClick={() => setMode('cross')}>{c.cross}</button>
      <button type="button" className={button} onClick={checkBoard}>{c.check}</button>
      <button type="button" className={button} onClick={() => {
        update({ ...session, marks: empty().map((_, i) => i === fixedSquare ? 'star' : '') });
        setNotice('cleared');
      }}>{c.clear}</button>
    </div>}
    <p ref={statusRef} tabIndex={-1} role="status" className="min-h-6">{stage === 'done' ? c.done : stage === 'between' ? c.guidedDone : notice && c[notice]}</p>
    {stage === 'between' && <button ref={nextRef} type="button" className={button} onClick={() => {
      trackInteraction('star_battle_puzzle_2_started', { locale });
      update({ ...session, stage: 'independent', marks: empty() }, 'board');
      setMode('star');
    }}>{c.next}</button>}
    {session.started && <button type="button" className={button} onClick={() => {
      update(fresh(), 'board');
      setPicked(null);
      setReason('');
      setNotice(undefined);
      setMode('star');
    }}>{c.restart}</button>}
  </fieldset>;
}
