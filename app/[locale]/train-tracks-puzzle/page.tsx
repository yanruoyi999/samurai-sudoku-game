import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { qaSource, withQa } from '@/lib/shingoki/traffic';
import { TrainTracksLesson } from '@/components/train-tracks/TrainTracksLesson';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';

const path = '/train-tracks-puzzle';
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ qa?: string | string[] }> };

const copy = {
  en: {
    title: 'Train Tracks Puzzle: Two Beginner Practice Boards',
    heading: 'Train Tracks Puzzle',
    description: 'Find one required rail connection, explain your choice, then solve a second 5×5 board on your own.',
    rules: 'Rules for these boards',
    steps: [
      'Draw a single track from A to B. It can turn at right angles and cannot branch, cross, or revisit a square.',
      'The clues count track squares in each row or column, including A and B. On these boards an endpoint’s row or column can have a clue of 1.',
      'The filled dot marks a square the track must pass through. The dot does not tell you which way it turns.',
    ],
    help: 'On the second board, click or tap to extend your route. Use arrow keys to move focus and Enter or Space to select. Progress is saved in this browser when storage is available.',
    shingoki: 'Draw a closed loop in Shingoki',
    other: 'Try Star Battle',
    otherLanguage: '简体中文',
  },
  zh: {
    title: '火车轨道谜题（Train Tracks）：两道入门练习',
    heading: '火车轨道谜题（Train Tracks）',
    description: '先选出一条必走边并说明理由，再独立完成第二道 5×5 题。',
    rules: '本题规则',
    steps: [
      '从 A 到 B 连成一条连续轨道。轨道可以直角转弯，不能分叉、交叉或重复经过同一格。',
      '每行每列的线索是占用的格数，A 和 B 也计入。本题允许起终点所在的行或列只有一格轨道。',
      '圆点标记必经格，轨道的走向需要自己判断。',
    ],
    help: '第二题可点击或轻触格子延伸路线。键盘用方向键移动焦点，回车或空格选择。浏览器允许存储时会保存进度。',
    shingoki: '试试 Shingoki，连出一条闭合回路',
    other: '试试星战谜题',
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

export default async function TrainTracksPage({ params, searchParams }: Props) {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const qa = qaSource((await searchParams).qa);
  const c = copy[locale];
  const other = locale === 'en' ? 'zh' : 'en';
  return <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 leading-7 sm:px-8">
    <header className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.heading}</h1>
      <p className="text-muted-foreground">{c.description}</p>
    </header>
    <section aria-labelledby="track-rules" className="space-y-2">
      <h2 id="track-rules" className="text-xl font-semibold">{c.rules}</h2>
      <ol className="list-decimal space-y-1 pl-6">{c.steps.map(step => <li key={step}>{step}</li>)}</ol>
    </section>
    <section aria-label={c.heading} className="space-y-3 rounded-xl border border-border bg-card p-3 sm:p-6">
      <TrainTracksLesson locale={locale} />
      <p className="text-sm text-muted-foreground">{c.help}</p>
    </section>
    <nav className="flex flex-wrap gap-x-5 gap-y-2 text-primary underline underline-offset-4">
      <TrackedLink href={withQa('/' + locale + '/shingoki-puzzle', qa)} reloadDocument eventName="shingoki_entry"
        eventProperties={{ locale, qa_source: qa, puzzle_number: 1, source: 'train_tracks' }}>{c.shingoki}</TrackedLink>
      <Link href={`/${locale}/star-battle-puzzle`}>{c.other}</Link>
      <Link href={`/${other}${path}`} lang={other === 'zh' ? 'zh-CN' : 'en'}>{c.otherLanguage}</Link>
    </nav>
  </main>;
}
