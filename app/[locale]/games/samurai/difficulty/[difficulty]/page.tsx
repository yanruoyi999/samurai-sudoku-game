import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { locales, type Locale } from '@/i18n';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { getPuzzleIndex, isPuzzleDifficulty } from '@/lib/puzzles';
import type { Difficulty } from '@/lib/sudoku/types';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'evil'];
const MAX_VISIBLE_PUZZLES = 48;

interface DifficultyPageProps {
  params: Promise<{ locale: string; difficulty: string }>;
}

const LABELS: Record<Difficulty, { en: string; zh: string }> = {
  easy: { en: 'Easy', zh: '简单' },
  medium: { en: 'Medium', zh: '中等' },
  hard: { en: 'Hard', zh: '困难' },
  evil: { en: 'Evil', zh: 'Evil 极难' },
};

function getEnglishArticle(label: string) {
  return /^[aeiou]/i.test(label) ? 'an' : 'a';
}

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

const PRACTICE_GUIDES: Record<
  Difficulty,
  {
    heading: { en: string; zh: string };
    body: { en: string; zh: string };
    steps: Array<{ title: { en: string; zh: string }; body: { en: string; zh: string } }>;
    links: Array<{ href: string; label: { en: string; zh: string } }>;
    faq: Array<{ question: { en: string; zh: string }; answer: { en: string; zh: string } }>;
  }
