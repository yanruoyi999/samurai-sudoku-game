'use client';

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { trackInteraction } from '@/lib/analytics/events';
import { STANDARD_SUDOKU_PUZZLES } from '@/lib/standard-sudoku/puzzles';
import { parseSudoku, sudokuDigits, type SudokuResult, type SudokuStep } from '@/lib/sudoku-step-solver/solve';

type Locale = 'en' | 'zh';
type State = SudokuResult | { status: 'idle' | 'running' | 'error' };

const blank = Array<number>(81).fill(0);
const example = STANDARD_SUDOKU_PUZZLES[0].grid.flat();
const button = 'min-h-11 rounded-md border border-border bg-background px-3 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50';

const text = {
  en: {
    board: 'Sudoku input grid', pad: 'Number pad', empty: 'empty', conflict: 'duplicate',
    instructions: 'Select a square and type a digit or tap the keypad. Digits advance to the next square. Use arrow keys to move, 0 or a dot for a blank, and Backspace or Delete to erase.',
    paste: 'Paste an 81-character puzzle', pasteHelp: 'Use 0 or a dot for blanks. Spaces and line breaks are fine.', load: 'Load pasted grid',
    pasteError: 'Enter exactly 81 digits or dots. Whitespace is allowed.',
    loaded: 'Grid loaded.', sample: 'Load example', cleared: 'Grid cleared.', clear: 'Clear grid', erase: 'Erase',
    solve: 'Solve Sudoku', running: 'Searching for solutions…', cancel: 'Cancel search', canceled: 'Search canceled.',
    none: 'No solution. The clues conflict even though no digit repeats in a row, column or box.',
    multiple: 'This puzzle has multiple solutions. Add more clues to get a unique answer.',
    invalid: 'This grid must contain 81 values, using 1–9 or blanks.',
    limit: 'The search reached its limit. The number of solutions is still undetermined.',
    error: 'The browser could not run the solver. Try again or reload the page.',
    unique: 'One unique solution found.',
    duplicates: 'Correct the highlighted duplicates before solving.',
    duplicate: (digit: number, unit: string, cells: string) => `${digit} repeats in ${unit} at ${cells}.`,
    cell: (r: number, c: number) => `R${r}C${c}`,
    unit: (kind: number, n: number) => `${['row', 'column', 'box'][kind]} ${n}`,
    logical: 'Logical steps', preview: 'Grid after the current logical step', prev: 'Previous step', next: 'Next step',
    step: (n: number, total: number) => `Step ${n} of ${total}`,
    complete: 'The supported techniques complete this puzzle.',
    finished: 'This input grid is already complete.',
    stalled: 'The supported techniques cannot continue after the last listed step. The separate exact solution is available below.',
    naked: (cell: string, n: number) => `Naked single. Only ${n} remains for ${cell} after row, column and box restrictions and any earlier candidate eliminations.`,
    hidden: (cell: string, n: number, unit: string) => `Hidden single. ${n} can only go in ${cell} within ${unit}.`,
    locked: (digit: number, source: string, target: string, anchors: string, removed: string) =>
      `Locked candidate. In ${source}, ${digit} can only go at ${anchors}, all in ${target}. Remove ${digit} from the other candidates in ${target} at ${removed}.`,
    exact: 'Show exact final solution', exactNote: 'The search verified this unique answer. The grid below includes any cells beyond the logical steps.',
  },
  zh: {
    board: '数独输入棋盘', pad: '屏幕数字键', empty: '空格', conflict: '数字重复',
    instructions: '选中格子后输入数字或点屏幕数字键。填数后自动前进。方向键移动，0 或句点表示空格，退格或 Delete 清除。',
    paste: '粘贴 81 字符题目', pasteHelp: '空格用 0 或英文句点表示，可以带空白或换行。', load: '载入粘贴题目',
    pasteError: '请输入恰好 81 个数字或英文句点。可以带空白或换行。',
    loaded: '题目已载入。', sample: '载入示例', cleared: '棋盘已清空。', clear: '清空棋盘', erase: '清除所选格',
    solve: '求解数独', running: '正在搜索解…', cancel: '取消搜索', canceled: '已取消搜索。',
    none: '无解。虽然行、列、宫中没有重复数字，给定数字仍无法同时满足所有规则。',
    multiple: '这道题有多个解。补充给定数字后再试，才能确定唯一解。',
    invalid: '棋盘须有 81 个格，填写 1–9 或留空。',
    limit: '搜索已达到上限，解的数量仍未确定。',
    error: '浏览器未能运行求解器，请重试或刷新页面。',
    unique: '已找到唯一解。',
    duplicates: '请先修正标出的重复数字。',
    duplicate: (digit: number, unit: string, cells: string) => `${unit}的 ${cells} 重复填写了 ${digit}。`,
    cell: (r: number, c: number) => `第${r}行第${c}列`,
    unit: (kind: number, n: number) => `第 ${n} ${['行', '列', '宫'][kind]}`,
    logical: '逻辑步骤', preview: '当前逻辑步骤后的棋盘', prev: '上一步', next: '下一步',
    step: (n: number, total: number) => `第 ${n} / ${total} 步`,
    complete: '本页支持的技巧已解完这道题。',
    finished: '输入的棋盘已经完整。',
    stalled: '列表最后一步之后，本页支持的技巧无法继续。下方可单独查看唯一解。',
    naked: (cell: string, n: number) => `显性单数。根据行、列、宫及前面步骤的排除，${cell}只剩候选 ${n}。`,
    hidden: (cell: string, n: number, unit: string) => `隐性单数。${unit}只有${cell}还能填 ${n}。`,
    locked: (digit: number, source: string, target: string, anchors: string, removed: string) =>
      `区块排除。${source}的 ${digit} 只能落在 ${anchors}，这些格都在${target}。因此可从${target}的 ${removed} 删除候选 ${digit}。`,
    exact: '查看搜索得到的完整解', exactNote: '搜索已验证下方答案唯一，也补齐了逻辑步骤可能尚未填出的格子。',
  },
};

