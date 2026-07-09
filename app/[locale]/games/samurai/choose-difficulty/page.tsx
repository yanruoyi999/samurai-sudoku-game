import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { TrackedLink } from '@/components/analytics/TrackedLink';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/games/samurai/choose-difficulty';

const difficultyRows = {
  zh: [
    ['简单', '第一次玩、想练第一步、想熟悉重叠区', '先选空格，再点数字；重点练四个重叠宫。', '/games/samurai/difficulty/easy'],
    ['中等', '已经会普通数独，想练候选数和跨网格复查', '先做唯一候选，再围绕重叠区做少量候选。', '/games/samurai/difficulty/medium'],
    ['困难', '能稳定完成中等题，想挑战更少线索', '不要盲猜；卡住时切到候选数和策略页复盘。', '/games/samurai/difficulty/hard'],
    ['Evil 极难', '熟悉候选对、隐藏单、跨网格联动的玩家', '把它当成长期挑战，先完成两个网格再找重叠突破口。', '/games/samurai/difficulty/evil'],
  ],
  en: [
    ['Easy', 'First-time players, first-move practice, overlap-box basics', 'Select a cell before tapping numbers and focus on the four overlap boxes.', '/games/samurai/difficulty/easy'],
    ['Medium', 'Regular Sudoku players who want candidate and overlap practice', 'Solve singles first, then use light notes around active overlap areas.', '/games/samurai/difficulty/medium'],
    ['Hard', 'Players who can finish Medium and want fewer clues', 'Do not guess; when stuck, switch to candidate notes and review strategy.', '/games/samurai/difficulty/hard'],
    ['Evil', 'Advanced players comfortable with pairs, hidden singles, and cross-grid logic', 'Treat it as a long challenge: stabilize two grids, then use overlap breakthroughs.', '/games/samurai/difficulty/evil'],
  ],
} as const;

const sections = {
  zh: [
    {
      title: '如果你从百度第一次进入，先选简单题',
      body: '简单难度不是“太简单”，而是让你熟悉五个网格、四个重叠宫和移动端操作。第一次玩时不要先切困难或 Evil，否则你会同时面对规则陌生、棋盘大、候选多三个问题。',
    },
    {
      title: '“新游戏”适合换局面，不适合逃避难度',
      body: '点击新游戏会重新生成当前选择难度下的新谜题。如果你刚切到困难再点新游戏，它更可能给你困难题，而不是回到简单题。想降低难度时，先点简单或中等，再点新游戏。',
    },
    {
      title: '“全部题库”适合找历史题和换日期',
      body: '如果你想查看更多日期、不同难度或已公开题目，进入全部题库比反复点新游戏更清晰。题库页适合比较难度、找旧题、按日期练习，也适合从卡住的题目切换到更合适的题。',
    },
    {
      title: '卡住时先降一级难度，而不是马上退出',
      body: '如果简单题能开始但中等题卡住，先回简单题练候选；如果困难题卡住，回中等题练重叠区复查。难度切换是练习路线，不是失败。',
    },
    {
      title: '长期练习顺序：简单 → 中等 → 困难 → Evil',
      body: '每天只需要稳定推进一个难度。简单题练开局，中等题练候选，困难题练复查，Evil 练耐心和完整策略。这样比频繁随机换题更容易形成留存。',
    },
  ],
  en: [
    {
      title: 'If you arrive from search for the first time, start with Easy',
      body: 'Easy is not a downgrade. It helps you learn five grids, four overlap boxes, and mobile input at the same time. Jumping to Hard or Evil too early creates three problems at once: unfamiliar rules, a large board, and too many candidates.',
    },
    {
      title: 'New Game changes the board, not your learning path',
      body: 'The New Game button generates a fresh puzzle for the currently selected difficulty. If you switch to Hard and then press New Game, expect a hard puzzle. To lower difficulty, choose Easy or Medium first, then start a new game.',
    },
    {
      title: 'All Puzzles is for dates, archives, and better choices',
      body: 'Use the archive when you want more dates, public puzzles, or a different difficulty. It is clearer than repeatedly starting new games because you can compare difficulty and choose a puzzle intentionally.',
    },
    {
      title: 'When stuck, step down one level instead of leaving',
      body: 'If Medium feels blocked, return to Easy and practice notes. If Hard feels blocked, use Medium to practice overlap rescanning. Difficulty switching is a learning path, not a failure.',
    },
    {
      title: 'A sustainable path: Easy → Medium → Hard → Evil',
      body: 'Use one difficulty for one purpose: Easy for opening moves, Medium for candidates, Hard for rescanning, and Evil for patience and complete strategy. This builds a habit faster than random switching.',
    },
  ],
} as const;

