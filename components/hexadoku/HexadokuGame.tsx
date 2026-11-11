'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { trackInteraction } from '@/lib/analytics/events';
import {
  HEXADOKU_DIGITS, HEXADOKU_SIZE, hexadokuBox, hexadokuPuzzles,
  readHexadokuProgress, valueForHexadokuKey, type HexadokuPuzzle,
} from '@/lib/hexadoku/puzzles';

type Locale = 'en' | 'zh';
const copy = {
  en: {
    choose: 'Choose a puzzle', levels: ['Starter', 'Standard', 'Extended'],
    instructions: 'Select a cell, then tap the keypad. On a keyboard, use 1–9 and A–G for 10–16. Arrow keys move. Backspace or Delete clears a cell. Swipe inside the board on a narrow screen.',
    board: '16×16 Sudoku board', keypad: 'Number pad', fit: 'Fit full board', enlarge: 'Enlarge cells',
    next: 'Next puzzle', notes: 'Notes', erase: 'Erase', check: 'Check entries', reset: 'Restart this puzzle',
    confirm: 'Clear this puzzle’s numbers and notes?', yes: 'Restart', cancel: 'Cancel',
    given: 'given', empty: 'empty', incorrect: 'incorrect', solved: 'Puzzle solved!', restarted: 'Puzzle restarted.',
    selectedNotes: 'Notes in selected cell',
    allRight: 'No incorrect entries so far.', wrong: (n: number) => `${n} incorrect entries highlighted.`,
    filled: (n: number, total: number) => `${n} of ${total} empty cells filled`,
    cell: (r: number, c: number, b: number) => `Row ${r}, column ${c}, box ${b}`,
  },
  zh: {
    choose: '选择题目', levels: ['入门', '标准', '更多空格'],
    instructions: '先选格子，再用数字键。实体键盘可用 1–9，A–G 对应 10–16。方向键移动，退格或 Delete 清除。窄屏可在棋盘内滑动。',
    board: '16×16 数独棋盘', keypad: '屏幕数字键', fit: '缩放显示整盘', enlarge: '放大格子',
    next: '下一题', notes: '候选笔记', erase: '清除', check: '检查填数', reset: '重开本题',
    confirm: '清除本题的填数和笔记？', yes: '重开', cancel: '取消',
    given: '给定', empty: '空格', incorrect: '错误', solved: '解题成功！', restarted: '本题已重开。',
    selectedNotes: '所选格的候选数字',
    allRight: '目前没有错误填数。', wrong: (n: number) => `已标出 ${n} 个错误填数。`,
    filled: (n: number, total: number) => `已填 ${n} / ${total} 格`,
    cell: (r: number, c: number, b: number) => `第 ${r} 行，第 ${c} 列，第 ${b} 宫`,
  },
};

const buttonStyle = 'min-h-11 rounded-md border border-border bg-background px-3 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';
const levels = ['starter', 'standard', 'extended'];

