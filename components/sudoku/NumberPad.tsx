"use client";

import { useTranslations } from "next-intl";
import { useSudokuStore } from "@/stores/sudoku-store";
import { cn } from "@/lib/utils";

interface NumberPadProps {
  onNumberSelect?: (num: number) => void;
  showCandidates?: boolean;
}

export function NumberPad({ onNumberSelect, showCandidates = false }: NumberPadProps) {
  const t = useTranslations("game");
  const { selectedCell, setCell, engine } = useSudokuStore();

  const handleNumberClick = (num: number) => {
    if (selectedCell) {
      setCell(selectedCell, num);
    }

    if (onNumberSelect) {
      onNumberSelect(num);
    }

    // Optional: vibrate on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleClear = () => {
    if (selectedCell) {
      setCell(selectedCell, 0);
    }
  };

  // Get candidates for selected cell
  const candidates = selectedCell && engine
    ? engine.getCandidates(selectedCell)
    : new Set<number>();

  return (
    <div className="w-full bg-background border-t p-4">
      <div className="max-w-md mx-auto">
        {/* Number Grid */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const isCandidate = candidates.has(num);
            const isDisabled = !selectedCell;

            return (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={isDisabled}
                className={cn(
                  "aspect-square rounded-lg font-semibold text-xl",
                  "border-2 transition-all active:scale-95",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  isDisabled
                    ? "border-muted bg-muted/20"
                    : showCandidates && !isCandidate
                    ? "border-muted bg-muted/20 opacity-50"
                    : "border-primary hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {num}
              </button>
            );
          })}

          {/* Clear Button */}
          <button
            onClick={handleClear}
            disabled={!selectedCell}
            className={cn(
              "aspect-square rounded-lg font-semibold",
              "border-2 border-destructive text-destructive",
              "hover:bg-destructive hover:text-destructive-foreground",
              "transition-all active:scale-95",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            ⌫
          </button>
        </div>

        {/* Hint */}
        {!selectedCell && (
          <p className="text-xs text-center text-muted-foreground">
            {t("selectCellPrompt")}
          </p>
        )}

        {selectedCell && showCandidates && candidates.size > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            {t("possibleValues", { values: Array.from(candidates).sort().join(", ") })}
          </p>
        )}
      </div>
    </div>
  );
}
