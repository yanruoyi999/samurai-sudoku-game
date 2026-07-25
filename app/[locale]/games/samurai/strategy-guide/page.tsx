import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { getSamuraiGuide } from '@/lib/samurai/guides';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/games/samurai/strategy-guide';

const techniques = {
  zh: [
    {
      title: '隐藏唯一：从“数字能去哪”而不是“格子能填什么”出发',
      body: '当一行、一列或一个 3×3 宫里没有明显的单一候选时，改为逐个检查数字 1–9。某个数字即使所在格还有多个候选，只要它在该单位中只剩一个位置，就可以确定。重叠宫要分别从中央网格和角落网格检查一次。',
    },
    {
      title: '候选对：用两个格子锁住两个数字',
      body: '如果同一行、列或宫中有两个格子都只包含相同的两个候选，这两个数字就被锁在这两个格子里，可以从同一单位的其他格子删除。困难题中，候选对往往会重新制造单一候选。',
    },
    {
      title: '区块排除：让宫内候选限制整行或整列',
      body: '如果某个数字在一个 3×3 宫里只能落在同一行，那么该行位于其他宫的同数字候选都可以排除；列同理。重叠宫的区块排除可能同时影响两个网格，是武士数独最有价值的高级推理之一。',
    },
    {
      title: '跨网格传递：每次重叠区变化都要双向复查',
      body: '在重叠宫填入或删除候选后，不要只在当前网格继续。先检查连接网格对应的行、列、宫，再回到中央网格。这个双向循环能避免候选过期，也能发现原本隐藏的唯一位置。',
    },
    {
      title: '回退与候选重建：发现冲突时不要继续堆错误',
      body: '如果高难题出现冲突，回到最近一次没有充分逻辑依据的填数，而不是继续猜。清除该步并重新计算附近重叠宫的候选，通常比整盘重置更快，也更容易找到错误来源。',
    },
  ],
  en: [
    {
      title: 'Hidden singles: ask where a digit can go',
      body: 'When no cell has one obvious candidate, inspect digits 1–9 within a row, column, or box. A cell may still show several notes, but a digit is forced when it has only one position in that unit. Check shared boxes once from the center grid and once from the connected corner grid.',
    },
    {
      title: 'Candidate pairs: lock two digits into two cells',
      body: 'If two cells in one row, column, or box contain the same two candidates, those digits are locked into the pair. Remove them from the other cells in that unit. On Hard boards, pairs often recreate a naked or hidden single.',
    },
    {
      title: 'Box-line reduction: let a box constrain a row or column',
      body: 'If every candidate for a digit inside one 3×3 box lies on the same row, remove that digit from the rest of the row outside the box; apply the same logic to columns. In an overlap box, one reduction can affect two grids.',
    },
    {
      title: 'Cross-grid transfer: rescan both directions after every overlap change',
      body: 'After placing a digit or removing notes in an overlap box, do not continue in only one grid. Scan the connected row, column, and box, then return to the center. This prevents stale candidates and exposes newly forced positions.',
    },
    {
      title: 'Rollback and rebuild notes when a conflict appears',
      body: 'If a hard puzzle develops a conflict, return to the most recent placement without a complete logical reason. Clear it and rebuild notes around the affected overlap instead of stacking more guesses or resetting the entire board.',
    },
  ],
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const guide = getSamuraiGuide(locale, 'strategy-guide');
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? '武士数独高级技巧：候选对、区块排除与跨网格推理'
    : 'Advanced Samurai Sudoku Techniques: Pairs, Locked Candidates & Cross-Grid Logic';
  const description = isZh
    ? '掌握武士数独中高级解题技术：隐藏唯一、候选对、区块排除、跨网格传递与冲突回退。适合已熟悉基础通关流程的玩家。'
    : 'Learn intermediate and advanced Samurai Sudoku techniques: hidden singles, candidate pairs, box-line reduction, cross-grid transfers, and disciplined rollback.';

  return {
    title,
    description,
    keywords: isZh
      ? [guide.primaryKeyword, '武士数独候选对', '武士数独区块排除', '武士数独隐藏唯一', '武士数独跨网格推理']
      : [guide.primaryKeyword, 'samurai sudoku candidate pairs', 'samurai sudoku box line reduction', 'samurai sudoku hidden singles', 'cross grid sudoku logic'],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: { title, description, url: canonical, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function StrategyGuidePage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const normalizedLocale = isZh ? 'zh' : 'en';
  const guide = getSamuraiGuide(locale, 'strategy-guide');
  const content = techniques[normalizedLocale];
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    mainEntityOfPage: pageUrl,
    inLanguage: isZh ? 'zh-CN' : 'en-US',
    author: {
      '@type': 'Organization',
      name: 'Samurai Sudoku',
      url: buildAbsoluteUrl(`/${normalizedLocale}`),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Samurai Sudoku',
      url: buildAbsoluteUrl(`/${normalizedLocale}`),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isZh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${normalizedLocale}`) },
      { '@type': 'ListItem', position: 2, name: 'Samurai Sudoku', item: buildAbsoluteUrl(`/${normalizedLocale}/games/samurai`) },
      { '@type': 'ListItem', position: 3, name: guide.title, item: pageUrl },
    ],
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      {[articleJsonLd, breadcrumbJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`advanced-strategy-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href={`/${normalizedLocale}`} className="hover:text-foreground">
          {isZh ? '首页' : 'Home'}
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/${normalizedLocale}/games/samurai`} className="hover:text-foreground">
          Samurai Sudoku
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{isZh ? '高级技巧' : 'Advanced techniques'}</span>
      </nav>

      <header className="rounded-2xl border bg-primary/5 p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          {isZh ? '中高级推理专项' : 'Intermediate and advanced deductions'}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-6xl">
          {guide.title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {isZh
            ? '本页不重复基础规则或完整通关流程，而是专门讲基础唯一候选之后的技术。还没有稳定完成简单或中等题时，请先阅读通关技巧主页面。'
            : 'This page does not repeat the basic rules or the full solving workflow. It focuses on deductions that come after singles. If Easy or Medium still feels unstable, begin with the main solving-tips guide.'}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${normalizedLocale}/games/samurai/solving-tips`}
            className="rounded-lg border border-primary px-6 py-3 text-center font-semibold text-primary hover:bg-primary/10"
          >
            {isZh ? '先看完整通关流程' : 'Read the complete solving workflow'}
          </Link>
          <Link
            href={`/${normalizedLocale}/games/samurai/difficulty/hard`}
            className="rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isZh ? '用困难题练习' : 'Practice on Hard'}
          </Link>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold tracking-tight">
          {isZh ? '5 个中高级技巧' : '5 intermediate and advanced techniques'}
        </h2>
        <div className="mt-5 space-y-4">
          {content.map((item, index) => (
            <section key={item.title} className="rounded-xl border bg-card p-5">
              <h3 className="text-xl font-semibold">
                {index + 1}. {item.title}
              </h3>
              <p className="mt-3 leading-7 text-muted-foreground">{item.body}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <Link href={`/${normalizedLocale}/games/samurai/candidate-notes`} className="rounded-xl border bg-background p-5 hover:border-primary hover:bg-primary/5">
          <h2 className="text-lg font-semibold text-primary">{isZh ? '候选数专项' : 'Candidate notes'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh ? '先保证候选记录准确，再使用候选对和区块排除。' : 'Keep notes accurate before applying pairs and box-line reductions.'}
          </p>
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/overlap-boxes`} className="rounded-xl border bg-background p-5 hover:border-primary hover:bg-primary/5">
          <h2 className="text-lg font-semibold text-primary">{isZh ? '重叠宫专项' : 'Overlap boxes'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh ? '复习共享宫如何同时约束中央和角落网格。' : 'Review how shared boxes constrain the center and corner grids.'}
          </p>
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/evil-solving-path`} className="rounded-xl border bg-background p-5 hover:border-primary hover:bg-primary/5">
          <h2 className="text-lg font-semibold text-primary">{isZh ? 'Evil 解题路径' : 'Evil solving path'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh ? '把这些技术组合成适用于极难题的完整工作流。' : 'Combine these techniques into a disciplined Evil workflow.'}
          </p>
        </Link>
      </section>

      <footer className="mt-12 grid gap-3 rounded-2xl border bg-muted/30 p-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href={`/${normalizedLocale}/games/samurai/solving-tips`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '返回通关技巧主页面' : 'Back to solving tips'}
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/difficulty/evil`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '挑战 Evil 极难' : 'Try Evil'}
        </Link>
        <Link href={`/${normalizedLocale}/games/samurai/archive`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '浏览全部题库' : 'Browse all puzzles'}
        </Link>
        <Link href={`/${normalizedLocale}/about/puzzle-methodology`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '题目如何生成与验证' : 'How puzzles are validated'}
        </Link>
      </footer>
    </article>
  );
}
