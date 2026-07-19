import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { PayPalCheckout } from "@/components/payments/PayPalCheckout";
import { MiniSamuraiPreview } from "@/components/printable/MiniSamuraiPreview";
import { PRINTABLE_PUZZLE_OPEN_EVENT } from "@/lib/analytics/event-names";
import { selectRecentDailyPuzzles } from "@/lib/daily-puzzles";
import {
  PRINTABLE_STARTER_A4_PDF,
  PRINTABLE_STARTER_A4_TWO_UP_PDF,
  PRINTABLE_STARTER_DIFFICULTIES,
  PRINTABLE_STARTER_LETTER_PDF,
  PRINTABLE_STARTER_LETTER_TWO_UP_PDF,
  groupPrintablePackByDifficulty,
  getPrintableDifficultyLabel,
  selectPrintableStarterPack,
} from "@/lib/printable-pack";
import {
  getPdfPackPrice,
  getPdfPackPriceAmount,
  getPdfPackProductName,
} from "@/lib/paypal";
import { getPayPalClientId, isPayPalOrdersConfigured } from "@/lib/paypal-api";
import { getPuzzle, getPuzzleIndex } from "@/lib/puzzles";
import { getPrimaryPrintablePuzzle } from "@/lib/puzzle-links";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";
import type { Difficulty, PuzzleMetadata } from "@/lib/sudoku/types";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = "/printable-samurai-sudoku";
const EXPERIMENT_ID = "printable_hub_7d_v1";

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

