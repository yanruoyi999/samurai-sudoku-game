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
  const tActions = useTranslations("actions");
  const {
    selectedCell,
    setCell,
    clearCell,
    toggleCandidate,
    engine,
    candidates,
    showCandidates: noteMode,
  } = useSudokuStore();

  const handleNumberClick = (num: number) => {
    if (selectedCell) {
      if (noteMode) {
        toggleCandidate(selectedCell, num);
      } else {
        setCell(selectedCell, num);
      }
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
      clearCell(selectedCell);
    }
  };

  // Get candidates for selected cell
  const possibleValues = selectedCell && engine
    ? engine.getCandidates(selectedCell)
    : new Set<number>();
  const selectedCandidateMarks = selectedCell
    ? candidates.get(`${selectedCell.row},${selectedCell.col}`) ?? new Set<number>()
    : new Set<number>();

  return (
    <div className="w-full bg-background border-t p-4">
      <div className="max-w-md mx-auto">
        {/* Number Grid */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const isPossibleValue = possibleValues.has(num);
            const isMarkedCandidate = selectedCandidateMarks.has(num);
            const isDisabled = !selectedCell;

            return (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={isDisabled}
                aria-label={
                  noteMode
                    ? `${tActions('candidates')} ${num}`
                    : t("enterNumber", { value: num })
                }
                aria-pressed={noteMode ? isMarkedCandidate : undefined}
                title={noteMode ? `${tActions('candidates')} ${num}` : String(num)}
                className={cn(
                  "aspect-square rounded-lg font-semibold text-xl",
                  "border-2 transition-all active:scale-95",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  isDisabled
                    ? "border-muted bg-muted/20"
                    : noteMode && isMarkedCandidate
                    ? "border-primary bg-primary text-primary-foreground"
                    : showCandidates && possibleValues.size > 0 && !isPossibleValue
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
            aria-label={tActions('clear')}
            title={tActions('clear')}
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

        {selectedCell && showCandidates && (noteMode || possibleValues.size > 0) && (
          <p className="text-xs text-center text-muted-foreground">
            {noteMode
              ? t("noteMode")
              : t("possibleValues", { values: Array.from(possibleValues).sort().join(", ") })}
          </p>
        )}
      </div>
    </div>
  );
}