export function HexadokuGame({ locale }: { locale: Locale }) {
  const [index, setIndex] = useState(0);
  const puzzle = hexadokuPuzzles[index];
  const l = copy[locale];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid gap-1 font-medium">
          {l.choose}
          <select className={buttonStyle} value={index} onChange={event => setIndex(Number(event.target.value))}>
            {hexadokuPuzzles.map((item, number) => (
              <option key={item.id} value={number}>
                {l.levels[levels.indexOf(item.level)]} {number % 2 + 1}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={buttonStyle} onClick={() => setIndex((index + 1) % hexadokuPuzzles.length)}>
          {l.next}
        </button>
      </div>
      <Board key={puzzle.id} puzzle={puzzle} locale={locale} />
    </div>
  );
}

function Board({ puzzle, locale }: { puzzle: HexadokuPuzzle; locale: Locale }) {
  const l = copy[locale];
  const storageKey = `samurai-16x16-v1:${puzzle.id}`;
  const [progress, setProgress] = useState(() => readHexadokuProgress(null, puzzle));
  const [selected, setSelected] = useState(() => puzzle.givens.indexOf(0));
  const [noteMode, setNoteMode] = useState(false);
  const [fit, setFit] = useState(false);
  const [checked, setChecked] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [ready, setReady] = useState(false);
  const started = useRef(false);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const resetButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const { entries, notes } = progress;
  const filled = entries.filter(Boolean).length;
  const wrong = entries.filter((value, index) => value && value !== puzzle.solution[index]).length;
  const solved = filled === puzzle.blanks && wrong === 0;
  const selectedNotes = HEXADOKU_DIGITS.filter(value => notes[selected] & (1 << (value - 1)));

  useEffect(() => {
    try {
      const saved = readHexadokuProgress(window.localStorage.getItem(storageKey), puzzle);
      started.current = saved.entries.some(Boolean) || saved.notes.some(Boolean);
      setProgress(saved);
    } catch {
      // Private browsing and storage policy may disable local saves.
    }
    setReady(true);
  }, [puzzle, storageKey]);

  useEffect(() => {
    if (confirming) cancelButton.current?.focus();
  }, [confirming]);

  function closeReset() {
    setConfirming(false);
    resetButton.current?.focus();
  }

  function record(action: 'start' | 'complete' | 'check') {
    try {
      trackInteraction(`hexadoku_${action}`, { locale, difficulty: puzzle.level });
    } catch {
      // A telemetry failure must never prevent play.
    }
  }

  function save(next: typeof progress) {
    setProgress(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // In-memory play still works when storage is unavailable.
    }
  }

  function enter(value: number) {
    if (!ready || puzzle.givens[selected] || solved) return;
    if (noteMode && value > 0 && entries[selected]) return;
    const next = { entries: [...entries], notes: [...notes] };
    if (noteMode && value > 0) {
      next.notes[selected] ^= 1 << (value - 1);
    } else {
      next.entries[selected] = value;
      next.notes[selected] = 0;
    }
    if (value && !started.current) {
      started.current = true;
      record('start');
    }
    setChecked(false);
    setAnnouncement('');
    save(next);
    if (next.entries.every((entry, index) => (puzzle.givens[index] || entry) === puzzle.solution[index])) record('complete');
  }

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const row = Math.floor(index / HEXADOKU_SIZE);
    const column = index % HEXADOKU_SIZE;
    const movement: Record<string, number> = {
      ArrowLeft: column > 0 ? -1 : 0, ArrowRight: column < 15 ? 1 : 0,
      ArrowUp: row > 0 ? -16 : 0, ArrowDown: row < 15 ? 16 : 0,
    };
    if (event.key in movement) {
      event.preventDefault();
      cells.current[index + movement[event.key]]?.focus();
      return;
    }
    const value = valueForHexadokuKey(event.key);
    if (value >= 1 || event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      enter(value >= 1 ? value : 0);
    }
  }

  return (
    <div className="space-y-3">
      <p id="hexadoku-instructions" className="text-sm leading-6 text-muted-foreground">{l.instructions}</p>
      <button type="button" className={buttonStyle} aria-pressed={fit} onClick={() => setFit(!fit)}>
        {fit ? l.enlarge : l.fit}
      </button>
      <div className="max-w-full overflow-x-auto rounded border border-foreground" data-hexadoku-scroll>
        <div role="grid" aria-label={l.board} aria-describedby="hexadoku-instructions"
          className={fit ? 'min-w-0' : 'min-w-[44rem]'}>
          {HEXADOKU_DIGITS.map((_, row) => (
            <div key={row} role="row" className="grid grid-cols-[repeat(16,minmax(0,1fr))]">
              {HEXADOKU_DIGITS.map((_, column) => {
                const index = row * HEXADOKU_SIZE + column;
                const given = puzzle.givens[index];
                const value = given || entries[index];
                const incorrect = checked && value > 0 && value !== puzzle.solution[index];
                const related = row === Math.floor(selected / HEXADOKU_SIZE) || column === selected % HEXADOKU_SIZE;
                const candidates = HEXADOKU_DIGITS.filter(digit => notes[index] & (1 << (digit - 1)));
                const position = l.cell(row + 1, column + 1, hexadokuBox(index) + 1);
                const label = [position, value || l.empty, given ? l.given : '', incorrect ? l.incorrect : '', candidates.join(' ')]
                  .filter(Boolean).join(', ');
                return (
                  <div key={index} role="gridcell" aria-selected={selected === index} aria-readonly={given > 0 || solved}
                    className={`aspect-square min-w-0 border-b border-r ${row % 4 === 3 ? 'border-b-2 border-b-foreground/75' : 'border-b-border'} ${column % 4 === 3 ? 'border-r-2 border-r-foreground/75' : 'border-r-border'}`}>
                    <button type="button" data-hexadoku-cell={index} aria-label={label}
                      aria-disabled={given > 0 || solved} tabIndex={selected === index ? 0 : -1}
                      ref={element => { cells.current[index] = element; }}
                      onFocus={() => setSelected(index)} onClick={event => { setSelected(index); event.currentTarget.focus(); }}
                      onKeyDown={event => handleKey(event, index)}
                      className={`relative grid h-full w-full place-items-center leading-none outline-offset-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${fit ? 'text-[0.57rem] sm:text-base' : 'text-base'} ${selected === index ? 'bg-primary text-primary-foreground' : incorrect ? 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100' : given ? 'bg-secondary font-bold' : related ? 'bg-primary/10 text-primary' : 'bg-background text-primary'} ${incorrect ? 'ring-2 ring-inset ring-red-500' : ''}`}>
                      {value || (candidates.length > 0 && (
                        <span aria-hidden="true" className={`pointer-events-none absolute inset-px grid grid-cols-4 grid-rows-4 overflow-hidden ${fit ? 'text-[0.35rem]' : 'text-[0.5rem]'}`}>
                          {HEXADOKU_DIGITS.map(digit => (
                            <span key={digit} className="grid min-h-0 min-w-0 place-items-center">
                              {candidates.includes(digit) ? (fit ? '·' : digit) : ''}
                            </span>
                          ))}
                        </span>
                      ))}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {selectedNotes.length > 0 && <p className="text-sm">{l.selectedNotes} · {selectedNotes.join(', ')}</p>}
      <div role="group" aria-label={l.keypad} className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
        {HEXADOKU_DIGITS.map(value => (
          <button key={value} type="button" className={buttonStyle} disabled={!ready || solved}
            onClick={() => enter(value)}>{value}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${buttonStyle} aria-pressed:bg-primary aria-pressed:text-primary-foreground`}
          aria-pressed={noteMode} onClick={() => setNoteMode(!noteMode)}>{l.notes}</button>
        <button type="button" className={buttonStyle} onClick={() => enter(0)}>{l.erase}</button>
        <button type="button" className={buttonStyle} onClick={() => { setChecked(true); setAnnouncement(''); record('check'); }}>{l.check}</button>
        <button ref={resetButton} type="button" className={buttonStyle} onClick={() => setConfirming(true)}>{l.reset}</button>
      </div>
      {confirming && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={l.confirm}>
          <p>{l.confirm}</p>
          <button type="button" className={buttonStyle} onClick={() => {
            save(readHexadokuProgress(null, puzzle));
            closeReset(); setChecked(false); setNoteMode(false); setAnnouncement(l.restarted);
            setSelected(puzzle.givens.indexOf(0)); started.current = false;
          }}>{l.yes}</button>
          <button ref={cancelButton} type="button" className={buttonStyle} onClick={closeReset}>{l.cancel}</button>
        </div>
      )}
      <p role="status" className="min-h-6 text-sm font-medium">
        {solved ? l.solved : checked ? (wrong ? l.wrong(wrong) : l.allRight) : announcement || l.filled(filled, puzzle.blanks)}
      </p>
    </div>
  );
}
