"use client";

import { useSudokuStore } from "@/stores/sudoku-store";

export function ActionBar() {
  const {
    undo,
    redo,
    reset,
    togglePause,
    toggleShowConflicts,
    showConflicts,
    isPaused,
    history,
    historyIndex,
    engine,
  } = useSudokuStore();

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

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
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
