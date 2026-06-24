import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { locales, type Locale } from '@/i18n';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { getPuzzleIndex, isPuzzleDifficulty } from '@/lib/puzzles';
import type { Difficulty } from '@/lib/sudoku/types';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'evil'];

interface DifficultyPageProps {
  params: Promise<{ locale: string; difficulty: string }>;
}

const LABELS: Record<Difficulty, { en: string; zh: string }> = {
  easy: { en: 'Easy', zh: '简单' },
  medium: { en: 'Medium', zh: '中等' },
  hard: { en: 'Hard', zh: '困难' },
  evil: { en: 'Evil', zh: 'Evil 极难' },
};

// Keyword-targeted intro copy per difficulty, in both locales.
const INTRO: Record<Difficulty, { en: string; zh: string }> = {
  easy: {
    en: 'Easy Samurai Sudoku puzzles keep more clues filled in, so the five overlapping 9×9 grids stay approachable. A relaxed way to learn how the shared corner boxes connect.',
    zh: '简单难度的武士数独保留了更多提示数字，五个互相重叠的 9×9 网格更容易上手，是熟悉重叠角宫规则的轻松入门方式。',
  },
  medium: {
    en: 'Medium Samurai Sudoku strikes the balance: fewer clues than easy and more candidate tracking across the cross-shaped board.',
    zh: '中等难度的武士数独提示比简单更少，需要在整个十字形棋盘中更系统地追踪候选数字。',
  },
  hard: {
    en: 'Hard Samurai Sudoku removes most of the clues, forcing you to chain deductions through the overlapping center grid. A real test of concentration.',
    zh: '困难难度的武士数独移除了大部分提示，需要你借助重叠的中央网格层层推理，是对专注力的真正考验。',
  },
  evil: {
    en: 'Evil Samurai Sudoku is the toughest clue profile on this site. Every generated board is checked for one solution, but solving it may require patient candidate tracking beyond the built-in basic hints.',
    zh: 'Evil 极难武士数独采用本站最少的提示配置。每道生成题都会验证唯一解，但完成它可能需要超出内置基础提示的耐心候选推理。',
  },
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    DIFFICULTIES.map((difficulty) => ({ locale, difficulty }))
  );
}

