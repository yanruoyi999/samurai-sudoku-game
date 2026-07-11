import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { isLocale, type Locale } from "@/i18n";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

const GUIDE_PATH = "/games/samurai/common-mistakes";
const UPDATED_AT = "2026-07-12";

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface TextBlock {
  title: string;
  body: string;
}

interface ChecklistGroup {
  title: string;
  items: string[];
}

interface CommonMistakesContent {
  metaTitle: string;
  title: string;
  eyebrow: string;
  description: string;
  intro: string;
  quickAnswerTitle: string;
  quickAnswer: string;
  mistakesTitle: string;
  mistakesIntro: string;
  mistakes: TextBlock[];
  recoveryTitle: string;
  recoveryIntro: string;
  recoverySteps: TextBlock[];
  checklistTitle: string;
  checklists: ChecklistGroup[];
  faqTitle: string;
  faqs: TextBlock[];
  nextTitle: string;
  nextBody: string;
  primaryCta: string;
  secondaryCta: string;
  keywords: string[];
}

function normalizeLocale(locale: string): Locale {
  return isLocale(locale) ? locale : "en";
}

const content: Record<Locale, CommonMistakesContent> = {
  en: {
    metaTitle: "Samurai Sudoku Common Mistakes - Why You Get Stuck and How to Recover",
    title: "Samurai Sudoku common mistakes: why players get stuck and how to recover",
    eyebrow: "Long-tail troubleshooting guide",
    description:
      "A practical Samurai Sudoku guide for players who switch difficulties, enter and clear numbers, restart puzzles, or get stuck after a few grids.",
    intro:
      "Most Samurai Sudoku drop-offs do not come from a lack of interest. Players usually understand the goal, then run into one of four problems: the board feels too large, the overlap boxes are not being transferred, candidates become stale, or the selected difficulty does not match the current skill level.",
    quickAnswerTitle: "Fast answer",
    quickAnswer:
      "If you are stuck in Samurai Sudoku, do not keep scanning the same grid. Pick one active overlap box, rebuild its candidates from both connected grids, transfer every placement into both boards, and switch down one difficulty if you have made no confirmed move for several minutes.",
    mistakesTitle: "The mistakes that cause early exits",
    mistakesIntro:
      "These are the problems that match real play behavior: difficulty switching, first-move hesitation, repeated entry and clearing, new-game resets, and the classic hard or evil stall after two areas look finished.",
    mistakes: [
      {
        title: "Choosing Evil before the overlap workflow is stable",
        body: "Evil puzzles are not just longer Easy puzzles. They assume that you can maintain candidates, recheck overlap boxes, and use pairs without guessing. If you are still learning the five-grid layout, start on Easy or Medium until overlap transfers feel automatic.",
      },
      {
        title: "Trying to solve one corner grid in isolation",
        body: "A corner grid can look blocked because it is waiting for information from the center grid. When a corner stops moving, check the shared 3x3 box that connects it to the center instead of repeating the same local scan.",
      },
      {
        title: "Filling a shared cell but updating only one grid",
        body: "Every overlap cell belongs to two Sudoku grids. A correct placement can still create a later stall if you forget to remove that digit from the row, column, and box constraints in the connected grid.",
      },
      {
        title: "Writing too many candidates too early",
        body: "Full-board notes can become visual noise on a 369-cell Samurai board. Before writing every candidate, solve obvious singles, then write notes around the active overlap and the rows or boxes that changed most recently.",
      },
      {
        title: "Keeping stale candidates after a new overlap placement",
        body: "A candidate note written five moves ago may be illegal now. Hard and evil puzzles often reopen when you erase one small bridge area and rebuild candidates from current rows, columns, boxes, and the connected overlap.",
      },
      {
        title: "Applying row or column rules across empty space",
        body: "The five grids are connected by shared 3x3 boxes, not by long rows across the whole page. A row rule belongs to one 9x9 grid at a time. Do not extend it through the gap between grids.",
      },
      {
        title: "Restarting instead of diagnosing the first stuck point",
        body: "New Game is useful when the difficulty is wrong, but repeated restarts hide the pattern. If you restart after the same kind of stall, the problem is usually overlap transfer, candidate upkeep, or difficulty choice.",
      },
      {
        title: "Using hints as answer reveals instead of workflow checks",
        body: "A good hint should teach the next deduction. Before asking for a hint, list the candidates in the stuck cell or overlap box so the explanation becomes useful instead of feeling like a random answer.",
      },
    ],
    recoveryTitle: "A clean recovery workflow",
    recoveryIntro:
      "Use this sequence when you have clicked around, cleared numbers, or sat for a few minutes without a confirmed move. It keeps the recovery small enough to finish.",
    recoverySteps: [
      {
        title: "1. Stop adding numbers for one minute",
        body: "Freeze the board and identify the last move you can explain. If the last move was a guess, clear it before continuing.",
      },
      {
        title: "2. Pick one active overlap box",
        body: "Choose the shared 3x3 box that touches the grid you cannot move. Treat it as the only area you are solving for the next pass.",
      },
      {
        title: "3. Rebuild candidates in that box from both grids",
        body: "For each empty shared cell, check the row, column, and box in the corner grid, then repeat the check in the center grid. Keep only candidates legal in both views.",
      },
      {
        title: "4. Look for singles, then pairs",
        body: "First find a digit that has only one cell. If there is no single, check whether two cells share the same two candidates and can remove those candidates elsewhere.",
      },
      {
        title: "5. Transfer the result immediately",
        body: "A placement or elimination in the overlap must be applied to both connected grids. Scan the affected row, column, and box on each side before moving on.",
      },
      {
        title: "6. Change difficulty deliberately",
        body: "If the board still has no confirmed move after a focused overlap pass, switch down one level for practice. If Easy is too automatic, move up only after you can explain your overlap decisions.",
      },
    ],
    checklistTitle: "Use the right checklist for your situation",
    checklists: [
      {
        title: "First 30 seconds",
        items: [
          "Select a cell before tapping a number.",
          "Start with Easy if this is your first Samurai Sudoku.",
          "Find the four shared 3x3 overlap boxes before solving.",
          "Make one confirmed placement before switching difficulty.",
        ],
      },
      {
        title: "After two grids or large regions are filled",
        items: [
          "Recheck the overlap that connects the stuck grid to the center.",
          "Erase stale candidates in that bridge area.",
          "Read the shared box once as the corner grid and once as the center grid.",
          "Search for pairs before guessing.",
        ],
      },
      {
        title: "Before restarting",
        items: [
          "Identify whether the problem is difficulty, layout confusion, or candidate upkeep.",
          "Use one hint only after writing candidates in the stuck area.",
          "Switch down one difficulty if you cannot explain the next move.",
          "Use the archive when you want another board at the same difficulty.",
        ],
      },
    ],
    faqTitle: "FAQ",
    faqs: [
      {
        title: "Why do I get stuck after filling two grids?",
        body: "Because the next grid may need information from the center overlap. Rebuild candidates in the shared box that touches the stuck grid instead of solving the corner alone.",
      },
      {
        title: "Should beginners use candidate notes immediately?",
        body: "Not on every cell. Solve obvious singles first, then use candidates around overlap boxes and areas that changed recently.",
      },
      {
        title: "Is it wrong to switch difficulties often?",
        body: "No, but switch with a reason. Use Easy to learn layout, Medium to practice candidates, Hard for longer logic, and Evil only when overlap transfers are stable.",
      },
      {
        title: "When should I press New Game?",
        body: "Press New Game when you want a fresh puzzle at the selected difficulty. If you keep restarting for the same reason, read the stuck pattern first.",
      },
      {
        title: "Do hints make me worse at Sudoku?",
        body: "Hints help when they explain a deduction. They hurt when used as answer reveals without checking candidates first.",
      },
    ],
    nextTitle: "Continue with the best next page",
    nextBody:
      "If you are new, start with Easy. If you already know the rules but keep stalling, use the overlap and candidate-note guides before moving back to Hard or Evil.",
    primaryCta: "Start with Easy",
    secondaryCta: "Read overlap boxes",
    keywords: [
      "samurai sudoku common mistakes",
      "why am i stuck in samurai sudoku",
      "samurai sudoku beginner mistakes",
      "samurai sudoku overlap mistakes",
      "hard samurai sudoku help",
      "evil samurai sudoku stuck",
    ],
  },
  zh: {
    metaTitle: "武士数独常见错误 - 为什么卡住以及如何恢复",
    title: "武士数独常见错误：为什么会卡住，以及如何恢复",
    eyebrow: "长尾痛点排查指南",
    description:
      "面向频繁切换难度、反复输入清除、开新局或两三个网格后卡住的武士数独玩家，给出可执行恢复流程。",
    intro:
      "武士数独早退通常不是因为用户没有兴趣，而是卡在四个问题：棋盘太大不知道从哪开始、重叠区没有同步传导、候选数过期、当前难度超过了当下流程能力。",
    quickAnswerTitle: "快速结论",
    quickAnswer:
      "如果武士数独卡住，不要继续扫同一个网格。选一个连接卡住区域的重叠 3x3 宫，从两个相连网格重新计算候选，把每次填数和排除同步到两边；如果几分钟没有确定步，就降一个难度练流程。",
    mistakesTitle: "导致早退的常见错误",
    mistakesIntro:
      "这些问题对应真实行为：频繁切难度、第一步犹豫、输入后又清除、反复开新局，以及困难或 Evil 题两个区域后打不开第三个区域。",
    mistakes: [
      {
        title: "重叠区流程没稳定就直接玩 Evil",
        body: "Evil 不是更长的简单题。它默认你能维护候选数、复查重叠宫并使用候选对。如果还在熟悉五宫布局，先用简单或中等把重叠传导练顺。",
      },
      {
        title: "把角落网格当成独立数独硬解",
        body: "角落网格有时看起来无法推进，是因为它在等中心网格通过重叠区提供信息。角落卡住时，先查它和中心相连的共享 3x3 宫。",
      },
      {
        title: "填了共享格，只更新了一个网格",
        body: "每个重叠格属于两个数独网格。数字本身可能正确，但如果没有从另一个网格的行、列、宫里同步排除，后面就会假性卡死。",
      },
      {
        title: "太早写满全盘候选",
        body: "369 个可见格全写候选很容易变成噪音。先做明显唯一数，再围绕当前重叠区和最近发生变化的行列宫写候选。",
      },
      {
        title: "重叠区变化后还相信旧候选",
        body: "五步前写的候选，现在可能已经非法。困难和 Evil 题经常只需要擦掉一个桥接区域，按当前约束重新算候选就能继续。",
      },
      {
        title: "把行列规则跨过空白区域使用",
        body: "五个网格只通过共享 3x3 宫连接，不是整张大图的一整行。行列规则一次只属于一个 9x9 网格，不要穿过网格之间的空白。",
      },
      {
        title: "用开新局代替诊断",
        body: "难度选错时开新局有用，但反复开新局会掩盖真正问题。如果每次都在同类位置卡住，通常是重叠传导、候选维护或难度选择的问题。",
      },
      {
        title: "把提示当答案，而不是当流程检查",
        body: "好的提示应该教你下一步推理。点提示前，先写出卡住格或重叠宫的候选，这样提示才不会像随机给答案。",
      },
    ],
    recoveryTitle: "干净的恢复流程",
    recoveryIntro:
      "如果你已经点了一圈、填了又清、或几分钟没有确定进展，用下面流程。它把恢复范围缩小到能完成的一小块。",
    recoverySteps: [
      {
        title: "1. 先停止填数一分钟",
        body: "冻结棋盘，找出最后一步你能解释的填数。如果上一手是猜的，先清掉再继续。",
      },
      {
        title: "2. 选择一个活跃重叠宫",
        body: "找出连接卡住网格和中心网格的共享 3x3 宫。接下来一轮只解决这个桥接区。",
      },
      {
        title: "3. 从两个网格重建候选",
        body: "每个共享空格先看角落网格的行、列、宫，再看中心网格的行、列、宫。只保留两边都合法的候选。",
      },
      {
        title: "4. 先找唯一，再找候选对",
        body: "先看某个数字是否只有一个位置。如果没有，再找两个格子是否共享同一对候选，并据此排除其他位置。",
      },
      {
        title: "5. 结果立刻传导到两边",
        body: "重叠区里的填数或排除必须同步到两个相连网格。先扫两边受影响的行、列、宫，再移动到其他区域。",
      },
      {
        title: "6. 有意识地切换难度",
        body: "如果一次聚焦重叠区后仍没有确定步，降一个难度练流程。只有当你能解释重叠区决策时，再升到 Hard 或 Evil。",
      },
    ],
    checklistTitle: "按场景使用检查清单",
    checklists: [
      {
        title: "前 30 秒",
        items: [
          "先选格子，再点数字。",
          "第一次玩武士数独先从简单难度开始。",
          "解题前先找到四个共享 3x3 重叠宫。",
          "至少完成一个有依据的填数，再切换难度。",
        ],
      },
      {
        title: "两个网格或大区域完成后",
        items: [
          "复查连接卡住网格和中心的那个重叠宫。",
          "擦掉桥接区里的过期候选。",
          "同一个共享宫要按角落网格读一次，再按中心网格读一次。",
          "猜之前先找候选对。",
        ],
      },
      {
        title: "开新局之前",
        items: [
          "判断问题是难度、布局不熟，还是候选维护。",
          "只在卡住区域写出候选后再用一次提示。",
          "如果解释不了下一步，就降一个难度。",
          "想玩同难度新题时，优先用题库归档选择。",
        ],
      },
    ],
    faqTitle: "常见问题",
    faqs: [
      {
        title: "为什么填完两个网格后第三个总打不开？",
        body: "因为第三个网格可能需要中心网格通过重叠区传来的信息。不要只在角落里硬扫，先重建连接它的共享宫候选。",
      },
      {
        title: "新手要一开始就写候选数吗？",
        body: "不要给所有格都写。先做明显唯一数，再围绕重叠区和最近变化的区域写候选。",
      },
      {
        title: "频繁切换难度是不是不对？",
        body: "切难度本身没问题，但要有目的：简单练布局，中等练候选，困难练长链逻辑，Evil 适合重叠传导已经稳定的玩家。",
      },
      {
        title: "什么时候应该点新游戏？",
        body: "当你想在当前难度换一题时可以点新游戏。如果总因为同类卡点重开，应该先读卡点模式。",
      },
      {
        title: "用提示会不会降低数独能力？",
        body: "解释型提示有帮助。直接当答案看才会削弱训练效果。点提示前先写候选，才能理解提示为什么成立。",
      },
    ],
    nextTitle: "下一步去哪里",
    nextBody:
      "如果你是新手，从简单题开始。如果已经会规则但经常卡住，先看重叠宫和候选数指南，再回到 Hard 或 Evil。",
    primaryCta: "从简单题开始",
    secondaryCta: "查看重叠宫",
    keywords: [
      "武士数独常见错误",
      "武士数独为什么卡住",
      "武士数独新手错误",
      "武士数独重叠区错误",
      "困难武士数独帮助",
      "Evil 武士数独卡住",
    ],
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const page = content[normalizedLocale];
  const canonical = buildLocalizedUrl(normalizedLocale, GUIDE_PATH);

  return {
    title: page.metaTitle,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(GUIDE_PATH),
    },
    openGraph: {
      title: page.metaTitle,
      description: page.description,
      url: canonical,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: page.metaTitle,
      description: page.description,
    },
  };
}

