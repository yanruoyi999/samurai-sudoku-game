import type { Metadata } from 'next';
import Link from 'next/link';
import { StarBattleGame } from '@/components/star-battle/StarBattleGame';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';

const path = '/star-battle-puzzle';
type Props = { params: Promise<{ locale: string }> };

const copy = {
  en: {
    title: 'Star Battle Puzzle: Learn and Play Two Beginner Boards',
    heading: 'Star Battle Puzzle',
    description: 'Play two original 5×5 Star Battle puzzles. Explain your first star, then solve a second board on your own.',
    play: 'Play Star Battle',
    rules: 'How to play',
    steps: ['Place exactly one star in each row, each column and each lettered region.', 'Stars cannot touch, including at the corners.', 'Use × to mark places that cannot hold a star. Exclusion marks are optional.'],
    deduction: 'What to check after placing a star',
    explanation: 'Rule out every other square in that row, column and region. Also rule out the diagonally touching squares. If only one unmarked square remains in a region, that square must take the region’s star.',
    storage: 'When browser storage is available, this page resumes your board and lesson stage after a refresh. Use the arrow keys to move between squares and Enter or Space to select one.',
    related: 'More puzzles with different rules',
    diagonal: 'Play Diagonal Sudoku',
    cat: 'Learn the Meowdoku rules',
  },
  zh: {
    title: '星战谜题（Star Battle）：两道入门题在线练习',
    heading: '星战谜题（Star Battle）',
    description: '在线玩两道原创 5×5 星战谜题。先说明第一颗星为什么放在那里，再独立解第二张棋盘。',
    play: '开始玩星战谜题',
    rules: '玩法规则',
    steps: ['每一行、每一列、每个字母区域恰好放一颗星。', '星星之间不能相邻，斜角接触也算。', '可以用 × 标记不能放星的格子，无须标完所有空格。'],
    deduction: '放下一颗星后怎么推',
    explanation: '排除同一行、同一列、同一区的其他格子，也排除斜角相邻的格子。如果一个区域只剩一个未被排除的格子，这个区域的星就只能放在那里。',
    storage: '浏览器允许本地存储时，刷新后可以继续当前棋盘和步骤。方向键移动格子焦点，回车或空格选择格子。',
    related: '试试其他规则的谜题',
    diagonal: '玩对角线数独',
    cat: '了解 Meowdoku 的玩法',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const { title, description } = copy[locale];
  const canonical = buildLocalizedUrl(locale, path);
  return {
    title, description,
    alternates: { canonical, languages: buildLanguageAlternates(path) },
    openGraph: { title, description, url: canonical, type: 'website' },
    robots: { index: false, follow: true },
  };
}

export default async function StarBattlePage({ params }: Props) {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const c = copy[locale];
  const linkClass = 'font-medium text-primary underline underline-offset-4';
  return <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 leading-7 sm:px-8">
    <header className="space-y-3">
      <h1 className="text-4xl font-bold tracking-tight">{c.heading}</h1>
      <p className="max-w-xl text-muted-foreground">{c.description}</p>
    </header>
    <section aria-labelledby="star-battle-rules" className="space-y-2">
      <h2 id="star-battle-rules" className="text-xl font-semibold">{c.rules}</h2>
      <ol className="list-decimal space-y-1 pl-6">{c.steps.map(step => <li key={step}>{step}</li>)}</ol>
    </section>
    <section aria-labelledby="star-battle-play" className="space-y-4 rounded-xl border border-border bg-card p-3 sm:p-6">
      <h2 id="star-battle-play" className="text-2xl font-semibold">{c.play}</h2>
      <StarBattleGame locale={locale} />
      <p className="text-sm text-muted-foreground">{c.storage}</p>
    </section>
    <section aria-labelledby="star-battle-deduction" className="space-y-2">
      <h2 id="star-battle-deduction" className="text-2xl font-semibold">{c.deduction}</h2>
      <p>{c.explanation}</p>
    </section>
    <nav aria-labelledby="star-battle-related" className="space-y-2">
      <h2 id="star-battle-related" className="text-xl font-semibold">{c.related}</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li><Link className={linkClass} href={`/${locale}/diagonal-sudoku`}>{c.diagonal}</Link></li>
        <li><Link className={linkClass} href={`/${locale}/meowdoku-rules`}>{c.cat}</Link></li>
      </ul>
    </nav>
  </main>;
}
