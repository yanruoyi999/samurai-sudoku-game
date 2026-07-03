import type { Metadata } from 'next';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/games/samurai/paper-practice';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  return {
    title: isZh ? '武士数独纸笔练习指南' : 'Samurai Sudoku Paper Practice Guide',
    description: isZh
      ? '用纸笔练习武士数独：候选数、重叠区标记、难度选择和复盘方法。'
      : 'Use paper-style practice for Samurai Sudoku with candidate notes, overlap marking, difficulty choice, and review habits.',
    alternates: { canonical: `/${locale}${PATH}` },
  };
}

export default async function PaperPracticePage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const tips = isZh
    ? [
        ['先选择合适难度', '从简单或中等开始。困难和 Evil 题更适合熟悉候选数和重叠区推理的玩家。'],
        ['留出候选数空间', '纸笔练习时，空格里要能写小候选数。使用较大页面或横向布局会更舒服。'],
        ['标记重叠区', '把四个共享 3×3 宫轻轻标出，有助于提醒自己跨网格检查。'],
        ['复盘错误路径', '如果出现矛盾，回到最近一次无依据猜测，重新检查候选数。'],
      ]
    : [
        ['Choose the right difficulty first', 'Start with Easy or Medium. Hard and Evil puzzles are better once candidates and overlap logic feel natural.'],
        ['Leave room for candidates', 'Paper-style solving needs space for small notes inside empty cells. A larger page or landscape layout helps.'],
        ['Mark overlap zones', 'Lightly mark the four shared 3×3 boxes so you remember to check both grids after each placement.'],
        ['Review mistakes', 'If a contradiction appears, return to the last unsupported assumption and rebuild the candidate notes.'],
      ];

  return (
    <article className="container mx-auto max-w-3xl px-4 py-10">
      <Link href={`/${locale}/games/samurai/archive`} className="text-primary hover:underline">
        ← {isZh ? '返回题库' : 'Back to archive'}
      </Link>
      <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight md:text-5xl">
        {isZh ? '武士数独纸笔练习指南' : 'Samurai Sudoku Paper Practice Guide'}
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">
        {isZh
          ? '纸笔式练习适合深度思考。你可以更认真地标候选数、记录推理路径，并复盘每一步。'
          : 'Paper-style practice is useful for slower reasoning. You can mark candidates carefully, track your logic, and review each step.'}
      </p>
      <section className="mt-10 space-y-5">
        {tips.map(([title, body]) => (
          <section key={title} className="rounded-xl border bg-background p-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{body}</p>
          </section>
        ))}
      </section>
      <footer className="mt-10 flex flex-wrap gap-3">
        <Link href={`/${locale}/games/samurai/archive`} className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
          {isZh ? '选择一道题' : 'Choose a puzzle'}
        </Link>
        <Link href={`/${locale}/games/samurai/strategy-guide`} className="rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-primary/10">
          {isZh ? '查看解题策略' : 'Read solving strategy'}
        </Link>
      </footer>
    </article>
  );
}
