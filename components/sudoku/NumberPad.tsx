"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSudokuStore } from "@/stores/sudoku-store";
import { trackInteraction } from "@/lib/analytics/events";
import { trackInteractionOncePerPuzzle } from "@/lib/analytics/once";
import { cn } from "@/lib/utils";

const NUMBER_PAD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const FEEDBACK_DURATION_MS = 1600;

const FEEDBACK_COPY = {
  en: {
    candidateAdded: (value: number) => `Candidate ${value} added`,
    candidateRemoved: (value: number) => `Candidate ${value} removed`,
    cleared: "Cell cleared",
    entered: (value: number) => `Entered ${value}`,
    givenSelected: "Given clue selected",
  },
  zh: {
    candidateAdded: (value: number) => `已添加候选 ${value}`,
    candidateRemoved: (value: number) => `已移除候选 ${value}`,
    cleared: "已清除",
    entered: (value: number) => `已填入 ${value}`,
    givenSelected: "已选中给定数",
  },
};

interface NumberPadProps {
  onNumberSelect?: (num: number) => void;
  showCandidates?: boolean;
}

export function NumberPad({ onNumberSelect, showCandidates = false }: NumberPadProps) {
  const t = useTranslations("game");
  const tActions = useTranslations("actions");
  const locale = useLocale();
  const feedbackCopy = locale === "zh" ? FEEDBACK_COPY.zh : FEEDBACK_COPY.en;
  const selectedCell = useSudokuStore((state) => state.selectedCell);
  const setCell = useSudokuStore((state) => state.setCell);
  const clearCell = useSudokuStore((state) => state.clearCell);
  const toggleCandidate = useSudokuStore((state) => state.toggleCandidate);
  const engine = useSudokuStore((state) => state.engine);
  const candidates = useSudokuStore((state) => state.candidates);
  const noteMode = useSudokuStore((state) => state.showCandidates);
  const difficulty = useSudokuStore((state) => state.difficulty);
  const puzzleId = useSudokuStore((state) => state.puzzleId);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedCellIsInitial = selectedCell
    ? engine?.isInitial(selectedCell) ?? false
    : false;
  const canEditSelectedCell = Boolean(selectedCell && !selectedCellIsInitial);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const showFeedback = (message: string) => {
    setFeedbackMessage(message);

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }

    feedbackTimerRef.current = setTimeout(() => {
      setFeedbackMessage(null);
      feedbackTimerRef.current = null;
    }, FEEDBACK_DURATION_MS);
  };

  const trackFirstNumberPadInput = (num: number) => {
    trackInteractionOncePerPuzzle("sudoku_first_number_input", puzzleId, {
      difficulty: difficulty ?? "",
      locale,
      note_mode: noteMode,
      source: "number_pad",
      value: num,
    });
    trackInteractionOncePerPuzzle("first_number_entered", puzzleId, {
      difficulty: difficulty ?? "",
      locale,
      note_mode: noteMode,
      source: "number_pad",
      value: num,
    });
  };

  const handleNumberClick = (num: number) => {
    if (selectedCell && !selectedCellIsInitial) {
      const currentValue = engine?.getValue(selectedCell) ?? 0;

      if (noteMode) {
        if (currentValue !== 0) return;

        const key = `${selectedCell.row},${selectedCell.col}`;
        const hadCandidate = candidates.get(key)?.has(num) ?? false;
        toggleCandidate(selectedCell, num);
        trackInteraction("sudoku_candidate_toggle", {
          difficulty: difficulty ?? "",
          input_method: "number_pad",
          puzzle_id: puzzleId ?? "",
          value: num,
        });
        showFeedback(
          hadCandidate
            ? feedbackCopy.candidateRemoved(num)
            : feedbackCopy.candidateAdded(num)
        );
      } else {
        if (currentValue === num) return;

        setCell(selectedCell, num);
        trackInteraction("sudoku_cell_input", {
          difficulty: difficulty ?? "",
          input_method: "number_pad",
          puzzle_id: puzzleId ?? "",
          value: num,
        });
        showFeedback(feedbackCopy.entered(num));
      }
      trackFirstNumberPadInput(num);
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
    if (selectedCell && !selectedCellIsInitial) {
      const key = `${selectedCell.row},${selectedCell.col}`;
      const hasValue = (engine?.getValue(selectedCell) ?? 0) !== 0;
      const hasCandidates = candidates.has(key);

      if (!hasValue && !hasCandidates) return;

      clearCell(selectedCell);
      trackInteraction("sudoku_cell_clear", {
        difficulty: difficulty ?? "",
        input_method: "number_pad",
        puzzle_id: puzzleId ?? "",
      });
      trackInteraction("cell_cleared", {
        difficulty: difficulty ?? "",
        input_method: "number_pad",
        puzzle_id: puzzleId ?? "",
      });
      showFeedback(feedbackCopy.cleared);
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
          {NUMBER_PAD_VALUES.map((num) => {
            const isPossibleValue = possibleValues.has(num);
            const isMarkedCandidate = selectedCandidateMarks.has(num);
            const isDisabled = !canEditSelectedCell;

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
                  isDisabled
                    ? "border-muted bg-muted/20 opacity-40 cursor-not-allowed"
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
            disabled={!canEditSelectedCell}
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

        {selectedCellIsInitial && (
          <p className="text-xs text-center text-muted-foreground" role="status">
            {feedbackCopy.givenSelected}
          </p>
        )}

        {selectedCell && showCandidates && (noteMode || possibleValues.size > 0) && (
          <p className="text-xs text-center text-muted-foreground">
            {noteMode
              ? t("noteMode")
              : t("possibleValues", { values: Array.from(possibleValues).sort().join(", ") })}
          </p>
        )}

        {feedbackMessage && (
          <p
            className="mt-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-center text-xs font-medium text-primary"
            role="status"
            aria-live="polite"
          >
            {feedbackMessage}
          </p>
        )}
      </div>
    </div>
  );
}
