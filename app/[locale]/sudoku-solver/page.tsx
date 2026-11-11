import type { Metadata } from 'next';
import Link from 'next/link';
import { StepSolver } from '@/components/sudoku-solver/StepSolver';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';

const path = '/sudoku-solver';
type Props = { params: Promise<{ locale: string }> };

const copy = {
  en: {
    title: 'Sudoku Solver with Steps | Solve a 9×9 Puzzle',
    heading: 'Sudoku Solver with Steps',
    description: 'Enter or paste a classic 9×9 Sudoku. Check for duplicates or multiple solutions, follow logical moves, and reveal the separately verified unique answer.',
    input: 'Enter your puzzle',
    how: 'How to solve your Sudoku here',
    instructions: [
      'Enter the clues into the grid or paste 81 characters in row order. Use 0 or a dot for each blank and leave the other digits as printed. You can also load an example and work through it.',
      'Choose Solve Sudoku. Duplicate clues are marked with their row, column or box. Even without duplicates, a grid can have no solution, or the clues can allow several solutions. An empty grid has multiple solutions.',
      'If the answer is unique, move through the steps to see where a digit was placed or which candidates were removed. The input stays editable and separate from the step preview. Changes to a clue clear the previous result.',
    ],
    techniques: 'What the logical steps show',
    methods: [
      'Naked single. A cell has one candidate left after the row, column and box rules and previous eliminations.',
      'Hidden single. A digit has only one possible cell in a row, column or box, even if that cell also has other candidates.',
      'Locked candidate. All remaining spots for a digit in a box fall in one line, or all spots in a line fall in one box. That intersection forces an elimination outside it.',
    ],
    limits: 'When the logical steps stop',
    explanation: 'Some unique puzzles require techniques beyond the three shown here. In that case the step list stops at the last supported deduction. The separate exact search can still verify and show a unique final grid. If the search reaches its limit, the solver reports that the solution count is undetermined.',
    local: 'The puzzle is checked in your browser. The solver does not upload the clues. It supports one classic 9×9 board with square 3×3 boxes.',
    related: 'Practice more Sudoku techniques',
    links: ['Learn cross hatching', 'Learn hidden pairs', 'Open the Samurai Sudoku solver'],
  },
  zh: {
    title: '数独求解器｜逐步解 9×9 数独',
    heading: '数独求解器与解题步骤',
    description: '输入或粘贴经典 9×9 数独，检查重复、无解和多解，查看每一步的逻辑依据和单独验证的唯一解。',
    input: '输入你的题目',
    how: '怎么求解自己的数独',
    instructions: [
      '在棋盘填入题目给出的数字，或者按行顺序粘贴 81 个字符。空格用 0 或英文句点表示，其他数字照原题输入。也可载入示例再看步骤。',
      '点击求解。若数字重复，工具会标出格子以及对应的行、列或宫。即使没有重复，题目也可能无解，或允许多种填法。空棋盘属于多解。',
      '有唯一解时，可以前后查看每一步，了解数字为何能填入某格，或某个候选为何能删除。输入棋盘和步骤预览分开，改动给定数字会清除旧结果。',
    ],
    techniques: '步骤会展示哪些技巧',
    methods: [
      '显性单数。结合所在行、列、宫以及前面的候选排除，某格只剩一个可填数字。',
      '隐性单数。某个数字在同一行、列或宫中只剩一个落点，即使那个格还有别的候选。',
      '区块排除。某宫的某个数字只能落在一条线上，或某行列的候选集中在同一宫，就能删除交集之外的相关候选。',
    ],
    limits: '逻辑步骤停下来时',
    explanation: '部分有唯一解的题目需要这里没有展示的技巧。此时步骤会停在最后一项可解释的推理。单独的搜索仍可验证并显示唯一答案。如果搜索达到上限，页面会标明解的数量仍未确定。',
    local: '题目在浏览器内处理，求解器不会上传你输入的数字。支持一个经典 9×9 棋盘，每个宫为 3×3。',
    related: '继续练习数独技巧',
    links: ['学习交叉排除', '学习隐性对', '打开武士数独求解器'],
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

export default async function SudokuSolverPage({ params }: Props) {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const c = copy[locale];
  const schema = {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication',
    name: c.heading, description: c.description, url: buildLocalizedUrl(locale, path),
    inLanguage: locale, applicationCategory: 'EducationalApplication', operatingSystem: 'Web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
  const related = ['/sudoku-cross-hatching', '/sudoku-hidden-pairs', '/games/samurai/solver'];

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{c.heading}</h1>
        <p className="max-w-2xl leading-7 text-muted-foreground">{c.description}</p>
      </header>
      <section aria-labelledby="play-solver" className="space-y-4 rounded-xl border border-border bg-card p-2 min-[360px]:p-3 sm:p-6">
        <h2 id="play-solver" className="text-2xl font-semibold">{c.input}</h2>
        <StepSolver locale={locale} />
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.how}</h2>
        <ol className="list-decimal space-y-2 pl-6">{c.instructions.map(step => <li key={step}>{step}</li>)}</ol>
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.techniques}</h2>
        <ul className="list-disc space-y-2 pl-6">{c.methods.map(method => <li key={method}>{method}</li>)}</ul>
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.limits}</h2>
        <p>{c.explanation}</p>
        <p>{c.local}</p>
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.related}</h2>
        <ul className="list-disc space-y-2 pl-6">
          {related.map((target, i) => <li key={target}><Link className="text-primary underline underline-offset-4" href={`/${locale}${target}`}>{c.links[i]}</Link></li>)}
        </ul>
      </section>
    </main>
  );
}
