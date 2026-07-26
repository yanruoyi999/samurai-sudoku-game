import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { CrossHatchingTrainer } from "@/components/sudoku/CrossHatchingTrainer";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/sudoku-cross-hatching';

const steps = {
  en: [
    {
      title: "Choose one digit and one 3×3 box",
      body: "Cross hatching is easier when you ask one narrow question: where can this digit go inside this box? Do not scan every empty cell for every number at once. Start with a digit that already appears in nearby rows or columns.",
    },
    {
      title: "Cross out rows that already contain the digit",
      body: "Look across the full three rows that pass through the target box. If a row already contains the chosen digit anywhere on the board, that digit cannot appear again in the same row, so every empty target-box cell on that row is excluded.",
    },
    {
      title: "Cross out columns that already contain the digit",
      body: "Repeat the scan vertically. A column containing the chosen digit removes the corresponding target-box cells. The row and column exclusions form the visual cross-hatching pattern that gives the technique its name.",
    },
    {
      title: "Place the digit only when one cell survives",
      body: "If exactly one empty cell in the box survives both scans, the placement is logically forced. If two or more cells remain, stop. Cross hatching has narrowed the options but has not solved that digit yet.",
    },
  ],
  zh: [
    {
      title: "选定一个数字和一个 3×3 宫",
      body: "交叉排除最有效的提问不是“这个空格填什么”，而是“这个数字在这个宫里能放哪里”。不要同时计算所有空格与全部数字，先选一个已经在附近行列中出现多次的数字。",
    },
    {
      title: "排除已经包含该数字的行",
      body: "横向查看穿过目标宫的三行。某一行只要已经出现目标数字，该行在目标宫内的所有空格就都不能再填同一个数字，因此可以整行排除。",
    },
    {
      title: "排除已经包含该数字的列",
      body: "再纵向扫描三列。某一列已有目标数字，就排除它在目标宫内对应的空格。横向和纵向排除线交叉后，就形成了这种技巧的视觉结构。",
    },
    {
      title: "只在剩余一个位置时落子",
      body: "如果目标宫经过行列排除后只剩一个空格，这一步才是逻辑确定的。若仍有两个或更多位置，就先停止；交叉排除只是缩小了范围，还没有给出唯一答案。",
    },
  ],
} as const;

const terminology = {
  en: [
    {
      term: "Cross hatching",
      meaning: "A visual scanning process that removes rows and columns from a chosen digit's positions inside one box.",
      result: "Often exposes one legal position for the digit.",
    },
    {
      term: "Hidden single",
      meaning: "A digit has only one legal location within a row, column, or box, even if that cell still has other pencil marks.",
      result: "Cross hatching commonly reveals a hidden single in a box.",
    },
    {
      term: "Naked single",
      meaning: "One cell has only one possible candidate after all of its row, column, and box constraints are applied.",
      result: "Starts from the cell, not from a chosen digit.",
    },
    {
      term: "Locked candidates",
      meaning: "All candidates for a digit in a box lie on one row or column, so that digit can be removed elsewhere on that line.",
      result: "Eliminates candidates outside the box; it may not place a digit immediately.",
    },
  ],
  zh: [
    {
      term: "交叉排除",
      meaning: "选定一个数字，在一个宫内通过已有数字所在的行和列排除不可能位置。",
      result: "常常直接找到该数字在宫内的唯一位置。",
    },
    {
      term: "隐藏唯一",
      meaning: "某个数字在一行、一列或一宫中只剩一个合法位置，即使那个格子里还写着多个候选。",
      result: "交叉排除经常揭示宫内的隐藏唯一。",
    },
    {
      term: "显性唯一",
      meaning: "一个格子结合行、列和宫约束后只剩一个可填数字。",
      result: "它从格子出发，而不是从指定数字出发。",
    },
    {
      term: "区块排除",
      meaning: "一个宫内某数字的候选都落在同一行或同一列，因此可删除该行列在宫外的同数字候选。",
      result: "主要用于删除宫外候选，不一定立即落子。",
    },
  ],
} as const;

