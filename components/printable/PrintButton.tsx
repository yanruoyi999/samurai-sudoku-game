"use client";

import { trackInteraction } from "@/lib/analytics/events";
import { PRINT_PUZZLE_EVENT } from "@/lib/analytics/event-names";

interface PrintButtonProps {
  locale: string;
  puzzleId: string;
  difficulty: string;
}

export function PrintButton({ locale, puzzleId, difficulty }: PrintButtonProps) {
  const handlePrint = () => {
    trackInteraction(PRINT_PUZZLE_EVENT, {
      locale,
      puzzle_id: puzzleId,
      difficulty,
      location: "printable_puzzle_page",
    });
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
    >
      {locale === "zh" ? "打印题面与答案" : "Print puzzle and answer"}
    </button>
  );
}
