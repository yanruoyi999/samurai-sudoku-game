import type { Metadata } from 'next';
import Link from 'next/link';
import { KillerGame } from '@/components/killer/KillerGame';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';

const path = '/killer-sudoku';
type Props = { params: Promise<{ locale: string }> };

const copy = {
  en: {
    title: 'Killer Sudoku Online — Play Free 9×9 Puzzles',
    heading: 'Killer Sudoku Online',
    description: 'Play original Killer Sudoku puzzles in your browser. Fill the 9×9 grid using the usual Sudoku rules and the sums in the dashed cages.',
    play: 'Play Killer Sudoku',
    rules: 'How to play Killer Sudoku',
    steps: [
      'Use the digits 1–9 exactly once in each row, column and bold 3×3 box. The bold borders separate the nine Sudoku boxes.',
      'The dashed borders mark cages. The small number in the first cell is the total of that entire cage. A cage can cross a bold box border, and its digits cannot repeat even if two of its cells share no row, column or box.',
      'Start with short cages. A one-cell cage gives you that cell’s value. A two-cell cage totaling 17 must contain 8 and 9. Use the row, column and box to decide which digit belongs in which cell.',
    ],
    example: 'A first move on Puzzle 1',
    deduction: 'Look at the top-left 3×3 box. Three cages sit entirely inside it and total 15, 5 and 22. The nine digits in the box add to 45, so the two cells left over in row 3 must add to 45 − 15 − 5 − 22 = 3. They contain 1 and 2 in some order. Pencil in both candidates, then use their separate cage sums and the other units to decide their positions.',
    help: 'Notes, checking and restarting',
    controls: 'Notes toggles pencil marks in an empty cell. Check entries marks incorrect numbers you have entered and leaves blank cells alone. A solution must satisfy the rows, columns, boxes and every cage. Each original grid has one solution. Your entries and notes are saved separately for each puzzle when local storage is available. Restart clears the selected puzzle after confirmation.',
    related: 'More Sudoku practice',
    links: ['Look up possible cage combinations', 'Play Jigsaw Sudoku', 'Learn how Samurai Sudoku overlaps'],
  },
  zh: {
    title: '杀手数独在线玩｜免费 9×9 Killer Sudoku',
    heading: '杀手数独在线玩',
    description: '在浏览器里玩原创杀手数独。按标准数独规则填完 9×9 棋盘，同时满足每个虚线笼的和值。',
    play: '玩杀手数独',
    rules: '杀手数独怎么玩？',
    steps: [
      '每行、每列和每个用粗线分隔的 3×3 宫都要把数字 1–9 各用一次。',
      '虚线围起的是笼。笼里第一个格子左上角的小数字表示整笼的和值。一个笼可以跨越宫界，即使它的两个格子不在同一行、同一列或同一宫，数字也不能重复。',
      '先找格子少的笼。一格笼的和值就是该格的数字。两格笼如果和为 17，就只能用 8 和 9，再用所在的行、列和宫判断它们的位置。',
    ],
    example: '第 1 题可以这样起手',
    deduction: '看左上角的 3×3 宫。有三个笼完全落在宫内，和值是 15、5 和 22。整宫的九个数字相加等于 45，所以第 3 行余下的两个格子之和是 45 − 15 − 5 − 22 = 3，只能填 1 和 2。先把这两个候选记下来，再结合它们各自所在的笼及行列限制确定顺序。',
    help: '候选笔记、检查和重开',
    controls: '打开候选笔记可在空格里标记或取消候选。检查只标出已填错的数字，空格保留给你继续解。所有行、列、宫及笼都符合规则才算通关。每道原创题都只有一个解。浏览器支持本地存储时，每题分别保存填数和笔记。确认重开只清除当前题。',
    related: '继续练习数独',
    links: ['查笼内数字组合', '玩不规则数独', '了解武士数独如何重叠'],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const c = copy[locale];
  const url = buildLocalizedUrl(locale, path);
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: url, languages: buildLanguageAlternates(path) },
    openGraph: { title: c.title, description: c.description, url, type: 'website' },
    robots: { index: true, follow: true },
  };
}

export default async function KillerSudokuPage({ params }: Props) {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const c = copy[locale];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: c.heading,
    description: c.description,
    url: buildLocalizedUrl(locale, path),
    inLanguage: locale,
    isAccessibleForFree: true,
  };
  const related = ['/killer-sudoku-cheat-sheet', '/jigsaw-sudoku', '/games/samurai/what-is-samurai-sudoku'];

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{c.heading}</h1>
        <p className="max-w-2xl leading-7 text-muted-foreground">{c.description}</p>
      </header>
      <section aria-labelledby="play-killer" className="space-y-4 rounded-xl border border-border bg-card p-2 min-[360px]:p-3 sm:p-6">
        <h2 id="play-killer" className="text-2xl font-semibold">{c.play}</h2>
        <KillerGame locale={locale} />
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.rules}</h2>
        <ol className="list-decimal space-y-2 pl-6">{c.steps.map(step => <li key={step}>{step}</li>)}</ol>
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.example}</h2>
        <p>{c.deduction}</p>
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.help}</h2>
        <p>{c.controls}</p>
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.related}</h2>
        <ul className="list-disc space-y-2 pl-6">
          {related.map((target, i) => (
            <li key={target}><Link className="text-primary underline underline-offset-4" href={`/${locale}${target}`}>{c.links[i]}</Link></li>
          ))}
        </ul>
      </section>
    </main>
  );
}
