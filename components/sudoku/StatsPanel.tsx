"use client";

import { useSudokuStore } from "@/stores/sudoku-store";
import { formatTime } from "@/lib/utils";
import { getVisibleMoveCount } from "@/lib/sudoku/player-stats";
import { useTranslations } from 'next-intl';

export function StatsPanel() {
  const t = useTranslations('stats');
  const tGame = useTranslations('game');

  const elapsedTime = useSudokuStore((state) => state.elapsedTime);
  const hintsUsed = useSudokuStore((state) => state.hintsUsed);
  const mistakesMade = useSudokuStore((state) => state.mistakesMade);
  const engine = useSudokuStore((state) => state.engine);
  const difficulty = useSudokuStore((state) => state.difficulty);
  const movesCount = useSudokuStore((state) =>
    getVisibleMoveCount(state.history.length, state.historyIndex)
  );

  const completion = engine?.getCompletionPercentage() || 0;

  const getDifficultyTranslation = (diff: string) => {
    return tGame(`difficulty.${diff}`);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-muted/40 rounded-lg">
      <StatItem
        label={t('time')}
        value={formatTime(elapsedTime)}
        icon="⏱️"
      />

      <StatItem
        label={t('progress')}
        value={`${completion}%`}
        icon="📊"
      />

      <StatItem
        label={t('hints')}
        value={hintsUsed.toString()}
        icon="💡"
      />

      <StatItem
        label={t('moves')}
        value={movesCount.toString()}
        icon="🎯"
      />

      <StatItem
        label={t('mistakes')}
        value={mistakesMade.toString()}
        icon="!"
      />

      {difficulty && (
        <div className="col-span-2 md:col-span-5 text-center text-sm text-muted-foreground">
          {tGame('difficulty.label')}: <span className="font-semibold capitalize">{getDifficultyTranslation(difficulty)}</span>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-background rounded border">
      <div className="text-xl mb-1 opacity-80 font-semibold">{icon}</div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
