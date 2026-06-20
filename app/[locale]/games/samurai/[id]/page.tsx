import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { locales, type Locale } from '@/i18n';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { getPuzzle, getPuzzleIndex, getPuzzleMetadata } from '@/lib/puzzles';
import PuzzleClient from './PuzzleClient';

interface PuzzlePageProps {
  params: { locale: string; id: string };
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
  const locale = (params.locale as Locale) ?? 'en';
  const puzzle = await getPuzzleMetadata(params.id);

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
      ? `${puzzle.id} 武士数独 - ${difficulty}难度`
      : `${puzzle.id} Samurai Sudoku - ${difficulty} Puzzle`;
  const description =
    locale === 'zh'
      ? `在线游玩 ${puzzle.id} 武士数独，难度 ${difficulty}，预计 ${puzzle.estimatedTime} 分钟完成，支持候选标记、提示和进度记录。`
      : `Play the ${puzzle.id} Samurai Sudoku puzzle online. ${difficulty} difficulty, estimated ${puzzle.estimatedTime} minutes, with notes, hints, and progress tracking.`;
  const canonical = `/${locale}/games/samurai/${puzzle.id}`;

  return {
    title,
    description,
    keywords:
      locale === 'zh'
        ? ['武士数独', '在线数独', `${difficulty}数独`, '每日数独', puzzle.id, ...puzzle.tags]
        : ['samurai sudoku', 'online sudoku', `${puzzle.difficulty} sudoku`, 'daily sudoku', puzzle.id, ...puzzle.tags],
    alternates: {
      canonical,
      languages: Object.fromEntries(
        locales.map((loc) => [
          loc === 'zh' ? 'zh-CN' : 'en-US',
          `/${loc}/games/samurai/${puzzle.id}`,
        ]),
      ),
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
  const puzzle = await getPuzzle(params.id);

  if (!puzzle) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name:
      params.locale === 'zh'
        ? `${puzzle.id} 武士数独`
        : `${puzzle.id} Samurai Sudoku`,
    url: buildAbsoluteUrl(`/${params.locale}/games/samurai/${puzzle.id}`),
    inLanguage: params.locale === 'zh' ? 'zh-CN' : 'en-US',
    gameItem: {
      '@type': 'Thing',
      name: 'Samurai Sudoku',
    },
    educationalUse: 'logic training',
    keywords: puzzle.metadata.tags?.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PuzzleClient puzzleId={params.id} initialPuzzle={puzzle} />
    </>
  );
}
