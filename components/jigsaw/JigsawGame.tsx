'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { arePeers, digits, isComplete, puzzles, restoreProgress } from '@/lib/jigsaw/puzzles';

const palette = [
  '#f8eddd', '#e6f1ed', '#ece9f7', '#e8eff7', '#f6e8ed', '#eef1dc', '#f2eadf', '#e5f2f5', '#f5eed5',
];
const keyPrefix = 'samurai-jigsaw-v1:';
const control = 'min-h-11 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50';
const labels = {
  en: {
    choose: 'Choose a puzzle', names: ['Steps', 'Bridges', 'Switchbacks'],
    board: 'Jigsaw Sudoku board', instructions: 'Select a square, then use the number pad or keys 1–9. Arrow keys move; Delete or Backspace clears the selected square.',
    pad: 'Number pad', notes: 'Notes', erase: 'Erase', check: 'Check entries', reset: 'Restart this puzzle',
    resetPrompt: 'Restart this puzzle? This will clear its entries and notes.',
    restart: 'Restart', cancel: 'Cancel', resetDone: 'Puzzle restarted.',
    ready: 'Each bold region, row and column must contain 1–9.',
    good: 'No incorrect entries so far.', solved: 'Puzzle solved!', given: 'given', empty: 'empty', incorrect: 'incorrect',
    progress: (n: number, total: number) => `${n} of ${total} empty squares filled`,
    wrong: (n: number) => `${n} incorrect ${n === 1 ? 'entry' : 'entries'} highlighted.`,
    cell: (r: number, c: number, g: number) => `Row ${r}, column ${c}, region ${g}`,
  },
  zh: {
    choose: '选择题目', names: ['台阶', '桥梁', '折线'],
    board: '不规则数独棋盘', instructions: '先选格子，再用屏幕数字键或键盘 1–9 填写。方向键移动；Delete 或 Backspace 清除所选格。',
    pad: '数字键', notes: '候选笔记', erase: '清除', check: '检查已填数字', reset: '重开此题',
    resetPrompt: '重开此题？这会清除当前题目的填写和笔记。',
    restart: '重开', cancel: '取消', resetDone: '本题已重开。',
    ready: '每行、每列和每个粗线宫都要填入 1–9。',
    good: '目前填写的数字均正确。', solved: '解题成功！', given: '题目给定', empty: '空格', incorrect: '填数错误',
    progress: (n: number, total: number) => `已填 ${n} / ${total} 个空格`,
    wrong: (n: number) => `已标出 ${n} 个错误填数。`,
    cell: (r: number, c: number, g: number) => `第 ${r} 行，第 ${c} 列，第 ${g} 宫`,
  },
};

export function JigsawGame({ locale }: { locale: 'en' | 'zh' }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const l = labels[locale];
  const puzzle = puzzles[puzzleIndex];
  return (
    <div className="space-y-4">
      <label className="flex flex-wrap items-center gap-3 font-medium">
        {l.choose}
        <select
          value={puzzleIndex}
          onChange={e => setPuzzleIndex(Number(e.currentTarget.value))}
          className="min-h-11 rounded-md border border-border bg-background px-3"
        >
          {puzzles.map(({ id }, i) => <option key={id} value={i}>{i + 1}. {l.names[i]}</option>)}
        </select>
      </label>
      <Board key={puzzle.id} puzzle={puzzle} l={l} />
    </div>
  );
}