export default async function PrintableSamuraiSudokuResourcePage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const index = await getPuzzleIndex();
  const packPuzzles = selectPrintableStarterPack(index.puzzles);
  const grouped = groupPrintablePackByDifficulty(packPuzzles);
  const previewPuzzle = await getPreviewPuzzle(packPuzzles);
  const pageUrl = buildAbsoluteUrl(`/${locale}${PATH}`);
  const sampleHref = `/${locale}/printable-samurai-sudoku#free-20-puzzle-pack`;
  const onlineHref = `/${locale}/games/samurai`;
  const dailyHref = `/${locale}/games/samurai/daily`;
  const paperPracticeHref = `/${locale}/games/samurai/paper-practice`;
  const rulesHref = `/${locale}/games/samurai/how-to-play`;
  const strategyHref = `/${locale}/games/samurai/strategy-guide`;
  const solverHref = `/${locale}/games/samurai/solver`;
  const paidPackPrice = getPdfPackPrice();
  const paidPackPriceAmount = getPdfPackPriceAmount();
  const paidPackProductName = getPdfPackProductName();
  const autoDeliveryEnabled = isPayPalOrdersConfigured();
  const payPalClientId = getPayPalClientId();
  const supportHref = `/${locale}/contact`;
  const latestPuzzle = selectRecentDailyPuzzles(index.puzzles, 1)[0];
  const heroPuzzle = getPrimaryPrintablePuzzle(latestPuzzle, packPuzzles);
  const heroPrintHref = heroPuzzle
    ? `/${locale}/games/samurai/printable/${heroPuzzle.id}?paper=a4`
    : sampleHref;
  const latestPrintHref = latestPuzzle
    ? `/${locale}/games/samurai/printable/${latestPuzzle.id}?paper=a4`
    : heroPrintHref;

  const faqItems = isZh
    ? [
        ["这些武士数独题目免费吗？", "免费包可以直接打开、打印或保存为 PDF，不需要注册或邮箱。"],
        ["PDF 包含答案吗？", "包含。免费样稿和单题打印页都会把答案放在独立答案区，适合完成后核对。"],
        ["可以用 A4 纸打印吗？", "可以。打印页提供 A4 和 US Letter 入口，并使用黑白清晰网格。"],
        ["最简单的难度是什么？", "Easy 简单适合新手、课堂和第一次打印练习。"],
        ["可以用于课堂吗？", "可以用于个人、家庭和课堂练习；如果需要批量发放，建议使用免费包或后续付费题包。"],
        ["多久新增题目？", "在线题库持续新增；免费打印中心会优先保持 20 题 starter pack 清晰可用。"],
        ["100 题包付款后如何下载？", autoDeliveryEnabled ? "PayPal 确认付款后，本页会立即显示 100 题 ZIP 下载按钮。下载链接有效期为 7 天。" : "结账配置未完成时不会接收付款；付款入口恢复后，PayPal 确认付款即可立即下载 ZIP。"],
        ["免费包和 100 题包有什么区别？", "免费包有 20 题；100 题包包含四份 PDF：A4、US Letter，以及两种纸张的一页 2 题紧凑版，全部附答案。"],
      ]
    : [
        ["Are these Samurai Sudoku puzzles free?", "Yes. The starter pack opens without registration or email and can be printed or saved as PDF."],
        ["Do the PDFs include solutions?", "Yes. The free sample and printable puzzle pages include separate answer sections for checking after you solve."],
        ["Can I print them on A4 paper?", "Yes. The printable flow supports A4 and US Letter entry points with clear black-and-white grids."],
        ["What is the easiest level?", "Easy is the best starting level for beginners, classrooms, and first paper sessions."],
        ["Can I use the puzzles in a classroom?", "Yes for personal, family, and classroom practice. Use the starter pack first, then consider the larger pack when you need more sheets."],
        ["How often are new puzzles added?", "The online archive keeps growing; this printable center keeps the 20-puzzle starter pack easy to find and print."],
        ["How do I download the 100-puzzle pack after payment?", autoDeliveryEnabled ? "After PayPal confirms payment, this page immediately shows the 100-puzzle ZIP download. The signed link remains valid for 7 days." : "No payment is accepted while checkout is not configured. Once restored, PayPal confirmation unlocks the ZIP immediately."],
        ["What is the difference between the free and paid packs?", "The free pack contains 20 puzzles. The 100-puzzle pack includes four PDFs: A4, US Letter, and compact two-per-page editions for both paper sizes, all with solutions."],
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
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: paidPackProductName,
    description: isZh
      ? "100 道经过程序校验的可打印武士数独，包含答案、A4、US Letter 和一页 2 题版本。"
      : "100 program-validated printable Samurai Sudoku puzzles with solutions, A4, US Letter, and compact two-per-page editions.",
    sku: "samurai-sudoku-100-pack-v1",
    category: "Printable puzzle pack",
    url: `${pageUrl}#paid-100-puzzle-pack`,
    offers: {
      "@type": "Offer",
      availability: autoDeliveryEnabled
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      price: paidPackPriceAmount,
      priceCurrency: "USD",
      url: `${pageUrl}#paid-100-puzzle-pack`,
    },
  };

  return (
    <main className="min-h-screen bg-background">
      {[breadcrumbJsonLd, webPageJsonLd, productJsonLd, faqJsonLd].map((schema, index) => (
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
                href={PRINTABLE_STARTER_A4_PDF}
                eventName="download_free_pdf"
                eventProperties={{ locale, pack_id: "starter_20", paper: "a4", location: "hero", experiment_id: EXPERIMENT_ID }}
                download
                className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {isZh ? "下载免费 A4 PDF" : "Download Free A4 PDF"}
              </TrackedLink>
              <TrackedLink
                href={PRINTABLE_STARTER_LETTER_PDF}
                eventName="download_free_pdf"
                eventProperties={{ locale, pack_id: "starter_20", paper: "letter", location: "hero", experiment_id: EXPERIMENT_ID }}
                download
                className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10"
              >
                {isZh ? "下载 US Letter PDF" : "Download US Letter PDF"}
              </TrackedLink>
              <TrackedLink
                href={heroPrintHref}
                eventName={PRINTABLE_PUZZLE_OPEN_EVENT}
                eventProperties={{
                  locale,
                  puzzle_id: heroPuzzle?.id,
                  difficulty: heroPuzzle?.difficulty,
                  paper: "a4",
                  location: "hero",
                }}
                className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10"
              >
                {isZh ? "打印当前题" : "Print Current Puzzle"}
              </TrackedLink>
              <TrackedLink
                href={`${heroPrintHref}#answer-key`}
                eventName="view_solution"
                eventProperties={{
                  locale,
                  puzzle_id: heroPuzzle?.id,
                  difficulty: heroPuzzle?.difficulty,
                  paper: "a4",
                  location: "hero",
                }}
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
              <TrackedLink
                href={PRINTABLE_STARTER_A4_PDF}
                eventName="download_free_pdf"
                eventProperties={{ locale, pack_id: "starter_20", paper: "a4", location: "hero_filter", experiment_id: EXPERIMENT_ID }}
                download
                className="rounded-full border px-3 py-1 font-medium hover:border-primary hover:text-primary"
              >
                A4
              </TrackedLink>
              <TrackedLink
                href={PRINTABLE_STARTER_LETTER_PDF}
                eventName="download_free_pdf"
                eventProperties={{ locale, pack_id: "starter_20", paper: "letter", location: "hero_filter", experiment_id: EXPERIMENT_ID }}
                download
                className="rounded-full border px-3 py-1 font-medium hover:border-primary hover:text-primary"
              >
                US Letter
              </TrackedLink>
            </div>
          </div>
          <div className="rounded-lg border bg-secondary/20 p-4">
            <MiniSamuraiPreview
              puzzle={previewPuzzle}
              ariaLabel={isZh ? "可打印武士数独题目预览" : "Samurai Sudoku printable puzzle preview"}
            />
            <p className="mt-3 text-sm text-muted-foreground">
              {isZh
                ? "重叠宫使用浅色底标出，便于打印后做跨网格候选数检查。"
                : "Overlap boxes are lightly shaded so cross-grid candidate checks stay visible on paper."}
            </p>
          </div>
        </div>
      </section>

      {latestPuzzle ? (
        <section className="border-b bg-secondary/20 px-4 py-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">
                {isZh ? "今日可打印题" : "Today's printable puzzle"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                {latestPuzzle.id} {getPrintableDifficultyLabel(latestPuzzle.difficulty, locale)}{" "}
                {isZh ? "武士数独" : "Samurai Sudoku"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {isZh
                  ? `预计 ${latestPuzzle.estimatedTime} 分钟。打开单题 A4 版打印或保存 PDF，也可以在线完成今日挑战。`
                  : `Estimated at ${latestPuzzle.estimatedTime} minutes. Open the single-puzzle A4 edition to print or save as PDF, or solve today's challenge online.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <TrackedLink
                href={latestPrintHref}
                eventName={PRINTABLE_PUZZLE_OPEN_EVENT}
                eventProperties={{ locale, puzzle_id: latestPuzzle.id, difficulty: latestPuzzle.difficulty, paper: "a4", location: "printable_daily_bridge" }}
                className="rounded-lg border border-primary px-4 py-2 font-semibold text-primary hover:bg-primary/10"
              >
                {isZh ? "打印 / 保存 PDF" : "Print / Save PDF"}
              </TrackedLink>
              <TrackedLink
                href={dailyHref}
                eventName="printable_daily_click"
                eventProperties={{ locale, puzzle_id: latestPuzzle.id, location: "printable_daily_bridge" }}
                className="rounded-lg border px-4 py-2 font-semibold hover:bg-accent"
              >
                {isZh ? "查看每日题" : "View daily puzzle"}
              </TrackedLink>
            </div>
          </div>
        </section>
      ) : null}

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
                      href={PRINTABLE_STARTER_A4_PDF}
                      eventName="download_free_pdf"
                      eventProperties={{ locale, difficulty, pack_id: "starter_20", paper: "a4", location: "difficulty_card", experiment_id: EXPERIMENT_ID }}
                      download
                      className="rounded-md bg-primary px-3 py-2 text-center font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      {isZh ? "下载 A4 PDF" : "Download A4 PDF"}
                    </TrackedLink>
                    {summary.firstPuzzle ? (
                      <>
                        <TrackedLink
                          href={`/${locale}/games/samurai/printable/${summary.firstPuzzle.id}`}
                          eventName={PRINTABLE_PUZZLE_OPEN_EVENT}
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

      <section id="free-20-puzzle-pack" className="scroll-mt-28 bg-secondary/20 px-4 py-10">
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
                      eventName={PRINTABLE_PUZZLE_OPEN_EVENT}
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
                <li>{isZh ? "一页 2 题紧凑版" : "2 puzzles per page compact edition"}</li>
                <li>{isZh ? "完整答案页" : "Complete solutions included"}</li>
                <li>{isZh ? "矢量数字与清晰粗细线" : "Vector numbers and clear line weights"}</li>
              </ul>
              <TrackedLink
                href={PRINTABLE_STARTER_A4_PDF}
                eventName="download_free_pdf"
                eventProperties={{ locale, pack_id: "starter_20", paper: "a4", location: "print_options", experiment_id: EXPERIMENT_ID }}
                download
                className="mt-5 block rounded-lg bg-primary px-4 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {isZh ? "下载 A4 免费包" : "Download the free A4 pack"}
              </TrackedLink>
              <TrackedLink
                href={PRINTABLE_STARTER_LETTER_PDF}
                eventName="download_free_pdf"
                eventProperties={{ locale, pack_id: "starter_20", paper: "letter", location: "print_options", experiment_id: EXPERIMENT_ID }}
                download
                className="mt-3 block rounded-lg border border-primary px-4 py-3 text-center font-semibold text-primary hover:bg-primary/10"
              >
                {isZh ? "下载 US Letter 免费包" : "Download the US Letter pack"}
              </TrackedLink>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <TrackedLink
                  href={PRINTABLE_STARTER_A4_TWO_UP_PDF}
                  eventName="download_free_pdf"
                  eventProperties={{ locale, pack_id: "starter_20", paper: "a4", layout: "two", location: "print_options", experiment_id: EXPERIMENT_ID }}
                  download
                  className="rounded-lg border px-3 py-2 text-center text-sm font-semibold hover:bg-accent"
                >
                  {isZh ? "A4 一页 2 题" : "A4 compact 2-up"}
                </TrackedLink>
                <TrackedLink
                  href={PRINTABLE_STARTER_LETTER_TWO_UP_PDF}
                  eventName="download_free_pdf"
                  eventProperties={{ locale, pack_id: "starter_20", paper: "letter", layout: "two", location: "print_options", experiment_id: EXPERIMENT_ID }}
                  download
                  className="rounded-lg border px-3 py-2 text-center text-sm font-semibold hover:bg-accent"
                >
                  {isZh ? "Letter 一页 2 题" : "Letter compact 2-up"}
                </TrackedLink>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="paid-100-puzzle-pack" className="scroll-mt-28 border-y px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-x-10 gap-y-7 lg:grid-cols-[1fr_340px] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">
              {isZh ? "一次购买，立即下载" : "One-time purchase, instant download"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              {isZh
                ? `100 道可打印武士数独题 · ${paidPackPrice}`
                : `100 Printable Samurai Sudoku Puzzles · ${paidPackPrice}`}
            </h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
              {isZh
                ? "免费 20 题包适合先测试打印体验。需要更长训练周期时，100 题 ZIP 提供 Easy、Medium、Hard、Expert 各 25 题，全部附答案，无广告、无需订阅。"
                : "Use the free 20-puzzle pack to test the print experience. For a longer practice cycle, the 100-puzzle ZIP includes 25 Easy, 25 Medium, 25 Hard, and 25 Expert puzzles, all with solutions, no ads, and no subscription."}
            </p>

          </div>

          <aside className="border-t pt-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-sm font-medium text-muted-foreground">
              {isZh ? "100 题完整 ZIP" : "Complete 100-puzzle ZIP"}
            </p>
            <p className="mt-2 text-4xl font-semibold">{paidPackPrice}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {isZh
                ? "一次性付款，不自动续费。包含 4 份 PDF 和说明文件。"
                : "One-time payment with no renewal. Includes four PDFs and a readme."}
            </p>
            <div className="mt-6">
              <PayPalCheckout
                autoDeliveryEnabled={autoDeliveryEnabled}
                clientId={payPalClientId}
                deferUntilActivated
                experimentId={EXPERIMENT_ID}
                locale={locale}
                price={paidPackPrice}
                supportHref={supportHref}
              />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {autoDeliveryEnabled
                ? isZh
                  ? "结账由 PayPal 安全处理。付款确认后，本页立即显示 ZIP 下载按钮。"
                  : "Checkout is securely handled by PayPal. The ZIP download appears here immediately after confirmation."
                : isZh
                  ? "自动验单配置未完成时不会接收付款，也不会跳转到个人收款页。"
                  : "No payment is accepted while automatic verification is unavailable, and no personal payment page is used."}
            </p>
          </aside>

          <div className="lg:col-start-1">
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {(
                isZh
                  ? [
                      ["100 道已验证题目", "每个难度 25 题，答案来自同一程序校验题库。"],
                      ["4 份打印 PDF", "A4、US Letter，以及两种纸张的一页 2 题紧凑版。"],
                      ["题面与答案分开", "先完成整套题面，再进入编号一致的答案页。"],
                      ["付款后自动交付", "PayPal 验证金额和商品后立即生成 7 天下载链接。"],
                    ]
                  : [
                      ["100 validated puzzles", "25 puzzles per level, with answers from the same program-checked archive."],
                      ["4 print-ready PDFs", "A4, US Letter, and compact two-per-page editions for both paper sizes."],
                      ["Separate answer sections", "Complete the puzzle pages first, then use matching numbered solutions."],
                      ["Automatic delivery", "PayPal verifies the product and amount before issuing a 7-day download link."],
                    ]
              ).map(([label, detail]) => (
                <div key={label} className="border-t py-4">
                  <dt className="font-semibold">{label}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
              <a href="#free-20-puzzle-pack" className="text-primary hover:underline">
                {isZh ? "先下载免费 20 题" : "Download the free 20-puzzle pack first"}
              </a>
              <Link href={`/${locale}/terms`} className="text-primary hover:underline">
                {isZh ? "购买与退款条款" : "Purchase and refund terms"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
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
