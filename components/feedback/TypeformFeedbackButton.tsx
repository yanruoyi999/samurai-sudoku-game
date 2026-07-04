"use client";

import { usePathname } from "next/navigation";

import { trackInteraction } from "@/lib/analytics/events";
import { useSudokuStore } from "@/stores/sudoku-store";

const formUrl =
  process.env.NEXT_PUBLIC_SUDOKU_TYPEFORM_URL ||
  process.env.NEXT_PUBLIC_TYPEFORM_URL ||
  "";
const formId =
  process.env.NEXT_PUBLIC_SUDOKU_TYPEFORM_FORM_ID ||
  process.env.NEXT_PUBLIC_TYPEFORM_FORM_ID ||
  "";

function buildTypeformHref({
  locale,
  pathname,
  puzzleId,
  difficulty,
  status,
}: {
  locale: string;
  pathname: string | null;
  puzzleId?: string;
  difficulty?: string;
  status?: string;
}) {
  const base = formUrl || (formId ? `https://form.typeform.com/to/${formId}` : "");
  if (!base) return "";

  try {
    const url = new URL(base);
    url.searchParams.set("source", "samurai-sudoku");
    url.searchParams.set("locale", locale);
    if (pathname) {
      url.searchParams.set("page", pathname);
    }
    if (puzzleId) {
      url.searchParams.set("puzzle_id", puzzleId);
    }
    if (difficulty) {
      url.searchParams.set("difficulty", difficulty);
    }
    if (status) {
      url.searchParams.set("status", status);
    }
    return url.toString();
  } catch {
    return "";
  }
}

interface TypeformFeedbackButtonProps {
  locale: string;
}

export function TypeformFeedbackButton({ locale }: TypeformFeedbackButtonProps) {
  const pathname = usePathname();
  const { difficulty, puzzleId, status } = useSudokuStore();
  const isZh = locale === "zh";
  const routePuzzleId = pathname?.match(/\/games\/samurai\/(\d{4}-\d{2}-\d{2})/)?.[1];
  const effectivePuzzleId = puzzleId ?? routePuzzleId;
  const typeformHref = buildTypeformHref({
    locale,
    pathname,
    puzzleId: effectivePuzzleId ?? undefined,
    difficulty: difficulty ?? undefined,
    status,
  });
  const fallbackHref = `mailto:feedback@samuraisudoku.net?subject=${encodeURIComponent(
    isZh
      ? `武士数独反馈${effectivePuzzleId ? ` ${effectivePuzzleId}` : ""}`
      : `Samurai Sudoku feedback${effectivePuzzleId ? ` ${effectivePuzzleId}` : ""}`,
  )}`;

  return (
    <a
      href={typeformHref || fallbackHref}
      target={typeformHref ? "_blank" : undefined}
      rel={typeformHref ? "noopener noreferrer" : undefined}
      onClick={() =>
        trackInteraction("feedback_open", {
          locale,
          difficulty: difficulty ?? "",
          page: pathname ?? "",
          puzzle_id: effectivePuzzleId ?? "",
          source: typeformHref ? "typeform" : "email_fallback",
          status,
        })
      }
      aria-label={isZh ? "反馈武士数独题目" : "Send Samurai Sudoku feedback"}
      className="fixed bottom-24 right-4 z-40 rounded-full border border-primary/20 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90 md:bottom-5 md:right-5"
    >
      {isZh ? "反馈题目" : "Feedback"}
    </a>
  );
}
