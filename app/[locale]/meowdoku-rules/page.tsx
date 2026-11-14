import type { Metadata } from 'next';
import Link from 'next/link';
import { CatLogicPractice } from '@/components/CatLogicPractice';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';

const PATH = '/meowdoku-rules';
type Props = { params: Promise<{ locale: string }> };

const copy = {
  en: {
    title: 'Meowdoku Rules: How to Play the Cat Logic Puzzle',
    description: 'Learn the three Meowdoku rules, try an original four-by-four cat logic puzzle, and find the official mobile app.',
    affiliation: 'This is an independent Samurai Sudoku guide. The practice board was made for this site. Oakever Games publishes the official Meowdoku app.',
    rules: 'The three Meowdoku rules',
    steps: ['Place exactly one cat in each row and each column.', 'Place exactly one cat in every outlined or colored region.', 'Two cats cannot touch, even corner to corner.'],
    practice: 'Try an original 4 × 4 puzzle',
    tip: 'Start with region B or D in the board above. Each is confined to two cells in one row. If a choice rules out both cells in the other unfilled row, undo it and try the remaining possibility.',
    hint: 'Show a hint for this board',
    answer: 'Put the first cat in row 1, column 2. In row 2, region B must then use column 4 because column 3 would touch that cat diagonally.',
    walkthrough: 'Work through the practice board',
    deductions: [
      'The two B squares are in row 2, columns 3 and 4. The two D squares are in row 4, columns 3 and 4. Since B and D each need a cat, rows 2 and 4 must use those columns in some order.',
      'Try row 2, column 3. A cat there rules out columns 2 through 4 in both adjacent rows. Row 1 and row 3 would both need column 1, which breaks the one-cat-per-column rule.',
      'So place the B cat in row 2, column 4. This leaves column 3 for the D cat in row 4. The D cat rules out columns 2 through 4 in row 3, so put the C cat in column 1. That leaves column 2 in row 1 for A.',
      'Check all four regions and read the occupied columns from top to bottom: 2, 4, 1, 3. Adjacent rows are at least two columns apart, so none of the cats touch at a corner.',
    ],
    mistakes: 'Common mistakes',
    correction: 'Two cats can be in different rows and columns and still touch at a corner. Also look at all the squares marked with the same letter: a region can cross a row boundary. A legal move can still be a dead end if it leaves another row with no space.',
    compare: 'How is this different from Sudoku?',
    comparison: 'Cat puzzles place one marker per row, column and region. Sudoku fills the grid with digits. In Jigsaw Sudoku, the regions may bend, but each region still needs all nine digits.',
    jigsaw: 'Play Jigsaw Sudoku', samurai: 'See how Samurai Sudoku works', official: 'Find the official app',
  },
  zh: {
    title: 'Meowdoku 怎么玩？猫咪逻辑谜题规则与练习',
    description: '了解 Meowdoku 的三条规则，做一道原创 4×4 猫咪练习题，并找到官方应用。',
    affiliation: '这是武士数独的独立指南。练习题由本站制作，Meowdoku 官方应用由 Oakever Games 发行。',
    rules: 'Meowdoku 的三条规则',
    steps: ['每一行和每一列恰好放一只猫。', '每个颜色区域恰好放一只猫。', '两只猫不能在相邻格，斜角接触也算。'],
    practice: '做一道原创 4 × 4 练习题',
    tip: '先观察 B 区和 D 区，它们分别只有同一行中的两个格子。若某个放法让尚未放猫的一行没有位置，就撤销，再试另一个选项。',
    hint: '查看本题提示', answer: '第一只猫可以放在第 1 行第 2 列。此时第 2 行的 B 区只能选第 4 列，因为第 3 列会与第一只猫斜角相邻。',
    walkthrough: '这道练习题怎么推出来？',
    deductions: [
      'B 区只占第 2 行的第 3、4 列，D 区只占第 4 行的第 3、4 列。每区恰好一只猫，所以第 2、4 行必须分别使用这两列。',
      '假设 B 区的猫在第 2 行第 3 列。前后两行的第 2 至第 4 列都会因相邻而排除。这样第 1 行和第 3 行都只剩第 1 列，违反同列只能放一只猫的规则。',
      '所以 B 区选第 2 行第 4 列，D 区只能选第 4 行第 3 列。D 区的猫排除了第 3 行的第 2 至第 4 列，C 区因此选第 3 行第 1 列。最后只剩第 1 行第 2 列给 A 区。',
      '从上到下检查四只猫所在的列，依次是 2、4、1、3。每个字母区域恰好有一只，相邻两行的列号至少差 2，所以没有斜角接触。',
    ],
    mistakes: '容易漏掉的两件事',
    correction: '两只猫即使在不同行和不同列，也可能在斜角相邻。相同字母的区域还可能跨行，不能只检查当前行。看似合法的一步也可能让别的行无处落子。',
    compare: '和数独有什么区别？',
    comparison: '猫咪谜题每行、每列、每区只放一个标记。数独要填满数字。异形数独的区域可以不规则，但每个区域依然要包含 1–9。',
    jigsaw: '玩异形数独', samurai: '了解武士数独的玩法', official: '下载官方应用',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const { title, description } = copy[locale];
  const canonical = buildLocalizedUrl(locale, PATH);
  return { title, description, robots: { index: true, follow: true },
    alternates: { canonical, languages: buildLanguageAlternates(PATH) },
    openGraph: { title, description, url: canonical, type: 'article' } };
}

export default async function MeowdokuRules({ params }: Props) {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const c = copy[locale];
  const link = 'font-medium text-primary underline underline-offset-4';
  const schema = { '@context': 'https://schema.org', '@type': 'Article', headline: c.title, description: c.description,
    mainEntityOfPage: buildLocalizedUrl(locale, PATH), inLanguage: locale, author: { '@type': 'Organization', name: 'Samurai Sudoku' } };
  return <article className="mx-auto max-w-3xl space-y-8 px-4 py-10 leading-7">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <header className="space-y-4"><h1 className="text-4xl font-bold tracking-tight">{c.title}</h1><p>{c.affiliation}</p></header>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">{c.rules}</h2>
      <ol className="list-decimal space-y-2 pl-6">{c.steps.map(step => <li key={step}>{step}</li>)}</ol>
    </section>
    <section className="space-y-4 rounded-xl border p-4 sm:p-6"><h2 className="text-2xl font-semibold">{c.practice}</h2>
      <CatLogicPractice locale={locale} /><p>{c.tip}</p><details><summary className="cursor-pointer font-medium">{c.hint}</summary><p className="pt-2">{c.answer}</p></details>
    </section>
    <details className="rounded-lg border p-4">
      <summary className="cursor-pointer text-xl font-semibold">{c.walkthrough}</summary>
      <ol className="mt-3 list-decimal space-y-2 pl-6">{c.deductions.map(step => <li key={step}>{step}</li>)}</ol>
    </details>
    <section className="space-y-2"><h2 className="text-2xl font-semibold">{c.mistakes}</h2><p>{c.correction}</p></section>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">{c.compare}</h2>
      <p>{c.comparison}</p><ul className="list-disc pl-6">
        <li><Link className={link} href={`/${locale}/jigsaw-sudoku`}>{c.jigsaw}</Link></li>
        <li><Link className={link} href={`/${locale}/games/samurai/what-is-samurai-sudoku`}>{c.samurai}</Link></li>
      </ul>
    </section>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">{c.official}</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li><a className={link} href="https://apps.apple.com/us/app/meowdoku/id6761760135">Meowdoku · App Store</a></li>
        <li><a className={link} href="https://play.google.com/store/apps/details?id=com.oakever.meowdoku">Meowdoku · Google Play</a></li>
      </ul>
    </section>
  </article>;
}
