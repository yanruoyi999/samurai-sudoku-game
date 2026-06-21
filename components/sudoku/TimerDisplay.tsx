"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSudokuStore } from "@/stores/sudoku-store";
import { formatTime } from "@/lib/utils";

export function TimerDisplay() {
  const t = useTranslations("actions");
  const { startTime, elapsedTime, isPaused, updateElapsedTime } =
    useSudokuStore();
  const [currentTime, setCurrentTime] = useState(elapsedTime);

  useEffect(() => {
    if (!startTime || isPaused) {
      setCurrentTime(elapsedTime);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setCurrentTime(elapsed);
      updateElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isPaused, elapsedTime, updateElapsedTime]);

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
