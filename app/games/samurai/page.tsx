"use client";

import { useEffect } from "react";
import { useSudokuStore } from "@/stores/sudoku-store";
import { SAMPLE_PUZZLE } from "@/lib/sudoku/sample-puzzle";
import { SamuraiBoard } from "@/components/sudoku/SamuraiBoard";
import { ActionBar } from "@/components/sudoku/ActionBar";
import { TimerDisplay } from "@/components/sudoku/TimerDisplay";
import Link from "next/link";

export default function SamuraiGamePage() {
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
          <p className="text-muted-foreground">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Home
        </Link>

        <div className="flex items-center gap-4">
          <TimerDisplay />

          <div className="text-sm">
            <span className="text-muted-foreground">Puzzle: </span>
            <span className="font-semibold">{puzzleId}</span>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {status === "completed" && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-500 rounded-lg text-center">
            <p className="text-lg font-semibold text-green-700 dark:text-green-400">
              🎉 Congratulations! You solved the puzzle!
            </p>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <SamuraiBoard />
        </div>
      </main>

      {/* Action Bar */}
      <ActionBar />
    </div>
  );
}