> = {
  easy: {
    heading: { en: 'Easy practice path', zh: '简单难度练习路径' },
    body: {
      en: 'Use easy Samurai Sudoku to learn the five-grid shape before chasing speed.',
      zh: '用简单武士数独先熟悉五宫结构，不要一开始追求速度。',
    },
    steps: [
      {
        title: { en: 'Name the five grids first', zh: '先识别五个网格' },
        body: {
          en: 'Before filling numbers, identify the center grid and four corner grids so overlap boxes stop feeling confusing.',
          zh: '填数前先找出中心网格和四角网格，重叠宫会更容易理解。',
        },
      },
      {
        title: { en: 'Solve visible singles', zh: '先做明显唯一数' },
        body: {
          en: 'Easy boards usually contain enough givens for singles without heavy note taking.',
          zh: '简单题通常给定数足够多，可以先不大量写候选，直接找明显唯一数。',
        },
      },
    ],
    links: [
      { href: '/games/samurai/beginners', label: { en: 'Beginner guide', zh: '新手指南' } },
      { href: '/games/samurai/how-to-play', label: { en: 'How to play', zh: '玩法规则' } },
    ],
    faq: [
      {
        question: { en: 'Is easy Samurai Sudoku good for beginners?', zh: '简单武士数独适合新手吗？' },
        answer: {
          en: 'Yes. Easy puzzles keep more starting digits, which makes the overlap layout easier to learn.',
          zh: '适合。简单题保留更多起始数字，更容易学习重叠网格结构。',
        },
      },
    ],
  },
  medium: {
    heading: { en: 'Medium practice path', zh: '中等难度练习路径' },
    body: {
      en: 'Medium puzzles are the best place to build candidate-note habits without the pressure of evil puzzles.',
      zh: '中等题最适合建立候选数习惯，还没有 Evil 题那么大的压力。',
    },
    steps: [
      {
        title: { en: 'Add notes around active areas', zh: '围绕活跃区域写候选' },
        body: {
          en: 'Do not fill the whole board with pencil marks; focus on overlap boxes and rows with several givens.',
          zh: '不要给全盘写满候选，优先围绕重叠宫和给定数密集的行列记录。',
        },
      },
      {
        title: { en: 'Check both grids after an overlap', zh: '重叠区后检查两边网格' },
        body: {
          en: 'A placement in a shared box should trigger a quick rescan of the center grid and the connected corner grid.',
          zh: '共享宫里填数后，应快速复查中心网格和对应角落网格。',
        },
      },
    ],
    links: [
      { href: '/games/samurai/candidate-notes', label: { en: 'Candidate notes', zh: '候选数笔记' } },
      { href: '/games/samurai/overlap-boxes', label: { en: 'Overlap boxes', zh: '重叠宫详解' } },
    ],
    faq: [
      {
        question: { en: 'When should I move from medium to hard?', zh: '什么时候从中等进入困难？' },
        answer: {
          en: 'Move up when you can finish medium puzzles with candidate notes and very few guesses.',
          zh: '当你能用候选数稳定完成中等题，并且很少猜测时，就可以进入困难题。',
        },
      },
    ],
  },
  hard: {
    heading: { en: 'Hard Samurai Sudoku solving path', zh: '困难武士数独解题路径' },
    body: {
      en: 'Hard Samurai Sudoku is where overlap discipline matters. Treat each shared box as a two-grid checkpoint before you guess.',
      zh: '困难武士数独开始真正考验重叠区纪律。猜测前，把每个共享宫都当作双网格检查点。',
    },
    steps: [
      {
        title: { en: 'Start with overlap boxes and dense givens', zh: '从重叠宫和密集给定数开始' },
        body: {
          en: 'The fastest clean progress usually comes from shared boxes and rows near several givens, not from isolated empty corners.',
          zh: '最干净的推进通常来自共享宫和给定数密集区域，而不是孤立空角落。',
        },
      },
      {
        title: { en: 'Use candidates in small regions', zh: '小区域使用候选数' },
        body: {
          en: 'Build candidates around one overlap, solve what it reveals, then move to the next overlap. This avoids stale notes.',
          zh: '围绕一个重叠区建立候选，解出它带来的结果，再移动到下一个重叠区，避免候选过期。',
        },
      },
      {
        title: { en: 'Look for pairs before guessing', zh: '猜之前先找候选对' },
        body: {
          en: 'Naked pairs and hidden pairs often unlock hard boards without needing long speculative chains.',
          zh: '显性候选对和隐性候选对经常能打开困难题，不必过早进入猜测链。',
        },
      },
    ],
    links: [
      { href: '/games/samurai/candidate-notes', label: { en: 'Candidate notes guide', zh: '候选数笔记指南' } },
      { href: '/games/samurai/overlap-boxes', label: { en: 'Overlap boxes explained', zh: '重叠宫详解' } },
      { href: '/games/samurai/strategy-guide', label: { en: 'Strategy guide', zh: '解题策略' } },
    ],
    faq: [
      {
        question: { en: 'Why are hard Samurai Sudoku puzzles difficult?', zh: '困难武士数独难在哪里？' },
        answer: {
          en: 'They require more candidate tracking across overlapping grids, so one missed shared-box deduction can stall the whole board.',
          zh: '它们需要跨重叠网格追踪更多候选数，一个漏掉的共享宫排除就可能让全盘卡住。',
        },
      },
      {
        question: { en: 'Should I guess on hard puzzles?', zh: '困难题应该猜吗？' },
        answer: {
          en: 'Only after checking overlap boxes, candidate pairs, and hidden singles. Most hard puzzles still reward clean logic first.',
          zh: '只有在检查过重叠宫、候选对和隐性唯一后再考虑。大多数困难题仍然优先奖励干净逻辑。',
        },
      },
    ],
  },
  evil: {
    heading: { en: 'Evil Samurai Sudoku solving path', zh: 'Evil 极难武士数独解题路径' },
    body: {
      en: 'Evil puzzles are long-form logic sessions. The goal is not to move fast; it is to keep every candidate and overlap decision auditable.',
      zh: 'Evil 题是长时间逻辑挑战。目标不是快，而是让每个候选数和重叠区判断都能复查。',
    },
    steps: [
      {
        title: { en: 'Audit every overlap before adding new notes', zh: '写新候选前先审计所有重叠区' },
        body: {
          en: 'Reconfirm the four shared boxes and their connected rows, columns, and boxes before spreading notes across the board.',
          zh: '在全盘铺开候选前，先重新确认四个共享宫及其连接的行、列、宫约束。',
        },
      },
      {
        title: { en: 'Work one constrained region at a time', zh: '一次只处理一个高约束区域' },
        body: {
          en: 'Pick the tightest overlap or center-grid region, solve its local candidates, then carry the result into the linked grid.',
          zh: '选择约束最强的重叠区或中心网格区域，先解决局部候选，再把结果带入关联网格。',
        },
      },
      {
        title: { en: 'Use conflicts as rollback points', zh: '把冲突当作回滚点' },
        body: {
          en: 'If a contradiction appears, clear the unsupported placement and return to the last candidate change that was not fully justified.',
          zh: '如果出现矛盾，清除没有依据的填数，回到上一次未被充分证明的候选变化。',
        },
      },
    ],
    links: [
      { href: '/games/samurai/evil-solving-path', label: { en: 'Evil solving path', zh: 'Evil 解题路径' } },
      { href: '/games/samurai/candidate-notes', label: { en: 'Candidate notes guide', zh: '候选数笔记指南' } },
      { href: '/games/samurai/solver', label: { en: 'Hint guide', zh: '提示指南' } },
    ],
    faq: [
      {
        question: { en: 'Are evil Samurai Sudoku puzzles uniquely solvable?', zh: 'Evil 武士数独有唯一解吗？' },
        answer: {
          en: 'Yes. Public generated puzzles are checked for a unique solution, even when they require patient candidate analysis.',
          zh: '有。公开生成题会验证唯一解，即使它们需要耐心的候选数分析。',
        },
      },
      {
        question: { en: 'What is the best first step on evil puzzles?', zh: 'Evil 题第一步最好做什么？' },
        answer: {
          en: 'Re-scan all four overlap boxes and build candidates only in the most constrained region first.',
          zh: '先重新扫描四个重叠宫，并只在约束最强的区域建立候选。',
        },
      },
    ],
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
  const path = `/games/samurai/difficulty/${difficulty}`;
  const canonical = buildLocalizedUrl(locale, path);

  return {
    title,
    description,
    keywords: isZh
      ? [`${label}武士数独`, '武士数独', '在线数独', '每日数独', `${label}数独`]
      : [`${label.toLowerCase()} samurai sudoku`, 'samurai sudoku', 'online sudoku', 'daily sudoku', `${label.toLowerCase()} sudoku`],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(path),
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
  const visiblePuzzles = puzzles.slice(0, MAX_VISIBLE_PUZZLES);
  const hasMorePuzzles = puzzles.length > visiblePuzzles.length;
  const practiceGuide = PRACTICE_GUIDES[difficulty];

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
      itemListElement: visiblePuzzles.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: buildAbsoluteUrl(`/${locale}/games/samurai/${p.id}`),
      })),
    },
  };
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: practiceGuide.faq.map((item) => ({
      '@type': 'Question',
      name: item.question[isZh ? 'zh' : 'en'],
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer[isZh ? 'zh' : 'en'],
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

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
                {isZh
                  ? `开始一道${label}题目`
                  : `Play ${getEnglishArticle(label)} ${label.toLowerCase()} puzzle`}
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
        <section className="mb-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border bg-background p-6">
            <h2 className="text-2xl font-semibold">
              {practiceGuide.heading[isZh ? 'zh' : 'en']}
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {practiceGuide.body[isZh ? 'zh' : 'en']}
            </p>
            <ol className="mt-5 space-y-4">
              {practiceGuide.steps.map((step, index) => (
                <li key={step.title.en} className="rounded-lg border bg-secondary/20 p-4">
                  <h3 className="font-semibold">
                    {index + 1}. {step.title[isZh ? 'zh' : 'en']}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.body[isZh ? 'zh' : 'en']}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border bg-primary/5 p-5">
              <h2 className="font-semibold">{isZh ? '相关指南' : 'Related guides'}</h2>
              <div className="mt-4 grid gap-2 text-sm">
                {practiceGuide.links.map((link) => (
                  <Link
                    key={link.href}
                    href={`/${locale}${link.href}`}
                    className="rounded-md border bg-background px-3 py-2 text-primary hover:border-primary hover:bg-primary/5"
                  >
                    {link.label[isZh ? 'zh' : 'en']}
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-lg border bg-background p-5">
              <h2 className="font-semibold">{isZh ? '常见问题' : 'FAQ'}</h2>
              <div className="mt-3 space-y-3">
                {practiceGuide.faq.map((item) => (
                  <section key={item.question.en}>
                    <h3 className="text-sm font-semibold">{item.question[isZh ? 'zh' : 'en']}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.answer[isZh ? 'zh' : 'en']}
                    </p>
                  </section>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <h2 className="text-xl font-semibold mb-4">
          {isZh
            ? `最新 ${visiblePuzzles.length} 道${label}题目`
            : `Latest ${visiblePuzzles.length} ${label.toLowerCase()} puzzles`}
        </h2>

        {puzzles.length === 0 ? (
          <p className="text-muted-foreground">{isZh ? '暂无题目。' : 'No puzzles yet.'}</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {isZh
                ? `本页聚焦最近题目，完整 ${puzzles.length} 道${label}题目可在题库归档中筛选。`
                : `This page focuses on recent puzzles. Filter the full archive for all ${puzzles.length} ${label.toLowerCase()} puzzles.`}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePuzzles.map((p) => (
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
            {hasMorePuzzles && (
              <div className="mt-6 rounded-lg border bg-secondary/30 p-4 text-sm text-muted-foreground">
                <p>
                  {isZh
                    ? `还有 ${puzzles.length - visiblePuzzles.length} 道较早的${label}题目。`
                    : `${puzzles.length - visiblePuzzles.length} older ${label.toLowerCase()} puzzles are still available.`}
                </p>
                <Link
                  href={`/${locale}/games/samurai/archive?difficulty=${difficulty}`}
                  className="mt-3 inline-flex rounded-md border px-3 py-2 font-medium text-primary hover:bg-primary/10"
                >
                  {isZh ? '在完整题库中筛选' : 'Filter the full archive'}
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
