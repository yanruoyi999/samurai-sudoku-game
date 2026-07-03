import type { Metadata } from 'next';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/games/samurai/beginners';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  return {
    title: isZh ? '武士数独新手指南' : 'Samurai Sudoku for Beginners',
    description: isZh
      ? '给新手的武士数独入门指南：理解五宫结构、重叠区、候选数和从简单题开始练习的方法。'
      : 'A beginner-friendly Samurai Sudoku guide covering the five-grid layout, overlap boxes, candidates, and how to start with easy puzzles.',
    alternates: { canonical: `/${locale}${PATH}` },
  };
}

export default async function BeginnersPage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const points = isZh
    ? [
        ['先把它看成五个普通数独', '每个 9×9 网格仍然遵循普通数独规则。不要一开始就被大棋盘吓到，先找到每个网格的边界。'],
        ['重叠区是关键', '中心网格的四个角落 3×3 宫与四角网格共享。这里的数字同时影响两个网格，是新手最应该关注的区域。'],
        ['从简单难度开始', '简单题会给出更多线索，让你熟悉五宫结构。熟悉后再尝试中等和困难题。'],
        ['不要急着猜', '遇到卡住时先做候选数标记，检查行、列、宫和重叠区的排除关系。'],
      ]
    : [
        ['Think of it as five regular Sudokus first', 'Each 9×9 grid still follows normal Sudoku rules. Do not let the large board intimidate you; first identify the boundaries of each grid.'],
        ['Overlap boxes are the key', 'The four corner boxes of the center grid are shared with the corner grids. Numbers here affect two grids at the same time.'],
        ['Start on Easy', 'Easy puzzles provide more givens, which helps you learn the five-grid structure before moving to Medium or Hard.'],
        ['Do not rush to guess', 'When stuck, add candidate notes and check how rows, columns, boxes, and overlap zones remove possibilities.'],
      ];

  return (
    <article className="container mx-auto max-w-3xl px-4 py-10">
      <Link href={`/${locale}/games/samurai/how-to-play`} className="text-primary hover:underline">
        ← {isZh ? '返回规则说明' : 'Back to rules'}
      </Link>
      <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight md:text-5xl">
        {isZh ? '武士数独新手指南' : 'Samurai Sudoku for Beginners'}
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">
        {isZh
          ? '如果你会普通数独，武士数独的核心并不陌生。关键是学会把五个网格和四个重叠区一起看。'
          : 'If you can play regular Sudoku, Samurai Sudoku is not as strange as it looks. The key is learning to read five grids and four overlap zones together.'}
      </p>
      <section className="mt-10 space-y-5">
        {points.map(([title, body]) => (
          <section key={title} className="rounded-xl border bg-background p-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{body}</p>
          </section>
        ))}
      </section>
      <footer className="mt-10 flex flex-wrap gap-3">
        <Link href={`/${locale}/games/samurai/difficulty/easy`} className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
          {isZh ? '从简单题开始' : 'Start with Easy'}
        </Link>
        <Link href={`/${locale}/games/samurai/strategy-guide`} className="rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-primary/10">
          {isZh ? '继续看策略指南' : 'Read strategy guide'}
        </Link>
      </footer>
    </article>
  );
}
