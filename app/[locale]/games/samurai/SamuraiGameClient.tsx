"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSudokuStore } from "@/stores/sudoku-store";
import type { Puzzle } from "@/lib/sudoku/types";
import { TimerDisplay } from "@/components/sudoku/TimerDisplay";
import { useLocale, useTranslations } from 'next-intl';
import Link from "next/link";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BoardSkeleton, ActionBarSkeleton, NumberPadSkeleton, StatsPanelSkeleton } from "@/components/LoadingSkeleton";
import { GameOnboardingPrompt } from "@/components/sudoku/GameOnboardingPrompt";
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

interface SamuraiGameClientProps {
  initialPuzzle: Puzzle;
}

export default function SamuraiGameClient({ initialPuzzle }: SamuraiGameClientProps) {
  const t = useTranslations('common');
  const tGame = useTranslations('game');
  const locale = useLocale();

  const puzzleId = useSudokuStore((state) => state.puzzleId);
  const loadPuzzle = useSudokuStore((state) => state.loadPuzzle);
  const status = useSudokuStore((state) => state.status);
  const loadedInitialPuzzleId = useRef<string | null>(null);
  const [prevPuzzleId, setPrevPuzzleId] = useState<string | null>(null);
  const [isInitialPuzzleLoading, setIsInitialPuzzleLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const trackedOpenPuzzleId = useRef<string | null>(null);
  const trackedCompletedPuzzleId = useRef<string | null>(null);

  useEffect(() => {
    if (puzzleId && puzzleId !== prevPuzzleId) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevPuzzleId(puzzleId);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [puzzleId, prevPuzzleId]);

  useEffect(() => {
    if (loadedInitialPuzzleId.current !== initialPuzzle.id) {
      loadPuzzle(initialPuzzle);
      loadedInitialPuzzleId.current = initialPuzzle.id;
    }
    setIsInitialPuzzleLoading(false);
  }, [initialPuzzle, loadPuzzle]);

  useEffect(() => {
    if (puzzleId !== initialPuzzle.id || trackedOpenPuzzleId.current === initialPuzzle.id) {
      return;
    }

    trackedOpenPuzzleId.current = initialPuzzle.id;
    trackInteraction("sudoku_puzzle_start", {
      difficulty: initialPuzzle.difficulty,
      locale,
      puzzle_id: initialPuzzle.id,
      source: "daily",
    });
    trackInteraction("sudoku_puzzle_open", {
      difficulty: initialPuzzle.difficulty,
      locale,
      puzzle_id: initialPuzzle.id,
      source: "daily",
    });
  }, [puzzleId, initialPuzzle.difficulty, initialPuzzle.id, locale]);

  useEffect(() => {
    if (
      status !== "completed" ||
      puzzleId !== initialPuzzle.id ||
      trackedCompletedPuzzleId.current === initialPuzzle.id
    ) {
      return;
    }

    trackedCompletedPuzzleId.current = initialPuzzle.id;
    trackInteraction("sudoku_puzzle_completed", {
      difficulty: initialPuzzle.difficulty,
      locale,
      puzzle_id: initialPuzzle.id,
      source: "daily",
    });
  }, [status, puzzleId, initialPuzzle.difficulty, initialPuzzle.id, locale]);

  if (isInitialPuzzleLoading || !puzzleId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{tGame('loadingPuzzle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {isTransitioning && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-medium">{tGame('loadingPuzzle')}</p>
          </div>
        </div>
      )}

      <header className="border-b px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground border px-3 py-1 rounded-md transition-colors"
          >
            {t('backToHome')}
          </Link>
          <TrackedLink
            href={`/${locale}/support`}
            eventName="support_cta_click"
            eventProperties={{ locale, location: 'game_header', puzzle_id: puzzleId }}
            className="inline-flex items-center gap-2 text-xs md:text-sm text-primary border border-primary/40 px-3 py-1 rounded-md transition-colors hover:bg-primary/10"
          >
            {locale === 'zh' ? '支持/订阅' : 'Support'}
          </TrackedLink>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <LanguageSwitcher />
          <TimerDisplay />

          <div className="text-sm">
            <span className="text-muted-foreground">{tGame('puzzle')}: </span>
            <span className="font-semibold">{puzzleId}</span>
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {status === "completed" && (
          <div className="mx-4 mt-4 p-4 bg-primary/10 border border-primary/40 rounded-lg text-center">
            <p className="text-lg font-semibold text-primary">
              {tGame('completed')}
            </p>
          </div>
        )}

        <GameOnboardingPrompt className="mx-4 mt-4 shrink-0 lg:mx-auto lg:w-full lg:max-w-3xl" />

        <div className="hidden min-h-0 flex-1 lg:flex">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              <StatsPanel />
              <SamuraiBoard key={puzzleId} />
            </div>
          </div>

          <div className="w-80 xl:w-96 border-l overflow-y-auto">
            <div className="border-b">
              <NumberPad showCandidates />
            </div>
            <ActionBar />
          </div>
        </div>

        <div className="hidden min-h-0 flex-1 overflow-y-auto md:block lg:hidden">
          <div className="container mx-auto px-4 py-6 space-y-6">
            <StatsPanel />
            <SamuraiBoard key={puzzleId} />
            <NumberPad showCandidates />
            <ActionBar />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:hidden">
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
