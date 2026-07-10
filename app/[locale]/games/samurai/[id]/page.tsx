import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { notFound } from 'next/navigation';

import { locales, type Locale } from '@/i18n';
import { buildLanguageAlternates } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { getPuzzle, getPuzzleIndex, getPuzzleMetadata } from '@/lib/puzzles';
import { getNearbyPuzzles } from '@/lib/puzzle-links';
import type { Difficulty } from '@/lib/sudoku/types';
import PuzzleClient from './PuzzleClient';

const DIFFICULTY_LABELS: Record<Difficulty, { en: string; zh: string }> = {
  easy: { en: 'Easy', zh: '简单' },
  medium: { en: 'Medium', zh: '中等' },
  hard: { en: 'Hard', zh: '困难' },
  evil: { en: 'Evil', zh: 'Evil 极难' },
};
const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'evil'];

function getEnglishArticle(label: string) {
  return /^[aeiou]/i.test(label) ? 'an' : 'a';
}

const PRACTICE_PATHS: Record<
  Difficulty,
  {
    heading: { en: string; zh: string };
    steps: Array<{ title: { en: string; zh: string }; body: { en: string; zh: string } }>;
    links: Array<{ href: string; label: { en: string; zh: string } }>;
  }
> = {
  easy: {
    heading: { en: 'Easy puzzle practice path', zh: '简单题练习路径' },
    steps: [
      {
        title: { en: 'Identify the five grids', zh: '识别五个网格' },
        body: { en: 'Start by locating the center grid, four corner grids, and shared boxes.', zh: '先找到中心网格、四角网格和共享宫。' },
      },
      {
        title: { en: 'Fill obvious singles', zh: '填写明显唯一数' },
        body: { en: 'Easy puzzles usually reveal enough singles before candidate notes are needed.', zh: '简单题通常先能找出足够多的明显唯一数。' },
      },
    ],
    links: [
      { href: '/games/samurai/beginners', label: { en: 'Beginner guide', zh: '新手指南' } },
      { href: '/games/samurai/choose-difficulty', label: { en: 'Difficulty guide', zh: '难度指南' } },
    ],
  },
  medium: {
    heading: { en: 'Medium puzzle practice path', zh: '中等题练习路径' },
    steps: [
      {
        title: { en: 'Add notes near overlaps', zh: '围绕重叠区写候选' },
        body: { en: 'Use candidates around the overlap boxes instead of marking every empty cell.', zh: '围绕重叠宫写候选，不要给全盘空格都写满。' },
      },
      {
        title: { en: 'Re-scan both connected grids', zh: '复查连接的两个网格' },
        body: { en: 'Each overlap placement can change the center grid and one corner grid.', zh: '每个重叠区填数都会影响中心网格和一个角落网格。' },
      },
    ],
    links: [
      { href: '/games/samurai/candidate-notes', label: { en: 'Candidate notes', zh: '候选数笔记' } },
      { href: '/games/samurai/overlap-boxes', label: { en: 'Overlap boxes', zh: '重叠宫详解' } },
    ],
  },
  hard: {
    heading: { en: 'Hard puzzle practice path', zh: '困难题练习路径' },
    steps: [
      {
        title: { en: 'Work one overlap region', zh: '一次处理一个重叠区' },
        body: { en: 'Choose the most constrained overlap box, rebuild candidates, then carry deductions into the linked grid.', zh: '选择约束最强的重叠宫，重建候选，再把推理带入关联网格。' },
      },
      {
        title: { en: 'Find pairs before guessing', zh: '猜之前先找候选对' },
        body: { en: 'Hard puzzles often reopen with naked pairs, hidden pairs, or locked candidates.', zh: '困难题经常通过显性候选对、隐性候选对或锁定候选重新打开局面。' },
      },
    ],
    links: [
      { href: '/games/samurai/candidate-notes', label: { en: 'Candidate notes', zh: '候选数笔记' } },
      { href: '/games/samurai/overlap-boxes', label: { en: 'Overlap boxes', zh: '重叠宫详解' } },
      { href: '/games/samurai/solver', label: { en: 'Hint guide', zh: '提示指南' } },
    ],
  },
  evil: {
    heading: { en: 'Evil puzzle practice path', zh: 'Evil 题练习路径' },
    steps: [
      {
        title: { en: 'Audit overlaps before expanding notes', zh: '铺开候选前审计重叠区' },
        body: { en: 'Confirm all four shared boxes before writing broad candidates across the board.', zh: '在全盘铺开候选前，先确认四个共享宫的所有约束。' },
      },
      {
        title: { en: 'Use conflicts as rollback points', zh: '把冲突当作回滚点' },
        body: { en: 'If the board contradicts itself, return to the last unsupported candidate or placement.', zh: '如果棋盘出现矛盾，回到上一次没有充分证明的候选或填数。' },
      },
    ],
    links: [
      { href: '/games/samurai/evil-stuck-after-two-grids', label: { en: 'Stuck after two grids', zh: '两个网格后卡住' } },
      { href: '/games/samurai/evil-solving-path', label: { en: 'Evil solving path', zh: 'Evil 解题路径' } },
      { href: '/games/samurai/candidate-notes', label: { en: 'Candidate notes', zh: '候选数笔记' } },
      { href: '/games/samurai/solver', label: { en: 'Hint guide', zh: '提示指南' } },
    ],
  },
};

