import type { Metadata } from 'next';

import { locales } from '@/i18n';
import { getPuzzle, getPuzzleIndex } from '@/lib/puzzles';
import { buildAbsoluteUrl } from '@/lib/site-url';
import SamuraiGameClient from './SamuraiGameClient';

interface SamuraiGamePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: SamuraiGamePageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const title = isZh ? '在线武士数独 - 每日逻辑谜题' : 'Play Samurai Sudoku Online - Daily Logic Puzzle';
  const description = isZh
    ? '在线游玩武士数独，挑战五个互相重叠的 9x9 网格，支持候选标记、提示、计时和本地进度记录。'
    : 'Play Samurai Sudoku online across five overlapping 9x9 grids with notes, hints, timer, and local progress tracking.';
  const canonical = buildAbsoluteUrl(`/${locale}/games/samurai`);

  return {
    title,
    description,
    keywords: isZh
      ? ['武士数独', '在线数独', '每日数独', 'Evil 数独', '逻辑游戏']
      : ['samurai sudoku', 'online sudoku', 'daily sudoku', 'evil sudoku', 'logic game'],
    alternates: {
      canonical,
      languages: Object.fromEntries(
        locales.map((loc) => [
          loc === 'zh' ? 'zh-CN' : 'en-US',
          buildAbsoluteUrl(`/${loc}/games/samurai`),
        ]),
      ),
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

export default async function SamuraiGamePage() {
  const index = await getPuzzleIndex();
  const latest = index.puzzles[0];
  const puzzle = latest ? await getPuzzle(latest.id) : null;

  if (!puzzle) {
    throw new Error('No Samurai Sudoku puzzle is available. Run pnpm generate-puzzles first.');
  }

  return <SamuraiGameClient initialPuzzle={puzzle} />;
}