export default async function CommonMistakesPage({ params }: PageProps) {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const isZh = normalizedLocale === "zh";
  const page = content[normalizedLocale];
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${GUIDE_PATH}`);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.title,
    description: page.description,
    dateModified: UPDATED_AT,
    mainEntityOfPage: pageUrl,
    inLanguage: isZh ? "zh-CN" : "en-US",
    author: {
      "@type": "Organization",
      name: "Samurai Sudoku",
      url: buildAbsoluteUrl(`/${normalizedLocale}`),
    },
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.body,
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
        name: "Samurai Sudoku",
        item: buildAbsoluteUrl(`/${normalizedLocale}/games/samurai`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <Script
        id={`common-mistakes-article-jsonld-${normalizedLocale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id={`common-mistakes-faq-jsonld-${normalizedLocale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id={`common-mistakes-breadcrumb-jsonld-${normalizedLocale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="mx-auto max-w-4xl px-4 py-10">
        <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href={`/${normalizedLocale}`} className="hover:text-foreground">
            {isZh ? "首页" : "Home"}
          </Link>
          <span aria-hidden className="mx-2">/</span>
          <Link href={`/${normalizedLocale}/games/samurai`} className="hover:text-foreground">
            Samurai Sudoku
          </Link>
          <span aria-hidden className="mx-2">/</span>
          <span className="text-foreground">{isZh ? "常见错误" : "Common mistakes"}</span>
        </nav>

        <header className="space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            {page.eyebrow}
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {page.title}
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">{page.intro}</p>
        </header>

        <section className="mt-10 rounded-lg border bg-primary/5 p-6">
          <h2 className="text-2xl font-semibold">{page.quickAnswerTitle}</h2>
          <p className="mt-3 leading-8 text-muted-foreground">{page.quickAnswer}</p>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight">{page.mistakesTitle}</h2>
          <p className="mt-3 leading-8 text-muted-foreground">{page.mistakesIntro}</p>
          <div className="mt-6 grid gap-4">
            {page.mistakes.map((mistake, index) => (
              <section key={mistake.title} className="rounded-lg border bg-background p-5">
                <h3 className="text-xl font-semibold">
                  {index + 1}. {mistake.title}
                </h3>
                <p className="mt-3 leading-7 text-muted-foreground">{mistake.body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight">{page.recoveryTitle}</h2>
          <p className="mt-3 leading-8 text-muted-foreground">{page.recoveryIntro}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {page.recoverySteps.map((step) => (
              <section key={step.title} className="rounded-lg border bg-secondary/30 p-5">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight">{page.checklistTitle}</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {page.checklists.map((group) => (
              <section key={group.title} className="rounded-lg border p-5">
                <h3 className="font-semibold">{group.title}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {group.items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight">{page.faqTitle}</h2>
          <div className="mt-6 space-y-4">
            {page.faqs.map((faq) => (
              <section key={faq.title} className="rounded-lg border p-5">
                <h3 className="font-semibold">{faq.title}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{faq.body}</p>
              </section>
            ))}
          </div>
        </section>

        <footer className="mt-12 rounded-lg border bg-secondary/30 p-6">
          <h2 className="text-2xl font-semibold">{page.nextTitle}</h2>
          <p className="mt-3 leading-7 text-muted-foreground">{page.nextBody}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/${normalizedLocale}/games/samurai/difficulty/easy`}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {page.primaryCta}
            </Link>
            <Link
              href={`/${normalizedLocale}/games/samurai/overlap-boxes`}
              className="rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-primary/10"
            >
              {page.secondaryCta}
            </Link>
            <Link
              href={`/${normalizedLocale}/games/samurai/candidate-notes`}
              className="rounded-lg border px-6 py-3 font-medium hover:bg-accent"
            >
              {isZh ? "候选数笔记" : "Candidate notes"}
            </Link>
            <Link
              href={`/${normalizedLocale}/games/samurai/evil-stuck-after-two-grids`}
              className="rounded-lg border px-6 py-3 font-medium hover:bg-accent"
            >
              {isZh ? "两个网格后卡住" : "Stuck after two grids"}
            </Link>
          </div>
        </footer>
      </article>
    </>
  );
}
