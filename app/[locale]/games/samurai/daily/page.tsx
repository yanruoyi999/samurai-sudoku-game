import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { MiniSamuraiPreview } from "@/components/printable/MiniSamuraiPreview";
import { PRINTABLE_PUZZLE_OPEN_EVENT } from "@/lib/analytics/event-names";
import { selectRecentDailyPuzzles } from "@/lib/daily-puzzles";
import { getPuzzle, getPuzzleIndex } from "@/lib/puzzles";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";
import type { Difficulty } from "@/lib/sudoku/types";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = "/games/samurai/daily";
const DIFFICULTY_LABELS: Record<Difficulty, { en: string; zh: string }> = {
  easy: { en: "Easy", zh: "简单" },
  medium: { en: "Medium", zh: "中等" },
  hard: { en: "Hard", zh: "困难" },
  evil: { en: "Evil", zh: "Evil 极难" },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const index = await getPuzzleIndex();
  const latest = selectRecentDailyPuzzles(index.puzzles, 1)[0];
  const title = isZh
    ? "每日武士数独 - 今日免费题目与打印版"
    : "Daily Samurai Sudoku - Today's Free Puzzle & Printable";
  const description = isZh
    ? `挑战${latest ? ` ${latest.id}` : "今日"}每日武士数独，可在线游玩或打印保存 PDF，并浏览按日期归档的历史题目。`
    : `Play the ${latest?.id ?? "latest"} daily Samurai Sudoku online or print and save it as PDF, with a dated archive for more free puzzles.`;
  const canonical = buildLocalizedUrl(locale, PATH);

  return {
    title,
    description,
    keywords: isZh
      ? ["每日武士数独", "今日武士数独", "每日数独挑战", "武士数独打印"]
      : [
          "daily samurai sudoku",
          "samurai sudoku of the day",
          "samurai sudoku today",
          "daily printable samurai sudoku",
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

function formatPuzzleDate(id: string, isZh: boolean) {
  const [year, month, day] = id.split("-").map(Number);
  if (isZh) return `${year}年${month}月${day}日`;

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${id}T00:00:00Z`));
}

export default async function DailySamuraiSudokuPage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const index = await getPuzzleIndex();
  const recentPuzzles = selectRecentDailyPuzzles(index.puzzles, 7);
  const latest = recentPuzzles[0];
  if (!latest) notFound();

  const latestPuzzle = await getPuzzle(latest.id);
  if (!latestPuzzle) notFound();

  const difficultyLabel = DIFFICULTY_LABELS[latest.difficulty][isZh ? "zh" : "en"];
  const displayDate = formatPuzzleDate(latest.id, isZh);
  const pageUrl = buildAbsoluteUrl(`/${locale}${PATH}`);
  const playHref = `/${locale}/games/samurai/${latest.id}`;
  const printHref = `/${locale}/games/samurai/printable/${latest.id}?paper=a4`;
  const printableHubHref = `/${locale}/printable-samurai-sudoku`;
  const archiveHref = `/${locale}/games/samurai/archive`;
  const faqItems = isZh
    ? [
        ["今天的武士数独免费吗？", "免费。今日题可以直接在线游玩，单题打印页也不需要注册或邮箱。"],
        ["可以把今日题保存成 PDF 吗？", "可以。打开打印版后选择 A4 或 US Letter，再使用浏览器的打印或存储为 PDF 功能。答案会从独立页面开始。"],
        ["每日题什么时候更新？", "题库按日期持续增加。页面会自动选择公开题库中日期最新、已经完成结构和答案校验的题目。"],
        ["错过的每日题在哪里？", "近期题目列在本页下方，全部历史题可以在题库归档中按日期和难度浏览。"],
      ]
    : [
        ["Is today's Samurai Sudoku free?", "Yes. You can play today's puzzle or open its printable page without registration or email."],
        ["Can I save today's puzzle as a PDF?", "Yes. Open the printable version, choose A4 or US Letter, then use your browser's Print or Save as PDF command. The answer key starts on a separate page."],
        ["When is the daily puzzle updated?", "The library grows by date. This page automatically selects the newest public puzzle that has passed the site's structure and answer checks."],
        ["Where can I find missed daily puzzles?", "Recent dates are listed below, and the full archive lets you browse every public puzzle by date and difficulty."],
      ];

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
        name: isZh ? "每日武士数独" : "Daily Samurai Sudoku",
        item: pageUrl,
      },
    ],
  };
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: isZh ? "每日武士数独" : "Daily Samurai Sudoku",
    url: pageUrl,
    inLanguage: isZh ? "zh-CN" : "en-US",
    dateModified: index.lastUpdated,
    mainEntity: {
      "@type": "Game",
      name: isZh
        ? `${latest.id} 每日武士数独`
        : `${latest.id} Daily Samurai Sudoku`,
      url: buildAbsoluteUrl(playHref),
      datePublished: latest.id,
      isAccessibleForFree: true,
    },
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
      {[breadcrumbJsonLd, webPageJsonLd, faqJsonLd].map((schema, schemaIndex) => (
        <Script
          key={schemaIndex}
          id={`daily-samurai-sudoku-schema-${schemaIndex}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="border-b px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <nav className="mb-6 flex flex-wrap gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href={`/${locale}`} className="hover:text-foreground">
              {isZh ? "首页" : "Home"}
            </Link>
            <span>/</span>
            <Link href={`/${locale}/games/samurai`} className="hover:text-foreground">
              Samurai Sudoku
            </Link>
            <span>/</span>
            <span className="text-foreground">{isZh ? "每日题" : "Daily"}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-primary">
                {isZh ? "今日一题" : "Samurai Sudoku of the Day"}
              </p>
              <h1 className="mt-3 text-4xl font-semibold md:text-6xl">
                {isZh ? "每日武士数独：今日题目" : "Daily Samurai Sudoku: Today's Puzzle"}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                {isZh
                  ? `今天的免费题是 ${displayDate} ${difficultyLabel} 武士数独，预计 ${latest.estimatedTime} 分钟。你可以在线游玩，也可以打开清晰打印版并保存为 PDF。`
                  : `Today's free puzzle is the ${displayDate} ${difficultyLabel} Samurai Sudoku, estimated at ${latest.estimatedTime} minutes. Play online or open the clean printable version and save it as PDF.`}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <TrackedLink
                  href={playHref}
                  eventName="daily_puzzle_play_click"
                  eventProperties={{ locale, puzzle_id: latest.id, difficulty: latest.difficulty, location: "daily_hero" }}
                  className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {isZh ? "开始今日题" : "Play Today's Puzzle"}
                </TrackedLink>
                <TrackedLink
                  href={printHref}
                  eventName={PRINTABLE_PUZZLE_OPEN_EVENT}
                  eventProperties={{ locale, puzzle_id: latest.id, difficulty: latest.difficulty, paper: "a4", location: "daily_hero" }}
                  className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary/10"
                >
                  {isZh ? "打印 / 保存 PDF" : "Print / Save PDF"}
                </TrackedLink>
                <TrackedLink
                  href={printableHubHref}
                  eventName="daily_printable_hub_click"
                  eventProperties={{ locale, puzzle_id: latest.id, location: "daily_hero" }}
                  className="rounded-lg border px-6 py-3 font-semibold hover:bg-accent"
                >
                  {isZh ? "下载 20 道免费 PDF" : "Download 20 Free PDFs"}
                </TrackedLink>
              </div>
              <dl className="mt-7 grid max-w-2xl grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {[
                  [isZh ? "日期" : "Date", latest.id],
                  [isZh ? "难度" : "Difficulty", difficultyLabel],
                  [isZh ? "预计时间" : "Est. time", `${latest.estimatedTime} ${isZh ? "分钟" : "min"}`],
                  [isZh ? "题库总数" : "Archive", `${index.total} ${isZh ? "题" : "puzzles"}`],
                ].map(([label, value]) => (
                  <div key={label} className="border-t pt-3">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="border-l-0 bg-secondary/20 p-4 lg:border-l">
              <Link href={playHref} aria-label={isZh ? "打开今日武士数独" : "Open today's Samurai Sudoku"}>
                <MiniSamuraiPreview
                  puzzle={latestPuzzle}
                  ariaLabel={isZh ? `${latest.id} 每日武士数独预览` : `${latest.id} daily Samurai Sudoku preview`}
                />
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {isZh
                  ? "浅色区域是共享重叠宫。点击棋盘进入带候选数、提示和本地进度的在线版本。"
                  : "Lightly shaded cells are shared overlap boxes. Select the board to open notes, hints, and locally saved progress."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            <section className="border-t pt-5">
              <h2 className="text-2xl font-semibold">{isZh ? "在线完成今日挑战" : "Solve today's challenge online"}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {isZh
                  ? "在线版本适合短时间练习：支持候选数、冲突高亮、提示和暂停后继续。进度保存在当前浏览器，不需要注册账户。"
                  : "The online version is built for a focused session with candidate notes, conflict highlighting, hints, and resume support. Progress stays in this browser and needs no account."}
              </p>
              <Link href={playHref} className="mt-4 inline-flex font-semibold text-primary hover:underline">
                {isZh ? `在线玩 ${latest.id} 题目` : `Play the ${latest.id} puzzle`} →
              </Link>
            </section>
            <section className="border-t pt-5">
              <h2 className="text-2xl font-semibold">{isZh ? "打印后慢慢推理" : "Print it for slower paper solving"}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {isZh
                  ? "打印版把答案放在独立页，支持 A4 和 US Letter。先完成题面，再核对答案；需要更多练习时进入免费可打印武士数独中心。"
                  : "The printable version starts the answer key on a separate page and supports A4 and US Letter. Solve first, check later, then use the free printable Samurai Sudoku center when you need more sheets."}
              </p>
              <Link href={printableHubHref} className="mt-4 inline-flex font-semibold text-primary hover:underline">
                {isZh ? "免费可打印武士数独题目" : "Free printable Samurai Sudoku puzzles"} →
              </Link>
            </section>
          </div>
        </div>
      </section>

      <section className="bg-secondary/20 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold">{isZh ? "最近的每日武士数独" : "Recent Daily Samurai Sudoku Puzzles"}</h2>
              <p className="mt-2 text-muted-foreground">
                {isZh ? "错过某一天？按日期继续在线玩或直接打开打印版。" : "Missed a day? Continue online or open a printable copy by date."}
              </p>
            </div>
            <Link href={archiveHref} className="font-semibold text-primary hover:underline">
              {isZh ? "查看完整归档" : "Browse the full archive"} →
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentPuzzles.slice(1).map((puzzle) => {
              const label = DIFFICULTY_LABELS[puzzle.difficulty][isZh ? "zh" : "en"];
              return (
                <article key={puzzle.id} className="rounded-lg border bg-background p-4">
                  <p className="text-sm text-muted-foreground">{formatPuzzleDate(puzzle.id, isZh)}</p>
                  <h3 className="mt-1 font-semibold">
                    {isZh ? `${label}武士数独` : `${label} Samurai Sudoku`}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {puzzle.estimatedTime} {isZh ? "分钟预计时间" : "minute estimate"}
                  </p>
                  <div className="mt-4 flex gap-3 text-sm font-semibold">
                    <Link href={`/${locale}/games/samurai/${puzzle.id}`} className="text-primary hover:underline">
                      {isZh ? "在线玩" : "Play"}
                    </Link>
                    <Link href={`/${locale}/games/samurai/printable/${puzzle.id}?paper=a4`} className="text-primary hover:underline">
                      {isZh ? "打印 / PDF" : "Print / PDF"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_340px]">
          <section>
            <h2 className="text-3xl font-semibold">{isZh ? "一套可重复的每日解题流程" : "A repeatable daily solving routine"}</h2>
            <ol className="mt-5 grid gap-4 sm:grid-cols-2">
              {(
                isZh
                  ? [
                      ["先扫四个重叠宫", "共享区域同时限制两个网格，最容易产生第一批确定数字。"],
                      ["只记录有效候选", "优先在重叠区和中心网格写候选，避免全盘笔记过载。"],
                      ["每次填数后复查两个网格", "重叠宫的变化必须同时传回中心与角落网格。"],
                      ["卡住时回退，不要猜", "清理最近区域的过期候选，再检查唯一数、候选对和锁定候选。"],
                    ]
                  : [
                      ["Scan the four overlap boxes", "Shared cells constrain two grids and often produce the first confirmed placements."],
                      ["Write only useful candidates", "Prioritize overlaps and the center grid instead of covering all 369 cells with notes."],
                      ["Recheck both grids after a move", "Every overlap placement must feed back into the center and its connected corner grid."],
                      ["Roll back when stuck; do not guess", "Clear stale notes near the latest change, then check singles, pairs, and locked candidates."],
                    ]
              ).map(([title, body], index) => (
                <li key={title} className="border-t pt-4">
                  <h3 className="font-semibold">{index + 1}. {title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              <Link href={`/${locale}/games/samurai/how-to-play`} className="rounded-md border px-3 py-2 hover:bg-accent">
                {isZh ? "武士数独规则" : "Samurai Sudoku rules"}
              </Link>
              <Link href={`/${locale}/games/samurai/strategy-guide`} className="rounded-md border px-3 py-2 hover:bg-accent">
                {isZh ? "解题策略" : "Solving strategy"}
              </Link>
              <Link href={`/${locale}/games/samurai/candidate-notes`} className="rounded-md border px-3 py-2 hover:bg-accent">
                {isZh ? "候选数方法" : "Candidate notes"}
              </Link>
            </div>
          </section>

          <aside className="border-l-0 bg-primary/5 p-5 lg:border-l">
            <h2 className="text-xl font-semibold">{isZh ? "今日题如何验证" : "How today's puzzle is checked"}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {isZh
                ? "今日题来自本站公开题库。构建流程会校验五个网格结构、重叠格一致性、完整答案和唯一解；页面只展示已经通过校验的日期题。"
                : "Today's board comes from the public archive. The build checks all five grids, shared-cell consistency, the complete answer, and solution uniqueness before a dated puzzle is published here."}
            </p>
            <p className="mt-4 text-sm font-medium">
              {isZh ? `页面更新：${latest.id}` : `Page updated: ${latest.id}`}
            </p>
          </aside>
        </div>
      </section>

      <section className="border-t bg-secondary/20 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-semibold">{isZh ? "常见问题" : "Daily Puzzle FAQ"}</h2>
          <div className="mt-5 grid gap-4">
            {faqItems.map(([question, answer]) => (
              <section key={question} className="rounded-lg border bg-background p-5">
                <h3 className="font-semibold">{question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{answer}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