function Board({ puzzle, l }: { puzzle: typeof puzzles[number]; l: typeof labels.en }) {
  const { id, regions, givens, solution } = puzzle;
  const [board, setBoard] = useState(() => restoreProgress(givens, null));
  const [selected, setSelected] = useState(() => givens.indexOf('0'));
  const [noteMode, setNoteMode] = useState(false);
  const [checked, setChecked] = useState(false);
  const [ready, setReady] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [restarted, setRestarted] = useState(false);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const resetButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const key = keyPrefix + id;

  useEffect(() => {
    try { setBoard(restoreProgress(givens, localStorage.getItem(key))); } catch { /* Still playable. */ }
    setReady(true);
  }, [givens, key]);

  useEffect(() => {
    if (resetting) cancelButton.current?.focus();
  }, [resetting]);

  const { values, notes } = board;
  const total = [...givens].filter(g => g === '0').length;
  const filled = values.filter((v, i) => v && givens[i] === '0').length;
  const done = isComplete(regions, values);
  const errors = new Set(checked ? values.flatMap((v, i) => v && v !== Number(solution[i]) ? [i] : []) : []);
  const editable = ready && givens[selected] === '0';

  function commit(next: typeof board) {
    setBoard(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Keep in-memory progress. */ }
  }

  function edit(digit: number) {
    if (!editable) return;
    const next = { values: [...values], notes: [...notes] };
    if (noteMode && digit) {
      if (values[selected]) return;
      const old = notes[selected];
      next.notes[selected] = old.includes(digit) ? old.filter(n => n !== digit) : [...old, digit].sort();
    } else {
      next.values[selected] = digit;
      next.notes[selected] = [];
    }
    setChecked(false);
    setRestarted(false);
    commit(next);
  }

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, i: number) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (/^[1-9]$/.test(event.key)) { event.preventDefault(); edit(Number(event.key)); return; }
    if (event.key === 'Delete' || event.key === 'Backspace' || event.key === '0') {
      event.preventDefault(); edit(0); return;
    }
    const row = Math.floor(i / 9);
    const col = i % 9;
    const next = event.key === 'ArrowLeft' ? row * 9 + Math.max(0, col - 1)
      : event.key === 'ArrowRight' ? row * 9 + Math.min(8, col + 1)
      : event.key === 'ArrowUp' ? Math.max(0, row - 1) * 9 + col
      : event.key === 'ArrowDown' ? Math.min(8, row + 1) * 9 + col : null;
    if (next !== null) { event.preventDefault(); cells.current[next]?.focus(); }
  }

  function closeReset(restart: boolean) {
    if (restart) {
      commit(restoreProgress(givens, null));
      setChecked(false);
      setNoteMode(false);
      setRestarted(true);
    }
    setResetting(false);
    resetButton.current?.focus();
  }

  return (
    <div className="max-w-lg space-y-3">
      <p id="jigsaw-input-help" className="text-sm text-muted-foreground">{l.instructions}</p>
      <div role="group" aria-label={l.board} aria-describedby="jigsaw-input-help" className="grid w-full grid-cols-9 overflow-hidden rounded border-2 border-slate-800 bg-slate-800">
        {values.map((v, i) => {
          const r = Math.floor(i / 9);
          const c = i % 9;
          const region = regions[i];
          const clue = givens[i] !== '0';
          const wrong = errors.has(i);
          const related = arePeers(regions, selected, i);
          const details = v ? String(v) : notes[i].join(', ') || l.empty;
          const label = `${l.cell(r + 1, c + 1, Number(region) + 1)}: ${details}${clue ? `, ${l.given}` : ''}${wrong ? `, ${l.incorrect}` : ''}`;
          return (
            <button
              key={i}
              ref={el => { cells.current[i] = el; }}
              type="button"
              tabIndex={i === selected ? 0 : -1}
              aria-label={label}
              aria-pressed={i === selected}
              onFocus={() => setSelected(i)}
              onClick={event => { setSelected(i); event.currentTarget.focus(); }}
              onKeyDown={event => handleKey(event, i)}
              className="relative flex aspect-square min-w-0 items-center justify-center text-base focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-sky-800 sm:text-xl"
              style={{
                backgroundColor: wrong ? '#fee2e2' : i === selected ? '#a8d7f4' : palette[Number(region)],
                color: wrong ? '#991b1b' : clue ? '#172033' : '#185279',
                fontWeight: clue ? 750 : 500,
                boxShadow: related ? 'inset 0 0 0 2px #33415523' : undefined,
                borderRight: c === 8 ? 0 : region === regions[i + 1] ? '1px solid #64748b55' : '2px solid #1e293b',
                borderBottom: r === 8 ? 0 : region === regions[i + 9] ? '1px solid #64748b55' : '2px solid #1e293b',
              }}
            >
              <span aria-hidden="true">{v || ''}</span>
              {!v && notes[i].length > 0 && (
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 items-center text-[8px] leading-none sm:text-[11px]">
                  {digits.map(d => <span key={d}>{notes[i].includes(d) ? d : ''}</span>)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div role="group" aria-label={l.pad} className="grid grid-cols-9 gap-1">
        {digits.map(d => <button type="button" className="min-h-11 min-w-0 rounded-md border border-border font-semibold hover:bg-muted disabled:opacity-50" key={d} onClick={() => edit(d)} disabled={!editable || (noteMode && !!values[selected])}>{d}</button>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={noteMode} className={control + (noteMode ? ' bg-primary text-primary-foreground hover:bg-primary/90' : '')} onClick={() => setNoteMode(!noteMode)}>{l.notes}</button>
        <button type="button" className={control} disabled={!editable} onClick={() => edit(0)}>{l.erase}</button>
        <button type="button" className={control} disabled={!ready || !filled} onClick={() => { setRestarted(false); setChecked(true); }}>{l.check}</button>
        <button ref={resetButton} type="button" className={control} disabled={!ready} aria-expanded={resetting} onClick={() => setResetting(!resetting)}>{l.reset}</button>
      </div>
      {resetting && <div className="rounded-md border border-border bg-muted/40 p-3" onKeyDown={e => { if (e.key === 'Escape') closeReset(false); }}>
        <p>{l.resetPrompt}</p>
        <div className="mt-2 flex gap-2">
          <button ref={cancelButton} type="button" className={control} onClick={() => closeReset(false)}>{l.cancel}</button>
          <button type="button" className={control} onClick={() => closeReset(true)}>{l.restart}</button>
        </div>
      </div>}
      <p role="status" className="min-h-6 text-sm font-medium">
        {done ? l.solved : restarted ? l.resetDone : checked ? errors.size ? l.wrong(errors.size) : l.good : l.ready}
      </p>
      <p className="text-sm text-muted-foreground">{l.progress(filled, total)}</p>
    </div>
  );
}
