"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { trackInteraction } from "@/lib/analytics/events";
import {
  MINESWEEPER_PRESETS,
  countFlags,
  countMines,
  countRevealedSafeCells,
  createEmptyMinesweeperBoard,
  createMinesweeperBoard,
  getMinesweeperPreset,
  revealAllMines,
  revealCell,
  toggleFlag,
  type MinesweeperBoard,
  type MinesweeperCell,
  type MinesweeperDifficulty,
  type MinesweeperPreset,
  type MinesweeperStatus,
} from "@/lib/minesweeper/engine";

interface MinesweeperGameClientProps {
  locale: string;
  isZh: boolean;
}

export default function MinesweeperGameClient({ locale, isZh }: MinesweeperGameClientProps) {
  const [preset, setPreset] = useState<MinesweeperPreset>(() => getMinesweeperPreset("beginner"));
  const [board, setBoard] = useState<MinesweeperBoard>(() =>
    createEmptyMinesweeperBoard(preset.rows, preset.cols),
  );
  const [status, setStatus] = useState<MinesweeperStatus>("ready");
  const [flagMode, setFlagMode] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (status !== "playing" || startedAt === null) return undefined;

    const updateElapsed = () => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    };

    updateElapsed();
    const timer = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, status]);

  const flagsUsed = useMemo(() => countFlags(board), [board]);
  const minesOnBoard = useMemo(() => countMines(board), [board]);
  const revealedSafeCells = useMemo(() => countRevealedSafeCells(board), [board]);
  const totalSafeCells = preset.rows * preset.cols - preset.mines;
  const flagsLeft = Math.max(0, preset.mines - flagsUsed);

  const resetGame = useCallback((nextPreset: MinesweeperPreset = preset) => {
    setPreset(nextPreset);
    setBoard(createEmptyMinesweeperBoard(nextPreset.rows, nextPreset.cols));
    setStatus("ready");
    setFlagMode(false);
    setStartedAt(null);
    setElapsedSeconds(0);
  }, [preset]);

  const handleDifficultyChange = (difficulty: MinesweeperDifficulty) => {
    const nextPreset = getMinesweeperPreset(difficulty);
    resetGame(nextPreset);
    trackInteraction("minesweeper_difficulty_select", {
      difficulty,
      rows: nextPreset.rows,
      cols: nextPreset.cols,
      mines: nextPreset.mines,
      locale,
    });
  };

  const handleReveal = (cell: MinesweeperCell) => {
    if (status === "won" || status === "lost") return;

    if (flagMode && status === "playing") {
      handleToggleFlag(cell);
      return;
    }

    if (status === "ready") {
      const now = Date.now();
      const generatedBoard = createMinesweeperBoard({
        rows: preset.rows,
        cols: preset.cols,
        mines: preset.mines,
        safeCell: cell,
        seed: `${preset.key}-${now}-${Math.random()}`,
      });
      const result = revealCell(generatedBoard, cell);

      setBoard(result.board);
      setStartedAt(now);
      setElapsedSeconds(0);
      setStatus(result.won ? "won" : "playing");

      trackInteraction("minesweeper_game_start", {
        difficulty: preset.key,
        rows: preset.rows,
        cols: preset.cols,
        mines: preset.mines,
        locale,
      });

      if (result.won) {
        trackInteraction("minesweeper_game_win", {
          difficulty: preset.key,
          elapsed_seconds: 0,
          locale,
        });
      }
      return;
    }

    const result = revealCell(board, cell);
    if (result.hitMine) {
      const finalElapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : elapsedSeconds;
      const finalRevealedSafeCells = countRevealedSafeCells(result.board);
      setElapsedSeconds(finalElapsed);
      setBoard(revealAllMines(result.board));
      setStatus("lost");
      trackInteraction("minesweeper_game_lost", {
        difficulty: preset.key,
        elapsed_seconds: finalElapsed,
        revealed_safe_cells: finalRevealedSafeCells,
        locale,
      });
      return;
    }

    setBoard(result.board);
    if (result.won) {
      const finalElapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : elapsedSeconds;
      setElapsedSeconds(finalElapsed);
      setStatus("won");
      trackInteraction("minesweeper_game_win", {
        difficulty: preset.key,
        elapsed_seconds: finalElapsed,
        locale,
      });
    }
  };

  const handleToggleFlag = (cell: MinesweeperCell) => {
    if (status !== "playing" || cell.isRevealed) return;

    const nextBoard = toggleFlag(board, cell);
    setBoard(nextBoard);
    trackInteraction("minesweeper_flag_toggle", {
      difficulty: preset.key,
      flagged: !cell.isFlagged,
      locale,
    });
  };

  const statusText = getStatusText(status, isZh);
  const boardMaxWidth = preset.cols > 16 ? "max-w-[1080px]" : preset.cols > 9 ? "max-w-[720px]" : "max-w-[420px]";
  const cellSize = preset.cols > 16 ? "2rem" : preset.cols > 9 ? "2.25rem" : "2.5rem";

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <nav className="mb-3 flex flex-wrap gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <Link href={`/${locale}`} className="hover:text-foreground">
                {isZh ? "首页" : "Home"}
              </Link>
              <span>/</span>
              <Link href={`/${locale}/games/samurai`} className="hover:text-foreground">
                Samurai Sudoku
              </Link>
              <span>/</span>
              <span className="text-foreground">{isZh ? "扫雷" : "Minesweeper"}</span>
            </nav>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
              {isZh ? "高频逻辑游戏实验" : "High-frequency logic game"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
              {isZh ? "在线扫雷" : "Minesweeper Online"}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {isZh
                ? "免费浏览器扫雷，支持三种经典难度、移动端旗帜模式、本地即时开局。"
                : "Free browser Minesweeper with classic difficulty levels, mobile flag mode, and instant local play."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {MINESWEEPER_PRESETS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleDifficultyChange(option.key)}
                aria-pressed={preset.key === option.key}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  preset.key === option.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:border-primary hover:bg-primary/5"
                }`}
              >
                {getPresetLabel(option, isZh)}
              </button>
            ))}
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section aria-label={isZh ? "扫雷棋盘" : "Minesweeper board"} className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-secondary/30 p-3">
              <div className="flex flex-wrap gap-2 text-sm">
                <Metric label={isZh ? "时间" : "Time"} value={formatTime(elapsedSeconds)} />
                <Metric label={isZh ? "雷数" : "Mines"} value={minesOnBoard || preset.mines} />
                <Metric label={isZh ? "旗帜" : "Flags"} value={flagsLeft} />
                <Metric label={isZh ? "进度" : "Open"} value={`${revealedSafeCells}/${totalSafeCells}`} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFlagMode((current) => !current)}
                  aria-pressed={flagMode}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    flagMode
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  {isZh ? "旗帜模式" : "Flag mode"}
                </button>
                <button
                  type="button"
                  onClick={() => resetGame()}
                  className="rounded-lg border bg-background px-4 py-2 text-sm font-semibold hover:border-primary hover:bg-primary/5"
                >
                  {isZh ? "新开一局" : "New game"}
                </button>
              </div>
            </div>

            <div className="rounded-lg border bg-secondary/20 p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{statusText}</p>
                <p className="text-xs text-muted-foreground">
                  {preset.rows}x{preset.cols} / {preset.mines} {isZh ? "个雷" : "mines"}
                </p>
              </div>
              <div className="overflow-x-auto pb-2">
                <div
                  className={`grid gap-1 ${boardMaxWidth}`}
                  style={{ gridTemplateColumns: `repeat(${preset.cols}, ${cellSize})` }}
                >
                  {board.flat().map((cell) => (
                    <button
                      key={`${cell.row}-${cell.col}`}
                      type="button"
                      onClick={() => handleReveal(cell)}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        handleToggleFlag(cell);
                      }}
                      aria-label={getCellAriaLabel(cell, isZh)}
                      className={getCellClassName(cell)}
                    >
                      {getCellContent(cell)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg border bg-background p-5">
              <h2 className="text-lg font-semibold">{isZh ? "当前难度" : "Current level"}</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{isZh ? "棋盘" : "Board"}</dt>
                  <dd className="font-medium">{preset.rows}x{preset.cols}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{isZh ? "地雷" : "Mines"}</dt>
                  <dd className="font-medium">{preset.mines}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{isZh ? "状态" : "Status"}</dt>
                  <dd className="font-medium">{statusText}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-lg border bg-primary/5 p-5">
              <h2 className="text-lg font-semibold">{isZh ? "继续玩逻辑游戏" : "More logic games"}</h2>
              <div className="mt-4 grid gap-3 text-sm">
                <Link
                  href={`/${locale}/games/samurai`}
                  className="rounded-lg border bg-background px-4 py-3 font-medium text-primary hover:border-primary hover:bg-primary/5"
                >
                  {isZh ? "每日武士数独" : "Daily Samurai Sudoku"}
                </Link>
                <Link
                  href={`/${locale}/printable-samurai-sudoku#free-3-puzzle-pack`}
                  className="rounded-lg border bg-background px-4 py-3 font-medium text-primary hover:border-primary hover:bg-primary/5"
                >
                  {isZh ? "免费 PDF 样包" : "Free PDF sample pack"}
                </Link>
                <Link
                  href={`/${locale}/support`}
                  className="rounded-lg border bg-background px-4 py-3 font-medium text-primary hover:border-primary hover:bg-primary/5"
                >
                  {isZh ? "支持与订阅" : "Support / Subscribe"}
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-20 rounded-md border bg-background px-3 py-2">
      <div className="text-[11px] font-medium uppercase text-muted-foreground">{label}</div>
      <div className="tabular text-lg font-semibold">{value}</div>
    </div>
  );
}

