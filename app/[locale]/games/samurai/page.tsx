"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSudokuStore } from "@/stores/sudoku-store";
import { SAMPLE_PUZZLE } from "@/lib/sudoku/sample-puzzle";
import { TimerDisplay } from "@/components/sudoku/TimerDisplay";
import { useLocale, useTranslations } from 'next-intl';
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BoardSkeleton, ActionBarSkeleton, NumberPadSkeleton, StatsPanelSkeleton } from "@/components/LoadingSkeleton";

// Dynamic imports for heavy components with loading skeletons
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

export default function SamuraiGamePage() {
  const t = useTranslations('common');
  const tGame = useTranslations('game');
  const locale = useLocale();

  const { puzzleId, loadPuzzle, status } = useSudokuStore();

  useEffect(() => {
    // Load sample puzzle if no puzzle loaded
    if (!puzzleId) {
      loadPuzzle(SAMPLE_PUZZLE);
    }
  }, [puzzleId, loadPuzzle]);

  if (!puzzleId) {
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground border px-3 py-1 rounded-md transition-colors"
        >
          ← {t('backToHome')}
        </Link>

        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <LanguageSwitcher />
          <TimerDisplay />

          <div className="text-sm">
            <span className="text-muted-foreground">{tGame('puzzle')}: </span>
            <span className="font-semibold">{puzzleId}</span>
          </div>
        </div>
      </header>

      {/* Main Game Area - Responsive Layout */}
      <main className="flex-1 overflow-hidden">
        {status === "completed" && (
          <div className="mx-4 mt-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-500 rounded-lg text-center">
            <p className="text-lg font-semibold text-green-700 dark:text-green-400">
              {tGame('completed')}
            </p>
          </div>
        )}

        {/* Desktop Layout: Board on left, Controls on right */}
        <div className="hidden lg:flex h-full">
          {/* Left side - Game Board */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              <StatsPanel />
              <SamuraiBoard key={puzzleId} />
            </div>
          </div>

          {/* Right side - Controls (Desktop only) */}
          <div className="w-80 xl:w-96 border-l overflow-y-auto">
            <ActionBar />
          </div>
        </div>

        {/* Tablet Layout: Board on top, Controls on bottom */}
        <div className="hidden md:block lg:hidden h-full overflow-y-auto">
          <div className="container mx-auto px-4 py-6 space-y-6">
            <StatsPanel />
            <SamuraiBoard key={puzzleId} />
            <ActionBar />
          </div>
        </div>

        {/* Mobile Layout: Board with bottom controls */}
        <div className="md:hidden h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <StatsPanel />
            <SamuraiBoard key={puzzleId} />
          </div>

          {/* Mobile Number Pad */}
          <div className="border-t">
            <NumberPad showCandidates />
          </div>

          {/* Mobile Action Bar */}
          <ActionBar />
        </div>
      </main>
    </div>
  );
}
