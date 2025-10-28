"use client";

import { useState } from "react";
import { useSudokuStore } from "@/stores/sudoku-store";
import { SudokuSolver } from "@/lib/sudoku/solver";
import { generateSamuraiPuzzle } from "@/lib/sudoku/puzzle-generator";
import { useTranslations } from 'next-intl';

export function ActionBar() {
  const t = useTranslations('actions');
  const tStats = useTranslations('stats');
  const tHints = useTranslations('hints');
  const tGame = useTranslations('game');

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
    loadPuzzle,
  } = useSudokuStore();

  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleReset = () => {
    if (confirm(t('resetConfirm') || "Are you sure you want to reset the puzzle? All progress will be lost.")) {
      reset();
    }
  };

  const handleNewGame = () => {
    if (confirm(t('newGameConfirm') || "Start a new puzzle? Current progress will be lost.")) {
      try {
        const newPuzzle = generateSamuraiPuzzle(selectedDifficulty);
        loadPuzzle(newPuzzle);
        setHintMessage(null);
      } catch (error) {
        console.error('Failed to generate puzzle:', error);
        alert('Failed to generate a new puzzle. Please try again.');
      }
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
        'naked-single': tHints('nakedSingle', { value: hint.value }),
        'hidden-single': tHints('hiddenSingle', { value: hint.value, unit: '' }),
      };

      setHintMessage(messages[hint.type as keyof typeof messages] || 'Try this cell');

      // Clear hint message after 5 seconds
      setTimeout(() => setHintMessage(null), 5000);
    } else {
      setHintMessage(tHints('noHint'));
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
            <span>{tStats('progress')}</span>
            <span>{getCompletionPercentage()}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {tGame('difficulty.label')}:
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedDifficulty('easy')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDifficulty === 'easy'
                  ? 'bg-green-500 text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {tGame('difficulty.easy')}
            </button>
            <button
              onClick={() => setSelectedDifficulty('medium')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDifficulty === 'medium'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {tGame('difficulty.medium')}
            </button>
            <button
              onClick={() => setSelectedDifficulty('hard')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDifficulty === 'hard'
                  ? 'bg-red-500 text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {tGame('difficulty.hard')}
            </button>
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
              ↶ {t('undo')}
            </button>

            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-3 py-2 text-sm font-medium rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo (Ctrl+Y)"
            >
              ↷ {t('redo')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGetHint}
              className="px-3 py-2 text-sm font-medium rounded-md border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Get a hint"
            >
              💡 {t('hint')}
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
              {showCandidates ? "✓" : ""} {t('candidates')}
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
              {showConflicts ? "✓" : ""} {t('conflicts')}
            </button>

            <button
              onClick={togglePause}
              className="px-3 py-2 text-sm font-medium rounded-md border hover:bg-accent transition-colors"
              title="Pause timer"
            >
              {isPaused ? `▶️ ${t('resume')}` : `⏸️ ${t('pause')}`}
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm font-medium rounded-md border hover:bg-accent transition-colors"
              title="Reset puzzle"
            >
              🔄 {t('reset')}
            </button>

            <button
              onClick={handleNewGame}
              className="px-3 py-2 text-sm font-medium rounded-md border border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              title="Start new game"
            >
              ✨ {t('newGame')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
