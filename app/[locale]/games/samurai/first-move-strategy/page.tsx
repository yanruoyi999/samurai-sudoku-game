import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { TrackedLink } from '@/components/analytics/TrackedLink';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/games/samurai/first-move-strategy';

const sections = {
  zh: [
    {
      title: '第一步先不要点数字，先选一个空格',
      body: '移动端最常见的误操作，是先去点下方数字。武士数独和普通数独一样，必须先选中一个可填写的空格，再点数字。优先选重叠区附近的空格，因为这些格子同时受到两个网格约束，更容易排除候选。',
    },
    {
      title: '先看四个重叠宫，而不是从左上角硬扫',
      body: '武士数独由五个 9×9 网格组成，中央网格的四个角会和外侧网格共享 3×3 宫。开局先扫这四个重叠宫：有没有给定数？有没有某个数字在两个网格里同时被排除？这通常比从第一个格子顺序看更快。',
    },
    {
      title: '找最容易确定的单一候选',
      body: '选一个空格后，同时检查它所在的行、列、3×3 宫，以及它是否在重叠区。把已经出现过的数字划掉，如果只剩一个数字，就可以填入。若还剩多个数字，不要猜，先换一个线索更多的格子。',
    },
    {
      title: '填入后立刻回到另一个网格复查',
      body: '重叠区的一个数字，不只影响当前 9×9 网格，也会影响连接的另一个网格。你填入数字后，立刻检查另一个网格中同一行、列、宫是否出现新的唯一位置，这是武士数独开局最容易打开局面的地方。',
    },
    {
      title: '如果 30 秒内没有进展，开启候选标记',
      body: '新手不需要硬算。若一开始找不到确定数字，打开候选标记，只给重叠宫和中心网格附近的格子做笔记。不要给整个 369 格棋盘写满候选，否则会被信息量淹没。',
    },
    {
      title: '简单题用来练流程，不要急着切困难',
      body: '如果你第一次玩，简单题的目的不是证明水平，而是熟悉“选格 → 填数 → 复查重叠区”的流程。能稳定完成简单题后，再挑战中等和困难题，体验会好很多。',
    },
  ],
  en: [
    {
      title: 'Do not tap a number first — select an empty cell first',
      body: 'The most common mobile mistake is tapping the number pad before selecting a cell. Samurai Sudoku works like regular Sudoku here: choose an editable empty cell first, then tap a number. Start near overlap boxes because these cells receive constraints from two grids.',
    },
    {
      title: 'Look at the four overlap boxes before scanning from the top-left',
      body: 'Samurai Sudoku is five 9×9 grids. The center grid shares four 3×3 corner boxes with the outer grids. Your first scan should ask: which givens sit inside or near those overlap boxes, and which digits are eliminated in both connected grids?',
    },
    {
      title: 'Find the easiest single candidate',
      body: 'After choosing a cell, check its row, column, 3×3 box, and overlap relationship. Cross off digits already used. If one candidate remains, fill it. If several remain, do not guess; move to a more constrained cell.',
    },
    {
      title: 'After one placement, rescan the connected grid immediately',
      body: 'A digit placed in an overlap box affects both its corner grid and the center grid. After every overlap placement, check the connected grid for a newly forced position. This is often the fastest way to open the board.',
    },
    {
      title: 'If you make no progress in 30 seconds, turn on notes',
      body: 'Beginners do not need to solve everything mentally. Use candidate notes around overlap boxes and the center grid first. Do not fill the whole 369-cell board with notes; too much information becomes noise.',
    },
    {
      title: 'Use Easy puzzles to learn the workflow before switching up',
      body: 'The point of Easy mode is not proving skill. It teaches the loop: select a cell, place a digit, rescan overlap boxes. Once that loop feels natural, Medium and Hard puzzles become much less frustrating.',
    },
  ],
} as const;

