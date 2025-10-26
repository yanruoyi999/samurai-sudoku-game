"use client";

import { useSudokuStore } from "@/stores/sudoku-store";
import { formatTime } from "@/lib/utils";

export function StatsPanel() {
  const {
    elapsedTime,
    hintsUsed,
    engine,
    difficulty,
    history
  } = useSudokuStore();

  const completion = engine?.getCompletionPercentage() || 0;
  const movesCount = history.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
      <StatItem
        label="Time"
        value={formatTime(elapsedTime)}
        icon="⏱️"
      />

      <StatItem
        label="Progress"
        value={`${completion}%`}
        icon="📊"
      />

      <StatItem
        label="Hints"
        value={hintsUsed.toString()}
        icon="💡"
      />

      <StatItem
        label="Moves"
        value={movesCount.toString()}
        icon="🎯"
      />

      {difficulty && (
        <div className="col-span-2 md:col-span-4 text-center text-sm text-muted-foreground">
          Difficulty: <span className="font-semibold capitalize">{difficulty}</span>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-background rounded border">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
