import type { Metadata } from "next";
import Link from "next/link";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { PrintPackButton } from "@/components/printable/PrintPackButton";
import {
  PrintablePageStyle,
  PrintableSamuraiBoard,
} from "@/components/printable/PrintableSamuraiBoard";
import { selectPrintableStarterPack } from "@/lib/printable-pack";
import { getPuzzle, getPuzzleIndex } from "@/lib/puzzles";
import {
  getGlobalInitialBoard,
  getGlobalSolutionBoard,
} from "@/lib/sudoku/solution-counter";
import type { Puzzle } from "@/lib/sudoku/types";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface SamuraiPdfSamplePageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ paper?: string }>;
}

const PATH = "/games/samurai/pdf/sample";
const PACK_ID = "samurai-sudoku-starter-pack-20";

export async function generateMetadata({
  params,
}: SamuraiPdfSamplePageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? "免费武士数独 PDF 打印包 — 20 题与答案"
    : "Free Samurai Sudoku PDF Starter Pack — 20 Puzzles and Answers";
  const description = isZh
    ? "打印免费的武士数独 PDF starter pack，包含 20 道 Easy、Medium、Hard、Expert 难度题面与答案页。"
    : "Print a free Samurai Sudoku PDF starter pack with 20 Easy, Medium, Hard, and Expert puzzle sheets plus answer keys.";

  return {
    title,
    description,
    keywords: isZh
      ? ["免费武士数独 PDF", "武士数独样稿", "可打印武士数独", "数独 PDF 答案"]
      : [
          "free samurai sudoku pdf",
          "samurai sudoku sample pack",
          "printable samurai sudoku with answers",
          "sudoku pdf sample",
        ],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

async function getSamplePuzzles(): Promise<Puzzle[]> {
  const index = await getPuzzleIndex();
  const selectedIds = selectPrintableStarterPack(index.puzzles).map((puzzle) => puzzle.id);

  const puzzles = await Promise.all(selectedIds.map((id) => getPuzzle(id)));
  return puzzles.filter((puzzle): puzzle is Puzzle => Boolean(puzzle));
}

export default async function SamuraiPdfSamplePage({
  params,
  searchParams,
}: SamuraiPdfSamplePageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const isZh = locale === "zh";
  const paperSize = resolvedSearchParams?.paper === "a4" ? "a4" : "letter";
  const puzzles = await getSamplePuzzles();
  const pageUrl = buildAbsoluteUrl(`/${locale}${PATH}`);
  const pdfPackHref = `/${locale}/games/samurai/pdf`;
  const archiveHref = `/${locale}/games/samurai/archive`;

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
        name: isZh ? "PDF 免费包" : "PDF starter pack",
        item: pageUrl,
      },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: isZh ? "免费武士数独 PDF 打印包" : "Free Samurai Sudoku PDF Starter Pack",
    url: pageUrl,
    inLanguage: isZh ? "zh-CN" : "en-US",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: puzzles.length,
      itemListElement: puzzles.map((puzzle, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${puzzle.id} ${puzzle.difficulty} Samurai Sudoku`,
        url: buildAbsoluteUrl(`/${locale}/games/samurai/${puzzle.id}`),
      })),
    },
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
      {[breadcrumbJsonLd, collectionJsonLd].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <PrintablePageStyle paperSize={paperSize} />

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
        <Link href={pdfPackHref} className="hover:text-foreground">
          {isZh ? "PDF 打印包" : "PDF Pack"}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{isZh ? "免费包" : "Starter pack"}</span>
      </nav>

      <header className="mb-6 flex flex-col gap-5 border-b pb-5 print:mb-4 print:gap-2 print:pb-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary print:text-xs">
            {isZh ? "免费 PDF 打印包" : "Free PDF starter pack"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight print:text-2xl">
            {isZh ? "武士数独 PDF 免费打印包" : "Samurai Sudoku PDF Starter Pack"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground print:text-xs">
            {isZh
              ? "这份免费包包含 20 道题，覆盖 Easy、Medium、Hard、Expert 难度。打印时题面和答案分开分页；也可以在浏览器打印窗口中选择保存为 PDF。"
              : "This free pack includes 20 puzzles across Easy, Medium, Hard, and Expert. Puzzle sheets and answer keys are separated by page breaks; use your browser print dialog to save as PDF."}
          </p>
        </div>

        <div className="no-print flex flex-wrap gap-3">
          <PrintPackButton locale={locale} packId={PACK_ID} puzzleCount={puzzles.length} />
          <TrackedLink
            href={pdfPackHref}
            eventName="pdf_sample_pack_cta_click"
            eventProperties={{ locale, location: "pdf_sample_header" }}
            className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            {isZh ? "查看完整 PDF 包" : "View full PDF pack"}
          </TrackedLink>
          <Link
            href={archiveHref}
            className="rounded-lg border px-5 py-3 font-semibold transition-colors hover:bg-accent"
          >
            {isZh ? "返回题库" : "Back to archive"}
          </Link>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-3 print:grid-cols-3 print:text-xs">
          <div className="rounded-lg border bg-secondary/30 p-3 print:border-slate-300 print:bg-white">
            <dt className="text-muted-foreground">{isZh ? "题目数量" : "Puzzle count"}</dt>
            <dd className="mt-1 font-semibold">{puzzles.length}</dd>
          </div>
          <div className="rounded-lg border bg-secondary/30 p-3 print:border-slate-300 print:bg-white">
            <dt className="text-muted-foreground">{isZh ? "难度覆盖" : "Difficulties"}</dt>
            <dd className="mt-1 font-semibold">Easy / Medium / Hard / Expert</dd>
          </div>
          <div className="rounded-lg border bg-secondary/30 p-3 print:border-slate-300 print:bg-white">
            <dt className="text-muted-foreground">{isZh ? "答案页" : "Answer keys"}</dt>
            <dd className="mt-1 font-semibold">{isZh ? "包含" : "Included"}</dd>
          </div>
        </dl>
      </header>

      <section className="space-y-8 print:space-y-4">
        {puzzles.map((puzzle, index) => (
          <PrintableSamuraiBoard
            key={puzzle.id}
            board={getGlobalInitialBoard(puzzle)}
            title={
              isZh
                ? `${index + 1}. ${puzzle.id} 题面 (${puzzle.difficulty})`
                : `${index + 1}. ${puzzle.id} puzzle (${puzzle.difficulty})`
            }
            forcePageBreak={index > 0}
          />
        ))}
      </section>

      <section className="mt-8 space-y-8 print:mt-0 print:space-y-4">
        {puzzles.map((puzzle, index) => (
          <PrintableSamuraiBoard
            key={`${puzzle.id}-answer`}
            board={getGlobalSolutionBoard(puzzle)}
            title={
              isZh
                ? `${index + 1}. ${puzzle.id} 答案 (${puzzle.difficulty})`
                : `${index + 1}. ${puzzle.id} answer key (${puzzle.difficulty})`
            }
            isAnswer
            forcePageBreak
          />
        ))}
      </section>
    </main>
  );
}
