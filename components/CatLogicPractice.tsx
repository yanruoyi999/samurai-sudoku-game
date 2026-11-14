'use client';

import { useState } from 'react';
import { trackInteraction } from '@/lib/analytics/events';
import { canPlaceCat, catRegions } from '@/lib/cat-logic';

const colors = ['bg-amber-100', 'bg-sky-100', 'bg-emerald-100', 'bg-violet-100'];
const regions = ['A', 'B', 'C', 'D'];

export function CatLogicPractice({ locale }: { locale: 'zh' | 'en' }) {
  const zh = locale === 'zh';
  const [cats, setCats] = useState<number[]>([]);
  const [conflict, setConflict] = useState(false);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  function toggle(cell: number) {
    if (!started) {
      trackInteraction('cat_logic_started', { locale });
      setStarted(true);
    }
    if (cats.includes(cell)) {
      setCats(cats.filter(other => other !== cell));
      setConflict(false);
    } else if (canPlaceCat(cats, cell)) {
      setCats([...cats, cell]);
      setConflict(false);
      if (cats.length === 3 && !completed) {
        trackInteraction('cat_logic_completed', { locale });
        setCompleted(true);
      }
    } else {
      setConflict(true);
    }
  }

  return <div className="space-y-4">
    <p>{zh ? '点击格子放猫，再点一次移除。字母 A–D 表示不同区域。' : 'Select a square to place a cat, and select it again to remove it. Letters A–D identify the regions.'}</p>
    <div className="grid max-w-xs grid-cols-4 gap-1" role="group" aria-label={zh ? '四乘四练习盘' : 'Four by four practice board'}>
      {catRegions.map((region, cell) => {
        const row = Math.floor(cell / 4) + 1;
        const col = cell % 4 + 1;
        const occupied = cats.includes(cell);
        return <button key={cell} type="button" className={`min-h-12 rounded border border-slate-500 px-1 font-semibold text-slate-900 ${colors[region]}`}
          aria-label={zh ? `第 ${row} 行第 ${col} 列，区域 ${regions[region]}` : `Row ${row} column ${col}, region ${regions[region]}`}
          aria-pressed={occupied} onClick={() => toggle(cell)}>{occupied ? <span aria-hidden="true">🐈</span> : regions[region]}</button>;
      })}
    </div>
    <p role="status">{conflict
      ? zh ? '此处与现有猫冲突，检查行、列、区域及相邻格。' : 'That square conflicts with an existing cat. Check the row, column, region and touching squares.'
      : cats.length === 4 ? zh ? '完成！四只猫均满足规则。' : 'Solved! All four cats follow the rules.' : `${cats.length}/4 ${zh ? '只猫' : 'cats placed'}`}</p>
    <button type="button" className="min-h-11 rounded border px-4" onClick={() => { setCats([]); setConflict(false); setStarted(false); setCompleted(false); }}>{zh ? '重新开始' : 'Reset puzzle'}</button>
  </div>;
}
