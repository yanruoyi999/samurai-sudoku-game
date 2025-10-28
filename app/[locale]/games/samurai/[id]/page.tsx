"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useSudokuStore } from "@/stores/sudoku-store";
import { Puzzle } from "@/lib/sudoku/types";
import { TimerDisplay } from "@/components/sudoku/TimerDisplay";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { BoardSkeleton, ActionBarSkeleton, NumberPadSkeleton } from "@/components/LoadingSkeleton";

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

export default function PuzzlePage() {
  const t = useTranslations('game');
  const tArchive = useTranslations('archive');

  const params = useParams();
  const puzzleId = params.id as string;
  const { puzzleId: currentPuzzleId, loadPuzzle, status } = useSudokuStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPuzzle() {
      try {
        setLoading(true);
        setError(null);

        // Try to load from public/puzzles
        const year = puzzleId.split('-')[0];
        const response = await fetch(`/puzzles/${year}/${puzzleId}.json`);

        if (!response.ok) {
          throw new Error(`Puzzle ${puzzleId} not found`);
        }

        const puzzle: Puzzle = await response.json();
        loadPuzzle(puzzle);
      } catch (err) {
        console.error('Failed to load puzzle:', err);
        setError(err instanceof Error ? err.message : 'Failed to load puzzle');
      } finally {
        setLoading(false);
      }
    }

    // Only fetch if different puzzle or no puzzle loaded
    if (puzzleId !== currentPuzzleId) {
      fetchPuzzle();
    } else {
      setLoading(false);
    }
  }, [puzzleId, currentPuzzleId, loadPuzzle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loadingPuzzle')}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">{t('puzzleNotFound')}</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/games/samurai/archive"
              className="px-4 py-2 border rounded hover:bg-accent transition-colors"
            >
              {tArchive('title')}
            </Link>
            <Link
              href="/games/samurai"
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              {tArchive('playToday')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/games/samurai/archive"
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

      {/* Main Game Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {status === "completed" && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-500 rounded-lg text-center">
            <p className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
              {t('completed')}
            </p>
            <div className="flex gap-4 justify-center mt-4">
              <Link
                href="/games/samurai/archive"
                className="px-4 py-2 border border-green-600 text-green-700 dark:text-green-400 rounded hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
              >
                {tArchive('browseMore') || 'Browse More Puzzles'}
              </Link>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <SamuraiBoard />
        </div>
      </main>

      {/* Mobile Number Pad */}
      <div className="md:hidden">
        <NumberPad showCandidates />
      </div>

      {/* Action Bar */}
      <ActionBar />
    </div>
  );
}
