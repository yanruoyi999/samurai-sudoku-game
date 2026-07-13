import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import {
  PRINTABLE_STARTER_DIFFICULTIES,
  groupPrintablePackByDifficulty,
  getPrintableDifficultyLabel,
  selectPrintableStarterPack,
} from "@/lib/printable-pack";
import { getPuzzle, getPuzzleIndex } from "@/lib/puzzles";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";
import { globalToLocal } from "@/lib/sudoku/coordinates";
import { getGlobalInitialBoard } from "@/lib/sudoku/solution-counter";
import type { Difficulty, Puzzle, PuzzleMetadata } from "@/lib/sudoku/types";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = "/printable-samurai-sudoku";
const PAID_PACK_PRICE = process.env.NEXT_PUBLIC_SUDOKU_PDF_PACK_PRICE || "$4.99";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? "免费可打印武士数独题目 - PDF 与答案"
    : "Free Printable Samurai Sudoku Puzzles - PDF With Solutions";
  const description = isZh
    ? "免费下载可打印武士数独题目，包含 Easy、Medium、Hard、Expert 难度、答案页，并支持 A4 和 US Letter 打印。"
    : "Download free printable Samurai Sudoku puzzles in Easy, Medium, Hard, and Expert levels. Each PDF includes solutions and supports A4 and US Letter paper.";

  return {
    title,
    description,
    keywords: isZh
      ? ["可打印武士数独", "免费武士数独 PDF", "武士数独答案", "打印数独题"]
      : [
          "samurai sudoku printable",
          "free printable samurai sudoku",
          "samurai sudoku printable pdf",
          "printable samurai sudoku puzzles",
          "samurai sudoku printable free",
        ],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

async function getPreviewPuzzle(puzzles: PuzzleMetadata[]) {
  const firstPuzzle = puzzles[0];
  if (!firstPuzzle) return null;
  return getPuzzle(firstPuzzle.id);
}

function difficultySummary(difficulty: Difficulty, puzzles: PuzzleMetadata[], locale: string) {
  const firstPuzzle = puzzles[0];
  return {
    label: getPrintableDifficultyLabel(difficulty, locale),
    count: puzzles.length,
    firstPuzzle,
    description:
      locale === "zh"
        ? {
            easy: "适合第一次打印、课堂练习和轻松纸笔推理。",
            medium: "适合熟悉重叠宫后做稳定候选数训练。",
            hard: "适合长时间纸笔练习，需要持续复查候选数。",
            evil: "Expert 极难题，适合想挑战完整五宫联动的玩家。",
          }[difficulty]
        : {
            easy: "Best for first printable sessions, classrooms, and relaxed paper solving.",
            medium: "Good once you understand overlap boxes and want steady candidate practice.",
            hard: "Built for longer paper sessions with careful candidate review.",
            evil: "Expert-level puzzles for players who want full five-grid deduction.",
          }[difficulty],
  };
}

function MiniSamuraiPreview({ puzzle }: { puzzle: Puzzle | null }) {
  const board = puzzle ? getGlobalInitialBoard(puzzle) : Array.from({ length: 21 }, () => Array(21).fill(0));

  return (
    <div
      className="grid aspect-square w-full max-w-[420px] border-2 border-foreground bg-white text-[7px] text-slate-950 shadow-sm sm:text-[9px]"
      style={{ gridTemplateColumns: "repeat(21, minmax(0, 1fr))" }}
      aria-label="Samurai Sudoku printable puzzle preview"
    >
      {Array.from({ length: 21 * 21 }, (_, index) => {
        const row = Math.floor(index / 21);
        const col = index % 21;
        const locals = globalToLocal({ row, col });
        const value = board[row]?.[col] ?? 0;

        if (locals.length === 0) {
          return <span key={`${row}-${col}`} className="aspect-square bg-transparent" aria-hidden />;
        }

        const hasTopEdge = locals.some((local) => local.row === 0 || local.row % 3 === 0);
        const hasLeftEdge = locals.some((local) => local.col === 0 || local.col % 3 === 0);
        const hasBottomEdge = locals.some((local) => local.row === 8);
        const hasRightEdge = locals.some((local) => local.col === 8);

        return (
          <span
            key={`${row}-${col}`}
            className={[
              "flex aspect-square items-center justify-center border-slate-700 font-semibold",
              locals.length > 1 ? "bg-primary/10" : "bg-white",
            ].join(" ")}
            style={{
              borderTopWidth: hasTopEdge ? 2 : 1,
              borderLeftWidth: hasLeftEdge ? 2 : 1,
              borderBottomWidth: hasBottomEdge ? 2 : 1,
              borderRightWidth: hasRightEdge ? 2 : 1,
            }}
          >
            {value || ""}
          </span>
        );
      })}
    </div>
  );
}

export default async function PrintableSamuraiSudokuResourcePage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const index = await getPuzzleIndex();
  const packPuzzles = selectPrintableStarterPack(index.puzzles);
  const grouped = groupPrintablePackByDifficulty(packPuzzles);
  const previewPuzzle = await getPreviewPuzzle(packPuzzles);
  const pageUrl = buildAbsoluteUrl(`/${locale}${PATH}`);
  const sampleHref = `/${locale}/games/samurai/pdf/sample?paper=letter&layout=one`;
  const onlineHref = `/${locale}/games/samurai`;
  const dailyHref = `/${locale}/games/samurai/daily`;
  const paperPracticeHref = `/${locale}/games/samurai/paper-practice`;
  const rulesHref = `/${locale}/games/samurai/how-to-play`;
  const strategyHref = `/${locale}/games/samurai/strategy-guide`;
  const solverHref = `/${locale}/games/samurai/solver`;
  const paidPackHref = `/${locale}/games/samurai/pdf`;
  const firstPuzzle = packPuzzles[0];
  const firstPrintHref = firstPuzzle ? `/${locale}/games/samurai/printable/${firstPuzzle.id}` : sampleHref;

  const faqItems = isZh
    ? [
        ["这些武士数独题目免费吗？", "免费包可以直接打开、打印或保存为 PDF，不需要注册或邮箱。"],
        ["PDF 包含答案吗？", "包含。免费样稿和单题打印页都会把答案放在独立答案区，适合完成后核对。"],
        ["可以用 A4 纸打印吗？", "可以。打印页提供 A4 和 US Letter 入口，并使用黑白清晰网格。"],
        ["最简单的难度是什么？", "Easy 简单适合新手、课堂和第一次打印练习。"],
        ["可以用于课堂吗？", "可以用于个人、家庭和课堂练习；如果需要批量发放，建议使用免费包或后续付费题包。"],
        ["多久新增题目？", "在线题库持续新增；免费打印中心会优先保持 20 题 starter pack 清晰可用。"],
      ]
    : [
        ["Are these Samurai Sudoku puzzles free?", "Yes. The starter pack opens without registration or email and can be printed or saved as PDF."],
        ["Do the PDFs include solutions?", "Yes. The free sample and printable puzzle pages include separate answer sections for checking after you solve."],
        ["Can I print them on A4 paper?", "Yes. The printable flow supports A4 and US Letter entry points with clear black-and-white grids."],
        ["What is the easiest level?", "Easy is the best starting level for beginners, classrooms, and first paper sessions."],
        ["Can I use the puzzles in a classroom?", "Yes for personal, family, and classroom practice. Use the starter pack first, then consider the larger pack when you need more sheets."],
        ["How often are new puzzles added?", "The online archive keeps growing; this printable center keeps the 20-puzzle starter pack easy to find and print."],
      ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isZh ? "首页" : "Home", item: buildAbsoluteUrl(`/${locale}`) },
      { "@type": "ListItem", position: 2, name: "Samurai Sudoku", item: buildAbsoluteUrl(`/${locale}/games/samurai`) },
      { "@type": "ListItem", position: 3, name: isZh ? "可打印武士数独" : "Printable Samurai Sudoku", item: pageUrl },
    ],
  };
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: isZh ? "免费可打印武士数独题目" : "Free Printable Samurai Sudoku Puzzles",
    url: pageUrl,
    inLanguage: isZh ? "zh-CN" : "en-US",
    dateModified: index.lastUpdated,
    description: isZh
      ? "免费武士数独打印中心，提供 20 题 starter pack、答案、A4 和 US Letter 打印入口。"
      : "A free Samurai Sudoku print center with a 20-puzzle starter pack, solutions, A4, and US Letter print options.",
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <main className="min-h-screen bg-background">
      {[breadcrumbJsonLd, webPageJsonLd, faqJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`printable-samurai-sudoku-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="border-b px-4 py-8 md:py-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
          <div>
            <nav className="mb-5 flex flex-wrap gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link href={`/${locale}`} className="hover:text-foreground">
                {isZh ? "首页" : "Home"}
              </Link>
              <span>/</span>
              <Link href={onlineHref} className="hover:text-foreground">
                Samurai Sudoku
              </Link>
              <span>/</span>
              <span className="text-foreground">{isZh ? "可打印" : "Printable"}</span>
            </nav>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              {isZh ? "免费打印中心" : "Free print center"}
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              {isZh ? "免费可打印武士数独题目" : "Free Printable Samurai Sudoku Puzzles"}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {isZh
                ? "免费下载可打印武士数独题目，覆盖 Easy、Medium、Hard、Expert 难度。每份打印页包含清晰答案，并支持 A4 与 US Letter 纸张。"
                : "Download free printable Samurai Sudoku puzzles in Easy, Medium, Hard, and Expert levels. Each PDF includes clear solutions and is formatted for A4 and US Letter paper."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedLink
                href={sampleHref}
                eventName="download_free_pdf"
                eventProperties={{ locale, pack_id: "starter_20", location: "hero" }}
                className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {isZh ? "下载免费 PDF" : "Download Free PDF"}
              </TrackedLink>
              <TrackedLink
                href={firstPrintHref}
                eventName="print_puzzle"
                eventProperties={{ locale, puzzle_id: firstPuzzle?.id, location: "hero" }}
                className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10"
              >
                {isZh ? "打印当前题" : "Print Current Puzzle"}
              </TrackedLink>
              <TrackedLink
                href={`${firstPrintHref}#answer-key`}
                eventName="view_solution"
                eventProperties={{ locale, puzzle_id: firstPuzzle?.id, location: "hero" }}
                className="rounded-lg border px-5 py-3 font-semibold hover:bg-accent"
              >
                {isZh ? "查看答案" : "View Solutions"}
              </TrackedLink>
              <TrackedLink
                href={onlineHref}
                eventName="play_online_click"
                eventProperties={{ locale, location: "hero" }}
                className="rounded-lg border px-5 py-3 font-semibold hover:bg-accent"
              >
                {isZh ? "在线玩" : "Play Online"}
              </TrackedLink>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              {PRINTABLE_STARTER_DIFFICULTIES.map((difficulty) => (
                <Link
                  key={difficulty}
                  href={`#${difficulty === "evil" ? "expert" : difficulty}`}
                  className="rounded-full border px-3 py-1 font-medium hover:border-primary hover:text-primary"
                >
                  {getPrintableDifficultyLabel(difficulty, locale)}
                </Link>
              ))}
              <Link href={`${sampleHref}&paper=a4`} className="rounded-full border px-3 py-1 font-medium hover:border-primary hover:text-primary">
                A4
              </Link>
              <Link href={sampleHref} className="rounded-full border px-3 py-1 font-medium hover:border-primary hover:text-primary">
                US Letter
              </Link>
            </div>
          </div>
          <div className="rounded-lg border bg-secondary/20 p-4">
            <MiniSamuraiPreview puzzle={previewPuzzle} />
            <p className="mt-3 text-sm text-muted-foreground">
              {isZh
                ? "重叠宫使用浅色底标出，便于打印后做跨网格候选数检查。"
                : "Overlap boxes are lightly shaded so cross-grid candidate checks stay visible on paper."}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-4">
            {grouped.map(({ difficulty, puzzles }) => {
              const summary = difficultySummary(difficulty, puzzles, locale);
              const anchor = difficulty === "evil" ? "expert" : difficulty;
              return (
                <section key={difficulty} id={anchor} className="rounded-lg border bg-background p-5">
                  <h2 className="text-xl font-semibold">{summary.label}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{summary.description}</p>
                  <p className="mt-4 text-sm font-medium">
                    {summary.count} {isZh ? "道免费题" : "free puzzles"}
                  </p>
                  <div className="mt-4 grid gap-2 text-sm">
                    <TrackedLink
                      href={`${sampleHref}#${anchor}`}
                      eventName="download_free_pdf"
                      eventProperties={{ locale, difficulty, pack_id: "starter_20", location: "difficulty_card" }}
                      className="rounded-md bg-primary px-3 py-2 text-center font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      {isZh ? "下载 PDF" : "Download PDF"}
                    </TrackedLink>
                    {summary.firstPuzzle ? (
                      <>
                        <TrackedLink
                          href={`/${locale}/games/samurai/printable/${summary.firstPuzzle.id}`}
                          eventName="print_puzzle"
                          eventProperties={{ locale, difficulty, puzzle_id: summary.firstPuzzle.id, location: "difficulty_card" }}
                          className="rounded-md border px-3 py-2 text-center font-medium hover:bg-accent"
                        >
                          {isZh ? "在线打印" : "Print online"}
                        </TrackedLink>
                        <TrackedLink
                          href={`/${locale}/games/samurai/printable/${summary.firstPuzzle.id}#answer-key`}
                          eventName="view_solution"
                          eventProperties={{ locale, difficulty, puzzle_id: summary.firstPuzzle.id, location: "difficulty_card" }}
                          className="rounded-md border px-3 py-2 text-center font-medium hover:bg-accent"
                        >
                          {isZh ? "查看答案" : "View answer"}
                        </TrackedLink>
                      </>
                    ) : null}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-secondary/20 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <h2 className="text-3xl font-semibold">
                {isZh ? "20 道免费可打印武士数独题，含答案" : "20 Free Printable Samurai Sudoku Puzzles With Solutions"}
              </h2>
              <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
                {isZh
                  ? "免费包包含 Easy 5 题、Medium 5 题、Hard 5 题、Expert 5 题。无需注册、无需邮箱，题目来自已验证的在线题库，答案与网页解答一致。"
                  : "The free pack includes 5 Easy, 5 Medium, 5 Hard, and 5 Expert puzzles. No signup, no email, and every puzzle comes from the verified online archive with matching answer keys."}
              </p>
              <div className="mt-6 overflow-hidden rounded-lg border bg-background">
                <div className="grid grid-cols-[1fr_110px_110px] gap-0 border-b px-4 py-3 text-sm font-semibold sm:grid-cols-[1fr_120px_120px_120px]">
                  <span>{isZh ? "题目" : "Puzzle"}</span>
                  <span>{isZh ? "难度" : "Level"}</span>
                  <span>{isZh ? "打印" : "Print"}</span>
                  <span className="hidden sm:block">{isZh ? "在线" : "Online"}</span>
                </div>
                {packPuzzles.map((puzzle, index) => (
                  <div
                    key={puzzle.id}
                    className="grid grid-cols-[1fr_110px_110px] items-center gap-0 border-b px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[1fr_120px_120px_120px]"
                  >
                    <span className="font-medium">
                      {String(index + 1).padStart(2, "0")}. {puzzle.id}
                    </span>
                    <span>{getPrintableDifficultyLabel(puzzle.difficulty, locale)}</span>
                    <TrackedLink
                      href={`/${locale}/games/samurai/printable/${puzzle.id}`}
                      eventName="print_puzzle"
                      eventProperties={{ locale, puzzle_id: puzzle.id, difficulty: puzzle.difficulty, location: "starter_pack_table" }}
                      className="text-primary hover:underline"
                    >
                      {isZh ? "打印/答案" : "Print/answer"}
                    </TrackedLink>
                    <TrackedLink
                      href={`/${locale}/games/samurai/${puzzle.id}`}
                      eventName="play_online_click"
                      eventProperties={{ locale, puzzle_id: puzzle.id, difficulty: puzzle.difficulty, location: "starter_pack_table" }}
                      className="hidden text-primary hover:underline sm:inline"
                    >
                      {isZh ? "在线玩" : "Play"}
                    </TrackedLink>
                  </div>
                ))}
              </div>
            </div>
            <aside className="rounded-lg border bg-background p-5">
              <h2 className="text-xl font-semibold">{isZh ? "打印选项" : "Print options"}</h2>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                <li>A4</li>
                <li>US Letter</li>
                <li>{isZh ? "一页 1 题" : "1 puzzle per page"}</li>
                <li>{isZh ? "一页 2 题预留版" : "2 puzzles per page planned"}</li>
                <li>{isZh ? "可附答案页" : "Solutions included"}</li>
                <li>{isZh ? "普通字体 / 大字体打印流程" : "Regular / large-print workflow"}</li>
              </ul>
              <TrackedLink
                href={sampleHref}
                eventName="download_free_pdf"
                eventProperties={{ locale, pack_id: "starter_20", location: "print_options" }}
                className="mt-5 block rounded-lg bg-primary px-4 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {isZh ? "打开免费打印包" : "Open free print pack"}
              </TrackedLink>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <section className="rounded-lg border p-6">
            <h2 className="text-2xl font-semibold">{isZh ? "如何使用这页" : "How to use this page"}</h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                {isZh
                  ? "武士数独由五个互相重叠的 9x9 数独组成。打印前先选难度；新手从 Easy 开始，熟悉重叠宫后再进入 Medium、Hard 和 Expert。"
                  : "Samurai Sudoku is made from five overlapping 9x9 Sudoku grids. Choose difficulty before printing; beginners should start with Easy before moving to Medium, Hard, and Expert."}
              </p>
              <p>
                {isZh
                  ? "打印时先用题面页解题，完成后再看答案页。若更喜欢屏幕操作，可以直接进入在线武士数独，使用候选数、提示和进度保存。"
                  : "Print the puzzle sheet first, solve on paper, then check the answer page. Prefer playing on screen? Play Samurai Sudoku online for free with candidates, hints, and local progress."}
              </p>
              <p>
                {isZh
                  ? `最后更新：${new Date(index.lastUpdated).toISOString().slice(0, 10)}。题目来自本站题库，构建时会验证题目结构、答案一致性和唯一解。`
                  : `Last updated: ${new Date(index.lastUpdated).toISOString().slice(0, 10)}. Puzzles come from this site's archive and are validated for structure, answer consistency, and a unique solution during the build workflow.`}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <Link href={rulesHref} className="rounded-md border px-3 py-2 hover:bg-accent">
                {isZh ? "武士数独规则" : "Samurai Sudoku rules"}
              </Link>
              <Link href={strategyHref} className="rounded-md border px-3 py-2 hover:bg-accent">
                {isZh ? "解题技巧" : "Solving strategies"}
              </Link>
              <Link href={paperPracticeHref} className="rounded-md border px-3 py-2 hover:bg-accent">
                {isZh ? "纸笔练习流程" : "Paper practice workflow"}
              </Link>
              <Link href={dailyHref} className="rounded-md border px-3 py-2 hover:bg-accent">
                {isZh ? "每日武士数独" : "Daily puzzle"}
              </Link>
            </div>
          </section>
          <section className="rounded-lg border bg-primary/5 p-6">
            <h2 className="text-2xl font-semibold">
              {isZh ? "需要更多题？" : "Need more printable puzzles?"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {isZh
                ? `免费包用于验证打印体验。后续 100 题付费包会测试 ${PAID_PACK_PRICE} 左右价格，包含 Easy 到 Expert、答案、A4、US Letter、一页 1 题和一页 2 题版本。`
                : `Use the free pack to test the print experience. The 100-puzzle paid pack will test a price around ${PAID_PACK_PRICE} with Easy to Expert levels, solutions, A4, US Letter, one-puzzle and two-puzzle layouts.`}
            </p>
            <TrackedLink
              href={paidPackHref}
              eventName="paid_pack_view"
              eventProperties={{ locale, product: "100_printable_pack", location: "monetization_card" }}
              className="mt-5 inline-flex rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10"
            >
              {isZh ? "查看付费 PDF 题包" : "View paid PDF pack"}
            </TrackedLink>
          </section>
        </div>
      </section>

      <section className="border-t bg-secondary/20 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-semibold">{isZh ? "常见问题" : "FAQ"}</h2>
          <div className="mt-5 grid gap-4">
            {faqItems.map(([question, answer]) => (
              <section key={question} className="rounded-lg border bg-background p-5">
                <h3 className="font-semibold">{question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{answer}</p>
              </section>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <Link href={onlineHref} className="rounded-md border px-3 py-2 hover:bg-accent">
              {isZh ? "在线武士数独" : "play Samurai Sudoku online"}
            </Link>
            <Link href={solverHref} className="rounded-md border px-3 py-2 hover:bg-accent">
              {isZh ? "武士数独解题器" : "Samurai Sudoku solver"}
            </Link>
            <Link href={`/${locale}/games/samurai/difficulty/hard`} className="rounded-md border px-3 py-2 hover:bg-accent">
              {isZh ? "困难武士数独" : "Hard Samurai Sudoku"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