const faq = {
  zh: [
    {
      question: '武士数独第一步应该点哪里？',
      answer: '优先点重叠区附近的空格，尤其是已有给定数字较多的 3×3 宫。先选空格，再点下方数字。',
    },
    {
      question: '为什么我点数字没有反应？',
      answer: '通常是因为还没有选中可填写的空格。移动端先点棋盘上的空格，再点数字键盘。',
    },
    {
      question: '新手应该直接玩困难或 Evil 吗？',
      answer: '不建议。先用简单题熟悉重叠宫和候选标记流程，再切换到中等、困难或 Evil。',
    },
    {
      question: '开局要不要把所有候选都写满？',
      answer: '不需要。先围绕重叠区和中心网格写候选，等局面打开后再扩展到其他区域。',
    },
  ],
  en: [
    {
      question: 'Where should my first move be in Samurai Sudoku?',
      answer: 'Start near an overlap box, especially where several givens already constrain the shared 3×3 area. Select a cell first, then tap a number.',
    },
    {
      question: 'Why does tapping a number do nothing?',
      answer: 'Usually because no editable cell is selected yet. On mobile, tap an empty cell on the board before using the number pad.',
    },
    {
      question: 'Should beginners jump straight to Hard or Evil?',
      answer: 'No. Use Easy puzzles to learn overlap scanning and candidate notes, then move to Medium, Hard, and Evil.',
    },
    {
      question: 'Should I write candidates in every cell at the start?',
      answer: 'No. Begin with candidates around overlap boxes and the center grid. Expanding notes too early can make the board harder to read.',
    },
  ],
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? '武士数独第一步怎么下？新手开局与重叠区攻略'
    : 'Samurai Sudoku First Move Strategy: How to Start Without Guessing';
  const description = isZh
    ? '武士数独新手开局攻略：先选格还是先点数字、如何扫描重叠区、什么时候开启候选标记，以及从简单题进阶到困难题的流程。'
    : 'A first-move Samurai Sudoku guide for beginners: select a cell before tapping numbers, scan overlap boxes, use candidate notes, and move from Easy to harder puzzles.';

  return {
    title,
    description,
    keywords: isZh
      ? ['武士数独第一步', '武士数独怎么开始', '武士数独新手攻略', '武士数独重叠区怎么解', '武士数独简单题技巧']
      : ['samurai sudoku first move', 'how to start samurai sudoku', 'samurai sudoku beginner strategy', 'samurai sudoku overlap boxes', 'easy samurai sudoku tips'],
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

export default async function FirstMoveStrategyPage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const normalizedLocale = isZh ? 'zh' : 'en';
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);
  const content = sections[normalizedLocale];
  const faqItems = faq[normalizedLocale];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: isZh ? '武士数独第一步怎么下？' : 'Samurai Sudoku First Move Strategy',
    description: isZh
      ? '新手开局、重叠区扫描、候选标记和难度选择攻略。'
      : 'A beginner-friendly first-move workflow for Samurai Sudoku.',
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
    name: isZh ? '武士数独第一步开局流程' : 'How to make your first Samurai Sudoku move',
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
      { '@type': 'ListItem', position: 3, name: isZh ? '第一步开局攻略' : 'First Move Strategy', item: pageUrl },
    ],
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      {[articleJsonLd, howToJsonLd, faqJsonLd, breadcrumbJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`first-move-strategy-jsonld-${index}`}
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
        <span className="text-foreground">{isZh ? '第一步攻略' : 'First move'}</span>
      </nav>

      <header className="rounded-2xl border bg-primary/5 p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          {isZh ? '新手开局长尾攻略' : 'Beginner first-move guide'}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-6xl">
          {isZh ? '武士数独第一步怎么下？' : 'Samurai Sudoku First Move Strategy'}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {isZh
            ? '如果你从百度进入在线武士数独，看到五个重叠的 9×9 网格后不知道第一步点哪里，这篇攻略就是为你准备的。核心很简单：先选空格，再点数字；先看重叠区，再扩展到其他网格。'
            : 'If the five-grid board looks overwhelming, start here. The first move is simple: select an empty cell before tapping a number, scan overlap boxes first, then expand to the rest of the board.'}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <TrackedLink
            href={`/${normalizedLocale}/games/samurai/difficulty/easy`}
            eventName="first_move_easy_cta_click"
            eventProperties={{ locale: normalizedLocale, page: PATH }}
            className="rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isZh ? '打开简单题练第一步' : 'Practice first moves on Easy'}
          </TrackedLink>
          <TrackedLink
            href={`/${normalizedLocale}/games/samurai`}
            eventName="first_move_daily_cta_click"
            eventProperties={{ locale: normalizedLocale, page: PATH }}
            className="rounded-lg border border-primary px-6 py-3 text-center font-semibold text-primary hover:bg-primary/10"
          >
            {isZh ? '开始今日谜题' : "Play today's puzzle"}
          </TrackedLink>
        </div>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Link href={`/${normalizedLocale}/games/samurai/what-is-samurai-sudoku`} className="rounded-xl border bg-background p-5 hover:border-primary hover:bg-primary/5">
          <h2 className="text-lg font-semibold text-primary">{isZh ? '先看五宫布局' : 'Review the five-grid layout'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh ? '还不清楚五个网格怎么重叠？先看图解。' : 'Not sure how the five grids overlap? Start with the visual guide.'}
          </p>
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/overlap-boxes`} className="rounded-xl border bg-background p-5 hover:border-primary hover:bg-primary/5">
          <h2 className="text-lg font-semibold text-primary">{isZh ? '重叠宫详解' : 'Overlap boxes explained'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh ? '理解为什么重叠区是开局最重要的位置。' : 'Learn why overlap boxes are the most valuable opening area.'}
          </p>
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/candidate-notes`} className="rounded-xl border bg-background p-5 hover:border-primary hover:bg-primary/5">
          <h2 className="text-lg font-semibold text-primary">{isZh ? '候选数笔记' : 'Candidate notes'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh ? '卡住时用候选标记，而不是盲猜。' : 'When stuck, use notes instead of guessing.'}
          </p>
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold tracking-tight">
          {isZh ? '6 步开局流程' : 'A 6-step first-move workflow'}
        </h2>
        <div className="mt-5 space-y-4">
          {content.map((item, index) => (
            <section key={item.title} className="rounded-xl border bg-card p-5">
              <h3 className="text-xl font-semibold">
                {index + 1}. {item.title}
              </h3>
              <p className="mt-3 leading-7 text-muted-foreground">{item.body}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border bg-secondary/30 p-6">
        <h2 className="text-2xl font-semibold">{isZh ? '推荐练习路径' : 'Recommended practice path'}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {isZh
            ? '不要一开始就反复切困难和 Evil。先用简单题练第一步，再去中等题练候选数，最后用困难题检验你是否真的掌握重叠区复查。'
            : 'Do not jump between Hard and Evil first. Practice your first move on Easy, use Medium for candidate notes, then test overlap rescanning on Hard.'}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ['easy', isZh ? '简单：练第一步' : 'Easy: first moves'],
            ['medium', isZh ? '中等：练候选' : 'Medium: candidates'],
            ['hard', isZh ? '困难：练复查' : 'Hard: rescanning'],
            ['evil', isZh ? 'Evil：挑战进阶' : 'Evil: advanced challenge'],
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
          {isZh ? '回到完整玩法规则' : 'Back to full rules'}
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/strategy-guide`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '继续看完整策略' : 'Read the full strategy guide'}
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/archive`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '浏览全部题库' : 'Browse all puzzles'}
        </Link>
      </footer>
    </article>
  );
}
