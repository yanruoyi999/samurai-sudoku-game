'use client';

import { useState } from 'react';
import { VariantBoard, type BoardLabels } from '@/components/jigsaw/JigsawGame';
import { trackInteraction } from '@/lib/analytics/events';
import { killerPuzzles, matchesKillerCages } from '@/lib/killer-sudoku/puzzles';

type Locale = 'en' | 'zh';

const labels: Record<Locale, BoardLabels> = {
  en: {
    board: 'Killer Sudoku board',
    instructions: 'Select a cell, then use the keypad or keys 1–9. Arrow keys move, and Backspace or Delete clears the cell.',
    pad: 'Number pad', notes: 'Notes', erase: 'Erase', check: 'Check entries', reset: 'Restart this puzzle',
    resetPrompt: 'Clear the entries and notes for this puzzle?',
    restart: 'Restart', cancel: 'Cancel', resetDone: 'Puzzle restarted.',
    ready: 'Use each digit once per row, column and box. Digits in each dashed cage are distinct and add up to its label.',
    good: 'No incorrect entries so far.', solved: 'Puzzle solved!', given: 'given', empty: 'empty', incorrect: 'incorrect',
    progress: (filled, total) => `${filled} of ${total} cells filled`,
    wrong: count => `${count} incorrect ${count === 1 ? 'entry' : 'entries'} highlighted.`,
    cell: (row, column, box) => `Row ${row}, column ${column}, box ${box}`,
  },
  zh: {
    board: '杀手数独棋盘',
    instructions: '先选格子，再按屏幕数字键或键盘 1–9。用方向键移动，用退格或 Delete 清除。',
    pad: '屏幕数字键', notes: '候选笔记', erase: '清除', check: '检查填数', reset: '重开本题',
    resetPrompt: '清除本题的填数和笔记？',
    restart: '重开', cancel: '取消', resetDone: '本题已重开。',
    ready: '每行、每列和每宫各用一次 1–9。虚线笼内的数字不重复，且加起来等于标注的和值。',
    good: '目前没有错误填数。', solved: '解题成功！', given: '给定', empty: '空格', incorrect: '错误',
    progress: (filled, total) => `已填 ${filled} / ${total} 格`,
    wrong: count => `已标出 ${count} 个错误填数。`,
    cell: (row, column, box) => `第 ${row} 行，第 ${column} 列，第 ${box} 宫`,
  },
};

export function KillerGame({ locale }: { locale: Locale }) {
  const [index, setIndex] = useState(0);
  const puzzle = killerPuzzles[index];
  const zh = locale === 'zh';

  return (
    <div className="space-y-4">
      <label className="flex flex-wrap items-center gap-3 font-medium">
        {zh ? '选择题目' : 'Choose a puzzle'}
        <select
          value={index}
          onChange={event => setIndex(Number(event.currentTarget.value))}
          className="min-h-11 rounded-md border border-border bg-background px-3"
        >
          {killerPuzzles.map(({ id }, i) => <option key={id} value={i}>{zh ? `第 ${i + 1} 题` : `Puzzle ${i + 1}`}</option>)}
        </select>
      </label>
      <VariantBoard
        key={puzzle.id}
        puzzle={puzzle}
        l={labels[locale]}
        storagePrefix="samurai-killer-v1:"
        extraPeer={(a, b) => a !== b && puzzle.cageByCell[a] === puzzle.cageByCell[b]}
        cages={{
          complete: values => matchesKillerCages(puzzle.cages, values),
          at: cell => {
            const cage = puzzle.cageByCell[cell];
            return {
              sum: cage.cells[0] === cell ? cage.total : undefined,
              label: zh ? `${cage.cells.length} 格笼，和值 ${cage.total}` : `${cage.cells.length}-cell cage, sum ${cage.total}`,
              top: cage !== puzzle.cageByCell[cell - 9],
              right: cell % 9 === 8 || cage !== puzzle.cageByCell[cell + 1],
              bottom: cage !== puzzle.cageByCell[cell + 9],
              left: cell % 9 === 0 || cage !== puzzle.cageByCell[cell - 1],
            };
          },
        }}
        onAction={action => {
          try {
            trackInteraction(`killer_sudoku_${action}`, { locale, puzzle_id: puzzle.id });
          } catch { /* Telemetry must not interrupt play. */ }
        }}
      />
    </div>
  );
}
