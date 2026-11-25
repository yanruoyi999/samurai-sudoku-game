import type { Metadata } from 'next';
import Link from 'next/link';
import { ShingokiLesson } from '@/components/shingoki/ShingokiLesson';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { qaSource, withQa } from '@/lib/shingoki/traffic';

const path = '/shingoki-puzzle';
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ qa?: string | string[] }> };

const copy = {
  en: {
    title: 'Shingoki Puzzle: Two Beginner Loop Puzzles',
    heading: 'Shingoki Puzzle',
    description: 'Draw a loop on two original 4×4 dot boards. Explain a forced edge on the first, then solve the second without hints.',
    rules: 'How to read the circles',
    steps: [
      'Draw one closed loop along horizontal and vertical edges between neighboring dots. Visit every numbered circle. The loop cannot branch, cross itself or revisit a dot. Empty dots are optional.',
      'Go straight through each white circle and turn 90 degrees at each black circle.',
      'Starting at a circle, count the edges along the loop in each direction up to the first turn on that side. Add the two counts to get the number in the circle. For example, one edge to a turn on one side and two on the other give a 3.',
    ],
    back: 'Back to Train Tracks', language: '简体中文',
  },
  zh: {
    title: 'Shingoki 信号灯谜题：两道原创入门回路题',
    heading: 'Shingoki 信号灯谜题',
    description: '在两个原创 4×4 点阵上各画一个闭环。第一题先判断一条必走边并说明理由，第二题独立完成。',
    rules: '怎样读圈内的线索',
    steps: [
      '沿相邻点之间的横边或竖边画一个闭环，经过每个带数字的圈。回路不能分叉、交叉或重复经过同一点。没有圈的点可以经过，也可以留空。',
      '遇白圈直行，遇黑圈转直角弯。',
      '从圈出发，沿回路向两侧分别数到各自第一个转弯处。两侧的边数相加等于圈内的数字。例如，一侧走 1 条边就转弯，另一侧走 2 条边才转弯，圈内就是 3。',
    ],
    back: '返回火车轨道谜题', language: 'English',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const { title, description } = copy[locale];
  const canonical = buildLocalizedUrl(locale, path);
  return {
    title, description, alternates: { canonical, languages: buildLanguageAlternates(path) },
    openGraph: { title, description, url: canonical, type: 'website' },
    robots: { index: false, follow: true },
  };
}

export default async function ShingokiPage({ params, searchParams }: Props) {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const qa = qaSource((await searchParams).qa);
  const other = locale === 'en' ? 'zh' : 'en';
  const c = copy[locale];
  return <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 leading-7 sm:px-8">
    <header className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.heading}</h1>
      <p className="text-muted-foreground">{c.description}</p>
    </header>
    <section aria-labelledby="shingoki-rules" className="space-y-2">
      <h2 id="shingoki-rules" className="text-xl font-semibold">{c.rules}</h2>
      <ol className="list-decimal space-y-1 pl-6">{c.steps.map(step => <li key={step}>{step}</li>)}</ol>
    </section>
    <ShingokiLesson key={locale + qa} locale={locale} qa={qa} />
    <nav className="flex flex-wrap gap-x-5 gap-y-2 text-primary underline underline-offset-4">
      <Link href={withQa('/' + locale + '/train-tracks-puzzle', qa)}>{c.back}</Link>
      <a href={withQa('/' + other + path, qa)} lang={other}>{c.language}</a>
    </nav>
  </main>;
}
