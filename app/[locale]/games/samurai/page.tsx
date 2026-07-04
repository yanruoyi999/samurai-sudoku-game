import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { getPuzzle, getPuzzleIndex } from '@/lib/puzzles';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';
import SamuraiGameClient from './SamuraiGameClient';

interface SamuraiGamePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: SamuraiGamePageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const title = isZh
    ? '在线武士数独 - 每日免费五宫格数独'
    : 'Samurai Sudoku Online - Free Daily Hard & Evil Puzzle';
  const description = isZh
    ? '免费在线游玩每日武士数独，挑战五个互相重叠的 9x9 网格，支持候选标记、提示、计时和本地进度记录。'
    : 'Play Samurai Sudoku online for free with a fresh daily five-grid puzzle, notes, hints, timer, and local progress tracking.';
  const canonical = buildLocalizedUrl(locale, '/games/samurai');

  return {
    title,
    description,
    keywords: isZh
      ? ['武士数独', '在线数独', '每日数独', 'Evil 数独', '逻辑游戏']
      : [
          'samurai sudoku',
          'samurai sudoku online',
          'online sudoku samurai',
          'online sudoku',
          'daily sudoku',
          'evil sudoku',
          'logic game',
        ],
    alternates: {
      canonical,
      languages: buildLanguageAlternates('/games/samurai'),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SamuraiGamePage({ params }: SamuraiGamePageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const index = await getPuzzleIndex();
  const latest = index.puzzles[0];
  const puzzle = latest ? await getPuzzle(latest.id) : null;

  if (!puzzle) {
    throw new Error('No Samurai Sudoku puzzle is available. Run pnpm generate-puzzles first.');
  }

  return <SamuraiGamePageContent initialPuzzle={puzzle} locale={locale} isZh={isZh} />;
}

async function SamuraiGamePageContent({
  initialPuzzle,
  locale,
  isZh,
}: {
  initialPuzzle: NonNullable<Awaited<ReturnType<typeof getPuzzle>>>;
  locale: string;
  isZh: boolean;
}) {
  const canonical = buildAbsoluteUrl(`/${locale}/games/samurai`);
  const faqItems = isZh
    ? [
        {
          question: '武士数独可以免费在线玩吗？',
          answer: '可以。本站的每日武士数独可直接在浏览器中免费游玩，不需要注册账号，进度会保存在本地浏览器。',
        },
        {
          question: '每日武士数独和普通数独有什么不同？',
          answer: '武士数独由五个 9x9 数独网格组成，四个角落网格与中心网格共享 3x3 区域，因此每一步都可能影响两个网格。',
        },
        {
          question: '困难和 Evil 武士数独适合谁？',
          answer: '困难和 Evil 难度适合已经熟悉普通数独、愿意做候选数记录和跨网格推理的玩家。',
        },
      ]
    : [
        {
          question: 'Can I play Samurai Sudoku online for free?',
          answer: 'Yes. The daily Samurai Sudoku puzzle is free to play in the browser, with no account required and local progress saving.',
        },
        {
          question: 'How is daily Samurai Sudoku different from regular Sudoku?',
          answer: 'Samurai Sudoku links five 9x9 Sudoku grids. Four corner grids share 3x3 overlap boxes with the center grid, so one placement can affect two grids at once.',
        },
        {
          question: 'Who should try hard or evil Samurai Sudoku?',
          answer: 'Hard and evil puzzles are best for players who already know standard Sudoku and want deeper candidate tracking across overlapping grids.',
        },
      ];

  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isZh ? '在线武士数独' : 'Samurai Sudoku Online',
    url: canonical,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    inLanguage: isZh ? 'zh-CN' : 'en-US',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const gameJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: isZh ? '每日武士数独' : 'Daily Samurai Sudoku',
    url: canonical,
    gameItem: {
      '@type': 'Thing',
      name: 'Samurai Sudoku',
    },
    isAccessibleForFree: true,
    educationalUse: 'logic training',
    inLanguage: isZh ? 'zh-CN' : 'en-US',
    keywords: isZh
      ? '武士数独, 在线数独, 每日数独, 困难数独, Evil 数独'
      : 'samurai sudoku online, online sudoku samurai, daily sudoku, hard sudoku, evil sudoku',
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
      { '@type': 'ListItem', position: 1, name: isZh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${locale}`) },
      { '@type': 'ListItem', position: 2, name: 'Samurai Sudoku', item: canonical },
    ],
  };

  return (
    <>
      <Script
        id={`samurai-sudoku-webapp-jsonld-${locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <Script
        id={`samurai-sudoku-game-jsonld-${locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id={`samurai-sudoku-faq-jsonld-${locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id={`samurai-sudoku-breadcrumb-jsonld-${locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <SamuraiGameClient initialPuzzle={initialPuzzle} />

      <section className="border-t bg-background px-4 py-12">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {isZh ? '每日免费在线谜题' : 'Free daily online puzzle'}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                {isZh ? '每日武士数独，五宫格重叠逻辑挑战' : 'Daily Samurai Sudoku for five-grid logic practice'}
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                {isZh
                  ? `今日题目 ${initialPuzzle.id} 是 ${initialPuzzle.difficulty} 难度。先检查四个重叠的 3x3 区域，再用候选数推进中心网格和四角网格。`
                  : `Today's puzzle ${initialPuzzle.id} is ${initialPuzzle.difficulty}. Start with the four overlap boxes, then use candidates to connect the center grid with each corner grid.`}
              </p>
            </div>

            <div className="rounded-lg border bg-secondary/30 p-5">
              <h3 className="font-semibold">
                {isZh ? '继续探索' : 'Next useful pages'}
              </h3>
              <div className="mt-4 grid gap-2 text-sm">
                <Link href={`/${locale}/games/samurai/how-to-play`} className="text-primary hover:underline">
                  {isZh ? '如何玩武士数独' : 'How to play Samurai Sudoku'}
                </Link>
                <Link href={`/${locale}/games/samurai/strategy-guide`} className="text-primary hover:underline">
                  {isZh ? '武士数独解题策略' : 'Samurai Sudoku strategy guide'}
                </Link>
                <Link href={`/${locale}/games/samurai/difficulty/evil`} className="text-primary hover:underline">
                  {isZh ? 'Evil 极难武士数独' : 'Evil Samurai Sudoku puzzles'}
                </Link>
                <Link href={`/${locale}/games/samurai/archive`} className="text-primary hover:underline">
                  {isZh ? '全部武士数独题库' : 'Full Samurai Sudoku archive'}
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {faqItems.map((item) => (
              <section key={item.question} className="rounded-lg border p-5">
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
