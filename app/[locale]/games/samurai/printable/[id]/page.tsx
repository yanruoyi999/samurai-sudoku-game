import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { PrintButton } from "@/components/printable/PrintButton";
import { locales } from "@/i18n";
import { isPuzzleId } from "@/lib/puzzle-id";
import { getPuzzle, getPuzzleIndex } from "@/lib/puzzles";
import { globalToLocal } from "@/lib/sudoku/coordinates";
import {
  getGlobalInitialBoard,
  getGlobalSolutionBoard,
} from "@/lib/sudoku/solution-counter";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface PrintablePuzzlePageProps {
  params: Promise<{ locale: string; id: string }>;
}

const BOARD_SIZE = 21;

export async function generateStaticParams() {
  const index = await getPuzzleIndex();

  return locales.flatMap((locale) =>
    index.puzzles.map((puzzle) => ({
      locale,
      id: puzzle.id,
    })),
  );
}

export async function generateMetadata({
  params,
}: PrintablePuzzlePageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const isZh = locale === "zh";

  if (!isPuzzleId(id)) {
    return {
      title: isZh ? "可打印武士数独" : "Printable Samurai Sudoku",
      robots: { index: false, follow: true },
    };
  }

  const path = `/games/samurai/printable/${id}`;
  const canonical = buildLocalizedUrl(locale, path);
  const title = isZh
    ? `${id} 可打印武士数独题面与答案`
    : `${id} Printable Samurai Sudoku Puzzle and Answer`;
  const description = isZh
    ? `打印 ${id} 武士数独题面和答案页。适合纸笔练习，完成后可回到线上题目检查。`
    : `Print the ${id} Samurai Sudoku puzzle sheet and answer key for paper practice, then return online to check progress.`;

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical,
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
    },
  };
}

function getCellBorderStyle(row: number, col: number): CSSProperties {
  const locals = globalToLocal({ row, col });
  const hasTopEdge = locals.some((local) => local.row === 0 || local.row % 3 === 0);
  const hasLeftEdge = locals.some((local) => local.col === 0 || local.col % 3 === 0);
  const hasBottomEdge = locals.some((local) => local.row === 8);
  const hasRightEdge = locals.some((local) => local.col === 8);

  return {
    borderTopWidth: hasTopEdge ? 2 : 1,
    borderLeftWidth: hasLeftEdge ? 2 : 1,
    borderBottomWidth: hasBottomEdge ? 2 : 1,
    borderRightWidth: hasRightEdge ? 2 : 1,
  };
}

