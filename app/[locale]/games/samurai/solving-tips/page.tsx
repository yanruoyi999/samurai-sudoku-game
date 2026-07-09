import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { TrackedLink } from '@/components/analytics/TrackedLink';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/games/samurai/solving-tips';

const tips = {
  zh: [
    {
      title: '先确定目标：不是猜完，而是稳定推进',
      body: '武士数独的通关核心不是速度，而是避免无依据填数。每一步都应该能回答：这个数字为什么只能在这里？如果你只是凭感觉试，后面五个网格会一起制造冲突。',
      href: '/games/samurai/choose-difficulty',
      linkLabel: '先选合适难度',
    },
    {
      title: '开局先选空格，再点数字',
      body: '移动端玩家最容易先点数字，但正确流程是先选中一个可填写的空格，再点下方数字键。新手最好从重叠区附近开始，因为这些格子同时受到两个网格约束，候选更容易被排除。',
      href: '/games/samurai/first-move-strategy',
      linkLabel: '看第一步攻略',
    },
    {
      title: '把四个重叠宫当作通关发动机',
      body: '中央网格的四个角分别与外侧网格共享 3×3 宫。这里的一个数字会同时影响两个网格，所以每次看到重叠宫里的给定数或新填数字，都要立刻检查相连的另一个网格。',
      href: '/games/samurai/overlap-boxes',
      linkLabel: '理解重叠宫',
    },
    {
      title: '先找唯一候选，再找隐藏唯一',
      body: '最稳的通关顺序是先找单一候选：某个格子只剩一个可填数字。之后再找隐藏唯一：某个数字在一行、一列或一宫里只剩一个位置。不要跳过这一步直接写复杂候选。',
      href: '/games/samurai/strategy-guide',
      linkLabel: '看完整策略',
    },
    {
      title: '中盘卡住时，用候选数而不是新游戏逃走',
      body: '当 30 秒到 1 分钟没有进展，开启候选标记。先围绕重叠宫、中心网格和线索密集区域写候选，不要一次性把 369 个可见格写满，否则信息会变成噪音。',
      href: '/games/samurai/candidate-notes',
      linkLabel: '学习候选数',
    },
    {
      title: '每填一个重叠格，都要做一次复查循环',
      body: '复查循环是：填入数字 → 删除相关候选 → 检查连接网格 → 再回到中心网格。很多武士数独不是靠一次大突破通关，而是靠这个循环持续变窄。',
      href: '/games/samurai/difficulty/medium',
      linkLabel: '用中等题练复查',
    },
    {
      title: '困难和 Evil 题要先保留干净逻辑',
      body: '高难题最怕候选过期和误填。遇到冲突时不要硬往前推，而是回到最近一次没有依据的填数，清除并重新建立候选。Evil 难度尤其需要耐心复盘。',
      href: '/games/samurai/evil-solving-path',
      linkLabel: '看 Evil 解题路径',
    },
    {
      title: '通关后复盘：看你是在哪里打开局面的',
      body: '完成一题后，不要只看时间。记录是哪一个重叠宫、哪一次候选刷新或哪一个隐藏唯一打开了局面。下次遇到类似结构，你会更快识别突破口。',
      href: '/games/samurai/archive',
      linkLabel: '去全部题库继续练',
    },
  ],
  en: [
    {
      title: 'Set the goal: steady progress, not guessing your way through',
      body: 'The key to finishing Samurai Sudoku is not speed. It is making every placement explainable. Before entering a digit, ask: why can this number only go here? Guessing usually creates conflicts across multiple grids later.',
      href: '/games/samurai/choose-difficulty',
      linkLabel: 'Choose the right difficulty',
    },
    {
      title: 'For the opening move, select a cell before tapping a number',
      body: 'Mobile players often tap the number pad first, but the correct flow is to select an editable empty cell, then tap a number. Beginners should start near overlap boxes because those cells are constrained by two grids.',
      href: '/games/samurai/first-move-strategy',
      linkLabel: 'Read first-move guide',
    },
    {
      title: 'Treat the four overlap boxes as the solving engine',
      body: 'The center grid shares four corner 3×3 boxes with the outer grids. A digit placed here affects two grids at once, so every given or new placement in an overlap box should trigger a connected-grid scan.',
      href: '/games/samurai/overlap-boxes',
      linkLabel: 'Understand overlap boxes',
    },
    {
      title: 'Find naked singles first, then hidden singles',
      body: 'The safest path is to find naked singles first: cells with only one remaining candidate. Then look for hidden singles: a digit that has only one possible position in a row, column, or box. Do this before writing complex notes.',
      href: '/games/samurai/strategy-guide',
      linkLabel: 'Read full strategy',
    },
    {
      title: 'When the middle game stalls, use notes instead of fleeing to New Game',
      body: 'If you make no progress for 30 to 60 seconds, turn on candidate notes. Start around overlap boxes, the center grid, and clue-dense areas. Do not fill the whole 369-cell board with notes at once.',
      href: '/games/samurai/candidate-notes',
      linkLabel: 'Learn candidate notes',
    },
    {
      title: 'After every overlap placement, run a rescan loop',
      body: 'The loop is: place a digit, remove affected candidates, scan the connected grid, then return to the center grid. Many Samurai Sudoku puzzles are solved through repeated narrowing, not one dramatic breakthrough.',
      href: '/games/samurai/difficulty/medium',
      linkLabel: 'Practice rescanning on Medium',
    },
    {
      title: 'On Hard and Evil, protect clean logic first',
      body: 'Harder puzzles punish stale notes and unsupported placements. If a conflict appears, do not push forward. Clear the unsupported move, rebuild candidates, and audit the most recent overlap transfer.',
      href: '/games/samurai/evil-solving-path',
      linkLabel: 'Read Evil solving path',
    },
    {
      title: 'After finishing, review where the board opened',
      body: 'Do not judge a solve only by time. Notice which overlap box, candidate refresh, or hidden single unlocked progress. Recognizing that pattern makes the next puzzle faster.',
      href: '/games/samurai/archive',
      linkLabel: 'Practice more in the archive',
    },
  ],
} as const;