const mistakes = {
  en: [
    {
      title: "Scanning only inside the box",
      body: "The useful clues often sit outside the target box. Follow each of its three rows and columns across the full 9×9 board before deciding which cells survive.",
    },
    {
      title: "Treating two remaining cells as a choice",
      body: "Two candidates are not a fifty-fifty decision. Mark them if needed, then scan another digit or another box. A later placement will remove one of them without guessing.",
    },
    {
      title: "Confusing givens with candidate notes",
      body: "A pencil mark does not block an entire row or column. Only a confirmed digit, whether given or logically placed, creates the exclusion used in cross hatching.",
    },
    {
      title: "Forgetting to repeat the scan",
      body: "Every new placement changes three units. Rescan the affected row, column, and box because a previously inconclusive cross hatch may now leave one cell.",
    },
  ],
  zh: [
    {
      title: "只看目标宫内部",
      body: "真正用于排除的数字往往在目标宫外。必须把目标宫对应的三行和三列延伸到整个 9×9 棋盘，再判断哪些空格还能保留。",
    },
    {
      title: "把两个剩余位置当成二选一",
      body: "两个候选不是百分之五十的猜测题。需要时先做候选标记，然后换一个数字或宫继续扫描；后续逻辑会自然排除其中一个。",
    },
    {
      title: "把候选笔记当成确定数字",
      body: "候选数不会排除整行或整列。只有题目给定数字或已经由逻辑确认的数字，才能形成交叉排除中的阻挡。",
    },
    {
      title: "落子后没有重新扫描",
      body: "每个新数字都会改变一行、一列和一宫。立即复查这些区域，之前没有唯一答案的交叉排除，可能现在只剩一个位置。",
    },
  ],
} as const;

