import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { isLocale, type Locale } from "@/i18n";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

const GUIDE_PATH = "/games/samurai/printable-practice-plan";
const UPDATED_AT = "2026-07-12";

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface TextBlock {
  title: string;
  body: string;
}

interface PlanDay {
  day: string;
  title: string;
  body: string;
}

interface PracticePlanContent {
  metaTitle: string;
  title: string;
  eyebrow: string;
  description: string;
  intro: string;
  quickTitle: string;
  quickAnswer: string;
  whyTitle: string;
  why: TextBlock[];
  planTitle: string;
  planIntro: string;
  days: PlanDay[];
  setupTitle: string;
  setup: TextBlock[];
  mistakesTitle: string;
  mistakes: TextBlock[];
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

const content: Record<Locale, PracticePlanContent> = {
  en: {
    metaTitle: "Samurai Sudoku Printable Practice Plan - PDF, Answers, and Weekly Routine",
    title: "Samurai Sudoku printable practice plan: PDFs, answers, and a weekly routine",
    eyebrow: "Printable Samurai Sudoku guide",
    description:
      "A practical printable Samurai Sudoku practice plan for players who want PDF puzzles, answer keys, paper solving, and a weekly difficulty routine.",
    intro:
      "Printable Samurai Sudoku is not just a different format. Paper changes the workflow: you need room for candidates, a clean way to check answers, and a difficulty plan that avoids wasting a full sheet on a puzzle that is too hard for today.",
    quickTitle: "Fast answer",
    quickAnswer:
      "For printable Samurai Sudoku practice, print one Easy or Medium puzzle first, leave space for notes, solve overlap boxes in pencil, then check the answer key or reopen the dated online puzzle for hints. Move to Hard or Evil only after you can finish two paper sessions without guessing.",
    whyTitle: "Why printable practice is a high-intent use case",
    why: [
      {
        title: "Paper makes the 369-cell board easier to scan",
        body: "A Samurai board is visually dense on mobile. Printing lets you rotate, mark, erase, and compare the center grid with the four corners without fighting screen size.",
      },
      {
        title: "Answer keys matter more than volume",
        body: "A large PDF pack is useful only if you can check mistakes. For learning, a small set with clear solutions beats dozens of unsolved boards with no recovery path.",
      },
      {
        title: "Dated puzzles create a bridge back online",
        body: "When a printed puzzle has a date URL, you can solve offline, then reopen the same puzzle online to use hints, conflict checks, and related strategy pages.",
      },
    ],
    planTitle: "A one-week printable Samurai Sudoku routine",
    planIntro:
      "Use this plan when you want steady progress without guessing. It is built for one printed puzzle per session and works for A4, Letter, or tablet annotation.",
    days: [
      {
        day: "Day 1",
        title: "Print one Easy puzzle and map the overlaps",
        body: "Before solving, circle the four shared 3x3 boxes. Your goal is not speed. Your goal is to understand which corner grid connects to which center box.",
      },
      {
        day: "Day 2",
        title: "Repeat Easy with candidate notes only near overlaps",
        body: "Do not fill every empty cell with pencil marks. Write candidates only in the active overlap and the rows or columns changed by your last confirmed number.",
      },
      {
        day: "Day 3",
        title: "Print Medium and use a two-pass check",
        body: "Read each shared box once as the corner grid and once as the center grid. If a candidate is illegal in either view, erase it immediately.",
      },
      {
        day: "Day 4",
        title: "Use the answer key as an audit, not a reveal",
        body: "When you get stuck, compare only the first wrong region. Then hide the solution again and rebuild candidates from that point.",
      },
      {
        day: "Day 5",
        title: "Print another Medium from the archive",
        body: "Choose a dated puzzle instead of random switching. A same-level repeat is better practice than jumping to Evil after one good session.",
      },
      {
        day: "Day 6",
        title: "Try Hard with a clean margin system",
        body: "Use one margin mark for overlap checks and one mark for uncertain pairs. If the paper gets messy, copy only the active overlap to a clean area.",
      },
      {
        day: "Day 7",
        title: "Review the week before moving to Evil",
        body: "If your mistakes were mostly stale candidates or missed overlap transfers, repeat Medium or Hard. Move to Evil only when your paper notes stay readable.",
      },
    ],
    setupTitle: "How to print and check without losing the learning value",
    setup: [
      {
        title: "Choose one puzzle, not a stack",
        body: "A stack of printed puzzles feels productive but creates shallow practice. Start with one dated puzzle and finish the audit before printing the next one.",
      },
      {
        title: "Keep the answer key separate",
        body: "Print answer keys on a separate page or keep them on another device. The key should be easy to access after a serious attempt and hard to glance at by accident.",
      },
      {
        title: "Use online hints after paper work",
        body: "If a printed board stalls, open the same dated puzzle online. Use a hint only after writing candidates in the stuck overlap so the explanation teaches the deduction.",
      },
      {
        title: "Save PDF packs for repeatable routines",
        body: "A PDF pack is best when you want a classroom set, travel practice, or a predictable weekly routine with answers. For casual play, the archive and daily puzzle are enough.",
      },
    ],
    mistakesTitle: "Common printable practice mistakes",
    mistakes: [
      {
        title: "Printing Evil first",
        body: "Evil looks attractive, but paper magnifies note-management errors. If you cannot keep Medium notes clean, Evil will often become a guessing exercise.",
      },
      {
        title: "Checking the full solution too early",
        body: "A full reveal can end the session without teaching the blocked step. Check one region, rebuild the logic, and continue from the corrected position.",
      },
      {
        title: "Ignoring the online puzzle URL",
        body: "The best printable workflow is hybrid: paper for focus, online page for hints, conflict checks, related strategy, and returning to the same dated board later.",
      },
    ],
    faqTitle: "FAQ",
    faqs: [
      {
        title: "What is the best Samurai Sudoku printable difficulty for beginners?",
        body: "Start with Easy, then Medium. Hard and Evil are better after you can manage overlap candidates without filling the whole page with stale notes.",
      },
      {
        title: "Should printable Samurai Sudoku include answers?",
        body: "Yes. Answer keys are important for learning, especially on a five-grid puzzle where one wrong overlap placement can block several regions.",
      },
      {
        title: "Is PDF better than playing online?",
        body: "PDF is better for focused paper practice. Online play is better for hints, conflict checks, timer, and returning to a specific dated puzzle.",
      },
      {
        title: "How many printable puzzles should I solve per week?",
        body: "One to three serious sessions per week is enough for most players. The review quality matters more than the number of pages printed.",
      },
    ],
    nextTitle: "Build your printable workflow",
    nextBody:
      "Start with the printable page, try the free PDF sample, then use the archive to choose another puzzle at the same difficulty instead of switching randomly.",
    primaryCta: "Open printable puzzles",
    secondaryCta: "Download PDF sample",
    keywords: [
      "samurai sudoku printable practice",
      "samurai sudoku pdf with answers",
      "printable samurai sudoku weekly plan",
      "samurai sudoku worksheet",
      "samurai sudoku paper solving",
      "samurai sudoku printable for beginners",
    ],
  },
  zh: {
    metaTitle: "武士数独打印练习计划 - PDF、答案和每周训练流程",
    title: "武士数独打印练习计划：PDF、答案和每周训练流程",
    eyebrow: "可打印武士数独攻略",
    description:
      "面向想要 PDF、答案页、纸笔练习和每周难度安排的武士数独玩家，提供一套可执行的打印练习流程。",
    intro:
      "打印武士数独不是把线上棋盘换成纸而已。纸笔会改变解题流程：你需要候选数空间、答案核对方式，以及不会一上来就浪费一整页的难度安排。",
    quickTitle: "快速结论",
    quickAnswer:
      "打印练习先从一题简单或中等开始，留出候选数空间，用铅笔处理重叠宫，再用答案页或同日期线上题做提示和核对。只有连续两次纸笔练习都能不靠猜完成，再挑战困难或 Evil。",
    whyTitle: "为什么打印练习是高意图需求",
    why: [
      {
        title: "纸面更适合扫描 369 个可见格",
        body: "移动端看武士数独很密。打印后可以旋转、标记、擦除，并更容易比较中心网格和四个角落网格。",
      },
      {
        title: "答案页比题量更重要",
        body: "大 PDF 包只有在能核对错误时才有价值。对学习来说，带清晰答案的小套题，比没有恢复路径的大量题更有用。",
      },
      {
        title: "日期题能把纸笔练习带回线上",
        body: "如果打印题有日期 URL，你可以离线解题，再回到同一线上题使用提示、冲突检查和相关攻略。",
      },
    ],
    planTitle: "一周武士数独打印练习流程",
    planIntro:
      "这套计划适合每次打印一题，稳步提升而不是靠猜。A4、Letter 或平板批注都可以使用。",
    days: [
      {
        day: "第 1 天",
        title: "打印一题简单题，先标出重叠区",
        body: "解题前圈出四个共享 3x3 宫。目标不是速度，而是弄清每个角落网格如何连接中心网格。",
      },
      {
        day: "第 2 天",
        title: "继续简单题，只在重叠区附近写候选",
        body: "不要给所有空格都写候选。只在当前重叠宫，以及最近一次确定填数影响到的行列宫写候选。",
      },
      {
        day: "第 3 天",
        title: "打印中等题，做两遍重叠检查",
        body: "同一个共享宫先按角落网格读一次，再按中心网格读一次。任何一边不合法的候选都要马上擦掉。",
      },
      {
        day: "第 4 天",
        title: "把答案页当审计，不当直接揭晓",
        body: "卡住时只核对第一个出错区域。然后盖住答案，从那个位置重新建立候选逻辑。",
      },
      {
        day: "第 5 天",
        title: "从题库归档再打印一题中等",
        body: "选择同难度日期题，而不是随机切难度。连续同级练习，比一次顺利后马上跳 Evil 更有效。",
      },
      {
        day: "第 6 天",
        title: "尝试困难题，并整理页边标记",
        body: "用一种页边标记表示重叠区检查，用另一种表示不确定候选对。如果纸面太乱，只把活跃重叠区抄到空白处。",
      },
      {
        day: "第 7 天",
        title: "复盘一周，再决定是否进 Evil",
        body: "如果错误主要来自过期候选或漏传重叠区，继续中等或困难。只有纸面笔记保持清楚时，再进 Evil。",
      },
    ],
    setupTitle: "如何打印和核对，才不浪费练习价值",
    setup: [
      {
        title: "一次只选一题，不要先打印一叠",
        body: "一叠题看起来很有效率，但容易变成浅层练习。先完成一题和复盘，再打印下一题。",
      },
      {
        title: "答案页要分开放",
        body: "把答案页另打一张，或放在另一台设备上。答案应该在认真尝试后容易拿到，但不应该一眼扫到。",
      },
      {
        title: "纸笔推到卡点后再用线上提示",
        body: "纸面卡住时，打开同日期线上题。点提示前先写出卡住重叠区候选，这样提示才会变成可学习的推理。",
      },
      {
        title: "PDF 包适合固定练习场景",
        body: "PDF 包最适合课堂、旅行、周练或需要答案页的固定流程。偶尔玩一局，用每日题和归档就够了。",
      },
    ],
    mistakesTitle: "打印练习常见错误",
    mistakes: [
      {
        title: "第一张就打印 Evil",
        body: "Evil 很有吸引力，但纸笔会放大候选数管理错误。如果中等题笔记都不稳定，Evil 很容易变成猜。",
      },
      {
        title: "太早看完整答案",
        body: "完整揭晓会结束练习，但不一定教会卡住的那一步。只核对一个区域，修正逻辑后继续。",
      },
      {
        title: "忽略线上日期题入口",
        body: "最好的打印流程是混合式：纸面专注，线上页面负责提示、冲突检查、相关攻略和回到同一题。",
      },
    ],
    faqTitle: "常见问题",
    faqs: [
      {
        title: "新手打印武士数独应该选什么难度？",
        body: "先选简单，再到中等。困难和 Evil 适合已经能管理重叠区候选、不会把整页写乱的玩家。",
      },
      {
        title: "打印武士数独需要答案吗？",
        body: "需要。五宫题里一个重叠格错误会影响多个区域，答案页能帮助你复盘错误位置。",
      },
      {
        title: "PDF 比线上玩更好吗？",
        body: "PDF 更适合专注纸笔练习；线上更适合提示、冲突检查、计时和回到指定日期题。",
      },
      {
        title: "每周打印几题合适？",
        body: "大多数玩家每周一到三次认真练习就够了。复盘质量比打印页数更重要。",
      },
    ],
    nextTitle: "建立你的打印练习流程",
    nextBody:
      "先打开可打印题，试用免费 PDF 样张，再用题库归档选择同难度下一题，避免无目的切换。",
    primaryCta: "打开可打印题",
    secondaryCta: "下载 PDF 样张",
    keywords: [
      "武士数独打印练习",
      "武士数独 PDF 带答案",
      "武士数独每周练习计划",
      "武士数独纸笔解题",
      "武士数独可打印",
      "新手武士数独打印题",
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

export default async function PrintablePracticePlanPage({ params }: PageProps) {
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
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: page.planTitle,
    description: page.planIntro,
    step: page.days.map((day, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: `${day.day}: ${day.title}`,
      text: day.body,
    })),
  };

  return (
    <>
      <Script
        id={`printable-practice-article-jsonld-${normalizedLocale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id={`printable-practice-faq-jsonld-${normalizedLocale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id={`printable-practice-howto-jsonld-${normalizedLocale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
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
          <span className="text-foreground">{isZh ? "打印练习计划" : "Printable practice plan"}</span>
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
          <h2 className="text-2xl font-semibold">{page.quickTitle}</h2>
          <p className="mt-3 leading-8 text-muted-foreground">{page.quickAnswer}</p>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight">{page.whyTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {page.why.map((item) => (
              <section key={item.title} className="rounded-lg border p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight">{page.planTitle}</h2>
          <p className="mt-3 leading-8 text-muted-foreground">{page.planIntro}</p>
          <div className="mt-6 space-y-4">
            {page.days.map((day) => (
              <section key={day.day} className="rounded-lg border bg-background p-5">
                <p className="text-sm font-medium text-primary">{day.day}</p>
                <h3 className="mt-1 text-xl font-semibold">{day.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{day.body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight">{page.setupTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {page.setup.map((item) => (
              <section key={item.title} className="rounded-lg border bg-secondary/30 p-5">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight">{page.mistakesTitle}</h2>
          <div className="mt-6 space-y-4">
            {page.mistakes.map((item, index) => (
              <section key={item.title} className="rounded-lg border p-5">
                <h3 className="text-lg font-semibold">
                  {index + 1}. {item.title}
                </h3>
                <p className="mt-3 leading-7 text-muted-foreground">{item.body}</p>
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
              href={`/${normalizedLocale}/printable-samurai-sudoku`}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {page.primaryCta}
            </Link>
            <Link
              href={`/${normalizedLocale}/games/samurai/pdf/sample`}
              className="rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-primary/10"
            >
              {page.secondaryCta}
            </Link>
            <Link
              href={`/${normalizedLocale}/games/samurai/archive`}
              className="rounded-lg border px-6 py-3 font-medium hover:bg-accent"
            >
              {isZh ? "按日期选题" : "Choose by date"}
            </Link>
            <Link
              href={`/${normalizedLocale}/games/samurai/candidate-notes`}
              className="rounded-lg border px-6 py-3 font-medium hover:bg-accent"
            >
              {isZh ? "候选数笔记" : "Candidate notes"}
            </Link>
          </div>
        </footer>
      </article>
    </>
  );
}