function PrintableBoard({
  board,
  title,
  isAnswer = false,
}: {
  board: number[][];
  title: string;
  isAnswer?: boolean;
}) {
  return (
    <section className={isAnswer ? "break-before-page pt-8 print:pt-0" : ""}>
      <h2 className="mb-3 text-xl font-semibold print:text-base">{title}</h2>
      <div
        className="grid w-full max-w-[9.2in] border-2 border-foreground bg-white text-foreground shadow-sm print:max-w-none print:shadow-none"
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
          const row = Math.floor(index / BOARD_SIZE);
          const col = index % BOARD_SIZE;
          const locals = globalToLocal({ row, col });
          const isPlayable = locals.length > 0;
          const value = board[row]?.[col] ?? 0;
          const isOverlap = locals.length > 1;

          if (!isPlayable) {
            return (
              <div
                key={`${row}-${col}`}
                className="aspect-square bg-transparent"
                aria-hidden="true"
              />
            );
          }

          return (
            <div
              key={`${row}-${col}`}
              className={[
                "flex aspect-square items-center justify-center border-slate-700 text-center font-semibold",
                "text-[clamp(0.48rem,2.1vw,1.05rem)] print:text-[9px]",
                isOverlap ? "bg-primary/10" : "bg-white",
                isAnswer ? "text-slate-700" : "text-slate-950",
              ].join(" ")}
              style={getCellBorderStyle(row, col)}
            >
              {value === 0 ? "" : value}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default async function PrintablePuzzlePage({
  params,
}: PrintablePuzzlePageProps) {
  const { locale, id } = await params;
  if (!isPuzzleId(id)) notFound();

  const puzzle = await getPuzzle(id);
  if (!puzzle) notFound();

  const isZh = locale === "zh";
  const initialBoard = getGlobalInitialBoard(puzzle);
  const solutionBoard = getGlobalSolutionBoard(puzzle);
  const onlineHref = `/${locale}/games/samurai/${id}`;
  const archiveHref = `/${locale}/games/samurai/archive`;
  const pageUrl = buildAbsoluteUrl(`/${locale}/games/samurai/printable/${id}`);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isZh ? "首页" : "Home",
        item: buildAbsoluteUrl(`/${locale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Samurai Sudoku",
        item: buildAbsoluteUrl(`/${locale}/games/samurai`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: isZh ? "可打印题面" : "Printable puzzle",
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <style>
        {`
          @media print {
            @page { size: letter portrait; margin: 0.35in; }
            .no-print { display: none !important; }
            body { background: white !important; }
          }
        `}
      </style>

      <nav
        className="no-print mb-5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link href={`/${locale}`} className="hover:text-foreground">
          {isZh ? "首页" : "Home"}
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/${locale}/games/samurai`} className="hover:text-foreground">
          Samurai Sudoku
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/${locale}/games/samurai/printable`} className="hover:text-foreground">
          {isZh ? "可打印" : "Printable"}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{id}</span>
      </nav>

      <header className="mb-6 flex flex-col gap-5 border-b pb-5 print:mb-4 print:gap-2 print:pb-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary print:text-xs">
            {isZh ? "可打印武士数独" : "Printable Samurai Sudoku"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight print:text-2xl">
            {isZh ? `${id} 题面与答案` : `${id} puzzle sheet and answer key`}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground print:text-xs">
            {isZh
              ? "先打印题面页进行纸笔推理；答案页会单独分页，适合完成后核对。重叠区使用浅色底标出。"
              : "Print the puzzle page for paper solving; the answer key starts on a separate page for checking after you finish. Overlap zones are lightly shaded."}
          </p>
        </div>

        <div className="no-print flex flex-wrap gap-3">
          <PrintButton locale={locale} puzzleId={id} difficulty={puzzle.difficulty} />
          <Link
            href={onlineHref}
            className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            {isZh ? "在线游玩这道题" : "Play this puzzle online"}
          </Link>
          <Link
            href={archiveHref}
            className="rounded-lg border px-5 py-3 font-semibold transition-colors hover:bg-accent"
          >
            {isZh ? "返回题库" : "Back to archive"}
          </Link>
          <TrackedLink
            href={`/${locale}/games/samurai/pdf`}
            eventName="pdf_pack_printable_page_click"
            eventProperties={{
              locale,
              puzzle_id: id,
              difficulty: puzzle.difficulty,
              location: "printable_puzzle_page",
            }}
            className="rounded-lg border px-5 py-3 font-semibold transition-colors hover:bg-accent"
          >
            {isZh ? "查看 PDF 打印包" : "View PDF pack"}
          </TrackedLink>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-3 print:grid-cols-3 print:text-xs">
          <div className="rounded-lg border bg-secondary/30 p-3 print:border-slate-300 print:bg-white">
            <dt className="text-muted-foreground">{isZh ? "难度" : "Difficulty"}</dt>
            <dd className="mt-1 font-semibold capitalize">{puzzle.difficulty}</dd>
          </div>
          <div className="rounded-lg border bg-secondary/30 p-3 print:border-slate-300 print:bg-white">
            <dt className="text-muted-foreground">{isZh ? "预计时间" : "Estimated time"}</dt>
            <dd className="mt-1 font-semibold">
              {puzzle.metadata.estimatedTime} {isZh ? "分钟" : "minutes"}
            </dd>
          </div>
          <div className="rounded-lg border bg-secondary/30 p-3 print:border-slate-300 print:bg-white">
            <dt className="text-muted-foreground">{isZh ? "可见格子" : "Visible cells"}</dt>
            <dd className="mt-1 font-semibold">369</dd>
          </div>
        </dl>
      </header>

      <div className="space-y-8 print:space-y-4">
        <PrintableBoard
          board={initialBoard}
          title={isZh ? "题面" : "Puzzle"}
        />
        <PrintableBoard
          board={solutionBoard}
          title={isZh ? "答案" : "Answer key"}
          isAnswer
        />
      </div>
    </main>
  );
}