function cellBorders(index: number) {
  return `${index % 9 === 2 || index % 9 === 5 ? 'border-r-2 border-r-slate-700' : 'border-r border-r-border'} ${Math.floor(index / 9) % 3 === 2 && index < 72 ? 'border-b-2 border-b-slate-700' : 'border-b border-b-border'}`;
}

export function StepSolver({ locale }: { locale: Locale }) {
  const l = text[locale];
  const [input, setInput] = useState(blank);
  const [selected, setSelected] = useState(0);
  const [paste, setPaste] = useState('');
  const [pasteError, setPasteError] = useState(false);
  const [state, setState] = useState<State>({ status: 'idle' });
  const [notice, setNotice] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const worker = useRef<Worker | null>(null);

  useEffect(() => () => worker.current?.terminate(), []);

  function stop() {
    worker.current?.terminate();
    worker.current = null;
  }

  function load(next: number[], message = '') {
    stop();
    setInput(next);
    setState({ status: 'idle' });
    setNotice(message);
    setPasteError(false);
  }

  function pasteGrid(raw: string) {
    const grid = parseSudoku(raw);
    if (!grid) {
      setPasteError(true);
      return;
    }
    load(grid, l.loaded);
    setSelected(0);
    setPaste('');
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    pasteGrid(event.clipboardData.getData('text'));
  }

  function focus(index: number, preventScroll = false) {
    setSelected(index);
    cells.current[index]?.focus({ preventScroll });
  }

  function enter(value: number, index: number, advance: boolean) {
    const next = [...input];
    next[index] = value;
    load(next);
    if (advance) focus(Math.min(80, index + 1), true);
  }

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (/^[0-9.]$/.test(event.key)) {
      event.preventDefault();
      enter(event.key === '.' ? 0 : Number(event.key), index, true);
      return;
    }
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      enter(0, index, false);
      return;
    }
    const r = Math.floor(index / 9);
    const c = index % 9;
    const next = event.key === 'ArrowLeft' ? index - Number(c > 0)
      : event.key === 'ArrowRight' ? index + Number(c < 8)
      : event.key === 'ArrowUp' ? index - (r > 0 ? 9 : 0)
      : event.key === 'ArrowDown' ? index + (r < 8 ? 9 : 0) : null;
    if (next !== null) {
      event.preventDefault();
      focus(next);
    }
  }

  function record(action: 'start' | 'finish', outcome?: SudokuResult['status'] | 'error' | 'canceled') {
    try {
      trackInteraction(`sudoku_solver_${action}`, { locale, outcome });
    } catch { /* Telemetry must not interrupt the solver. */ }
  }

  function solve() {
    stop();
    setNotice('');
    setStepIndex(0);
    setState({ status: 'running' });
    record('start');
    try {
      const active = new Worker(new URL('../../lib/sudoku-step-solver/worker.ts', import.meta.url));
      worker.current = active;
      active.onmessage = (event: MessageEvent<SudokuResult>) => {
        if (worker.current !== active) return;
        stop();
        setState(event.data);
        record('finish', event.data.status);
      };
      active.onerror = () => {
        if (worker.current !== active) return;
        stop();
        setState({ status: 'error' });
        record('finish', 'error');
      };
      active.postMessage(input);
    } catch {
      stop();
      setState({ status: 'error' });
      record('finish', 'error');
    }
  }

  const conflicts = state.status === 'conflict' ? state.conflicts : [];
  const conflictingCells = new Set(conflicts.flatMap(item => item.cells));
  const position = (cell: number) => l.cell(Math.floor(cell / 9) + 1, cell % 9 + 1);
  const unitName = (unit: number) => l.unit(Math.floor(unit / 9), unit % 9 + 1);
  const positions = (list: number[]) => list.map(position).join(locale === 'zh' ? '、' : ', ');
  function reason(step: SudokuStep) {
    if (step.type === 'naked-single') return l.naked(position(step.cell), step.digit);
    if (step.type === 'hidden-single') return l.hidden(position(step.cell), step.digit, unitName(step.unit));
    return l.locked(step.digit, unitName(step.source), unitName(step.target), positions(step.anchors), positions(step.removed));
  }

  const result = state.status === 'unique' ? state : null;
  const step = result?.steps[stepIndex];
  const preview = [...input];
  for (const move of result?.steps.slice(0, stepIndex + 1) ?? []) {
    if (move.type !== 'locked-candidate') preview[move.cell] = move.digit;
  }
  const feedback = state.status === 'idle' ? notice : state.status === 'conflict' ? l.duplicates : l[state.status];

  return (
    <div data-clarity-mask="True" className="max-w-lg space-y-4">
      <p id="solver-input-help" className="text-sm leading-6 text-muted-foreground">{l.instructions}</p>
      <div role="group" aria-label={l.board} aria-describedby="solver-input-help" onPaste={handlePaste}
        className="grid w-full grid-cols-9 overflow-hidden rounded border-2 border-slate-700">
        {input.map((digit, index) => (
          <button key={index} ref={el => { cells.current[index] = el; }} type="button" data-solver-cell={index}
            aria-label={`${position(index)}, ${digit || l.empty}${conflictingCells.has(index) ? `, ${l.conflict}` : ''}`}
            aria-pressed={selected === index} tabIndex={selected === index ? 0 : -1}
            onFocus={() => setSelected(index)} onClick={() => focus(index)}
            onKeyDown={event => handleKey(event, index)}
            className={`aspect-square min-w-0 font-semibold focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 ${cellBorders(index)} ${conflictingCells.has(index) ? 'bg-red-200 text-red-950' : selected === index ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
            <span aria-hidden="true">{digit || ''}</span>
          </button>
        ))}
      </div>
      <div role="group" aria-label={l.pad} className="grid grid-cols-5 gap-1 sm:grid-cols-9">
        {sudokuDigits.map(digit => <button key={digit} type="button" className={button} onClick={() => enter(digit, selected, true)}>{digit}</button>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" data-solver-action="solve" className={`${button} bg-primary text-primary-foreground`} disabled={state.status === 'running'} onClick={solve}>{l.solve}</button>
        <button type="button" className={button} onClick={() => enter(0, selected, false)}>{l.erase}</button>
        <button type="button" className={button} onClick={() => { load(example, l.loaded); setSelected(0); }}>{l.sample}</button>
        <button type="button" className={button} onClick={() => { load(blank, l.cleared); setSelected(0); }}>{l.clear}</button>
        {state.status === 'running' && <button type="button" className={button} onClick={() => { stop(); setState({ status: 'idle' }); setNotice(l.canceled); record('finish', 'canceled'); }}>{l.cancel}</button>}
      </div>
      <div className="space-y-2">
        <label htmlFor="solver-paste" className="block font-medium">{l.paste}</label>
        <p id="solver-paste-help" className="text-sm text-muted-foreground">{l.pasteHelp}</p>
        <textarea id="solver-paste" data-solver-paste rows={2} value={paste}
          aria-describedby="solver-paste-help" aria-invalid={pasteError}
          className="block w-full min-w-0 rounded-md border border-border bg-background p-2 font-mono"
          onChange={event => { setPaste(event.target.value); setPasteError(false); }} />
        <button type="button" className={button} onClick={() => pasteGrid(paste)}>{l.load}</button>
        {pasteError && <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">{l.pasteError}</p>}
      </div>
      <p role="status" className="min-h-6 font-medium">{feedback}</p>
      {conflicts.length > 0 && <ul className="list-disc space-y-1 pl-5 text-sm">
        {conflicts.map(item => <li key={`${item.unit}-${item.digit}`}>{l.duplicate(item.digit, unitName(item.unit), positions(item.cells))}</li>)}
      </ul>}
      {result && <section aria-label={l.logical} className="space-y-3">
        <h3 className="text-lg font-semibold">{l.logical}</h3>
        {step && <>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={button} disabled={stepIndex === 0} onClick={() => setStepIndex(stepIndex - 1)}>{l.prev}</button>
            <span>{l.step(stepIndex + 1, result.steps.length)}</span>
            <button type="button" className={button} disabled={stepIndex + 1 === result.steps.length} onClick={() => setStepIndex(stepIndex + 1)}>{l.next}</button>
          </div>
          <p aria-live="polite" className="leading-7">{reason(step)}</p>
          <div role="group" aria-label={l.preview} className="grid max-w-xs grid-cols-9 overflow-hidden rounded border-2 border-slate-700">
            {preview.map((digit, index) => {
              const focusCell = step.type === 'locked-candidate' ? step.anchors.includes(index) : index === step.cell;
              const removed = step.type === 'locked-candidate' && step.removed.includes(index);
              return <span aria-hidden="true" key={index} className={`grid aspect-square min-w-0 place-items-center text-sm ${cellBorders(index)} ${focusCell ? 'bg-primary font-bold text-primary-foreground' : removed ? 'bg-red-200 text-red-950' : input[index] ? 'bg-muted font-bold' : 'bg-background'}`}>{removed ? '×' : digit || ''}</span>;
            })}
          </div>
        </>}
        <p className="text-sm text-muted-foreground">{result.logicComplete ? step ? l.complete : l.finished : l.stalled}</p>
        <details className="space-y-2 rounded-md border border-border p-3">
          <summary className="cursor-pointer font-semibold">{l.exact}</summary>
          <p className="text-sm text-muted-foreground">{l.exactNote}</p>
          <pre className="overflow-auto font-mono text-sm leading-relaxed">{Array.from({ length: 9 }, (_, row) => result.solution.slice(row * 9, row * 9 + 9).join(' ')).join('\n')}</pre>
        </details>
      </section>}
    </div>
  );
}
