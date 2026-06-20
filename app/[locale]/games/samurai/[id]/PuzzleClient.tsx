"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSudokuStore } from "@/stores/sudoku-store";
import { Puzzle } from "@/lib/sudoku/types";
import { TimerDisplay } from "@/components/sudoku/TimerDisplay";
import { useLocale, useTranslations } from 'next-intl';
import Link from "next/link";
import { BoardSkeleton, ActionBarSkeleton, NumberPadSkeleton } from "@/components/LoadingSkeleton";

const SamuraiBoard = dynamic(() => import("@/components/sudoku/SamuraiBoard").then(mod => ({ default: mod.SamuraiBoard })), {
  loading: () => <BoardSkeleton />,
  ssr: false
});

const ActionBar = dynamic(() => import("@/components/sudoku/ActionBar").then(mod => ({ default: mod.ActionBar })), {
  loading: () => <ActionBarSkeleton />,
  ssr: false
});

const NumberPad = dynamic(() => import("@/components/sudoku/NumberPad").then(mod => ({ default: mod.NumberPad })), {
  loading: () => <NumberPadSkeleton />,
  ssr: false
});

interface PuzzleClientProps {
  puzzleId: string;
  initialPuzzle: Puzzle;
}

export default function PuzzleClient({ puzzleId, initialPuzzle }: PuzzleClientProps) {
  const t = useTranslations('game');
  const tArchive = useTranslations('archive');
  const locale = useLocale();

  const { puzzleId: currentPuzzleId, loadPuzzle, status } = useSudokuStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (puzzleId !== currentPuzzleId) {
      loadPuzzle(initialPuzzle);
    }
    setLoading(false);
  }, [puzzleId, currentPuzzleId, initialPuzzle, loadPuzzle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loadingPuzzle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/games/samurai/archive`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {tArchive('title')}
          </Link>

          <div className="text-sm">
            <span className="text-muted-foreground">{t('puzzle')}: </span>
            <span className="font-semibold">{puzzleId}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TimerDisplay />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {status === "completed" && (
          <div className="mb-4 p-4 bg-primary/10 border border-primary/40 rounded-lg text-center">
            <p className="text-lg font-semibold text-primary mb-2">
              {t('completed')}
            </p>
            <div className="flex gap-4 justify-center mt-4">
              <Link
                href={`/${locale}/games/samurai/archive`}
                className="px-4 py-2 border border-primary/50 text-primary rounded hover:bg-primary/10 transition-colors"
              >
                {tArchive('browseMore')}
              </Link>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <SamuraiBoard />
          <div className="hidden md:block mt-6">
            <NumberPad showCandidates />
          </div>
        </div>
      </main>

      <div className="md:hidden">
        <NumberPad showCandidates />
      </div>

      <ActionBar />
    </div>
  );
}
