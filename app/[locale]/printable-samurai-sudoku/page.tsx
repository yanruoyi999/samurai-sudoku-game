import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { PayPalCheckout } from "@/components/payments/PayPalCheckout";
import { MiniSamuraiPreview } from "@/components/printable/MiniSamuraiPreview";
import {
  PrintableFreeDownloadLink,
  PrintablePackOffer,
} from "@/components/printable/PrintablePackOffer";
import { selectRecentDailyPuzzles } from "@/lib/daily-puzzles";
import {
  PRINTABLE_STARTER_A4_PDF,
  PRINTABLE_STARTER_A4_TWO_UP_PDF,
  PRINTABLE_STARTER_LETTER_PDF,
  PRINTABLE_STARTER_LETTER_TWO_UP_PDF,
  groupPrintablePackByDifficulty,
  getPrintableDifficultyLabel,
  isPrintableSamplerPreview,
  selectPrintableStarterPack,
} from "@/lib/printable-pack";
import {
  getPdfPackPrice,
  getPdfPackPriceAmount,
  getPdfPackProductName,
} from "@/lib/paypal";
import { getPayPalClientId, isPayPalOrdersConfigured } from "@/lib/paypal-api";
import { getPuzzle, getPuzzleIndex } from "@/lib/puzzles";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";
import type { Difficulty, PuzzleMetadata } from "@/lib/sudoku/types";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = "/printable-samurai-sudoku";
const EXPERIMENT_ID = "printable_hub_72h_v3";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? "免费可打印武士数独题目 - PDF 与答案"
    : "Free Printable Samurai Sudoku Puzzles - PDF With Solutions";
  const description = isZh
    ? "免费下载 3 道精选可打印武士数独，包含 Easy、Medium、带真实第一步提示的 Expert 预览及前 2 题答案，支持 A4 和 US Letter。"
    : "Download 3 curated printable Samurai Sudoku puzzles with two answers and an Expert preview with a real first-step hint, in A4 and US Letter.";

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
  const sampleHref = `/${locale}/printable-samurai-sudoku#free-3-puzzle-pack`;
  const onlineHref = `/${locale}/games/samurai`;
  const dailyHref = `/${locale}/games/samurai/daily`;
  const paperPracticeHref = `/${locale}/games/samurai/paper-practice`;
  const rulesHref = `/${locale}/games/samurai/how-to-play`;
  const strategyHref = `/${locale}/games/samurai/strategy-guide`;
  const solverHref = `/${locale}/games/samurai/solver`;
  const paidPackPrice = getPdfPackPrice();
  const paidPackPriceAmount = getPdfPackPriceAmount();
  const paidPackDailyPrice = (Number(paidPackPriceAmount) / 30).toFixed(2);
  const paidPackProductName = getPdfPackProductName();
  const autoDeliveryEnabled = isPayPalOrdersConfigured();
  const payPalClientId = getPayPalClientId();
  const supportHref = `/${locale}/contact`;
  const latestPuzzle = selectRecentDailyPuzzles(index.puzzles, 1)[0];

  const faqItems = isZh
      ? [
        ["这些武士数独题目免费吗？", "免费包可以直接打开、打印或保存为 PDF，不需要注册或邮箱。"],
        ["PDF 包含答案吗？", "免费精选包为前 2 题提供答案；第 3 题是来自完整库的 Expert 预览，PDF 中不附答案，但会给出一个真实第一步提示。完整训练库包含这道题的 12 步开局讲解与完整答案。"],
        ["可以用 A4 纸打印吗？", "可以。打印页提供 A4 和 US Letter 入口，并使用黑白清晰网格。"],
        ["最简单的难度是什么？", "Easy 简单适合新手、课堂和第一次打印练习。"],
        ["可以用于课堂吗？", "可以用于个人、家庭和课堂练习；如果需要批量发放，建议使用免费包或后续付费题包。"],
        ["多久新增题目？", "在线题库持续新增；免费打印中心会保持 3 题精选试玩包及其 Easy、Medium、Expert 难度梯度清晰可用。"],
        ["100 题包付款后如何下载？", autoDeliveryEnabled ? "PayPal 确认付款后，本页会立即显示 100 题 ZIP 下载按钮。下载链接有效期为 7 天。" : "结账配置未完成时不会接收付款；付款入口恢复后，PayPal 确认付款即可立即下载 ZIP。"],
        ["免费包和完整训练库有什么区别？", `免费包是 1 Easy、1 Medium 和 1 道带第一步提示的无答案 Expert 预览。完整库解锁预览题的 12 步开局讲解与完整答案，并提供 100 道题、30 天每日计划和一页 2 题随身版，${paidPackPrice} 一次购买，平均每天 $${paidPackDailyPrice}。`],
      ]
    : [
        ["Are these Samurai Sudoku puzzles free?", "Yes. The starter pack opens without registration or email and can be printed or saved as PDF."],
        ["Do the PDFs include solutions?", "The curated sampler includes answers for puzzles 1-2. Puzzle 3 is an Expert preview with a real first-step hint but no answer; the complete library unlocks its verified 12-step opening and full answer."],
        ["Can I print them on A4 paper?", "Yes. The printable flow supports A4 and US Letter entry points with clear black-and-white grids."],
        ["What is the easiest level?", "Easy is the best starting level for beginners, classrooms, and first paper sessions."],
        ["Can I use the puzzles in a classroom?", "Yes for personal, family, and classroom practice. Use the starter pack first, then consider the larger pack when you need more sheets."],
        ["How often are new puzzles added?", "The online archive keeps growing; this printable center keeps the three-puzzle Easy, Medium, and Expert progression easy to find and print."],
        ["How do I download the 100-puzzle pack after payment?", autoDeliveryEnabled ? "After PayPal confirms payment, this page immediately shows the 100-puzzle ZIP download. The signed link remains valid for 7 days." : "No payment is accepted while checkout is not configured. Once restored, PayPal confirmation unlocks the ZIP immediately."],
        ["What is the difference between the free and paid packs?", `The sampler has 1 Easy, 1 Medium, and 1 unanswered Expert preview with a first-step hint. The complete library unlocks its verified 12-step opening and full answer, plus 100 puzzles, a 30-day plan, and portable two-per-page editions for ${paidPackPrice}, or $${paidPackDailyPrice} a day over 30 days.`],
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
      ? "免费武士数独打印中心，提供 3 题精选试玩包、前 2 题答案、带真实第一步提示的 Expert 预览、A4 和 US Letter。"
      : "A free Samurai Sudoku print center with three curated puzzles, two answer keys, an Expert preview with a real first-step hint, A4, and US Letter.",
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
      ? "100 道经过程序校验的可打印武士数独训练库，包含免费包 Expert 预览题的 12 步开局讲解与完整答案，以及 30 天计划、A4、US Letter 和一页 2 题版本。"
      : "A 100-puzzle, program-validated Samurai Sudoku library with the free Expert preview's verified 12-step opening and full answer, plus a 30-day plan, A4, US Letter, and compact editions.",
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
                ? "免费体验 3 道精选武士数独：1 题 Easy、1 题 Medium、1 题带真实第一步提示的 Expert 预览。前 2 题附答案，支持 A4 与 US Letter，无需注册。"
                : "Try 3 curated Samurai Sudoku puzzles free: 1 Easy, 1 Medium, and 1 Expert preview with a real first-step hint. The first 2 answers are included in A4 and US Letter, with no signup."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <PrintableFreeDownloadLink
                href={PRINTABLE_STARTER_A4_PDF}
                eventProperties={{
                  locale,
                  pack_id: "curated_sampler_3",
                  paper: "a4",
                  location: "hero",
                  experiment_id: EXPERIMENT_ID,
                }}
                className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {isZh ? "下载免费包（含 Expert 预览）" : "Download Free Pack (Includes Expert Preview)"}
              </PrintableFreeDownloadLink>
              <TrackedLink
                href="#pack-options"
                eventName="printable_pack_compare_click"
                eventProperties={{ locale, location: "hero", experiment_id: EXPERIMENT_ID }}
                className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10"
              >
                {isZh ? "对比免费包与完整库" : "Compare Free vs Complete"}
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
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {isZh
                ? "内含一道 Expert 预览题与真实第一步提示；其 12 步开局讲解和完整答案可在训练库中解锁。"
                : "Includes one Expert preview with a real first-step hint; unlock its verified 12-step opening and full answer in the complete library."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              {grouped.filter(({ puzzles }) => puzzles.length > 0).map(({ difficulty }) => (
                <Link
                  key={difficulty}
                  href={`#${difficulty === "evil" ? "expert" : difficulty}`}
                  className="rounded-full border px-3 py-1 font-medium hover:border-primary hover:text-primary"
                >
                  {getPrintableDifficultyLabel(difficulty, locale)}
                </Link>
              ))}
              <span className="rounded-full border px-3 py-1 font-medium">A4</span>
              <span className="rounded-full border px-3 py-1 font-medium">US Letter</span>
            </div>
          </div>
          <div className="rounded-lg border bg-secondary/20 p-4">
            <MiniSamuraiPreview
              puzzle={previewPuzzle}
              ariaLabel={isZh ? "可打印武士数独题目预览" : "Samurai Sudoku printable puzzle preview"}
              action={{
                href: sampleHref,
                label: isZh ? "查看 3 题精选打印样包" : "See the curated 3-puzzle print sampler",
                eventName: "printable_sampler_details_click",
                eventProperties: {
                  locale,
                  location: "hero_preview",
                  experiment_id: EXPERIMENT_ID,
                },
              }}
            />
            <p className="mt-3 text-sm text-muted-foreground">
              {isZh
                ? "重叠宫使用浅色底标出，便于打印后做跨网格候选数检查。"
                : "Overlap boxes are lightly shaded so cross-grid candidate checks stay visible on paper."}
            </p>
          </div>
        </div>
      </section>

      <PrintablePackOffer
        checkoutAvailable={autoDeliveryEnabled}
        experimentId={EXPERIMENT_ID}
        freePdfHref={PRINTABLE_STARTER_A4_PDF}
        locale={locale}
        price={paidPackPrice}
      />

      {latestPuzzle ? (
        <section className="border-b bg-secondary/20 px-4 py-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">
                {isZh ? "今日在线题" : "Today's online puzzle"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                {latestPuzzle.id} {getPrintableDifficultyLabel(latestPuzzle.difficulty, locale)}{" "}
                {isZh ? "武士数独" : "Samurai Sudoku"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {isZh
                  ? `预计 ${latestPuzzle.estimatedTime} 分钟。在线完成今日挑战；需要纸笔体验时，下载统一优化排版的 3 题精选 PDF。`
                  : `Estimated at ${latestPuzzle.estimatedTime} minutes. Solve today's challenge online, or use the consistently polished 3-puzzle PDF sampler for paper practice.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <PrintableFreeDownloadLink
                href={PRINTABLE_STARTER_A4_PDF}
                eventProperties={{
                  locale,
                  pack_id: "curated_sampler_3",
                  paper: "a4",
                  location: "printable_daily_bridge",
                  experiment_id: EXPERIMENT_ID,
                }}
                className="rounded-lg border border-primary px-4 py-2 font-semibold text-primary hover:bg-primary/10"
              >
                {isZh ? "下载免费包（含 Expert 预览）" : "Download Free Pack (Expert Preview Included)"}
              </PrintableFreeDownloadLink>
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
          <div className="grid gap-4 md:grid-cols-3">
            {grouped.filter(({ puzzles }) => puzzles.length > 0).map(({ difficulty, puzzles }) => {
              const summary = difficultySummary(difficulty, puzzles, locale);
              const anchor = difficulty === "evil" ? "expert" : difficulty;
              const preview = summary.firstPuzzle
                ? isPrintableSamplerPreview(summary.firstPuzzle.id)
                : false;
              return (
                <section key={difficulty} id={anchor} className="rounded-lg border bg-background p-5">
                  <h2 className="text-xl font-semibold">{summary.label}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{summary.description}</p>
                  <p className="mt-4 text-sm font-medium">
                    {summary.count} {isZh ? "道免费题" : "free puzzles"}
                  </p>
                  <div className="mt-4 grid gap-2 text-sm">
                    <PrintableFreeDownloadLink
                      href={PRINTABLE_STARTER_A4_PDF}
                      eventProperties={{ locale, difficulty, pack_id: "curated_sampler_3", paper: "a4", location: "difficulty_card", experiment_id: EXPERIMENT_ID }}
                      className="rounded-md bg-primary px-3 py-2 text-center font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      {isZh ? "下载 A4 PDF" : "Download A4 PDF"}
                    </PrintableFreeDownloadLink>
                    {summary.firstPuzzle && !preview ? (
                      <TrackedLink
                        href={`/${locale}/games/samurai/${summary.firstPuzzle.id}`}
                        eventName="play_online_click"
                        eventProperties={{ locale, difficulty, puzzle_id: summary.firstPuzzle.id, location: "difficulty_card" }}
                        className="rounded-md border px-3 py-2 text-center font-medium hover:bg-accent"
                      >
                        {isZh ? "在线玩" : "Play online"}
                      </TrackedLink>
                    ) : preview ? (
                      <a
                        href="#paid-100-puzzle-pack"
                        className="rounded-md border px-3 py-2 text-center font-medium text-primary hover:bg-primary/10"
                      >
                        {isZh ? "在完整库中解锁答案" : "Unlock the answer"}
                      </a>
                    ) : null}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <span id="free-20-puzzle-pack" className="block scroll-mt-28" aria-hidden="true" />
      <span id="free-5-puzzle-pack" className="block scroll-mt-28" aria-hidden="true" />
      <section id="free-3-puzzle-pack" className="scroll-mt-28 bg-secondary/20 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <h2 className="text-3xl font-semibold">
                {isZh ? "3 道精选可打印武士数独试玩题" : "3 Curated Printable Samurai Sudoku Sampler Puzzles"}
              </h2>
              <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
                {isZh
                  ? "试玩包按 1 题 Easy、1 题 Medium、1 题 Expert 排列。前 2 题附答案；第 3 题给出真实第一步提示，并把 12 步开局讲解、完整答案与另外 97 道精选题留在完整训练库中。无需注册或邮箱，全部题目均经过唯一解与难度评分校验。"
                  : "The sampler progresses through 1 Easy, 1 Medium, and 1 Expert puzzle. The first two answers are included; puzzle 3 gives a real first-step hint, while its verified 12-step opening, full answer, and 97 more curated puzzles unlock in the complete library. No signup or email, and every puzzle is validated."}
              </p>
              <div className="mt-6 overflow-hidden rounded-lg border bg-background">
                <div className="grid grid-cols-[1fr_110px_110px] gap-0 border-b px-4 py-3 text-sm font-semibold sm:grid-cols-[1fr_120px_120px_120px]">
                  <span>{isZh ? "题目" : "Puzzle"}</span>
                  <span>{isZh ? "难度" : "Level"}</span>
                  <span>{isZh ? "打印" : "Print"}</span>
                  <span className="hidden sm:block">{isZh ? "在线" : "Online"}</span>
                </div>
                {packPuzzles.map((puzzle, index) => {
                  const preview = isPrintableSamplerPreview(puzzle.id);
                  return (
                    <div
                      key={puzzle.id}
                      className="grid grid-cols-[1fr_110px_110px] items-center gap-0 border-b px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[1fr_120px_120px_120px]"
                    >
                      <span className="font-medium">
                        {String(index + 1).padStart(2, "0")}. {puzzle.id}
                      </span>
                      <span>{getPrintableDifficultyLabel(puzzle.difficulty, locale)}</span>
                      {preview ? (
                        <a href="#paid-100-puzzle-pack" className="text-primary hover:underline">
                          {isZh ? "预览题" : "Preview"}
                        </a>
                      ) : (
                        <PrintableFreeDownloadLink
                          href={PRINTABLE_STARTER_A4_PDF}
                          eventProperties={{
                            locale,
                            pack_id: "curated_sampler_3",
                            paper: "a4",
                            location: "starter_pack_table",
                            experiment_id: EXPERIMENT_ID,
                          }}
                          className="text-primary hover:underline"
                        >
                          {isZh ? "免费 PDF 内" : "In free PDF"}
                        </PrintableFreeDownloadLink>
                      )}
                      {preview ? (
                        <span className="hidden text-muted-foreground sm:inline">
                          {isZh ? "完整库含答案" : "Answer in full pack"}
                        </span>
                      ) : (
                        <TrackedLink
                          href={`/${locale}/games/samurai/${puzzle.id}`}
                          eventName="play_online_click"
                          eventProperties={{ locale, puzzle_id: puzzle.id, difficulty: puzzle.difficulty, location: "starter_pack_table" }}
                          className="hidden text-primary hover:underline sm:inline"
                        >
                          {isZh ? "在线玩" : "Play"}
                        </TrackedLink>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <aside className="rounded-lg border bg-background p-5">
              <h2 className="text-xl font-semibold">{isZh ? "打印选项" : "Print options"}</h2>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                <li>A4</li>
                <li>US Letter</li>
                <li>{isZh ? "一页 1 题" : "1 puzzle per page"}</li>
                <li>{isZh ? "一页 2 题紧凑版" : "2 puzzles per page compact edition"}</li>
                <li>{isZh ? "前 2 题答案 + 1 道带第一步提示的 Expert 预览" : "Answers for puzzles 1-2 + an Expert preview with a first-step hint"}</li>
                <li>{isZh ? "矢量数字与清晰粗细线" : "Vector numbers and clear line weights"}</li>
              </ul>
              <PrintableFreeDownloadLink
                href={PRINTABLE_STARTER_A4_PDF}
                eventProperties={{ locale, pack_id: "curated_sampler_3", paper: "a4", location: "print_options", experiment_id: EXPERIMENT_ID }}
                className="mt-5 block rounded-lg bg-primary px-4 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {isZh ? "下载 A4 免费包" : "Download the free A4 pack"}
              </PrintableFreeDownloadLink>
              <PrintableFreeDownloadLink
                href={PRINTABLE_STARTER_LETTER_PDF}
                eventProperties={{ locale, pack_id: "curated_sampler_3", paper: "letter", location: "print_options", experiment_id: EXPERIMENT_ID }}
                className="mt-3 block rounded-lg border border-primary px-4 py-3 text-center font-semibold text-primary hover:bg-primary/10"
              >
                {isZh ? "下载 US Letter 免费包" : "Download the US Letter pack"}
              </PrintableFreeDownloadLink>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <PrintableFreeDownloadLink
                  href={PRINTABLE_STARTER_A4_TWO_UP_PDF}
                  eventProperties={{ locale, pack_id: "curated_sampler_3", paper: "a4", layout: "two", location: "print_options", experiment_id: EXPERIMENT_ID }}
                  className="rounded-lg border px-3 py-2 text-center text-sm font-semibold hover:bg-accent"
                >
                  {isZh ? "A4 一页 2 题" : "A4 compact 2-up"}
                </PrintableFreeDownloadLink>
                <PrintableFreeDownloadLink
                  href={PRINTABLE_STARTER_LETTER_TWO_UP_PDF}
                  eventProperties={{ locale, pack_id: "curated_sampler_3", paper: "letter", layout: "two", location: "print_options", experiment_id: EXPERIMENT_ID }}
                  className="rounded-lg border px-3 py-2 text-center text-sm font-semibold hover:bg-accent"
                >
                  {isZh ? "Letter 一页 2 题" : "Letter compact 2-up"}
                </PrintableFreeDownloadLink>
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
                ? `30 天每日数独冥想 · ${paidPackPrice}`
                : `30 Days of Daily Sudoku Meditation · ${paidPackPrice}`}
            </h2>
            <div className="mt-5 border-l-2 border-primary pl-4">
              <p className="font-semibold leading-relaxed text-foreground">
                {isZh
                  ? "先解锁你在免费包中看到的 Expert 题：获得 12 步真实开局讲解与完整答案，再继续挑战完整 100 题训练库。"
                  : "Unlock the Expert puzzle from your free pack: get its verified 12-step opening and full answer, then continue through the complete 100-puzzle library."}
              </p>
            </div>
            <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
              {isZh
                ? `每天约 10 分钟远离屏幕，完成 3 道渐进题，从 Easy 稳步推进到 Expert，训练逻辑并享受心流。100 题全部附答案，平均每天 $${paidPackDailyPrice}，无广告、无需订阅。`
                : `Spend about 10 screen-free minutes a day with 3 progressive puzzles, moving from Easy to Expert while training logic and settling into flow. All 100 answers are included for $${paidPackDailyPrice} a day over 30 days, with no ads or subscription.`}
            </p>

          </div>

          <aside className="border-t pt-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-sm font-medium text-muted-foreground">
              {isZh ? "完整 30 天训练库" : "Complete 30-day library"}
            </p>
            <p className="mt-2 text-4xl font-semibold">{paidPackPrice}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {isZh
                ? `一次性付款，不自动续费。先获得 Expert 预览题讲解与答案，再以平均每天 $${paidPackDailyPrice} 获得全部答案和一页 2 题随身版。`
                : `One-time payment with no renewal. Start with the Expert preview walkthrough and answer, then get every answer and portable edition for $${paidPackDailyPrice} a day.`}
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
            {autoDeliveryEnabled && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {isZh
                  ? "如果旧下载地址将你带到这里，请使用付款时的同一浏览器：已完成订单会自动恢复下载。仍无法下载时，请携 PayPal 订单号联系支持。"
                  : "If an older download address brought you here, use the same browser as checkout so a completed order can recover automatically. If it still fails, contact support with the PayPal order ID."}
              </p>
            )}
          </aside>

          <div className="lg:col-start-1">
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {(
                isZh
                  ? [
                      ["Expert 预览题解锁", "包含免费包第 3 题的 12 步真实裸单开局讲解与完整答案；在付费 PDF 中对应第 076 题。"],
                      ["30 天每日训练计划", "100 题按难度渐进分组，每天 3 道核心题，另有 10 道 Expert 题用于复盘。"],
                      ["随身打印版", "所有题目均提供一页 2 题版本，节省纸张，方便携带，通勤、旅行随时玩。"],
                      ["专注做题，再集中核对", "题面与答案分开，完成练习后再进入编号一致的答案区。"],
                      ["付款后自动交付", "PayPal 验证金额和商品后立即生成 7 天下载链接。"],
                    ]
                  : [
                      ["Expert preview unlocked", "Includes a verified 12-step naked-single opening and the full answer for free-pack puzzle 3, shown as puzzle 076 in the paid PDFs."],
                      ["30-day daily training plan", "The 100 puzzles are grouped progressively: 3 core puzzles a day plus 10 Expert review challenges."],
                      ["Portable print edition", "Every puzzle has a two-per-page version that saves paper and travels easily on commutes or trips."],
                      ["Solve first, check later", "Puzzle sheets and matching numbered answers stay separate so you can remain focused."],
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
              <a href="#free-3-puzzle-pack" className="text-primary hover:underline">
                {isZh ? "先下载 3 题精选试玩包" : "Download the 3-puzzle sampler first"}
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
