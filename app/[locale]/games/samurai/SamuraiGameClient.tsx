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
import { GameGuidancePanel } from "@/components/sudoku/GameGuidancePanel";
import { GameOnboardingPrompt } from "@/components/sudoku/GameOnboardingPrompt";
import { trackInteraction } from "@/lib/analytics/events";
import { getNextDifficulty } from "@/lib/sudoku/game-guidance";

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
  const currentDifficulty = useSudokuStore((state) => state.difficulty);
  const loadPuzzle = useSudokuStore((state) => state.loadPuzzle);
  const status = useSudokuStore((state) => state.status);
  const loadedInitialPuzzleId = useRef<string | null>(null);
  const [prevPuzzleId, setPrevPuzzleId] = useState<string | null>(null);
  const [isInitialPuzzleLoading, setIsInitialPuzzleLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const trackedOpenPuzzleId = useRef<string | null>(null);
  const trackedCompletedPuzzleId = useRef<string | null>(null);

  const activeDifficulty = currentDifficulty ?? initialPuzzle.difficulty;
  const nextDifficulty = getNextDifficulty(activeDifficulty);
  const activeDifficultyLabel = tGame(`difficulty.${activeDifficulty}`);
  const nextDifficultyLabel = nextDifficulty ? tGame(`difficulty.${nextDifficulty}`) : null;

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
      <div className="flex min-h-[calc(100dvh-5.5rem)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{tGame('loadingPuzzle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-5.5rem)] flex-col">
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
          <section className="mx-4 mt-4 rounded-xl border border-primary/40 bg-primary/10 p-4 text-center lg:mx-auto lg:w-full lg:max-w-3xl">
            <p className="text-lg font-semibold text-primary">
              {tGame('completed')}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {locale === 'zh'
                ? '继续保持解题节奏：可以做同难度下一题、提高一级，或先复盘通关技巧。'
                : 'Keep the solving loop going: play another puzzle at this level, move up, or review the solving guide.'}
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <TrackedLink
                href={`/${locale}/games/samurai/difficulty/${activeDifficulty}`}
                eventName="game_completion_cta_click"
                eventProperties={{
                  destination: `difficulty/${activeDifficulty}`,
                  difficulty: activeDifficulty,
                  locale,
                  puzzle_id: puzzleId,
                }}
                className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {locale === 'zh' ? `继续${activeDifficultyLabel}题` : `More ${activeDifficultyLabel} puzzles`}
              </TrackedLink>

              {nextDifficulty && nextDifficultyLabel && (
                <TrackedLink
                  href={`/${locale}/games/samurai/difficulty/${nextDifficulty}`}
                  eventName="game_completion_cta_click"
                  eventProperties={{
                    destination: `difficulty/${nextDifficulty}`,
                    difficulty: activeDifficulty,
                    locale,
                    next_difficulty: nextDifficulty,
                    puzzle_id: puzzleId,
                  }}
                  className="rounded-lg border border-primary px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  {locale === 'zh' ? `挑战${nextDifficultyLabel}` : `Try ${nextDifficultyLabel}`}
                </TrackedLink>
              )}

              <TrackedLink
                href={`/${locale}/games/samurai/archive`}
                eventName="game_completion_cta_click"
                eventProperties={{
                  destination: 'archive',
                  difficulty: activeDifficulty,
                  locale,
                  puzzle_id: puzzleId,
                }}
                className="rounded-lg border px-4 py-3 text-sm font-semibold hover:bg-accent"
              >
                {locale === 'zh' ? '全部题库' : 'All puzzles'}
              </TrackedLink>

              <TrackedLink
                href={`/${locale}/games/samurai/solving-tips`}
                eventName="game_completion_cta_click"
                eventProperties={{
                  destination: 'solving-tips',
                  difficulty: activeDifficulty,
                  locale,
                  puzzle_id: puzzleId,
                }}
                className="rounded-lg border px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                {locale === 'zh' ? '复盘通关技巧' : 'Review solving tips'}
              </TrackedLink>
            </div>
          </section>
        )}

        <GameOnboardingPrompt className="mx-4 mt-4 shrink-0 lg:mx-auto lg:w-full lg:max-w-3xl" />

        {status === "playing" && (
          <GameGuidancePanel
            className="mx-4 mt-4 shrink-0 lg:mx-auto lg:w-full lg:max-w-3xl"
            difficulty={activeDifficulty}
            locale={locale}
            location="game_body"
            puzzleId={puzzleId}
          />
        )}

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