function getPresetLabel(preset: MinesweeperPreset, isZh: boolean): string {
  if (!isZh) return preset.label;

  const labels: Record<MinesweeperDifficulty, string> = {
    beginner: "初级",
    intermediate: "中级",
    expert: "专家",
  };
  return labels[preset.key];
}

function getStatusText(status: MinesweeperStatus, isZh: boolean): string {
  const labels: Record<MinesweeperStatus, { en: string; zh: string }> = {
    ready: { en: "Ready", zh: "待开始" },
    playing: { en: "Playing", zh: "进行中" },
    won: { en: "Cleared", zh: "已通关" },
    lost: { en: "Mine hit", zh: "踩雷" },
  };

  return isZh ? labels[status].zh : labels[status].en;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function getCellContent(cell: MinesweeperCell): string {
  if (!cell.isRevealed) return cell.isFlagged ? "F" : "";
  if (cell.isMine) return "*";
  return cell.adjacentMines > 0 ? String(cell.adjacentMines) : "";
}

function getCellClassName(cell: MinesweeperCell): string {
  const base =
    "flex h-8 w-8 items-center justify-center rounded-md border text-sm font-bold tabular transition sm:h-9 sm:w-9";

  if (cell.isRevealed && cell.isMine) {
    return `${base} border-destructive bg-destructive text-destructive-foreground`;
  }

  if (cell.isRevealed) {
    return `${base} border-border bg-background ${getNumberClassName(cell.adjacentMines)}`;
  }

  if (cell.isFlagged) {
    return `${base} border-primary bg-primary/10 text-primary hover:bg-primary/20`;
  }

  return `${base} border-border bg-secondary text-foreground shadow-sm hover:border-primary hover:bg-primary/10`;
}

function getNumberClassName(value: number): string {
  const colors: Record<number, string> = {
    1: "text-blue-700 dark:text-blue-300",
    2: "text-emerald-700 dark:text-emerald-300",
    3: "text-red-700 dark:text-red-300",
    4: "text-indigo-700 dark:text-indigo-300",
    5: "text-amber-700 dark:text-amber-300",
    6: "text-cyan-700 dark:text-cyan-300",
    7: "text-foreground",
    8: "text-muted-foreground",
  };

  return colors[value] ?? "text-muted-foreground";
}

function getCellAriaLabel(cell: MinesweeperCell, isZh: boolean): string {
  const row = cell.row + 1;
  const col = cell.col + 1;

  if (isZh) {
    if (cell.isFlagged && !cell.isRevealed) return `第 ${row} 行第 ${col} 列，已插旗`;
    if (!cell.isRevealed) return `第 ${row} 行第 ${col} 列，未翻开`;
    if (cell.isMine) return `第 ${row} 行第 ${col} 列，地雷`;
    return `第 ${row} 行第 ${col} 列，数字 ${cell.adjacentMines}`;
  }

  if (cell.isFlagged && !cell.isRevealed) return `Row ${row}, column ${col}, flagged`;
  if (!cell.isRevealed) return `Row ${row}, column ${col}, hidden`;
  if (cell.isMine) return `Row ${row}, column ${col}, mine`;
  return `Row ${row}, column ${col}, number ${cell.adjacentMines}`;
}
