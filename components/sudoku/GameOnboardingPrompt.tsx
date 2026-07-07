"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";

import { trackInteractionOncePerPuzzle } from "@/lib/analytics/once";
import { cn } from "@/lib/utils";
import { useSudokuStore } from "@/stores/sudoku-store";

const IDLE_PROMPT_DELAY_MS = 5_000;

const COPY = {
  en: {
    idleNoCell: "Try one empty cell first. Overlap boxes are usually the easiest place to start.",
    idleWithCell: "Now tap a number below. If it is only a possibility, switch on Candidates first.",
  },
  zh: {
    idleNoCell: "先从一个空格开始。重叠的 3x3 区域通常更容易打开局面。",
    idleWithCell: "现在点下方数字。如果只是可能答案，先切到候选模式。",
  },
};

interface GameOnboardingPromptProps {
  className?: string;
}

export function GameOnboardingPrompt({ className }: GameOnboardingPromptProps) {
  const locale = useLocale();
  const puzzleId = useSudokuStore((state) => state.puzzleId);
  const difficulty = useSudokuStore((state) => state.difficulty);
  const selectedCell = useSudokuStore((state) => state.selectedCell);
  const historyIndex = useSudokuStore((state) => state.historyIndex);
  const showCandidates = useSudokuStore((state) => state.showCandidates);
  const status = useSudokuStore((state) => state.status);
  const [showIdlePrompt, setShowIdlePrompt] = useState(false);
  const selectedCellRef = useRef(selectedCell);
  const showCandidatesRef = useRef(showCandidates);

  selectedCellRef.current = selectedCell;
  showCandidatesRef.current = showCandidates;

  const copy = locale === "zh" ? COPY.zh : COPY.en;
  const hasStartedInput = historyIndex >= 0;
  const shouldShow = status === "playing" && !hasStartedInput;

  useEffect(() => {
    setShowIdlePrompt(false);

    if (!shouldShow) return;

    const timer = window.setTimeout(() => {
      setShowIdlePrompt(true);
      trackInteractionOncePerPuzzle("hint_needed_after_idle", puzzleId, {
        candidate_mode: showCandidatesRef.current,
        difficulty: difficulty ?? "",
        has_selected_cell: Boolean(selectedCellRef.current),
        idle_seconds: IDLE_PROMPT_DELAY_MS / 1000,
        locale,
      });
    }, IDLE_PROMPT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [difficulty, locale, puzzleId, shouldShow]);

  const message = useMemo(() => {
    return selectedCell ? copy.idleWithCell : copy.idleNoCell;
  }, [copy.idleNoCell, copy.idleWithCell, selectedCell]);

  if (!shouldShow || !showIdlePrompt) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-sm leading-6 text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