const faq = {
  en: [
    {
      question: "What is cross hatching in Sudoku?",
      answer: "Sudoku cross hatching is a scanning technique: choose a digit and a 3×3 box, eliminate target-box cells whose rows or columns already contain that digit, and place it only if one legal cell remains.",
    },
    {
      question: "Is cross hatching the same as scanning?",
      answer: "Cross hatching is a structured form of scanning. General scanning can inspect any unit or candidate; cross hatching specifically combines horizontal and vertical exclusions for one digit in one box.",
    },
    {
      question: "Is cross hatching a hidden-single technique?",
      answer: "It is a method that often reveals a hidden single. The hidden single is the logical result: one location remains for a digit in a unit. Cross hatching is the visual process used to find it.",
    },
    {
      question: "Can cross hatching solve hard Sudoku puzzles?",
      answer: "It solves many early and intermediate placements, but harder puzzles usually also need candidate notes, locked candidates, pairs, or other deductions. Use cross hatching again after every confirmed placement.",
    },
    {
      question: "How does cross hatching work in Samurai Sudoku?",
      answer: "Apply it to one 9×9 grid at a time. In a shared 3×3 overlap box, verify the surviving cell against both connected grids before placing the digit, then rescan both grids.",
    },
  ],
  zh: [
    {
      question: "数独中的交叉排除是什么？",
      answer: "交叉排除是一种扫描技巧：选择一个数字和一个 3×3 宫，排除所在行或列已经包含该数字的宫内空格，只有剩下唯一合法位置时才落子。",
    },
    {
      question: "交叉排除和扫描法是同一个技巧吗？",
      answer: "交叉排除是扫描法的一种具体形式。一般扫描可以检查各种单位和候选；交叉排除专门把一个数字在一个宫内的横向与纵向排除结合起来。",
    },
    {
      question: "交叉排除等于隐藏唯一吗？",
      answer: "不完全相同。隐藏唯一是某个数字在一个单位中只剩一个位置的逻辑结果；交叉排除是通过行列扫描找到这个结果的视觉过程。",
    },
    {
      question: "交叉排除能解决困难数独吗？",
      answer: "它能完成很多开局和中盘落子，但困难题通常还需要候选笔记、区块排除、候选对等技巧。每次确认新数字后，都值得重新执行一次交叉扫描。",
    },
    {
      question: "武士数独如何使用交叉排除？",
      answer: "每次只处理一个 9×9 网格。若目标宫是两个网格共享的重叠宫，必须分别用两个网格的行列约束检查剩余位置，落子后再双向复查。",
    },
  ],
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const normalizedLocale = isZh ? "zh" : "en";
  const canonical = buildLocalizedUrl(normalizedLocale, PATH);
  const title = isZh
    ? "数独交叉排除法图解：从行列扫描到唯一落点"
    : "Sudoku Cross Hatching: Step-by-Step Scanning Technique";
  const description = isZh
    ? "通过互动 9×9 棋盘学习数独交叉排除法：扫描行列、找到隐藏唯一、避免常见误区，并把技巧用于武士数独重叠宫。"
    : "Learn Sudoku cross hatching with an interactive 9×9 example. Scan rows and columns, find hidden singles, avoid common mistakes, and apply it to Samurai Sudoku.";

  return {
    title,
    description,
    keywords: isZh
      ? ["数独交叉排除", "数独扫描法", "数独隐藏唯一", "武士数独交叉排除", "数独入门技巧"]
      : [
          "sudoku cross hatching",
          "cross hatching in sudoku",
          "what is cross hatching in sudoku",
          "cross hatching sudoku",
          "cross hatching technique sudoku",
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

export default async function SudokuCrossHatchingPage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const normalizedLocale = isZh ? "zh" : "en";
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);
  const localizedSteps = steps[normalizedLocale];
  const localizedTerms = terminology[normalizedLocale];
  const localizedMistakes = mistakes[normalizedLocale];
  const faqItems = faq[normalizedLocale];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: isZh ? "数独交叉排除法图解" : "Sudoku Cross Hatching Explained",
    description: isZh
      ? "使用互动棋盘学习行列扫描、隐藏唯一以及武士数独重叠宫中的交叉排除。"
      : "An interactive guide to row and column scanning, hidden singles, and cross hatching in Samurai Sudoku overlap boxes.",
    mainEntityOfPage: pageUrl,
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
    inLanguage: isZh ? "zh-CN" : "en-US",
    author: {
      "@type": "Organization",
      name: "Samurai Sudoku",
      url: buildAbsoluteUrl(`/${normalizedLocale}/about`),
    },
    publisher: {
      "@type": "Organization",
      name: "Samurai Sudoku",
      url: buildAbsoluteUrl(`/${normalizedLocale}`),
    },
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: isZh ? "如何用交叉排除法解数独" : "How to use cross hatching in Sudoku",
    description: isZh
      ? "通过目标数字、行排除、列排除和唯一落点完成一次交叉扫描。"
      : "Use a target digit, row exclusions, column exclusions, and one surviving cell to complete a cross hatch.",
    totalTime: "PT5M",
    step: localizedSteps.map((item, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: item.title,
      text: item.body,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isZh ? "首页" : "Home",
        item: buildAbsoluteUrl(`/${normalizedLocale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isZh ? "数独技巧" : "Sudoku techniques",
        item: buildAbsoluteUrl(`/${normalizedLocale}/games/samurai/solving-tips`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: isZh ? "交叉排除" : "Cross hatching",
        item: pageUrl,
      },
    ],
  };

  return (
    <article className="pb-14">
      {[articleJsonLd, howToJsonLd, faqJsonLd, breadcrumbJsonLd].map(
        (schema, index) => (
          <Script
            key={index}
            id={`sudoku-cross-hatching-jsonld-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ),
      )}

      <div className="mx-auto max-w-5xl px-4 pt-8">
        <nav
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <Link href={`/${normalizedLocale}`} className="hover:text-foreground">
            {isZh ? "首页" : "Home"}
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={`/${normalizedLocale}/games/samurai/solving-tips`}
            className="hover:text-foreground"
          >
            {isZh ? "数独技巧" : "Sudoku techniques"}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">
            {isZh ? "交叉排除" : "Cross hatching"}
          </span>
        </nav>

        <header className="max-w-4xl py-9">
          <p className="text-sm font-semibold text-primary">
            {isZh ? "5 分钟视觉技巧课" : "A 5-minute visual technique lesson"}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
            {isZh ? "数独交叉排除法图解" : "Sudoku Cross Hatching Explained"}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            {isZh
              ? "不用列满候选数，也不用猜。选择一个数字，横向排除已有数字的行，再纵向排除已有数字的列，就能在一个 3×3 宫中找到唯一落点。"
              : "You do not need a full candidate grid or a guess. Choose one digit, eliminate rows that already contain it, then eliminate columns to find its only legal position in a 3×3 box."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="#interactive-example"
              className="rounded-lg bg-primary px-5 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {isZh ? "开始互动图解" : "Start the interactive example"}
            </a>
            <TrackedLink
              href={`/${normalizedLocale}/games/samurai/difficulty/easy`}
              eventName="cross_hatching_easy_cta_click"
              eventProperties={{ locale: normalizedLocale, page: PATH, location: "header" }}
              className="rounded-lg border border-primary px-5 py-3 text-center font-semibold text-primary hover:bg-primary/10"
            >
              {isZh ? "在简单题中练习" : "Practice on an Easy puzzle"}
            </TrackedLink>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            {isZh ? "发布并更新于 " : "Published and updated "}
            <time dateTime="2026-07-26">2026-07-26</time>
          </p>
        </header>
      </div>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h2 className="text-lg font-semibold">
            {isZh ? "直接答案" : "Direct answer"}
          </h2>
          <p className="mt-2 max-w-4xl leading-7 text-muted-foreground">
            {isZh
              ? "数独交叉排除法，是选定一个数字和一个 3×3 宫，再用棋盘上已经出现的同数字排除目标宫中的整行与整列。若交叉排除后只剩一个空格，该数字就必须放在那里；若剩余多个空格，则不能落子。"
              : "Sudoku cross hatching is a visual scanning technique: choose one digit and one 3×3 box, then eliminate target-box cells whose rows or columns already contain that digit. If exactly one empty cell survives, the digit is forced there. If several survive, do not place it yet."}
          </p>
        </div>
      </section>

      <div id="interactive-example" className="scroll-mt-20">
        <CrossHatchingTrainer locale={normalizedLocale} />
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <section className="py-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">
              {isZh ? "基础方法" : "Core method"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              {isZh ? "交叉排除的 4 个步骤" : "Cross hatching in 4 steps"}
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              {isZh
                ? "每次只追踪一个数字，认知负担会远小于同时观察整个棋盘。下面四步可以反复用于九个宫；新数字落下后，再从受影响的行、列和宫重新开始。"
                : "Track one digit at a time instead of reading the entire board at once. Repeat these four steps across the nine boxes, then rescan the affected row, column, and box after every placement."}
            </p>
          </div>
          <ol className="mt-7 grid gap-4 md:grid-cols-2">
            {localizedSteps.map((item, index) => (
              <li key={item.title} className="border-l-4 border-primary bg-muted/30 p-5">
                <p className="text-xs font-semibold text-primary">
                  {isZh ? `步骤 ${index + 1}` : `Step ${index + 1}`}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-y py-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">
              {isZh ? "术语边界" : "Technique boundaries"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              {isZh
                ? "交叉排除、隐藏唯一和区块排除有什么不同？"
                : "Cross hatching vs hidden singles and locked candidates"}
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              {isZh
                ? "这些术语经常一起出现，但它们描述的是不同视角或不同逻辑结果。区分清楚后，你才能知道什么时候可以立即填数，什么时候只能删除候选。"
                : "These terms often appear together, but they describe different viewpoints or logical outcomes. The distinction tells you when a digit is ready to place and when you have only earned a candidate elimination."}
            </p>
          </div>
          <dl className="mt-7 divide-y border-y">
            {localizedTerms.map((item) => (
              <div
                key={item.term}
                className="grid gap-2 py-5 md:grid-cols-[10rem_minmax(0,1fr)_minmax(0,0.8fr)] md:gap-6"
              >
                <dt className="font-semibold text-primary">{item.term}</dt>
                <dd className="leading-7 text-muted-foreground">{item.meaning}</dd>
                <dd className="text-sm leading-6">{item.result}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div>
              <p className="text-sm font-semibold text-primary">
                {isZh ? "武士数独适配" : "Samurai Sudoku adaptation"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                {isZh
                  ? "在重叠宫里，要执行两次交叉扫描"
                  : "In an overlap box, cross hatch from both grids"}
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                {isZh
                  ? "普通数独的一个格子只属于一个 9×9 网格；武士数独的重叠宫同时属于中央网格和一个角落网格。因此，先以当前网格为边界完成行列扫描，再切换到相连网格复查同一个共享格。只有两个网格都允许的位置，才是真正合法的位置。"
                  : "A regular Sudoku cell belongs to one 9×9 grid. A Samurai overlap cell belongs to both the center grid and one corner grid. First scan the rows and columns of one grid, then verify the same shared cell from the connected grid. A position is legal only when both grids allow it."}
              </p>
              <p className="mt-4 leading-7 text-muted-foreground">
                {isZh
                  ? "重叠宫中的数字确认后，它会同时更新两个网格。不要继续只解当前角落；立即回到中央网格做一次新的行列扫描，这通常能打开下一条解题链。"
                  : "Once an overlap digit is confirmed, it updates two grids at once. Do not keep solving only the current corner. Return to the center grid for another row-and-column scan, which often opens the next deduction chain."}
              </p>
            </div>
            <aside className="border-l-4 border-amber-500 bg-amber-50 p-5 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
              <h3 className="font-semibold">
                {isZh ? "重叠宫检查清单" : "Overlap-box checklist"}
              </h3>
              <ol className="mt-3 space-y-3 text-sm leading-6">
                <li>{isZh ? "1. 选一个目标数字。" : "1. Choose one target digit."}</li>
                <li>{isZh ? "2. 扫描第一个网格的三行三列。" : "2. Scan the first grid's three rows and columns."}</li>
                <li>{isZh ? "3. 用相连网格再次验证剩余格。" : "3. Verify survivors from the connected grid."}</li>
                <li>{isZh ? "4. 落子后双向复查。" : "4. Rescan both grids after placing."}</li>
              </ol>
              <Link
                href={`/${normalizedLocale}/games/samurai/overlap-boxes`}
                className="mt-5 inline-flex font-semibold underline underline-offset-4"
              >
                {isZh ? "查看重叠宫完整图解" : "Open the overlap-box guide"}
              </Link>
            </aside>
          </div>
        </section>

        <section className="border-y py-12">
          <h2 className="text-3xl font-semibold">
            {isZh ? "4 个常见错误" : "4 common cross-hatching mistakes"}
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {localizedMistakes.map((item) => (
              <section key={item.title} className="rounded-lg border p-5">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{item.body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">
              {isZh ? "练习顺序" : "Practice sequence"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              {isZh ? "从图解到真实棋盘" : "Move from the walkthrough to a real puzzle"}
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              {isZh
                ? "先完成上方三组互动练习，确保你能解释每一条排除线。然后打开简单武士数独，只在一个角落网格中选择一个数字做交叉扫描。找到重叠宫落点后，再切回中央网格复查。"
                : "Complete all three interactive examples above and explain every exclusion line. Then open an Easy Samurai puzzle, choose one digit in one corner grid, and cross hatch there. If the placement lands in an overlap box, switch to the center grid and rescan."}
            </p>
            <p className="mt-4 leading-7 text-muted-foreground">
              {isZh
                ? "如果扫描后剩两个格，不要猜。转到另一个宫或另一个数字，直到新落子改变原来的行列条件。这个“找不到就换目标，落子后再回来”的循环，比反复清空棋盘更可靠。"
                : "If two cells survive, do not guess. Move to another box or digit until a new placement changes the original rows or columns. This loop of changing targets and returning after progress is more reliable than clearing the board."}
            </p>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <TrackedLink
              href={`/${normalizedLocale}/games/samurai/difficulty/easy`}
              eventName="cross_hatching_easy_cta_click"
              eventProperties={{ locale: normalizedLocale, page: PATH, location: "practice" }}
              className="rounded-lg bg-primary px-5 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {isZh ? "打开简单题练习交叉排除" : "Practice cross hatching on Easy"}
            </TrackedLink>
            <TrackedLink
              href={`/${normalizedLocale}/games/samurai/first-move-strategy`}
              eventName="cross_hatching_first_move_cta_click"
              eventProperties={{ locale: normalizedLocale, page: PATH }}
              className="rounded-lg border px-5 py-3 text-center font-semibold hover:border-primary hover:bg-primary/5"
            >
              {isZh ? "结合第一步开局流程" : "Combine it with the first-move workflow"}
            </TrackedLink>
          </div>
        </section>

        <section className="border-t py-12">
          <h2 className="text-3xl font-semibold">
            {isZh ? "常见问题" : "Frequently asked questions"}
          </h2>
          <div className="mt-6 divide-y border-y">
            {faqItems.map((item) => (
              <details key={item.question} className="py-5">
                <summary className="cursor-pointer font-semibold">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-4xl leading-7 text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="border-t pt-12">
          <p className="text-sm font-semibold text-primary">
            {isZh ? "继续学习" : "Continue learning"}
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            {isZh ? "把基础扫描接入完整解题流程" : "Connect scanning to the full solving workflow"}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/games/samurai/first-move-strategy",
                title: isZh ? "第一步开局" : "First-move strategy",
                body: isZh ? "选择正确起点并开始扫描。" : "Choose a productive starting area.",
              },
              {
                href: "/games/samurai/overlap-boxes",
                title: isZh ? "重叠宫图解" : "Overlap boxes",
                body: isZh ? "理解两个网格的共享约束。" : "Understand constraints shared by two grids.",
              },
              {
                href: "/games/samurai/strategy-guide",
                title: isZh ? "进阶技巧" : "Advanced techniques",
                body: isZh ? "学习区块排除、候选对和跨网格推理。" : "Learn locked candidates, pairs, and cross-grid logic.",
              },
              {
                href: "/games/samurai/difficulty/easy",
                title: isZh ? "简单题实战" : "Easy practice",
                body: isZh ? "在真实棋盘上反复执行四步扫描。" : "Repeat the four-step scan on a real board.",
              },
              {
                href: "/sudoku-naked-triple",
                title: isZh ? "显性三数组" : "Naked triple",
                body: isZh ? "扫描不足时学习候选集合排除。" : "Use candidate sets when scanning stalls.",
              },
              {
                href: "/sudoku-swordfish",
                title: isZh ? "数独剑鱼" : "Sudoku Swordfish",
                body: isZh ? "进阶到三行或三列的候选排除。" : "Advance to three-line candidate eliminations.",
              },
              {
                href: "/printable-sudoku",
                title: isZh ? "标准数独打印练习" : "Printable Sudoku practice",
                body: isZh ? "用纸笔反复练习交叉扫描。" : "Repeat cross-hatching scans on paper.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={`/${normalizedLocale}${item.href}`}
                className="rounded-lg border p-5 hover:border-primary hover:bg-primary/5"
              >
                <h3 className="font-semibold text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
