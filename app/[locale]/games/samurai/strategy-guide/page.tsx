import type { Metadata } from 'next';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/games/samurai/strategy-guide';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  return {
    title: isZh ? '武士数独解题策略指南' : 'Samurai Sudoku Strategy Guide',
    description: isZh
      ? '从重叠宫、候选数、唯一位置到跨网格联动，学习武士数独的稳定解题步骤。'
      : 'Learn a reliable Samurai Sudoku solving process: overlap boxes, candidates, hidden singles, and cross-grid deductions.',
    alternates: { canonical: `/${locale}${PATH}` },
  };
}

export default async function StrategyGuidePage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const steps = isZh
    ? [
        ['先建立全局视角', '武士数独不是五道独立数独，而是五个共享信息的网格。先观察四个重叠 3×3 宫，标出它们同时影响哪两个网格。'],
        ['从确定候选开始', '每次只填有明确逻辑依据的数字。先找单一候选，再找某行、列或宫中只能放在一个位置的数字。'],
        ['重叠宫填完立刻复查', '重叠区域的一个数字会同时影响中心网格和角落网格。每次填入后，都回到另一个网格检查新排除的可能。'],
        ['困难题使用候选对', '当没有单一候选时，观察同一行、列或宫里的成对候选。候选对可以排除其他格子的可能，逐步打开局面。'],
      ]
    : [
        ['Start with the whole-board view', 'Samurai Sudoku is not five separate puzzles. It is five grids sharing information. First inspect the four overlap boxes and note which two grids each one controls.'],
        ['Place only justified digits', 'Begin with single candidates, then hidden singles: a digit that can appear in only one cell within a row, column, or box.'],
        ['Recheck after every overlap placement', 'A number placed in an overlap box affects both the center grid and a corner grid. After each placement, scan the other grid for newly removed possibilities.'],
        ['Use pairs on hard puzzles', 'When singles disappear, look for paired candidates in a row, column, or box. Pairs can remove candidates elsewhere and reopen the puzzle.'],
      ];

  return (
    <article className="container mx-auto max-w-3xl px-4 py-10">
      <Link href={`/${locale}/games/samurai/how-to-play`} className="text-primary hover:underline">
        ← {isZh ? '返回玩法规则' : 'Back to rules'}
      </Link>
      <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight md:text-5xl">
        {isZh ? '武士数独解题策略指南' : 'Samurai Sudoku Strategy Guide'}
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">
        {isZh
          ? '这是一套适合日常练习的稳定流程：先找重叠宫，再做候选数，最后用跨网格联动推进困难题。'
          : 'This is a repeatable process for daily practice: start with overlap boxes, build candidates, then use cross-grid logic to solve harder puzzles.'}
      </p>
      <section className="mt-10 space-y-5">
        {steps.map(([title, body], index) => (
          <div key={title} className="rounded-xl border bg-background p-6">
            <h2 className="text-xl font-semibold">{index + 1}. {title}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
      <footer className="mt-10 flex flex-wrap gap-3">
        <Link href={`/${locale}/games/samurai`} className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
          {isZh ? '开始今日谜题' : "Play today's puzzle"}
        </Link>
        <Link href={`/${locale}/games/samurai/archive`} className="rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-primary/10">
          {isZh ? '浏览题库' : 'Browse archive'}
        </Link>
      </footer>
    </article>
  );
}
