import type { Metadata } from 'next';
import Link from 'next/link';
import { SuguruLesson } from '@/components/suguru/SuguruLesson';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';

const path = '/suguru-puzzle';
type Props = { params: Promise<{ locale: string }> };

const copy = {
  en: {
    title: 'Suguru Puzzle: Two Playable Beginner Boards',
    heading: 'Suguru Puzzle',
    description: 'Practice the diagonal rule on a small Suguru board, then solve a second original board without hints.',
    rules: 'How to play Suguru',
    steps: [
      'Suguru is also called Tectonic or Number Blocks. Fill each outlined region of N squares with the numbers 1 through N, once each.',
      'Squares that share an edge or a corner must have different numbers, even across region borders.',
      'Given numbers stay fixed. Use the region letters as well as the thick borders to identify each group.',
    ],
    help: 'Use arrow keys to move between squares. Type 1–5 to fill a square or press Delete to clear it. Each puzzle saves its own board in this browser when storage is available.',
    home: 'Samurai Sudoku home',
    otherLanguage: '简体中文',
  },
  zh: {
    title: 'Suguru 数字拼图：两道可玩的原创入门题',
    heading: 'Suguru 数字拼图',
    description: '先在小棋盘上练习斜角排除，再无提示独立完成第二道原创题。',
    rules: 'Suguru 怎么玩',
    steps: [
      'Suguru 也叫 Tectonic 或 Number Blocks。含 N 格的区域必须刚好分别填入 1 到 N。',
      '共边或共角的格子不能填相同的数字，即使它们分属不同区域。',
      '给定数字不能修改。可用粗线和格子上的区域字母辨认分区。',
    ],
    help: '可用方向键移动，按 1–5 填数，按 Delete 清空。浏览器允许存储时，两道题各自保存棋盘。',
    home: 'Samurai 数独首页',
    otherLanguage: 'English',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const { title, description } = copy[locale];
  const canonical = buildLocalizedUrl(locale, path);
  return {
    title,
    description,
    alternates: { canonical, languages: buildLanguageAlternates(path) },
    openGraph: { title, description, url: canonical, type: 'website' },
    robots: { index: false, follow: true },
  };
}

export default async function SuguruPage({ params }: Props) {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const c = copy[locale];
  const other = locale === 'en' ? 'zh' : 'en';
  return <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 leading-7 sm:px-8">
    <header className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.heading}</h1>
      <p className="text-muted-foreground">{c.description}</p>
    </header>
    <section aria-labelledby="suguru-rules" className="space-y-2">
      <h2 id="suguru-rules" className="text-xl font-semibold">{c.rules}</h2>
      <ol className="list-decimal space-y-1 pl-6">{c.steps.map(step => <li key={step}>{step}</li>)}</ol>
    </section>
    <section aria-label={c.heading} className="space-y-3 rounded-xl border border-border bg-card p-3 sm:p-6">
      <SuguruLesson locale={locale} />
      <p className="text-sm text-muted-foreground">{c.help}</p>
    </section>
    <nav className="flex flex-wrap gap-x-5 gap-y-2 text-primary underline underline-offset-4">
      <Link href={`/${locale}`}>{c.home}</Link>
      <Link href={`/${other}${path}`} lang={other === 'zh' ? 'zh-CN' : 'en'}>{c.otherLanguage}</Link>
    </nav>
  </main>;
}
