"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Difficulty } from '@/lib/sudoku/types';
import { isPuzzleId } from '@/lib/puzzle-id';
import {
  getUniquePuzzlesFromHistory,
  SUDOKU_STORAGE_EVENT,
} from '@/lib/storage/game-history';

interface ArchivePuzzle {
  id: string;
  difficulty: Difficulty;
  estimatedTime: number;
  tags: string[];
  playCount: number;
  bestTime?: number;
  lastPlayed: string;
}

export function GameHistoryArchive({
  selectedDifficulty,
}: {
  selectedDifficulty?: Difficulty;
}) {
  const locale = useLocale();
  const tCommon = useTranslations('common');
  const t = useTranslations('archive');
  const tGame = useTranslations('game');

  const [puzzles, setPuzzles] = useState<ArchivePuzzle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = () => {
      const allPuzzles = getUniquePuzzlesFromHistory();

      const filtered = selectedDifficulty
        ? allPuzzles.filter(p => p.difficulty === selectedDifficulty)
        : allPuzzles;

      setPuzzles(filtered);
      setLoading(false);
    };

    loadHistory();
    window.addEventListener(SUDOKU_STORAGE_EVENT, loadHistory);
    window.addEventListener('storage', loadHistory);

    return () => {
      window.removeEventListener(SUDOKU_STORAGE_EVENT, loadHistory);
      window.removeEventListener('storage', loadHistory);
    };
  }, [selectedDifficulty]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    );
  }

  if (puzzles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{t('noResults')}</p>
        <Link
          href={`/${locale}/games/samurai`}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors inline-block"
        >
          {t('playToday') || 'Start Playing'}
        </Link>
      </div>
    );
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">{t('table.id')}</th>
            <th className="text-left p-3 font-medium">{t('table.difficulty')}</th>
            <th className="text-left p-3 font-medium">{t('table.playCount')}</th>
            <th className="text-left p-3 font-medium">{t('table.bestTime')}</th>
            <th className="text-left p-3 font-medium">{t('table.lastPlayed')}</th>
            <th className="text-left p-3 font-medium">{t('table.tags')}</th>
            <th className="text-right p-3 font-medium">{t('table.action')}</th>
          </tr>
        </thead>
        <tbody>
          {puzzles.map((puzzle) => {
            const isPublicPuzzle = isPuzzleId(puzzle.id);
            const localOnlyLabel = locale === 'zh' ? '本地记录' : 'Local record';

            return (
              <tr
                key={puzzle.id}
                className="border-b hover:bg-muted/50 transition-colors"
              >
                <td className="p-3">
                  <span className="font-medium">{puzzle.id}</span>
                </td>
                <td className="p-3">
                  <DifficultyBadge difficulty={puzzle.difficulty} tGame={tGame} />
                </td>
                <td className="p-3 text-muted-foreground">
                  {t('plays', { count: puzzle.playCount })}
                </td>
                <td className="p-3 text-muted-foreground">
                  {puzzle.bestTime ? formatTime(puzzle.bestTime) : '-'}
                </td>
                <td className="p-3 text-muted-foreground">
                  {formatDate(puzzle.lastPlayed)}
                </td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {puzzle.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-secondary rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-right">
                  {isPublicPuzzle ? (
                    <Link
                      href={`/${locale}/games/samurai/${puzzle.id}`}
                      className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors inline-block"
                    >
                      {t('play')}
                    </Link>
                  ) : (
                    <span
                      className="inline-block rounded bg-muted px-3 py-1 text-sm text-muted-foreground"
                      title={localOnlyLabel}
                    >
                      {localOnlyLabel}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DifficultyBadge({
  difficulty,
  tGame,
}: {
  difficulty: Difficulty;
  tGame: ReturnType<typeof useTranslations>;
}) {
  const colors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    evil: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded ${colors[difficulty]}`}
    >
      {tGame(`difficulty.${difficulty}`)}
    </span>
  );
}