const faq = {
  zh: [
    {
      question: '武士数独怎么通关最快？',
      answer: '最快的方式不是猜，而是按固定流程推进：先看重叠宫，找唯一候选，再用候选数和复查循环逐步缩小范围。',
    },
    {
      question: '通关武士数独一定要从重叠区开始吗？',
      answer: '不一定每一步都在重叠区，但开局优先检查重叠区更高效，因为一个数字会同时影响两个网格。',
    },
    {
      question: '卡住时应该点提示还是新游戏？',
      answer: '如果只是没有进展，先开候选或点提示；如果难度明显不适合，再降一级难度，而不是频繁随机换新游戏。',
    },
    {
      question: 'Evil 难度有通关技巧吗？',
      answer: '有。Evil 难度更依赖候选数、重叠区复查、隐藏唯一和候选对。不要猜，先保证每一步都有逻辑依据。',
    },
  ],
  en: [
    {
      question: 'What is the fastest way to solve Samurai Sudoku?',
      answer: 'The fastest reliable way is not guessing. Use a fixed loop: scan overlap boxes, find singles, use candidate notes, and rescan connected grids after each placement.',
    },
    {
      question: 'Do I always need to start in the overlap boxes?',
      answer: 'Not always, but checking overlap boxes early is efficient because one placement can affect two grids at the same time.',
    },
    {
      question: 'Should I use hints or start a new game when stuck?',
      answer: 'If you are simply stalled, use notes or a hint. If the difficulty is wrong, step down one level instead of randomly starting new games.',
    },
    {
      question: 'Are there solving tips for Evil Samurai Sudoku?',
      answer: 'Yes. Evil relies more on candidate notes, overlap rescanning, hidden singles, and pairs. Avoid guessing and preserve clean logic.',
    },
  ],
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? '武士数独通关技巧：从开局到完成的完整解题流程'
    : 'Samurai Sudoku Solving Tips: A Complete Path from First Move to Finish';
  const description = isZh
    ? '武士数独通关攻略：从第一步、重叠宫、唯一候选、候选数、中盘卡住到 Evil 极难复盘，学习稳定完成五宫数独的方法。'
    : 'A complete Samurai Sudoku solving tips guide covering first moves, overlap boxes, singles, candidate notes, mid-game stalls, and Evil-level review.';

  return {
    title,
    description,
    keywords: isZh
      ? ['武士数独通关技巧', '武士数独攻略', '武士数独怎么通关', '五宫数独解题技巧', 'Evil 武士数独通关']
      : ['samurai sudoku solving tips', 'samurai sudoku strategy', 'how to solve samurai sudoku', 'five grid sudoku tips', 'evil samurai sudoku tips'],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SolvingTipsPage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const normalizedLocale = isZh ? 'zh' : 'en';
  const content = tips[normalizedLocale];
  const faqItems = faq[normalizedLocale];
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: isZh ? '武士数独通关技巧' : 'Samurai Sudoku Solving Tips',
    description: isZh
      ? '从开局到完成的武士数独完整解题流程。'
      : 'A full solving path from first move to finish for Samurai Sudoku.',
    mainEntityOfPage: pageUrl,
    inLanguage: isZh ? 'zh-CN' : 'en-US',
    author: {
      '@type': 'Organization',
      name: 'Samurai Sudoku',
      url: buildAbsoluteUrl(`/${normalizedLocale}`),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Samurai Sudoku',
      url: buildAbsoluteUrl(`/${normalizedLocale}`),
    },
  };

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: isZh ? '武士数独通关流程' : 'How to solve Samurai Sudoku from start to finish',
    step: content.map((item, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: item.title,
      text: item.body,
    })),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isZh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${normalizedLocale}`) },
      { '@type': 'ListItem', position: 2, name: 'Samurai Sudoku', item: buildAbsoluteUrl(`/${normalizedLocale}/games/samurai`) },
      { '@type': 'ListItem', position: 3, name: isZh ? '通关技巧' : 'Solving Tips', item: pageUrl },
    ],
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      {[articleJsonLd, howToJsonLd, faqJsonLd, breadcrumbJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`solving-tips-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href={`/${normalizedLocale}`} className="hover:text-foreground">
          {isZh ? '首页' : 'Home'}
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/${normalizedLocale}/games/samurai`} className="hover:text-foreground">
          Samurai Sudoku
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{isZh ? '通关技巧' : 'Solving tips'}</span>
      </nav>

      <header className="rounded-2xl border bg-primary/5 p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          {isZh ? '完整通关长尾攻略' : 'Complete solving guide'}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-6xl">
          {isZh ? '武士数独通关技巧' : 'Samurai Sudoku Solving Tips'}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {isZh
            ? '这是一篇从开局到完成的武士数独通关总纲。它不会直接给答案，而是帮你建立一套稳定流程：选对难度、从重叠宫开局、用候选数处理中盘、卡住时复查，而不是盲猜或频繁换新游戏。'
            : 'This is a complete path from first move to finish. It does not reveal answers; it teaches a stable workflow: choose the right difficulty, start with overlap boxes, use notes in the middle game, and rescan instead of guessing or restarting randomly.'}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <TrackedLink
            href={`/${normalizedLocale}/games/samurai/difficulty/easy`}
            eventName="solving_tips_easy_cta_click"
            eventProperties={{ locale: normalizedLocale, page: PATH }}
            className="rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isZh ? '从简单题实战' : 'Practice on Easy'}
          </TrackedLink>
          <TrackedLink
            href={`/${normalizedLocale}/games/samurai/archive`}
            eventName="solving_tips_archive_cta_click"
            eventProperties={{ locale: normalizedLocale, page: PATH }}
            className="rounded-lg border border-primary px-6 py-3 text-center font-semibold text-primary hover:bg-primary/10"
          >
            {isZh ? '浏览全部题库' : 'Browse all puzzles'}
          </TrackedLink>
        </div>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-4">
        <Link href={`/${normalizedLocale}/games/samurai/first-move-strategy`} className="rounded-xl border bg-background p-5 hover:border-primary hover:bg-primary/5">
          <h2 className="text-lg font-semibold text-primary">{isZh ? '第一步' : 'First move'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh ? '先选空格，再点数字。' : 'Select a cell before tapping a number.'}
          </p>
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/choose-difficulty`} className="rounded-xl border bg-background p-5 hover:border-primary hover:bg-primary/5">
          <h2 className="text-lg font-semibold text-primary">{isZh ? '难度选择' : 'Difficulty'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh ? '简单、中等、困难、Evil 怎么选。' : 'Choose Easy, Medium, Hard, or Evil.'}
          </p>
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/overlap-boxes`} className="rounded-xl border bg-background p-5 hover:border-primary hover:bg-primary/5">
          <h2 className="text-lg font-semibold text-primary">{isZh ? '重叠宫' : 'Overlap boxes'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh ? '通关最重要的连接区域。' : 'The key connection zones.'}
          </p>
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/candidate-notes`} className="rounded-xl border bg-background p-5 hover:border-primary hover:bg-primary/5">
          <h2 className="text-lg font-semibold text-primary">{isZh ? '候选数' : 'Candidate notes'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh ? '卡住时不要猜，先记候选。' : 'When stuck, write notes instead of guessing.'}
          </p>
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold tracking-tight">
          {isZh ? '8 个通关技巧' : '8 solving tips from start to finish'}
        </h2>
        <div className="mt-5 space-y-4">
          {content.map((item, index) => (
            <section key={item.title} className="rounded-xl border bg-card p-5">
              <h3 className="text-xl font-semibold">
                {index + 1}. {item.title}
              </h3>
              <p className="mt-3 leading-7 text-muted-foreground">{item.body}</p>
              <Link href={`/${normalizedLocale}${item.href}`} className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
                {item.linkLabel} →
              </Link>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border bg-secondary/30 p-6">
        <h2 className="text-2xl font-semibold">{isZh ? '推荐实战路线' : 'Recommended practice route'}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {isZh
            ? '先用简单题练通关流程，再用中等题练候选刷新。能稳定完成中等后，再挑战困难和 Evil。每次卡住都先复查重叠宫和候选，不要第一反应就点新游戏。'
            : 'Use Easy to learn the full solving loop, then Medium to practice candidate refreshes. After Medium feels stable, move to Hard and Evil. When stuck, rescan overlaps and candidates before pressing New Game.'}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ['easy', isZh ? '简单：练流程' : 'Easy: learn the loop'],
            ['medium', isZh ? '中等：练候选' : 'Medium: practice notes'],
            ['hard', isZh ? '困难：练复查' : 'Hard: rescan carefully'],
            ['evil', isZh ? 'Evil：完整挑战' : 'Evil: full challenge'],
          ] as const).map(([difficulty, label]) => (
            <Link
              key={difficulty}
              href={`/${normalizedLocale}/games/samurai/difficulty/${difficulty}`}
              className="rounded-lg border bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:bg-primary/5"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">{isZh ? '常见问题' : 'Frequently asked questions'}</h2>
        <div className="mt-4 space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="rounded-xl border bg-background p-4">
              <summary className="cursor-pointer font-medium">{item.question}</summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="mt-12 grid gap-3 rounded-2xl border bg-muted/30 p-6 md:grid-cols-3">
        <Link href={`/${normalizedLocale}/games/samurai/how-to-play`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '回到玩法规则' : 'Back to rules'}
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '开始今日谜题' : "Play today's puzzle"}
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/archive`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '浏览全部题库' : 'Browse all puzzles'}
        </Link>
      </footer>
    </article>
  );
}
