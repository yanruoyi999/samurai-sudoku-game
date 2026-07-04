"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSudokuStore } from "@/stores/sudoku-store";
import { Puzzle } from "@/lib/sudoku/types";
import { TimerDisplay } from "@/components/sudoku/TimerDisplay";
import { useLocale, useTranslations } from 'next-intl';
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BoardSkeleton, ActionBarSkeleton, NumberPadSkeleton, StatsPanelSkeleton } from "@/components/LoadingSkeleton";
import { trackInteraction } from "@/lib/analytics/events";

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

const StatsPanel = dynamic(() => import("@/components/sudoku/StatsPanel").then(mod => ({ default: mod.StatsPanel })), {
  loading: () => <StatsPanelSkeleton />,
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
  const loadedRoutePuzzleId = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const trackedOpenPuzzleId = useRef<string | null>(null);
  const trackedCompletedPuzzleId = useRef<string | null>(null);

  useEffect(() => {
    if (loadedRoutePuzzleId.current !== puzzleId) {
      loadPuzzle(initialPuzzle);
      loadedRoutePuzzleId.current = puzzleId;
    }
    setLoading(false);
  }, [puzzleId, initialPuzzle, loadPuzzle]);

  useEffect(() => {
    if (loading || currentPuzzleId !== puzzleId || trackedOpenPuzzleId.current === puzzleId) {
      return;
    }

    trackedOpenPuzzleId.current = puzzleId;
    trackInteraction("sudoku_puzzle_start", {
      difficulty: initialPuzzle.difficulty,
      locale,
      puzzle_id: puzzleId,
      source: "archive",
    });
    trackInteraction("sudoku_puzzle_open", {
      difficulty: initialPuzzle.difficulty,
      locale,
      puzzle_id: puzzleId,
      source: "archive",
    });
  }, [loading, currentPuzzleId, puzzleId, initialPuzzle.difficulty, locale]);

  useEffect(() => {
    if (
      status !== "completed" ||
      currentPuzzleId !== puzzleId ||
      trackedCompletedPuzzleId.current === puzzleId
    ) {
      return;
    }

    trackedCompletedPuzzleId.current = puzzleId;
    trackInteraction("sudoku_puzzle_complete", {
      difficulty: initialPuzzle.difficulty,
      locale,
      puzzle_id: puzzleId,
      source: "archive",
    });
    trackInteraction("sudoku_puzzle_completed", {
      difficulty: initialPuzzle.difficulty,
      locale,
      puzzle_id: puzzleId,
      source: "archive",
    });
  }, [status, currentPuzzleId, puzzleId, initialPuzzle.difficulty, locale]);

  if (loading || !currentPuzzleId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loadingPuzzle')}</p>
        </div>
      </div>
    );
  }
  const displayPuzzleId = currentPuzzleId ?? puzzleId;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href={`/${locale}/games/samurai/archive`}
            className="inline-flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground border px-3 py-1 rounded-md transition-colors"
          >
            ← {tArchive('title')}
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <LanguageSwitcher />
          <TimerDisplay />

          <div className="text-sm">
            <span className="text-muted-foreground">{t('puzzle')}: </span>
            <span className="font-semibold">{displayPuzzleId}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {status === "completed" && (
          <div className="mx-4 mt-4 p-4 bg-primary/10 border border-primary/40 rounded-lg text-center">
            <p className="text-lg font-semibold text-primary">
              {t('completed')}
            </p>
          </div>
        )}

        <div className="hidden lg:flex h-full">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              <StatsPanel />
              <SamuraiBoard key={puzzleId} />
              <div className="flex justify-center">
                <Link
                  href={`/${locale}/games/samurai/archive`}
                  className="text-sm text-primary hover:underline"
                >
                  {tArchive('browseMore')}
                </Link>
              </div>
            </div>
          </div>

          <div className="w-80 xl:w-96 border-l overflow-y-auto">
            <div className="border-b">
              <NumberPad showCandidates />
            </div>
            <ActionBar />
          </div>
        </div>

        <div className="hidden md:block lg:hidden h-full overflow-y-auto">
          <div className="container mx-auto px-4 py-6 space-y-6">
            <StatsPanel />
            <SamuraiBoard key={puzzleId} />
            <NumberPad showCandidates />
            <ActionBar />
          </div>
        </div>

        <div className="md:hidden h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <StatsPanel />
            <SamuraiBoard key={puzzleId} />
          </div>

          <div className="border-t">
            <NumberPad showCandidates />
          </div>

          <ActionBar />
        </div>
      </main>
    </div>
  );
}
