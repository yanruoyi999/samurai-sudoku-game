"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSudokuStore } from "@/stores/sudoku-store";
import { formatTime } from "@/lib/utils";

export function TimerDisplay() {
  const t = useTranslations("actions");
  const startTime = useSudokuStore((state) => state.startTime);
  const elapsedTime = useSudokuStore((state) => state.elapsedTime);
  const isPaused = useSudokuStore((state) => state.isPaused);
  const updateElapsedTime = useSudokuStore((state) => state.updateElapsedTime);
  const [currentTime, setCurrentTime] = useState(elapsedTime);

  useEffect(() => {
    if (!startTime || isPaused) {
      setCurrentTime(elapsedTime);
    }
  }, [startTime, isPaused, elapsedTime]);

  useEffect(() => {
    if (!startTime || isPaused) return;

    const interval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setCurrentTime(elapsed);
      updateElapsedTime(elapsed);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [startTime, isPaused, updateElapsedTime]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">⏱️</span>
      <span className="font-mono font-semibold">{formatTime(currentTime)}</span>
      {isPaused && (
        <span className="text-xs text-muted-foreground">({t("paused")})</span>
      )}
    </div>
  );
}
