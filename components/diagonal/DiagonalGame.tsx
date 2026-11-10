'use client';

import { useEffect, useState } from 'react';
import { VariantBoard, type BoardLabels } from '@/components/jigsaw/JigsawGame';
import { dailyPuzzleIndex, diagonalOf, diagonalPuzzles, isDiagonalPeer } from '@/lib/diagonal/puzzles';

const diagonalLabels = {
  en: ['', 'on the descending diagonal', 'on the ascending diagonal', 'on both diagonals'],
  zh: ['', '在左上至右下对角线', '在右上至左下对角线', '在两条对角线交点'],
} as const;

const labels: Record<'en' | 'zh', BoardLabels> = {
  en: {
    board: 'Diagonal Sudoku board',
    instructions: 'Choose a square, then use the number pad or keys 1–9. Arrow keys move; Delete or Backspace clears the selected square.',
    pad: 'Number pad', notes: 'Notes', erase: 'Erase', check: 'Check entries', reset: 'Restart this puzzle',
    resetPrompt: 'Restart this puzzle? This will clear its entries and notes.',
    restart: 'Restart', cancel: 'Cancel', resetDone: 'Puzzle restarted.',
    ready: 'Each row, column, 3×3 box and marked diagonal must contain 1–9.',
    good: 'No incorrect entries so far.', solved: 'Puzzle solved!', given: 'given', empty: 'empty', incorrect: 'incorrect',
    progress: (n, total) => `${n} of ${total} empty squares filled`,
    wrong: n => `${n} incorrect ${n === 1 ? 'entry' : 'entries'} highlighted.`,
    cell: (r, c, box) => `Row ${r}, column ${c}, box ${box}`,
  },
  zh: {
    board: '对角线数独棋盘',
    instructions: '先选格子，再用屏幕数字键或键盘 1–9 填写。方向键移动，Delete 或 Backspace 清除所选格。',
    pad: '数字键', notes: '候选笔记', erase: '清除', check: '检查已填数字', reset: '重开此题',
    resetPrompt: '重开此题？这会清除本题的填写和笔记。',
    restart: '重开', cancel: '取消', resetDone: '本题已重开。',
    ready: '每行、每列、每个 3×3 宫和两条标记的对角线都要填入 1–9。',
    good: '目前填写的数字均正确。', solved: '解题成功！', given: '题目给定', empty: '空格', incorrect: '填数错误',
    progress: (n, total) => `已填 ${n} / ${total} 个空格`,
    wrong: n => `已标出 ${n} 个错误填数。`,
    cell: (r, c, box) => `第 ${r} 行，第 ${c} 列，第 ${box} 宫`,
  },
};

export function DiagonalGame({ locale }: { locale: 'en' | 'zh' }) {
  const [selected, setSelected] = useState('daily');
  const [daily, setDaily] = useState<{ index: number; date: string } | null>(null);
  const zh = locale === 'zh';

  useEffect(() => {
    const now = new Date();
    setDaily({ index: dailyPuzzleIndex(now), date: now.toISOString().slice(0, 10) });
  }, []);

  const index = selected === 'daily' ? daily?.index ?? 0 : Number(selected);
  const puzzle = diagonalPuzzles[index];

  return (
    <div className="space-y-4">
      <label className="flex flex-wrap items-center gap-3 font-medium">
        {zh ? '选择题目' : 'Choose a puzzle'}
        <select
          value={selected}
          onChange={e => setSelected(e.currentTarget.value)}
          className="min-h-11 rounded-md border border-border bg-background px-3"
        >
          <option value="daily">{zh ? '今日轮换题（UTC）' : 'Daily pick (UTC)'}</option>
          {diagonalPuzzles.map(({ id }, i) => <option key={id} value={i}>{zh ? `练习 ${i + 1}` : `Practice ${i + 1}`}</option>)}
        </select>
      </label>
      {selected === 'daily' && daily && <p className="text-sm text-muted-foreground">
        {zh ? `${daily.date} UTC · 题目 ${index + 1} / ${diagonalPuzzles.length}`
          : `${daily.date} UTC · Puzzle ${index + 1} of ${diagonalPuzzles.length}`}
      </p>}
      <VariantBoard
        key={puzzle.id}
        puzzle={puzzle}
        l={labels[locale]}
        storagePrefix="samurai-diagonal-v1:"
        extraPeer={isDiagonalPeer}
        diagonal={{ at: diagonalOf, cellLabels: diagonalLabels[locale] }}
      />
    </div>
  );
}
