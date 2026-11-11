import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { JigsawGame } from '@/components/jigsaw/JigsawGame';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';

const PATH = '/jigsaw-sudoku';
type Props = { params: Promise<{ locale: string }> };

const copy = {
  en: {
    title: 'Jigsaw Sudoku: Play Free Irregular Sudoku Online',
    heading: 'Jigsaw Sudoku',
    summary: 'Play three original 9×9 Jigsaw Sudoku puzzles. Fill each row, column and irregular region with the numbers 1–9. Use the on-screen keypad or your keyboard; no account is needed.',
    play: 'Play irregular Sudoku',
    rules: 'How to play Jigsaw Sudoku',
    steps: [
      'Follow the thick outlines. Each outline encloses nine connected squares, even when it steps across where an ordinary 3×3 box would end. The thin lines only separate individual cells.',
      'Pick a row, column or outlined region with just a few empty cells. List the missing numbers, then cross off any digit already used in a row, column or region that meets the selected cell. A given digit is fixed.',
      'If a region is missing 2 and 7, and one of its two empty squares already shares a column with 7, put 2 in that square. The other square must then be 7. This works even when the region bends across three columns.',
    ],
    tools: 'Notes, checking and progress',
    support: [
      'Turn on Notes to mark possible digits in an empty square. Tap a noted digit again to remove it. Turn Notes off to enter an answer. Erase clears either the answer or the notes from the selected square.',
      'Check entries highlights any entered digit that does not match the solution, without filling new squares. A puzzle is solved when all 81 squares obey the three rules. Each puzzle has one verified solution.',
      'Each puzzle saves its own entries and notes in this browser when local storage is available. You can switch boards without losing the other board’s progress. Restart clears the current board only; private browsing or clearing site data may remove saved progress.',
    ],
    difference: 'Jigsaw vs. classic and Samurai Sudoku',
    compare: 'In classic Sudoku, the nine regions are square. Jigsaw changes their shape while keeping the same nine rows and nine columns. Samurai is a different variant: five grids overlap, so a shared square belongs to two grids. Jigsaw here uses one grid, with no diagonal or cage rules.',
    links: ['Compare the five-grid Samurai rules', 'Try the 6×6 Sudoku practice board'],
  },
  zh: {
    title: '不规则数独（Jigsaw Sudoku）：免费在线玩 9×9',
    heading: '不规则数独',
    summary: '免费玩三道原创 9×9 不规则数独。每行、每列、每个不规则宫都填入 1–9。支持屏幕数字键和电脑键盘，无需登录。',
    play: '在线玩不规则数独',
    rules: '不规则数独怎么玩？',
    steps: [
      '沿粗线看宫界。每个宫包含九个上下左右相连的格子，形状可能跨过普通 3×3 宫的位置。细线只用来分隔格子。',
      '选空格少的一行、一列或一宫，先写出缺少的数字。再从候选中排除所选格的行、列、宫中已经出现的数字。题目给定的数字不能改。',
      '例如某宫只缺 2 和 7，两格中的一格所在列已经有 7，那么该格只能填 2，另一格就填 7。即使粗线宫转弯跨列，推理也一样。',
    ],
    tools: '候选笔记、检查与存档',
    support: [
      '开启候选笔记后，可在空格里标小数字。再按一次相同数字可取消标记。关闭笔记后再填正式答案；清除键可以擦掉所选格的正式填数或候选笔记。',
      '检查只标出与解不符的已填数字，不会代填。填满 81 格且每行、每列、每宫均不重复，就算解完。这里每道题都验证过唯一解。',
      '在浏览器允许本地存储时，每题分别保存填写和候选笔记。换题不会清掉其他题的记录；重开只影响当前题。无痕模式或清除网站数据可能导致进度丢失。',
    ],
    difference: '与普通数独、武士数独有何区别？',
    compare: '普通数独的九个宫都是正方形。不规则数独只改变宫的形状，仍用九行九列。武士数独则由五个网格重叠，重叠格同时属于两个网格。本页只有一个网格，没有对角线或数字和约束。',
    links: ['比较五盘武士数独规则', '练习 6×6 数独'],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const c = copy[locale];
  const url = buildLocalizedUrl(locale, PATH);
  return {
    title: c.title,
    description: c.summary,
    alternates: { canonical: url, languages: buildLanguageAlternates(PATH) },
    openGraph: { title: c.title, description: c.summary, url, type: 'website' },
    robots: { index: true, follow: true },
  };
}

export default async function JigsawSudokuPage({ params }: Props) {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const c = copy[locale];
  const url = buildLocalizedUrl(locale, PATH);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: c.heading,
    description: c.summary,
    url,
    inLanguage: locale,
    isAccessibleForFree: true,
  };
  const link = 'text-primary underline underline-offset-4';
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{c.heading}</h1>
        <p className="max-w-2xl leading-7 text-muted-foreground">{c.summary}</p>
      </header>
      <section aria-labelledby="play-jigsaw" className="space-y-4 rounded-xl border border-border bg-card p-2 min-[360px]:p-3 sm:p-6">
        <h2 id="play-jigsaw" className="text-2xl font-semibold">{c.play}</h2>
        <JigsawGame locale={locale} />
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.rules}</h2>
        <ol className="list-decimal space-y-3 pl-6">{c.steps.map(step => <li key={step}>{step}</li>)}</ol>
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.tools}</h2>
        {c.support.map(p => <p key={p}>{p}</p>)}
      </section>
      <section className="space-y-3 leading-7">
        <h2 className="text-2xl font-semibold">{c.difference}</h2>
        <p>{c.compare}</p>
        <ul className="list-disc pl-6">
          <li><Link className={link} href={`/${locale}/games/samurai/what-is-samurai-sudoku`}>{c.links[0]}</Link></li>
          <li><Link className={link} href={`/${locale}/sudoku-for-kids/6x6`}>{c.links[1]}</Link></li>
          <li><TrackedLink className={link} href={`/${locale}/16x16-sudoku`}
            eventName="hexadoku_open" eventProperties={{ locale, source: 'jigsaw-sudoku' }}>
            {locale === 'zh' ? '玩规则方宫的 16×16 数独' : 'Play 16×16 Sudoku with square boxes'}
          </TrackedLink></li>
        </ul>
      </section>
    </main>
  );
}
