"use client";

import { useState, useEffect } from "react";
import { useSudokuStore } from "@/stores/sudoku-store";
import { SudokuSolver } from "@/lib/sudoku/solver";
import { generateSamuraiPuzzle } from "@/lib/sudoku/puzzle-generator";
import { useTranslations, useLocale } from 'next-intl';
import { getGameHistory, getInProgressGames, type GameHistoryEntry } from '@/lib/storage/game-history';
import Link from 'next/link';

export function ActionBar() {
  const t = useTranslations('actions');
  const tStats = useTranslations('stats');
  const tHints = useTranslations('hints');
  const tGame = useTranslations('game');
  const locale = useLocale();

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
    difficulty,
  } = useSudokuStore();

  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'evil'>('medium');
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [inProgressGames, setInProgressGames] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load game history
  useEffect(() => {
    const loadHistory = () => {
      const completed = getGameHistory();
      const inProgress = getInProgressGames();
      setGameHistory(completed.slice(0, 5)); // Show last 5 completed games
      setInProgressGames(inProgress.slice(0, 3)); // Show last 3 in-progress games
    };

    loadHistory();
    // Refresh history every 5 seconds to pick up new saves
    const interval = setInterval(loadHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (difficulty && ['easy', 'medium', 'hard', 'evil'].includes(difficulty as any)) {
      setSelectedDifficulty(difficulty as 'easy' | 'medium' | 'hard' | 'evil');
    }
  }, [difficulty]);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleReset = () => {
    if (confirm(t('resetConfirm') || "Are you sure you want to reset the puzzle? All progress will be lost.")) {
      reset();
    }
  };

  const handleNewGame = () => {
    if (isGenerating) return; // Prevent rapid clicks

    if (confirm(t('newGameConfirm') || "Start a new puzzle? Current progress will be lost.")) {
      setIsGenerating(true);

      // Use setTimeout to ensure UI updates before heavy computation
      setTimeout(() => {
        try {
          const newPuzzle = generateSamuraiPuzzle(selectedDifficulty);
          loadPuzzle(newPuzzle);
          setHintMessage(null);
        } catch (error) {
          console.error('Failed to generate puzzle:', error);
          alert('Failed to generate a new puzzle. Please try again.');
        } finally {
          // Small delay to ensure state updates complete
          setTimeout(() => setIsGenerating(false), 100);
        }
      }, 10);
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
    <>
      {/* Desktop Sidebar Layout (lg+) */}
      <div className="hidden lg:block p-4 space-y-4">
        {/* Hint Message */}
        {hintMessage && (
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-500 rounded text-sm">
            💡 {hintMessage}
          </div>
        )}

        {/* Progress Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{tStats('progress')}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>完成度</span>
            <span>{getCompletionPercentage()}%</span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{tGame('difficulty.label')}</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedDifficulty('easy')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedDifficulty === 'easy'
                  ? 'bg-green-500 text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {tGame('difficulty.easy')}
            </button>
            <button
              onClick={() => setSelectedDifficulty('medium')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedDifficulty === 'medium'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {tGame('difficulty.medium')}
            </button>
            <button
              onClick={() => setSelectedDifficulty('hard')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedDifficulty === 'hard'
                  ? 'bg-red-500 text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {tGame('difficulty.hard')}
            </button>
            <button
              onClick={() => setSelectedDifficulty('evil')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedDifficulty === 'evil'
                  ? 'bg-purple-600 text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {tGame('difficulty.evil')}
            </button>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">操作</h3>

          <button
            onClick={handleNewGame}
            disabled={isGenerating}
            className="w-full px-4 py-3 text-sm font-medium rounded-md border-2 border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {isGenerating ? '…' : '✨'} {t('newGame')}
          </button>

          <Link
            href={`/${locale}`}
            className="block w-full px-4 py-2 text-sm font-medium rounded-md border border-primary text-primary hover:bg-primary/10 transition-colors text-center"
          >
            {t('backHome') ?? '← Back to home'}
          </Link>

          <div className="grid grid-cols-2 gap-2">
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

          <button
            onClick={handleGetHint}
            className="w-full px-4 py-2 text-sm font-medium rounded-md border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            💡 {t('hint')}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleShowCandidates}
              className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                showCandidates
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {showCandidates ? "✓ " : ""}{t('candidates')}
            </button>
            <button
              onClick={toggleShowConflicts}
              className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                showConflicts
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {showConflicts ? "✓ " : ""}{t('conflicts')}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={togglePause}
              className="px-3 py-2 text-sm font-medium rounded-md border hover:bg-accent transition-colors"
            >
              {isPaused ? `▶️ ${t('resume')}` : `⏸️ ${t('pause')}`}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm font-medium rounded-md border hover:bg-accent transition-colors"
            >
              🔄 {t('reset')}
            </button>
          </div>
        </div>

        {/* Keyboard Navigation Help */}
        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-sm font-semibold">⌨️ 键盘操作</h3>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>方向键 ←↑↓→</span>
              <span className="text-xs opacity-75">导航</span>
            </div>
            <div className="flex items-center justify-between">
              <span>数字键 1-9</span>
              <span className="text-xs opacity-75">填入数字</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Backspace/Delete</span>
              <span className="text-xs opacity-75">清除</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ctrl+Z / Ctrl+Y</span>
              <span className="text-xs opacity-75">撤销/重做</span>
            </div>
          </div>
        </div>

        {/* Game History */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">📊 游戏记录</h3>
            <Link
              href="/games/samurai/archive"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              查看全部
            </Link>
          </div>

          {/* In Progress Games */}
          {inProgressGames.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">进行中:</p>
              {inProgressGames.map((game, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{game.difficulty}</span>
                    <span className="text-muted-foreground">
                      {Math.floor(game.currentTime / 60)}:{(game.currentTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-[10px] mt-1">
                    {new Date(game.lastPlayed).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Games */}
          {gameHistory.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">已完成:</p>
              {gameHistory.map((game, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{game.difficulty}</span>
                    <span className="text-muted-foreground">
                      {Math.floor(game.stats.timeSpent / 60)}:{(game.stats.timeSpent % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-[10px] mt-1">
                    ✓ {new Date(game.completedAt).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {gameHistory.length === 0 && inProgressGames.length === 0 && (
            <div className="p-3 text-xs text-center text-muted-foreground bg-secondary/50 rounded">
              暂无游戏记录
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Bottom Layout */}
      <div className="lg:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-3 space-y-3">
          {/* Hint Message */}
          {hintMessage && (
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-500 rounded text-sm text-center">
              💡 {hintMessage}
            </div>
          )}

          {/* Progress Bar */}
          <div>
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {tGame('difficulty.label')}:
            </span>
            <div className="flex gap-1">
              {(['easy', 'medium', 'hard', 'evil'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedDifficulty === diff
                      ? diff === 'easy' ? 'bg-green-500 text-white'
                        : diff === 'medium' ? 'bg-yellow-500 text-white'
                        : diff === 'hard' ? 'bg-red-500 text-white'
                        : 'bg-purple-600 text-white'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {tGame(`difficulty.${diff}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons - Scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="px-3 py-2 text-xs font-medium rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              ↶ {t('undo')}
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-3 py-2 text-xs font-medium rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              ↷ {t('redo')}
            </button>
            <button
              onClick={handleGetHint}
              className="px-3 py-2 text-xs font-medium rounded-md border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors whitespace-nowrap"
            >
              💡 {t('hint')}
            </button>
            <button
              onClick={toggleShowCandidates}
              className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                showCandidates ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              {showCandidates ? "✓ " : ""}{t('candidates')}
            </button>
            <button
              onClick={toggleShowConflicts}
              className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                showConflicts ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              {showConflicts ? "✓ " : ""}{t('conflicts')}
            </button>
            <button
              onClick={togglePause}
              className="px-3 py-2 text-xs font-medium rounded-md border hover:bg-accent transition-colors whitespace-nowrap"
            >
              {isPaused ? `▶️ ${t('resume')}` : `⏸️ ${t('pause')}`}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 text-xs font-medium rounded-md border hover:bg-accent transition-colors whitespace-nowrap"
            >
              🔄 {t('reset')}
            </button>
            <button
              onClick={handleNewGame}
              disabled={isGenerating}
              className="px-3 py-2 text-xs font-medium rounded-md border border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-wait"
            >
              {isGenerating ? '…' : '✨'} {t('newGame')}
            </button>
            <Link
              href={`/${locale}`}
              className="px-3 py-2 text-xs font-medium rounded-md border border-primary text-primary hover:bg-primary/10 transition-colors whitespace-nowrap"
            >
              {t('backHome') ?? '← Back to home'}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
