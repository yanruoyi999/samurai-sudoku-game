import type { Metadata } from 'next';
import Link from 'next/link';
import { HexadokuGame } from '@/components/hexadoku/HexadokuGame';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';

const path = '/16x16-sudoku';
type Props = { params: Promise<{ locale: string }> };

const copy = {
  en: {
    title: '16×16 Sudoku (Hexadoku): Play Six Free Puzzles', heading: '16×16 Sudoku',
    description: 'Play six original 16×16 Sudoku puzzles. Fill each row, column and 4×4 box with 1–16. Use notes, check entries and save each puzzle locally.',
    play: 'Play 16×16 Sudoku', rules: 'How to play Hexadoku',
    steps: [
      'Fill the 256 cells with the numbers 1–16. Each row, column and outlined 4×4 box must contain every number once. The printed numbers are locked.',
      'Start with a unit that is nearly full. If a box has one empty cell and 13 is its only missing number, the cell must be 13. With more blanks, cross out the numbers already used in the cell’s row and column.',
      'The six puzzles have 44, 76 or 112 blanks. Each puzzle can be solved by repeatedly finding a cell with one candidate. A separate solver checks that every puzzle has a unique answer.',
    ],
    help: 'Notes, checks and saved games',
    notes: 'Use Notes to toggle candidates in an empty cell. Check entries marks incorrect numbers you have filled. The board reports success when all entries are correct. Each puzzle saves its own entries and notes in this browser when storage is available. Restart clears only the current puzzle.',
    compare: 'Compare other Sudoku boards',
    alternatives: 'These puzzles have one square board and regular boxes. Jigsaw changes the region shapes. Samurai combines five overlapping grids. A 6×6 grid is a shorter way to practice the same row and column rule.',
    links: ['Play 6×6 Sudoku', 'Play Jigsaw Sudoku', 'Learn how Samurai Sudoku overlaps'],
  },
  zh: {
    title: '16×16 数独（Hexadoku）｜免费玩六道原创题', heading: '16×16 数独',
    description: '免费玩六道原创 16×16 数独。每行、每列、每个 4×4 宫各填一次 1–16，支持候选笔记、检查与分题存档。',
    play: '在线玩 16×16 数独', rules: '16×16 数独怎么玩？',
    steps: [
      '把 1–16 填入 256 格。每行、每列和每个粗线围出的 4×4 宫都要恰好包含每个数一次。题目给定的数字不能改。',
      '先找快填满的一行、一列或一宫。例如某宫只剩一个空格并且只缺 13，空格就填 13。空格更多时，再从候选中划掉同一行、列已有的数字。',
      '六道题分为 44、76、112 个空格三档。每道题都能逐步找到只剩一个候选的格子，并由独立求解器验证唯一解。',
    ],
    help: '候选笔记、检查与存档',
    notes: '打开候选笔记后，可在空格中标记或取消候选。检查会标出错误的已填数字。全部填对后会显示通关。浏览器允许本地存储时，每题分别保存填数和笔记，重开只清除本题。',
    compare: '试试其他棋盘',
    alternatives: '本页是单盘正方形棋盘，宫也是正方形。不规则数独改变宫的形状，武士数独则由五盘重叠。也可以用 6×6 棋盘练习同样的行列规则。',
    links: ['玩 6×6 数独', '玩不规则数独', '了解武士数独如何重叠'],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const c = copy[locale];
  const url = buildLocalizedUrl(locale, path);
  return {
    title: c.title, description: c.description,
    alternates: { canonical: url, languages: buildLanguageAlternates(path) },
    openGraph: { title: c.title, description: c.description, url, type: 'website' },
    robots: { index: true, follow: true },
  };
}

export default async function HexadokuPage({ params }: Props) {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const c = copy[locale];
  const schema = {
    '@context': 'https://schema.org', '@type': 'Game', name: c.heading, description: c.description,
    url: buildLocalizedUrl(locale, path), inLanguage: locale, isAccessibleForFree: true,
  };
  const routes = ['/sudoku-for-kids/6x6', '/jigsaw-sudoku', '/games/samurai/what-is-samurai-sudoku'];

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-3 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">{c.heading}</h1>
        <p className="max-w-2xl leading-7 text-muted-foreground">{c.description}</p>
      </header>
      <section aria-labelledby="play-hexadoku" className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-2 sm:p-4">
        <h2 id="play-hexadoku" className="text-2xl font-semibold">{c.play}</h2>
        <HexadokuGame locale={locale} />
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.rules}</h2>
        <ol className="list-decimal space-y-2 pl-6">{c.steps.map(step => <li key={step}>{step}</li>)}</ol>
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.help}</h2>
        <p>{c.notes}</p>
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.compare}</h2>
        <p>{c.alternatives}</p>
        <ul className="list-disc pl-6">
          {routes.map((route, index) => (
            <li key={route}><Link className="text-primary underline underline-offset-4" href={`/${locale}${route}`}>{c.links[index]}</Link></li>
          ))}
        </ul>
      </section>
    </main>
  );
}
