"use client";

import { useState } from "react";
import { useSudokuStore } from "@/stores/sudoku-store";
import { SudokuSolver } from "@/lib/sudoku/solver";

export function ActionBar() {
  const {
    undo,
    redo,
    reset,
    togglePause,
    toggleShowConflicts,
    toggleShowCandidates,
    showConflicts,
    showCandidates,
    isPaused,
    history,
    historyIndex,
    engine,
    incrementHints,
    selectCell,
  } = useSudokuStore();

  const [hintMessage, setHintMessage] = useState<string | null>(null);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the puzzle? All progress will be lost.")) {
      reset();
    }
  };

  const getCompletionPercentage = () => {
    return engine?.getCompletionPercentage() || 0;
  };

  const handleGetHint = () => {
    if (!engine) return;

    const solver = new SudokuSolver(engine);
    const hint = solver.getHint();

    if (hint) {
      incrementHints();
      selectCell(hint.position);

      const messages = {
        'naked-single': `This cell can only be ${hint.value} (naked single)`,
        'hidden-single': `${hint.value} can only go here in this row/column/box`,
      };

      setHintMessage(messages[hint.type as keyof typeof messages] || 'Try this cell');

      // Clear hint message after 5 seconds
      setTimeout(() => setHintMessage(null), 5000);
    } else {
      setHintMessage('No obvious hints available. Try exploring candidates!');
      setTimeout(() => setHintMessage(null), 3000);
    }
  };

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        {/* Hint Message */}
        {hintMessage && (
          <div className="mb-3 p-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-500 rounded text-sm text-center">
            💡 {hintMessage}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{getCompletionPercentage()}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="px-3 py-2 text-sm font-medium rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>

            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-3 py-2 text-sm font-medium rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo (Ctrl+Y)"
            >
              ↷ Redo
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGetHint}
              className="px-3 py-2 text-sm font-medium rounded-md border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Get a hint"
            >
              💡 Hint
            </button>

            <button
              onClick={toggleShowCandidates}
              className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                showCandidates
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
              title="Toggle candidate display"
            >
              {showCandidates ? "✓" : ""} Candidates
            </button>

            <button
              onClick={toggleShowConflicts}
              className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                showConflicts
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
              title="Toggle conflict highlighting"
            >
              {showConflicts ? "✓" : ""} Conflicts
            </button>

            <button
              onClick={togglePause}
              className="px-3 py-2 text-sm font-medium rounded-md border hover:bg-accent transition-colors"
              title="Pause timer"
            >
              {isPaused ? "▶️ Resume" : "⏸️ Pause"}
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm font-medium rounded-md border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
              title="Reset puzzle"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