const faq = {
  zh: [
    {
      question: '武士数独新手应该选哪个难度？',
      answer: '建议先选简单。简单题能帮助你熟悉五宫结构、重叠区和“先选格再点数字”的操作。',
    },
    {
      question: '点新游戏会改变难度吗？',
      answer: '不会自动改变到你想要的难度。新游戏通常按当前选择的难度生成新题，所以要先选难度，再点新游戏。',
    },
    {
      question: '全部题库和新游戏有什么区别？',
      answer: '新游戏是快速换一题；全部题库适合按日期、难度、历史题目来选择，更适合有目的练习。',
    },
    {
      question: '什么时候可以挑战 Evil 极难？',
      answer: '当你能稳定使用候选数、重叠宫复查和隐藏单策略后，再挑战 Evil。否则容易很快卡住。',
    },
  ],
  en: [
    {
      question: 'Which Samurai Sudoku difficulty should beginners choose?',
      answer: 'Choose Easy first. It teaches the five-grid layout, overlap boxes, and the select-cell-then-number mobile workflow.',
    },
    {
      question: 'Does New Game change the difficulty?',
      answer: 'Not automatically. It usually generates a new puzzle for the currently selected difficulty, so choose the difficulty first, then start a new game.',
    },
    {
      question: 'What is the difference between All Puzzles and New Game?',
      answer: 'New Game quickly changes the board. All Puzzles lets you choose by date, difficulty, and public archive, which is better for planned practice.',
    },
    {
      question: 'When should I try Evil Samurai Sudoku?',
      answer: 'Try Evil after you can use candidate notes, overlap rescanning, and hidden singles consistently. Otherwise it is easy to get stuck quickly.',
    },
  ],
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? '武士数独难度怎么选？新游戏、简单题和全部题库指南'
    : 'How to Choose Samurai Sudoku Difficulty: Easy, New Game, and All Puzzles';
  const description = isZh
    ? '武士数独难度选择攻略：新手选简单还是困难？新游戏和全部题库有什么区别？如何从简单、中等、困难进阶到 Evil 极难。'
    : 'A Samurai Sudoku difficulty guide explaining when to choose Easy, Medium, Hard, or Evil, how New Game works, and when to use the puzzle archive.';

  return {
    title,
    description,
    keywords: isZh
      ? ['武士数独难度怎么选', '武士数独简单题', '武士数独新游戏', '武士数独全部题库', 'Evil 武士数独']
      : ['samurai sudoku difficulty', 'samurai sudoku easy', 'samurai sudoku new game', 'samurai sudoku archive', 'evil samurai sudoku'],
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

export default async function ChooseDifficultyPage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const normalizedLocale = isZh ? 'zh' : 'en';
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);
  const rows = difficultyRows[normalizedLocale];
  const content = sections[normalizedLocale];
  const faqItems = faq[normalizedLocale];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: isZh ? '武士数独难度怎么选？' : 'How to Choose Samurai Sudoku Difficulty',
    description: isZh
      ? '解释简单、中等、困难、Evil、新游戏和全部题库的使用场景。'
      : 'Explains Easy, Medium, Hard, Evil, New Game, and the puzzle archive.',
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
      { '@type': 'ListItem', position: 3, name: isZh ? '难度选择指南' : 'Difficulty Guide', item: pageUrl },
    ],
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      {[articleJsonLd, faqJsonLd, breadcrumbJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`choose-difficulty-jsonld-${index}`}
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
        <span className="text-foreground">{isZh ? '难度选择' : 'Choose difficulty'}</span>
      </nav>

      <header className="rounded-2xl border bg-primary/5 p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          {isZh ? '难度选择长尾攻略' : 'Difficulty selection guide'}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-6xl">
          {isZh ? '武士数独难度怎么选？' : 'How to Choose Samurai Sudoku Difficulty'}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {isZh
            ? '如果你进入在线武士数独后反复点简单、困难、新游戏和全部题库，这篇指南帮你判断每个入口该什么时候用。目标不是一直换题，而是找到适合当前水平的练习路线。'
            : 'If you keep switching between Easy, Hard, New Game, and All Puzzles, this guide helps you choose the right path. The goal is not random switching; it is finding the right practice level.'}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <TrackedLink
            href={`/${normalizedLocale}/games/samurai/difficulty/easy`}
            eventName="choose_difficulty_easy_cta_click"
            eventProperties={{ locale: normalizedLocale, page: PATH }}
            className="rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isZh ? '新手从简单题开始' : 'Start with Easy'}
          </TrackedLink>
          <TrackedLink
            href={`/${normalizedLocale}/games/samurai/archive`}
            eventName="choose_difficulty_archive_cta_click"
            eventProperties={{ locale: normalizedLocale, page: PATH }}
            className="rounded-lg border border-primary px-6 py-3 text-center font-semibold text-primary hover:bg-primary/10"
          >
            {isZh ? '进入全部题库' : 'Open All Puzzles'}
          </TrackedLink>
        </div>
      </header>

      <section className="mt-10 overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-secondary/60">
            <tr>
              <th className="px-4 py-3 font-semibold">{isZh ? '难度' : 'Difficulty'}</th>
              <th className="px-4 py-3 font-semibold">{isZh ? '适合谁' : 'Best for'}</th>
              <th className="px-4 py-3 font-semibold">{isZh ? '练什么' : 'What to practice'}</th>
              <th className="px-4 py-3 font-semibold">{isZh ? '入口' : 'Link'}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(([label, bestFor, practice, href]) => (
              <tr key={href}>
                <td className="px-4 py-4 font-semibold">{label}</td>
                <td className="px-4 py-4 text-muted-foreground">{bestFor}</td>
                <td className="px-4 py-4 text-muted-foreground">{practice}</td>
                <td className="px-4 py-4">
                  <Link href={`/${normalizedLocale}${href}`} className="font-semibold text-primary hover:underline">
                    {isZh ? '开始' : 'Play'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold tracking-tight">
          {isZh ? '新游戏、全部题库和难度切换怎么用？' : 'How to use New Game, All Puzzles, and difficulty switching'}
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

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <Link href={`/${normalizedLocale}/games/samurai/first-move-strategy`} className="rounded-xl border bg-background p-5 hover:border-primary hover:bg-primary/5">
          <h2 className="text-lg font-semibold text-primary">{isZh ? '第一步攻略' : 'First move guide'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh ? '不知道先点哪里？先看第一步，再开始简单题。' : 'Not sure where to start? Learn the first move before playing Easy.'}
          </p>
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/candidate-notes`} className="rounded-xl border bg-background p-5 hover:border-primary hover:bg-primary/5">
          <h2 className="text-lg font-semibold text-primary">{isZh ? '候选数笔记' : 'Candidate notes'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh ? '中等以上难度建议开始练候选。' : 'Use notes when moving beyond Easy.'}
          </p>
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/evil-solving-path`} className="rounded-xl border bg-background p-5 hover:border-primary hover:bg-primary/5">
          <h2 className="text-lg font-semibold text-primary">{isZh ? 'Evil 解题路径' : 'Evil solving path'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh ? '准备挑战极难题时，先读完整路径。' : 'Read the full workflow before trying Evil.'}
          </p>
        </Link>
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
        <Link href={`/${normalizedLocale}/games/samurai/archive`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '浏览全部题库' : 'Browse all puzzles'}
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '回到今日谜题' : "Back to today's puzzle"}
        </Link>
      </footer>
    </article>
  );
}