export async function generateMetadata({ params }: DifficultyPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  if (!isPuzzleDifficulty(resolvedParams.difficulty)) {
    return { title: 'Samurai Sudoku' };
  }

  const locale = (resolvedParams.locale as Locale) ?? 'en';
  const isZh = locale === 'zh';
  const difficulty = resolvedParams.difficulty;
  const label = isZh ? LABELS[difficulty].zh : LABELS[difficulty].en;

  const index = await getPuzzleIndex();
  const count = index.puzzles.filter((p) => p.difficulty === difficulty).length;

  const title = isZh
    ? `${label}武士数独 — ${count} 道免费在线题目`
    : `${label} Samurai Sudoku — ${count} Free Online Puzzles`;
  const description = isZh
    ? `在线游玩 ${label}难度武士数独，共 ${count} 道题目，五个互锁 9×9 网格，支持候选标记、提示、计时与本地进度记录。`
    : `Play ${label.toLowerCase()} Samurai Sudoku online — ${count} puzzles across five interlocking 9×9 grids, with notes, hints, a timer, and local progress saving.`;
  const canonical = `/${locale}/games/samurai/difficulty/${difficulty}`;

  return {
    title,
    description,
    keywords: isZh
      ? [`${label}武士数独`, '武士数独', '在线数独', '每日数独', `${label}数独`]
      : [`${label.toLowerCase()} samurai sudoku`, 'samurai sudoku', 'online sudoku', 'daily sudoku', `${label.toLowerCase()} sudoku`],
    alternates: {
      canonical,
      languages: Object.fromEntries(
        locales.map((loc) => [
          loc === 'zh' ? 'zh-CN' : 'en-US',
          `/${loc}/games/samurai/difficulty/${difficulty}`,
        ])
      ),
    },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function DifficultyLandingPage({ params }: DifficultyPageProps) {
  const resolvedParams = await params;
  if (!isPuzzleDifficulty(resolvedParams.difficulty)) {
    notFound();
  }

  const locale = resolvedParams.locale;
  const isZh = locale === 'zh';
  const difficulty = resolvedParams.difficulty;
  const label = isZh ? LABELS[difficulty].zh : LABELS[difficulty].en;
  const tGame = await getTranslations('game');

  const index = await getPuzzleIndex();
  const puzzles = index.puzzles
    .filter((p) => p.difficulty === difficulty)
    .sort((a, b) => (a.id < b.id ? 1 : -1));

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isZh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${locale}`) },
      { '@type': 'ListItem', position: 2, name: 'Samurai Sudoku', item: buildAbsoluteUrl(`/${locale}/games/samurai`) },
      { '@type': 'ListItem', position: 3, name: `${label} Samurai Sudoku`, item: buildAbsoluteUrl(`/${locale}/games/samurai/difficulty/${difficulty}`) },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: isZh ? `${label}武士数独题库` : `${label} Samurai Sudoku puzzles`,
    url: buildAbsoluteUrl(`/${locale}/games/samurai/difficulty/${difficulty}`),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: puzzles.length,
      itemListElement: puzzles.slice(0, 100).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: buildAbsoluteUrl(`/${locale}/games/samurai/${p.id}`),
      })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <header className="border-b px-4 py-6">
        <div className="container mx-auto">
          {/* Breadcrumb */}
          <nav className="text-xs text-muted-foreground mb-3 flex flex-wrap items-center gap-1.5" aria-label="Breadcrumb">
            <Link href={`/${locale}`} className="hover:text-foreground">{isZh ? '首页' : 'Home'}</Link>
            <span aria-hidden>/</span>
            <Link href={`/${locale}/games/samurai`} className="hover:text-foreground">Samurai Sudoku</Link>
            <span aria-hidden>/</span>
            <span className="text-foreground">{label}</span>
          </nav>

          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            {isZh ? `${label}武士数独` : `${label} Samurai Sudoku`}
          </h1>
          <p className="mt-4 max-w-3xl text-base md:text-lg text-muted-foreground leading-relaxed">
            {isZh ? INTRO[difficulty].zh : INTRO[difficulty].en}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {puzzles[0] && (
              <Link
                href={`/${locale}/games/samurai/${puzzles[0].id}`}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                {isZh ? `开始一道${label}题目` : `Play a ${label.toLowerCase()} puzzle`}
              </Link>
            )}
            <Link
              href={`/${locale}/games/samurai/archive`}
              className="px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
            >
              {isZh ? '浏览全部题库' : 'Browse full archive'}
            </Link>
          </div>

          {/* Cross-links to other difficulties */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{tGame('difficulty.label')}:</span>
            {DIFFICULTIES.map((d) => {
              const active = d === difficulty;
              const dLabel = tGame(`difficulty.${d}`);
              return active ? (
                <span key={d} className="rounded-md bg-primary px-3 py-1 text-primary-foreground font-medium">{dLabel}</span>
              ) : (
                <Link
                  key={d}
                  href={`/${locale}/games/samurai/difficulty/${d}`}
                  className="rounded-md border px-3 py-1 hover:bg-accent transition-colors"
                >
                  {dLabel}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4">
          {isZh ? `全部 ${puzzles.length} 道${label}题目` : `All ${puzzles.length} ${label.toLowerCase()} puzzles`}
        </h2>

        {puzzles.length === 0 ? (
          <p className="text-muted-foreground">{isZh ? '暂无题目。' : 'No puzzles yet.'}</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {puzzles.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/${locale}/games/samurai/${p.id}`}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <span className="font-medium tabular">{p.id}</span>
                  <span className="text-sm text-muted-foreground">{p.estimatedTime} {isZh ? '分钟' : 'min'}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
