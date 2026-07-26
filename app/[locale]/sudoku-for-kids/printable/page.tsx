import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { KidsPrintButton } from '@/components/kids/KidsPrintButton';
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

const PATH = '/sudoku-for-kids/printable';
const PRINT_LEVELS: KidsSudokuLevel[] = ['easy', 'medium', 'challenge'];
const printablePuzzles = PRINT_LEVELS.flatMap((level) =>
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
    ? '儿童数独打印练习：免费 4×4 题目与答案入口'
    : 'Sudoku for Kids Printable Worksheets: Free 4x4 Puzzles';
  const description = isZh
    ? '打印 6 道免费 4×4 儿童数独练习，包含简单、中等和挑战三个等级；无需注册或邮箱，可单独打开答案页核对。'
    : 'Print six free 4x4 Sudoku for kids worksheets across Easy, Medium, and Challenge levels. No signup or email, with a separate answer-key page.';

  return {
    title,
    description,
    keywords: isZh
      ? ['儿童数独打印', '儿童数独练习纸', '4×4 数独打印', '免费儿童数独题目']
      : ['sudoku for kids printable', 'sudoku worksheets for kids', 'easy sudoku worksheets', '4x4 sudoku printable'],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function KidsSudokuPrintablePage({ params }: PageProps) {
  const { locale } = await params;
  const normalizedLocale = locale === 'zh' ? 'zh' : 'en';
  const isZh = normalizedLocale === 'zh';
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isZh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${normalizedLocale}`) },
      { '@type': 'ListItem', position: 2, name: isZh ? '儿童数独' : 'Sudoku for Kids', item: buildAbsoluteUrl(`/${normalizedLocale}/sudoku-for-kids`) },
      { '@type': 'ListItem', position: 3, name: isZh ? '打印练习' : 'Printable worksheets', item: pageUrl },
    ],
  };

  const learningResourceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: isZh ? '4×4 儿童数独打印练习' : 'Sudoku for Kids Printable Worksheets',
    url: pageUrl,
    learningResourceType: ['Worksheet', 'Logic puzzle'],
    educationalLevel: isZh ? '儿童入门' : 'Beginner children',
    isAccessibleForFree: true,
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: printablePuzzles.length,
    itemListElement: printablePuzzles.map((puzzle, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${puzzle.spec.size}x${puzzle.spec.size} ${puzzle.level} Kids Sudoku ${index + 1}`,
      url: `${pageUrl}#worksheet-${index + 1}`,
    })),
  };

  return (
    <main className="min-h-screen bg-background">
      {[breadcrumbJsonLd, learningResourceJsonLd, itemListJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`kids-printable-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article className="mx-auto max-w-6xl px-4 py-10 md:py-14 print:max-w-none print:px-0 print:py-0">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground print:hidden" aria-label="Breadcrumb">
          <Link href={`/${normalizedLocale}`} className="hover:text-foreground">{isZh ? '首页' : 'Home'}</Link>
          <span aria-hidden>/</span>
          <Link href={`/${normalizedLocale}/sudoku-for-kids`} className="hover:text-foreground">{isZh ? '儿童数独' : 'Sudoku for Kids'}</Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">{isZh ? '打印练习' : 'Printable worksheets'}</span>
        </nav>

        <header className="rounded-2xl border bg-primary/5 p-6 md:p-8 print:hidden">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {isZh ? '家长与教师可直接打印' : 'Ready for parents and teachers'}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-6xl">
            {isZh ? '儿童数独打印练习：免费 4×4 题目' : 'Sudoku for Kids Printable Worksheets'}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {isZh
              ? '这组练习包含 2 道简单、2 道中等和 2 道挑战题。点击打印后，浏览器只保留题目和简短规则；答案放在独立页面，避免孩子提前看到。无需注册或邮箱。'
              : 'This set includes two Easy, two Medium, and two Challenge worksheets. Browser printing keeps the puzzle pages and short rules, while answers stay on a separate page. No signup or email is required.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <KidsPrintButton
              locale={normalizedLocale}
              location="kids_printable_hub"
              label={isZh ? '打印 6 道练习' : 'Print 6 worksheets'}
            />
            <Link href={`/${normalizedLocale}/sudoku-for-kids/answers`} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10">
              {isZh ? '查看答案' : 'Open answer keys'}
            </Link>
            <Link href={`/${normalizedLocale}/sudoku-for-kids/worksheet-generator`} className="rounded-lg border px-5 py-3 font-semibold hover:bg-accent">
              {isZh ? '自定义练习纸' : 'Customize a worksheet'}
            </Link>
          </div>
        </header>

        <section className="mt-8 rounded-xl border bg-secondary/20 p-5 print:mt-0 print:border-0 print:bg-white print:p-2">
          <h2 className="text-2xl font-semibold">{isZh ? '打印说明' : 'Worksheet directions'}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground print:text-black">
            {isZh
              ? '在每一行、每一列和每个 2×2 宫中填入 1、2、3、4，每个数字只能出现一次。建议先从已出现三个数字的区域开始。'
              : 'Fill every row, column, and 2×2 box with 1, 2, 3, and 4 exactly once. Start with a row, column, or box that already shows three different digits.'}
          </p>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2 print:mt-4 print:grid-cols-2 print:gap-3">
          {printablePuzzles.map((puzzle, index) => (
            <div id={`worksheet-${index + 1}`} key={puzzle.id}>
              <KidsSudokuPrintGrid
                puzzle={puzzle}
                label={isZh
                  ? `练习 ${index + 1} · ${levelLabel(puzzle.level, true)}`
                  : `Worksheet ${index + 1} · ${levelLabel(puzzle.level, false)}`}
              />
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-3 rounded-2xl border bg-secondary/30 p-6 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
          <Link href={`/${normalizedLocale}/sudoku-for-kids/answers`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '6 道题答案' : 'Answer keys'}
          </Link>
          <Link href={`/${normalizedLocale}/sudoku-for-kids/worksheet-generator`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '教师练习纸生成器' : 'Teacher worksheet generator'}
          </Link>
          <Link href={`/${normalizedLocale}/sudoku-for-kids/resources`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '家长与教师资源' : 'Parent and teacher resources'}
          </Link>
          <Link href={`/${normalizedLocale}/sudoku-for-kids`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '返回在线 4×4' : 'Back to online 4×4'}
          </Link>
        </section>
      </article>
    </main>
  );
}
