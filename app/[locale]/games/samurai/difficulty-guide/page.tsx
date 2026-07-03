import type { Metadata } from 'next';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/games/samurai/difficulty-guide';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  return {
    title: isZh ? '武士数独难度选择指南' : 'Samurai Sudoku Difficulty Guide',
    description: isZh
      ? '了解 Easy、Medium、Hard、Evil 武士数独难度差异，选择适合自己的练习路线。'
      : 'Understand Easy, Medium, Hard, and Evil Samurai Sudoku difficulty levels and choose the right practice path.',
    alternates: { canonical: `/${locale}${PATH}` },
  };
}

export default async function DifficultyGuidePage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const levels = isZh
    ? [
        ['Easy', '适合第一次接触武士数独，给出数字更多，重点是熟悉五个网格和重叠宫。'],
        ['Medium', '适合已经理解规则的玩家，需要更多候选数和跨网格排除。'],
        ['Hard', '适合稳定使用候选数、唯一位置和候选对的玩家。'],
        ['Evil', '适合想要长时间推理挑战的玩家，需要耐心复盘和更严格的候选管理。'],
      ]
    : [
        ['Easy', 'Best for first-time Samurai Sudoku players. More givens help you learn the five-grid layout and overlap boxes.'],
        ['Medium', 'Best once the rules feel natural. You will use more candidates and cross-grid eliminations.'],
        ['Hard', 'Best for players comfortable with candidates, hidden singles, and candidate pairs.'],
        ['Evil', 'Best for long reasoning sessions. Expect careful note management and patient review.'],
      ];

  return (
    <article className="container mx-auto max-w-3xl px-4 py-10">
      <Link href={`/${locale}/games/samurai`} className="text-primary hover:underline">
        ← {isZh ? '返回游戏' : 'Back to game'}
      </Link>
      <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight md:text-5xl">
        {isZh ? '武士数独难度选择指南' : 'Samurai Sudoku Difficulty Guide'}
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">
        {isZh
          ? '选择合适难度能让练习更稳定。先用简单题熟悉结构，再逐步增加候选数和跨网格推理。'
          : 'Choosing the right difficulty keeps practice sustainable. Start with structure, then add candidates and cross-grid reasoning as you improve.'}
      </p>
      <section className="mt-10 space-y-5">
        {levels.map(([title, body]) => (
          <section key={title} className="rounded-xl border bg-background p-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{body}</p>
          </section>
        ))}
      </section>
      <footer className="mt-10 flex flex-wrap gap-3">
        <Link href={`/${locale}/games/samurai/difficulty/easy`} className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
          {isZh ? '从 Easy 开始' : 'Start with Easy'}
        </Link>
        <Link href={`/${locale}/games/samurai/strategy-guide`} className="rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-primary/10">
          {isZh ? '查看策略指南' : 'Read strategy guide'}
        </Link>
      </footer>
    </article>
  );
}
