import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { KidsSudokuPrintGrid } from '@/components/kids/KidsSudokuPrintGrid';
import {
  KIDS_SUDOKU_4X4_PUZZLES,
  type KidsSudokuLevel,
} from '@/lib/kids-sudoku/puzzles';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/sudoku-for-kids/answers';
const LEVELS: KidsSudokuLevel[] = ['easy', 'medium', 'challenge'];
const answerPuzzles = LEVELS.flatMap((level) =>
  KIDS_SUDOKU_4X4_PUZZLES.filter((puzzle) => puzzle.level === level).slice(0, 2),
);

function levelLabel(level: KidsSudokuLevel, isZh: boolean) {
  if (isZh) return { easy: '简单', medium: '中等', challenge: '挑战' }[level];
  return { easy: 'Easy', medium: 'Medium', challenge: 'Challenge' }[level];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? '儿童数独答案：6 道 4×4 练习题答案页'
    : 'Sudoku for Kids Answer Keys: Six 4x4 Solutions';
  const description = isZh
    ? '核对儿童数独打印练习中的 6 道 4×4 题目，按题号查看简单、中等和挑战题的完整答案。'
    : 'Check the six 4x4 Sudoku for Kids worksheets with numbered Easy, Medium, and Challenge answer keys.';

  return {
    title,
    description,
    keywords: isZh
      ? ['儿童数独答案', '4×4 数独答案', '儿童数独答案页']
      : ['sudoku for kids answers', '4x4 sudoku answer key', 'kids sudoku solutions'],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function KidsSudokuAnswersPage({ params }: PageProps) {
  const { locale } = await params;
  const normalizedLocale = locale === 'zh' ? 'zh' : 'en';
  const isZh = normalizedLocale === 'zh';
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: isZh ? '儿童数独答案' : 'Sudoku for Kids Answer Keys',
    url: pageUrl,
    inLanguage: isZh ? 'zh-CN' : 'en-US',
    isPartOf: buildAbsoluteUrl(`/${normalizedLocale}/sudoku-for-kids`),
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: answerPuzzles.length,
    itemListElement: answerPuzzles.map((puzzle, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${puzzle.spec.size}x${puzzle.spec.size} ${puzzle.level} Kids Sudoku answer ${index + 1}`,
      url: `${pageUrl}#answer-${index + 1}`,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isZh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${normalizedLocale}`) },
      { '@type': 'ListItem', position: 2, name: isZh ? '儿童数独' : 'Sudoku for Kids', item: buildAbsoluteUrl(`/${normalizedLocale}/sudoku-for-kids`) },
      { '@type': 'ListItem', position: 3, name: isZh ? '答案' : 'Answer keys', item: pageUrl },
    ],
  };

  return (
    <main className="min-h-screen bg-background">
      {[collectionJsonLd, itemListJsonLd, breadcrumbJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`kids-answers-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href={`/${normalizedLocale}`} className="hover:text-foreground">{isZh ? '首页' : 'Home'}</Link>
          <span aria-hidden>/</span>
          <Link href={`/${normalizedLocale}/sudoku-for-kids`} className="hover:text-foreground">{isZh ? '儿童数独' : 'Sudoku for Kids'}</Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">{isZh ? '答案' : 'Answer keys'}</span>
        </nav>

        <header className="rounded-2xl border bg-primary/5 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {isZh ? '完成练习后再核对' : 'Check after the worksheet is complete'}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-6xl">
            {isZh ? '儿童数独答案：6 道 4×4 练习题' : 'Sudoku for Kids Answer Keys'}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {isZh
              ? '题号与打印练习页完全对应。建议先让孩子检查行、列和 2×2 宫中的重复数字，再打开答案；答案用于复盘，不替代推理过程。'
              : 'These answer numbers match the printable worksheet page exactly. Ask the learner to recheck rows, columns, and 2×2 boxes before using the key; answers support review rather than replacing reasoning.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/${normalizedLocale}/sudoku-for-kids/printable`} className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
              {isZh ? '返回打印练习' : 'Back to printable worksheets'}
            </Link>
            <Link href={`/${normalizedLocale}/sudoku-for-kids/resources`} className="rounded-lg border px-5 py-3 font-semibold hover:bg-accent">
              {isZh ? '查看引导方法' : 'Teaching and parent prompts'}
            </Link>
          </div>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {answerPuzzles.map((puzzle, index) => (
            <div id={`answer-${index + 1}`} key={puzzle.id}>
              <KidsSudokuPrintGrid
                puzzle={puzzle}
                showSolution
                label={isZh
                  ? `答案 ${index + 1} · ${levelLabel(puzzle.level, true)}`
                  : `Answer ${index + 1} · ${levelLabel(puzzle.level, false)}`}
              />
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-3 rounded-2xl border bg-secondary/30 p-6 sm:grid-cols-3">
          <Link href={`/${normalizedLocale}/sudoku-for-kids/printable`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '重新打印题目' : 'Print worksheets again'}
          </Link>
          <Link href={`/${normalizedLocale}/sudoku-for-kids/worksheet-generator`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '生成另一组题' : 'Generate another set'}
          </Link>
          <Link href={`/${normalizedLocale}/sudoku-for-kids`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '在线玩 4×4' : 'Play 4×4 online'}
          </Link>
        </section>
      </article>
    </main>
  );
}