function countGivenEntries(puzzle: NonNullable<Awaited<ReturnType<typeof getPuzzle>>>) {
  return puzzle.grids.reduce(
    (total, grid) => total + grid.initial.flat().filter((value) => value !== 0).length,
    0,
  );
}

interface PuzzlePageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateStaticParams() {
  const index = await getPuzzleIndex();
  return locales.flatMap((locale) =>
    index.puzzles.map((puzzle) => ({
      locale,
      id: puzzle.id,
    })),
  );
}
export async function generateMetadata({ params }: PuzzlePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale as Locale) ?? 'en';
  const puzzle = await getPuzzleMetadata(resolvedParams.id);

  if (!puzzle) {
    return {
      title: locale === 'zh' ? '未找到武士数独谜题' : 'Samurai Sudoku Puzzle Not Found',
    };
  }

  const difficulty =
    locale === 'zh'
      ? {
          easy: '简单',
          medium: '中等',
          hard: '困难',
          evil: 'Evil 极难',
        }[puzzle.difficulty]
      : puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1);
  const title =
    locale === 'zh'
      ? `${puzzle.id} ${difficulty}在线武士数独 - 每日谜题`
      : `${puzzle.id} ${difficulty} Samurai Sudoku Online - Daily Puzzle`;
  const description =
    locale === 'zh'
      ? `免费在线游玩 ${puzzle.id} 每日武士数独，难度 ${difficulty}，预计 ${puzzle.estimatedTime} 分钟完成，支持候选标记、提示和进度记录。`
      : `Play the free ${puzzle.id} daily Samurai Sudoku puzzle online. ${difficulty} difficulty, estimated ${puzzle.estimatedTime} minutes, with notes, hints, and progress tracking.`;
  const canonical = buildAbsoluteUrl(`/${locale}/games/samurai/${puzzle.id}`);
  const path = `/games/samurai/${puzzle.id}`;

  return {
    title,
    description,
    keywords:
      locale === 'zh'
        ? ['武士数独', '在线数独', `${difficulty}数独`, '每日数独', puzzle.id, ...puzzle.tags]
        : ['samurai sudoku online', 'online sudoku samurai', 'free sudoku', `${puzzle.difficulty} sudoku`, 'daily sudoku', puzzle.id, ...puzzle.tags],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function PuzzlePage({ params }: PuzzlePageProps) {
  const resolvedParams = await params;
  const puzzle = await getPuzzle(resolvedParams.id);

  if (!puzzle) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name:
      resolvedParams.locale === 'zh'
        ? `${puzzle.id} 武士数独`
        : `${puzzle.id} Samurai Sudoku`,
    url: buildAbsoluteUrl(`/${resolvedParams.locale}/games/samurai/${puzzle.id}`),
    inLanguage: resolvedParams.locale === 'zh' ? 'zh-CN' : 'en-US',
    gameItem: {
      '@type': 'Thing',
      name: 'Samurai Sudoku',
    },
    datePublished: puzzle.id,
    educationalUse: 'logic training',
    isAccessibleForFree: true,
    keywords: puzzle.metadata.tags?.join(', '),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const isZh = resolvedParams.locale === 'zh';
  const difficulty = puzzle.difficulty;
  const diffLabel = isZh ? DIFFICULTY_LABELS[difficulty].zh : DIFFICULTY_LABELS[difficulty].en;
  const givenEntries = countGivenEntries(puzzle);
  const puzzleTitle = isZh
    ? `${puzzle.id} ${diffLabel}在线武士数独`
    : `${puzzle.id} ${diffLabel} Samurai Sudoku Online`;

  // Prev/next within the same difficulty for crawlable internal linking.
  const index = await getPuzzleIndex();
  const sameDifficulty = index.puzzles
    .filter((p) => p.difficulty === difficulty)
    .sort((a, b) => (a.id < b.id ? 1 : -1));
  const pos = sameDifficulty.findIndex((p) => p.id === puzzle.id);
  const newer = pos > 0 ? sameDifficulty[pos - 1] : null;
  const older = pos >= 0 && pos < sameDifficulty.length - 1 ? sameDifficulty[pos + 1] : null;
  const related = getNearbyPuzzles(sameDifficulty, puzzle.id, 6);
  const practicePath = PRACTICE_PATHS[difficulty];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isZh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${resolvedParams.locale}`) },
      { '@type': 'ListItem', position: 2, name: 'Samurai Sudoku', item: buildAbsoluteUrl(`/${resolvedParams.locale}/games/samurai`) },
      { '@type': 'ListItem', position: 3, name: `${diffLabel} Samurai Sudoku`, item: buildAbsoluteUrl(`/${resolvedParams.locale}/games/samurai/difficulty/${difficulty}`) },
      { '@type': 'ListItem', position: 4, name: puzzle.id, item: buildAbsoluteUrl(`/${resolvedParams.locale}/games/samurai/${puzzle.id}`) },
    ],
  };

  return (
    <>
      <Script
        id={`samurai-sudoku-puzzle-jsonld-${puzzle.id}-${resolvedParams.locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id={`samurai-sudoku-breadcrumb-jsonld-${puzzle.id}-${resolvedParams.locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PuzzleClient puzzleId={resolvedParams.id} initialPuzzle={puzzle} />

      <section className="border-t bg-background px-4 py-10">
        <div className="container mx-auto grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {isZh ? '题目概览' : 'Puzzle profile'}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {puzzleTitle}
            </h1>
            <p className="leading-relaxed text-muted-foreground">
              {isZh
                ? `这是一道 ${diffLabel} 难度的每日武士数独，预计 ${puzzle.metadata.estimatedTime} 分钟完成。五个 9x9 网格共享四个重叠 3x3 区域，适合先从重叠宫和给定数密集区域开始。`
                : `This is ${getEnglishArticle(diffLabel)} ${diffLabel.toLowerCase()} daily Samurai Sudoku puzzle with an estimated solve time of ${puzzle.metadata.estimatedTime} minutes. The five 9x9 grids share four overlapping 3x3 boxes, so start with the overlap boxes and the densest given areas.`}
            </p>
          </div>

          <div className="rounded-lg border bg-secondary/30 p-5">
            <h2 className="font-semibold">
              {isZh ? '题目事实' : 'Puzzle facts'}
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">{isZh ? '日期' : 'Date'}</dt>
                <dd className="font-medium">{puzzle.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{isZh ? '难度' : 'Difficulty'}</dt>
                <dd className="font-medium">{diffLabel}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{isZh ? '预计时间' : 'Estimated time'}</dt>
                <dd className="font-medium">{puzzle.metadata.estimatedTime} {isZh ? '分钟' : 'min'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{isZh ? '给定数' : 'Given entries'}</dt>
                <dd className="font-medium">{givenEntries}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-3 lg:col-span-2">
            <h2 className="text-xl font-semibold">
              {isZh ? '建议解题顺序' : 'Suggested solving path'}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {isZh
                ? '先扫描中心网格与四角网格的重叠区域，再记录候选数。若某个数字同时限制中心网格和角落网格，优先处理它；如果卡住，可以回到同难度归档页继续练习相邻日期题。'
                : 'Scan the four overlap boxes first, then add candidate notes. Prioritize numbers that constrain both the center grid and a corner grid; if the puzzle stalls, use the same-difficulty archive links below to practice nearby dates.'}
            </p>
            <section className="rounded-lg border bg-secondary/20 p-4">
              <h3 className="font-semibold">{practicePath.heading[isZh ? 'zh' : 'en']}</h3>
              <ol className="mt-3 grid gap-3 md:grid-cols-2">
                {practicePath.steps.map((step, index) => (
                  <li key={step.title.en} className="rounded-md bg-background p-3">
                    <h4 className="text-sm font-semibold">
                      {index + 1}. {step.title[isZh ? 'zh' : 'en']}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.body[isZh ? 'zh' : 'en']}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link href={`/${resolvedParams.locale}/games/samurai/how-to-play`} className="rounded-md border px-3 py-2 hover:bg-accent transition-colors">
                {isZh ? '规则说明' : 'How to play'}
              </Link>
              <Link href={`/${resolvedParams.locale}/games/samurai/strategy-guide`} className="rounded-md border px-3 py-2 hover:bg-accent transition-colors">
                {isZh ? '解题策略' : 'Strategy guide'}
              </Link>
              <Link href={`/${resolvedParams.locale}/games/samurai/archive`} className="rounded-md border px-3 py-2 hover:bg-accent transition-colors">
                {isZh ? '全部题库' : 'Full archive'}
              </Link>
              {practicePath.links.map((link) => (
                <Link
                  key={link.href}
                  href={`/${resolvedParams.locale}${link.href}`}
                  className="rounded-md border px-3 py-2 text-primary hover:bg-primary/10 transition-colors"
                >
                  {link.label[isZh ? 'zh' : 'en']}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Server-rendered internal links (crawlable; the game UI above is client-only) */}
      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-8 space-y-6 text-sm">
          <nav className="flex flex-wrap items-center justify-between gap-3" aria-label={isZh ? '相邻题目' : 'Adjacent puzzles'}>
            {older ? (
              <Link href={`/${resolvedParams.locale}/games/samurai/${older.id}`} className="rounded-md border px-3 py-2 hover:bg-accent transition-colors">
                ← {older.id}
              </Link>
            ) : <span />}
            <Link href={`/${resolvedParams.locale}/games/samurai/difficulty/${difficulty}`} className="font-medium text-primary hover:underline">
              {isZh ? `更多${diffLabel}武士数独` : `More ${diffLabel.toLowerCase()} Samurai Sudoku`}
            </Link>
            {newer ? (
              <Link href={`/${resolvedParams.locale}/games/samurai/${newer.id}`} className="rounded-md border px-3 py-2 hover:bg-accent transition-colors">
                {newer.id} →
              </Link>
            ) : <span />}
          </nav>

          {related.length > 0 && (
            <div className="border-t pt-4">
              <h2 className="font-medium mb-3">
                {isZh ? `更多${diffLabel}武士数独` : `More ${diffLabel.toLowerCase()} Samurai Sudoku`}
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/${resolvedParams.locale}/games/samurai/${p.id}`}
                      className="flex items-center justify-between rounded-lg border px-4 py-3 hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <span className="font-medium tabular">{p.id}</span>
                      <span className="text-sm text-muted-foreground">{p.estimatedTime} {isZh ? '分钟' : 'min'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <span className="text-muted-foreground">{isZh ? '按难度浏览：' : 'Browse by difficulty:'}</span>
            {ALL_DIFFICULTIES.map((d) => (
              <Link
                key={d}
                href={`/${resolvedParams.locale}/games/samurai/difficulty/${d}`}
                className="rounded-md border px-3 py-1 hover:bg-accent transition-colors"
              >
                {isZh ? DIFFICULTY_LABELS[d].zh : DIFFICULTY_LABELS[d].en}
              </Link>
            ))}
            <Link href={`/${resolvedParams.locale}/games/samurai/archive`} className="rounded-md border px-3 py-1 hover:bg-accent transition-colors">
              {isZh ? '全部题库' : 'Full archive'}
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
