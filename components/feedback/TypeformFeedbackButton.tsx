"use client";

import { usePathname } from "next/navigation";

const formUrl =
  process.env.NEXT_PUBLIC_SUDOKU_TYPEFORM_URL ||
  process.env.NEXT_PUBLIC_TYPEFORM_URL ||
  "";
const formId =
  process.env.NEXT_PUBLIC_SUDOKU_TYPEFORM_FORM_ID ||
  process.env.NEXT_PUBLIC_TYPEFORM_FORM_ID ||
  "";

function buildTypeformHref(locale: string, pathname: string | null) {
  const base = formUrl || (formId ? `https://form.typeform.com/to/${formId}` : "");
  if (!base) return "";

  try {
    const url = new URL(base);
    url.searchParams.set("source", "samurai-sudoku");
    url.searchParams.set("locale", locale);
    if (pathname) {
      url.searchParams.set("page", pathname);
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
  const isZh = locale === "zh";
  const typeformHref = buildTypeformHref(locale, pathname);
  const fallbackHref = `mailto:feedback@samuraisudoku.net?subject=${encodeURIComponent(
    isZh ? "武士数独反馈" : "Samurai Sudoku feedback",
  )}`;

  return (
    <a
      href={typeformHref || fallbackHref}
      target={typeformHref ? "_blank" : undefined}
      rel={typeformHref ? "noopener noreferrer" : undefined}
      aria-label={isZh ? "反馈武士数独题目" : "Send Samurai Sudoku feedback"}
      className="fixed bottom-5 right-5 z-40 rounded-full border border-primary/20 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
    >
      {isZh ? "反馈题目" : "Feedback"}
    </a>
  );
}
