import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { PrintButton } from "@/components/printable/PrintButton";
import {
  PrintablePageStyle,
  PrintableSamuraiBoard,
} from "@/components/printable/PrintableSamuraiBoard";
import { locales } from "@/i18n";
import { isPuzzleId } from "@/lib/puzzle-id";
import { getPuzzle, getPuzzleIndex } from "@/lib/puzzles";
import {
  getGlobalInitialBoard,
  getGlobalSolutionBoard,
} from "@/lib/sudoku/solution-counter";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface PrintablePuzzlePageProps {
  params: Promise<{ locale: string; id: string }>;
}

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
      <PrintablePageStyle />

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
        <PrintableSamuraiBoard
          board={initialBoard}
          title={isZh ? "题面" : "Puzzle"}
        />
        <PrintableSamuraiBoard
          board={solutionBoard}
          title={isZh ? "答案" : "Answer key"}
          isAnswer
          forcePageBreak
        />
      </div>
    </main>
  );
}
