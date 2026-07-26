import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { KidsSudoku6x6 } from '@/components/kids/KidsSudoku6x6';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/sudoku-for-kids/6x6';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? '6×6 儿童数独：免费在线题目与 2×3 宫规则'
    : '6×6 Sudoku for Kids: Free Online Puzzles';
  const description = isZh
    ? '完成 4×4 后尝试免费 6×6 儿童数独，学习每行、每列和每个 2×3 宫使用 1–6，支持难度选择、检查、进度保存和打印。'
    : 'Play free 6x6 Sudoku for kids with 2x3 boxes, three levels, answer checking, local progress, and printing. A bridge from 4x4 to regular Sudoku.';

  return {
    title,
    description,
    keywords: isZh
      ? ['6×6 儿童数独', '儿童数独 6×6', '2×3 宫数独', '儿童进阶数独']
      : ['6x6 sudoku for kids', 'easy 6x6 sudoku', '6x6 sudoku online', 'kids sudoku 2x3 boxes'],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SixBySixKidsSudokuPage({ params }: PageProps) {
  const { locale } = await params;
  const normalizedLocale = locale === 'zh' ? 'zh' : 'en';
  const isZh = normalizedLocale === 'zh';
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);

  const faqItems = isZh
    ? [
        ['6×6 数独比 4×4 难多少？', '6×6 使用 1–6，共 36 个格子，信息量明显增加，但规则仍是行、列和宫不重复。它适合作为 4×4 与标准 9×9 之间的过渡。'],
        ['6×6 的宫为什么是 2×3？', '每个宫必须包含 6 个格子，才能放入 1–6。本站使用 2 行乘 3 列的宫，共有 6 个宫。'],
        ['孩子什么时候适合做 6×6？', '当孩子能独立完成中等或挑战级 4×4，并能说出某个数字被排除的理由时，可以尝试 6×6。'],
        ['可以打印 6×6 题目吗？', '当前在线题可使用浏览器打印；教师还可以在练习纸生成器中选择 6×6、难度和题目数量。'],
      ]
    : [
        ['How much harder is 6×6 than 4×4 Sudoku?', 'A 6×6 board uses 1–6 across 36 cells, so there is more information to track, but the same row, column, and box logic applies. It is a useful bridge to 9×9.'],
        ['Why does 6×6 Sudoku use 2×3 boxes?', 'Each box needs six cells so it can contain 1–6 exactly once. This page uses boxes that are two rows high and three columns wide.'],
        ['When is a child ready for 6×6 Sudoku?', 'Try 6×6 when the learner can finish Medium or Challenge 4×4 puzzles independently and explain why a number cannot go in a position.'],
        ['Can I print 6×6 Sudoku for kids?', 'The current online puzzle can be printed, and the teacher worksheet generator lets you choose 6×6, a level, and a worksheet size.'],
      ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isZh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${normalizedLocale}`) },
      { '@type': 'ListItem', position: 2, name: isZh ? '儿童数独' : 'Sudoku for Kids', item: buildAbsoluteUrl(`/${normalizedLocale}/sudoku-for-kids`) },
      { '@type': 'ListItem', position: 3, name: '6×6', item: pageUrl },
    ],
  };

  const learningResourceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: isZh ? '6×6 儿童数独互动练习' : 'Interactive 6×6 Sudoku for Kids',
    url: pageUrl,
    learningResourceType: ['Interactive game', 'Logic puzzle', 'Worksheet'],
    educationalLevel: isZh ? '儿童进阶' : 'Intermediate children',
    teaches: isZh
      ? ['1–6 排除', '2×3 宫规则', '行列推理', '从 4×4 进阶']
      : ['1–6 elimination', '2x3 box rules', 'row and column logic', 'progression from 4x4'],
    isAccessibleForFree: true,
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return (
    <main className="min-h-screen bg-background">
      {[breadcrumbJsonLd, learningResourceJsonLd, faqJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`kids-6x6-jsonld-${index}`}
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
          <span className="text-foreground">6×6</span>
        </nav>

        <header className="grid gap-6 rounded-3xl border bg-primary/5 p-6 md:p-9 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {isZh ? '从 4×4 迈向标准数独' : 'A bridge from 4×4 to standard Sudoku'}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-6xl">
              {isZh ? '6×6 儿童数独：免费在线题目' : '6×6 Sudoku for Kids'}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {isZh
                ? '6×6 使用数字 1–6，并把棋盘分成六个 2×3 宫。它比 4×4 更有挑战，但仍然能在一次短练习中完成。页面提供 12 道唯一解题目、三个难度和 30 天本地进度。'
                : 'A 6×6 puzzle uses digits 1–6 and divides the board into six 2×3 boxes. It adds challenge without jumping directly to 81 cells. This page provides 12 unique-solution puzzles, three levels, and 30-day local progress.'}
            </p>
          </div>
          <div className="rounded-2xl border bg-background p-5">
            <h2 className="text-xl font-semibold">{isZh ? '6×6 三条规则' : 'Three rules for 6×6'}</h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li><strong className="text-foreground">1.</strong> {isZh ? '每行放入 1–6，各一次。' : 'Each row contains 1–6 once.'}</li>
              <li><strong className="text-foreground">2.</strong> {isZh ? '每列放入 1–6，各一次。' : 'Each column contains 1–6 once.'}</li>
              <li><strong className="text-foreground">3.</strong> {isZh ? '每个粗边框 2×3 宫放入 1–6，各一次。' : 'Each thick-bordered 2×3 box contains 1–6 once.'}</li>
            </ol>
          </div>
        </header>

        <section className="mt-10">
          <KidsSudoku6x6 locale={normalizedLocale} />
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h2 className="text-2xl font-semibold">{isZh ? '先找信息最完整的区域' : 'Start with the most complete area'}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {isZh
                ? '优先检查已经出现 4–5 个不同数字的行、列或 2×3 宫。先确定一个唯一缺少的数字，再让新数字帮助相邻区域继续排除。'
                : 'Look first for a row, column, or 2×3 box that already contains four or five different digits. Find one forced value, then use it to narrow nearby areas.'}
            </p>
          </div>
          <div className="rounded-2xl border bg-secondary/30 p-6">
            <h2 className="text-2xl font-semibold">{isZh ? '觉得太难时回到 4×4' : 'Return to 4×4 when needed'}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {isZh
                ? '降回 4×4 不是失败。可以先在挑战级 4×4 练习解释排除理由，再回到 6×6；稳定理解比快速升级更重要。'
                : 'Moving back to 4×4 is not a failure. Practice explaining eliminations on Challenge 4×4, then return to 6×6. Stable understanding matters more than fast progression.'}
            </p>
            <Link href={`/${normalizedLocale}/sudoku-for-kids`} className="mt-4 inline-flex font-semibold text-primary hover:underline">
              {isZh ? '返回 4×4 儿童数独' : 'Return to 4×4 Sudoku for Kids'} →
            </Link>
          </div>
        </section>

        <section className="mt-14 rounded-2xl border bg-primary/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">{isZh ? '把 6×6 加入练习纸' : 'Put 6×6 puzzles on a worksheet'}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            {isZh
              ? '教师练习纸生成器可以选择 4×4 或 6×6、难度、题目数量，以及是否在末尾附答案。所有题目都来自经过唯一解检查的题库。'
              : 'The teacher worksheet generator lets you choose 4×4 or 6×6, a level, a puzzle count, and optional answer keys. Every worksheet uses verified unique-solution puzzles.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/${normalizedLocale}/sudoku-for-kids/worksheet-generator`} className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
              {isZh ? '打开练习纸生成器' : 'Open worksheet generator'}
            </Link>
            <Link href={`/${normalizedLocale}/sudoku-for-kids/printable`} className="rounded-lg border px-5 py-3 font-semibold hover:bg-accent">
              {isZh ? '打印现成 4×4 练习' : 'Print ready-made 4×4 worksheets'}
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold">{isZh ? '6×6 儿童数独常见问题' : '6×6 Sudoku for Kids FAQ'}</h2>
          <div className="mt-5 space-y-4">
            {faqItems.map(([question, answer]) => (
              <details key={question} className="rounded-xl border bg-card p-5">
                <summary className="cursor-pointer font-semibold">{question}</summary>
                <p className="mt-3 leading-7 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
