'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n';
import { trackInteraction } from '@/lib/analytics/events';
import { puzzles } from '@/lib/shingoki/board';
import { gradeFirstReason, initialProgress, readProgress, reasons, startSecond, submitLoop, submitReason, toggleEdge, type Progress } from '@/lib/shingoki/lesson';
import type { QaSource } from '@/lib/shingoki/traffic';
import { ShingokiBoard } from './ShingokiBoard';

const copy = {
  en: {
    first: 'Puzzle 1 of 2 · Find a forced edge',
    second: 'Puzzle 2 of 2 · Solve on your own',
    choose: 'Select one edge touching B1 that the loop must use. Then choose your reason.',
    why: 'Why must the loop use this edge?',
    turn: 'The loop must turn at every numbered circle.',
    top: 'A white circle on the top border must connect left and right.',
    all: 'The loop must pass through every dot.',
    submitReason: 'Check my reasoning', right: 'Correct edge and reason.',
    review: 'Look again at B1.',
    explain: 'B1 is a white circle on the top border. The loop must go straight there, so both A1–B1 and B1–C1 are required.',
    draw: 'Now draw the rest of the loop. You can change your first edge.',
    independent: 'Use the four new clues to draw the whole loop. Submit it when you are ready.',
    controls: 'Tap a dashed edge to draw a solid line. Tap it again to erase. On a keyboard, use Tab to reach an edge and Space or Enter to toggle it.',
    check: 'Check my loop', retry: 'This loop does not satisfy all the rules yet. You can edit it and check again.',
    solved: 'Your loop passes through all four circles and satisfies every clue.',
    next: 'Start puzzle 2', done: 'Both puzzles complete. You solved the second loop without hints.',
  },
  zh: {
    first: '第 1 题，共 2 题 · 找出一条必走边',
    second: '第 2 题，共 2 题 · 独立画出闭环',
    choose: '请在棋盘上选一条与 B1 相连的必走边，再选出理由。',
    why: '为什么一定经过这条边？',
    turn: '回路必须在每个带数字的圈转弯。',
    top: '顶边的白圈必须左右直行。',
    all: '回路必须经过所有点。',
    submitReason: '检查我的推理', right: '必走边和理由都选对了。',
    review: '再看一下 B1。',
    explain: 'B1 是顶边的白圈，回路在这里必须直行。因此 A1–B1 和 B1–C1 两条边都要画。',
    draw: '现在请补全整个闭环，也可以修改首答时画的边。',
    independent: '根据这四个新线索独立画出整个闭环，画好后再提交。',
    controls: '轻点虚线边画出实线，再点一次擦除。键盘可用 Tab 选中一条边，再按空格或回车切换。',
    check: '检查我的闭环', retry: '这次画出的边还没满足全部规则。可以修改后再检查。',
    solved: '闭环经过了全部四个圈，也满足每个圈的线索。',
    next: '开始第二题', done: '两题都完成了。你无提示解出了第二个闭环。',
  },
};

const action = 'min-h-11 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50';

export function ShingokiLesson({ locale, qa }: { locale: Locale; qa: QaSource }) {
  const c = copy[locale];
  const storageKey = 'samurai-shingoki-v1:' + locale + ':' + qa;
  const [progress, setProgress] = useState(initialProgress);
  const current = useRef(progress);
  const [ready, setReady] = useState(false);
  const [wrong, setWrong] = useState(false);
  const nextFocus = useRef(false);
  const section = useRef<HTMLElement>(null);
  const { stage } = progress;
  const level = stage === 'second' || stage === 'done' ? 2 : 1;
  const finished = stage === 'firstDone' || stage === 'done';

  useEffect(() => {
    function restore() {
      try {
        const saved = readProgress(sessionStorage.getItem(storageKey));
        current.current = saved;
        setProgress(saved);
      } catch { /* The puzzle also works without browser storage. */ }
      setReady(true);
    }
    restore();
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, [storageKey]);

  useEffect(() => {
    if (nextFocus.current) {
      section.current?.querySelector<HTMLElement>('[data-stage-focus]')?.focus();
      nextFocus.current = false;
    }
  }, [stage]);

  function update(next: Progress) {
    const last = current.current;
    if (next === last) return;
    current.current = next;
    setProgress(next);
    setWrong(false);
    try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
    const properties = { locale, qa_source: qa, puzzle_number: level };
    try {
      if (!last.started && next.started) trackInteraction('shingoki_start', { ...properties, outcome: 'first_start' });
      if (last.stage === next.stage) return;
      nextFocus.current = true;
      switch (next.stage) {
        case 'first':
          trackInteraction('shingoki_reason_submit', {
            ...properties, ...gradeFirstReason(next.firstEdge, next.reason),
          });
          break;
        case 'second':
          trackInteraction('shingoki_start', { ...properties, puzzle_number: 2, outcome: 'second_start' });
          break;
        case 'firstDone':
        case 'done':
          trackInteraction('shingoki_complete', {
            ...properties, without_hints: next.stage === 'done',
            outcome: next.stage === 'done' ? 'second_complete_without_hints' : 'first_complete',
          });
          break;
      }
    } catch { /* A telemetry failure must allow the lesson to continue. */ }
  }

  function check() {
    const last = current.current;
    if (last.stage !== 'first' && last.stage !== 'second') return;
    const next = submitLoop(last);
    if (next === last) setWrong(true);
    else update(next);
  }

  return <section ref={section} aria-labelledby="shingoki-lesson" className="space-y-4 rounded-xl border border-border bg-card p-3 sm:p-6">
    <h2 id="shingoki-lesson" data-stage-focus={stage === 'second' ? true : undefined} tabIndex={-1}
      className="text-xl font-semibold">{level === 1 ? c.first : c.second}</h2>
    {stage === 'reason' && <p>{c.choose}</p>}
    {stage === 'first' && <p data-stage-focus tabIndex={-1} role="status">
      <strong>{gradeFirstReason(progress.firstEdge, progress.reason).correct ? c.right : c.review}</strong> {c.explain} {c.draw}
    </p>}
    {stage === 'second' && <p>{c.independent}</p>}
    {!finished && <p className="text-sm text-muted-foreground">{c.controls}</p>}
    <ShingokiBoard clues={puzzles[level - 1]} selected={progress.edges} locale={locale}
      disabled={!ready || finished} onSelect={id => update(toggleEdge(current.current, id))} />
    {stage === 'reason' && <>
      <fieldset disabled={!ready} className="space-y-1">
        <legend className="font-semibold">{c.why}</legend>
        {reasons.map(reason => <label key={reason} className="flex min-h-11 items-center gap-3">
          <input type="radio" name="shingoki-reason" checked={progress.reason === reason}
            onChange={() => update({ ...current.current, started: true, reason })} />
          {c[reason]}
        </label>)}
      </fieldset>
      <button type="button" className={action} disabled={!ready || !progress.reason || !progress.edges.length}
        onClick={() => update(submitReason(current.current))}>{c.submitReason}</button>
    </>}
    {(stage === 'first' || stage === 'second') && <>
      <button type="button" className={action} disabled={!ready || !progress.edges.length} onClick={check}>{c.check}</button>
      <p role="status">{wrong ? c.retry : ''}</p>
    </>}
    {finished && <p data-stage-focus tabIndex={-1} role="status" className="font-medium">{stage === 'done' ? c.done : c.solved}</p>}
    {stage === 'firstDone' && <button type="button" className={action} onClick={() => update(startSecond(current.current))}>{c.next}</button>}
  </section>;
}
