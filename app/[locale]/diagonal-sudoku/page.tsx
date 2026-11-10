import type { Metadata } from 'next';
import Link from 'next/link';

import { DiagonalGame } from '@/components/diagonal/DiagonalGame';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';

const PATH = '/diagonal-sudoku';
type Props = { params: Promise<{ locale: string }> };

const content = {
  en: {
    title: 'Diagonal Sudoku (Sudoku X): Play Free Online',
    heading: 'Diagonal Sudoku',
    description: 'Play Sudoku X online with 12 original 9×9 puzzles. Fill every row, column, box and both diagonals. Includes a rotating daily pick, notes and entry checking.',
    play: 'Play Sudoku X',
    rules: 'What changes in Diagonal Sudoku?',
    ruleText: 'Keep all the classic rules: each row, column and 3×3 box uses the numbers 1–9 once. The two marked lines add two more units: top left to bottom right, and top right to bottom left. Each line must independently contain every digit.',
    center: 'The center square is on both diagonals. A digit entered there rules out that digit on both lines, its row, its column and its box. A square next to a line follows its usual row, column and box rules unless it lies on the other line.',
    exampleTitle: 'Try a diagonal deduction',
    example: 'Imagine a marked diagonal is missing 4 and 7. If one of its two empty squares is in a column that already contains 7, that square must be 4. The other empty square on the same diagonal is 7. There is no need for the two squares to share a row or a box.',
    notes: 'Use Notes to pencil in possibilities. Check entries marks incorrect filled digits without giving away an empty square. Complete the puzzle by satisfying all 29 units. Progress and notes are saved per puzzle in this browser when local storage is available.',
    daily: 'The daily pick rotates through the same 12 original puzzles using the UTC date when you open the page. Choose any of the 12 to practice without waiting. Each puzzle has one solution under the full rules; the givens alone permit more than one answer if you ignore both diagonals.',
    compareTitle: 'Is Sudoku X the same as X-Wing?',
    compare: 'No. Sudoku X names the two-diagonal variant. X-Wing is a solving technique based on candidate positions in rows and columns. Jigsaw Sudoku changes the shape of the boxes instead; this game keeps the nine square boxes.',
    links: ['Play Jigsaw Sudoku', 'Learn the X-Wing technique'],
  },
  zh: {
    title: '对角线数独（Sudoku X）：免费在线玩',
    heading: '对角线数独',
    description: '免费玩 12 道原创 9×9 对角线数独。每行、每列、每个九宫和两条对角线都须填入 1–9，支持日题轮换、候选笔记和检查。',
    play: '在线玩 Sudoku X',
    rules: '对角线数独多了什么规则？',
    ruleText: '普通数独的规则都保留：每行、每列、每个 3×3 宫各填一次 1–9。棋盘上标出的左上至右下、右上至左下两条线也分别要填一次 1–9。',
    center: '正中央同时属于两条对角线。填入数字后，两条线、所在行、列和宫里的其他格子都不能再用该数字。只是挨着线、实际没在线上的格子不受那条线约束。',
    exampleTitle: '试一次对角线推理',
    example: '假设一条对角线只缺 4 和 7。其中一个空格所在列已经有 7，那么此格只能填 4。该对角线另一个空格就填 7。即使两个格子不同宫、不同列，这一步也成立。',
    notes: '打开候选笔记可以先写小数字。检查只标出已经填错的格子，不会帮你填空。29 个约束单位全部满足后即完成。浏览器允许本地存储时，每题的进度和候选会分别保留。',
    daily: '今日题目按打开页面时的 UTC 日期在 12 道原创题中轮换，练习模式可随时选任一题。每题在完整规则下只有一个解；如果忽略两条对角线，给定数字可以有多个解。',
    compareTitle: 'Sudoku X 与 X-Wing 一样吗？',
    compare: '不同。Sudoku X 是对角线数独的别名，X-Wing 则是根据行列候选位置来排除数字的技巧。不规则数独改变宫的形状；本游戏仍使用九个正方形宫。',
    links: ['玩不规则数独', '学习 X-Wing 技巧'],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const c = content[locale];
  const url = buildLocalizedUrl(locale, PATH);
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: url, languages: buildLanguageAlternates(PATH) },
    openGraph: { title: c.title, description: c.description, url, type: 'website' },
    robots: { index: false, follow: true },
  };
}

export default async function DiagonalSudokuPage({ params }: Props) {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const c = content[locale];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: c.heading,
    description: c.description,
    url: buildLocalizedUrl(locale, PATH),
    inLanguage: locale,
    isAccessibleForFree: true,
  };
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{c.heading}</h1>
        <p className="max-w-2xl leading-7 text-muted-foreground">{c.description}</p>
      </header>
      <section aria-labelledby="play-diagonal" className="space-y-4 rounded-xl border border-border bg-card p-2 min-[360px]:p-3 sm:p-6">
        <h2 id="play-diagonal" className="text-2xl font-semibold">{c.play}</h2>
        <DiagonalGame locale={locale} />
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.rules}</h2>
        <p>{c.ruleText}</p><p>{c.center}</p>
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.exampleTitle}</h2>
        <p>{c.example}</p><p>{c.notes}</p><p>{c.daily}</p>
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.compareTitle}</h2>
        <p>{c.compare}</p>
        <ul className="list-disc space-y-2 pl-6">
          <li><Link className="text-primary underline underline-offset-4" href={`/${locale}/jigsaw-sudoku`}>{c.links[0]}</Link></li>
          <li><Link className="text-primary underline underline-offset-4" href={`/${locale}/sudoku-x-wing`}>{c.links[1]}</Link></li>
        </ul>
      </section>
    </main>
  );
}
