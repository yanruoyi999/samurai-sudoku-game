import type { Metadata } from 'next';

import { NurikabeLesson } from '@/components/nurikabe/NurikabeLesson';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';

const PATH = '/nurikabe-puzzle';
type Props = { params: Promise<{ locale: string }> };
const content = {
  en: {
    title: 'Nurikabe Puzzle',
    description: 'Learn three Nurikabe deductions on a 5 × 5 grid, then solve a second original puzzle without hints.',
    rulesTitle: 'Nurikabe rules',
    rules: [
      'An island is a group of squares joined along edges. Every island contains exactly one printed number, and that number is its size.',
      'All sea squares must connect along edges. Diagonal contact does not count.',
      'The sea cannot contain a solid 2 × 2 block.',
    ],
  },
  zh: {
    title: '海岛谜题（Nurikabe）',
    description: '先在 5 × 5 棋盘上练习三种推理，再无提示解开第二道原创题。',
    rulesTitle: '海岛谜题规则',
    rules: [
      '岛由沿边相连的格子组成。每座岛恰有一个数字，数字就是岛的格数。',
      '所有海格必须沿边连通，斜角接触不算。',
      '海不能填满任意一个 2 × 2 方块。',
    ],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  return {
    title: content[locale].title,
    description: content[locale].description,
    alternates: { canonical: buildLocalizedUrl(locale, PATH), languages: buildLanguageAlternates(PATH) },
    robots: { index: false, follow: true },
  };
}

export default async function NurikabePage({ params }: Props) {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const c = content[locale];
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{c.title}</h1>
        <p className="text-muted-foreground">{c.description}</p>
      </header>
      <section aria-labelledby="nurikabe-rules" className="space-y-2">
        <h2 id="nurikabe-rules" className="text-xl font-semibold">{c.rulesTitle}</h2>
        <ul className="list-disc space-y-1 pl-5 leading-relaxed">
          {c.rules.map((rule) => <li key={rule}>{rule}</li>)}
        </ul>
      </section>
      <NurikabeLesson locale={locale} />
    </main>
  );
}
