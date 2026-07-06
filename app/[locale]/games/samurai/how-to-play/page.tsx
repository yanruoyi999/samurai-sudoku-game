import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface HowToPlayPageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/games/samurai/how-to-play';

export async function generateMetadata({ params }: HowToPlayPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const title = isZh
    ? '如何玩武士数独 — 规则、技巧与解题策略'
    : 'How to Play Samurai Sudoku — Rules, Tips & Solving Strategy';
  const description = isZh
    ? '武士数独完整规则与解题攻略：理解五个重叠 9×9 网格、从重叠区入手的技巧，以及从简单到 Evil 极难的进阶策略。'
    : 'A complete guide to Samurai Sudoku: the rules of the five overlapping 9×9 grids, how to use the shared overlap boxes, and step-by-step strategy from easy to evil.';
  const canonical = buildLocalizedUrl(locale, PATH);

  return {
    title,
    description,
    keywords: isZh
      ? ['武士数独规则', '武士数独怎么玩', '武士数独技巧', '武士数独攻略', '数独教程']
      : ['how to play samurai sudoku', 'samurai sudoku rules', 'samurai sudoku tips', 'samurai sudoku strategy', 'samurai sudoku guide'],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: { title, description, url: canonical, type: 'article' },
    twitter: { card: 'summary', title, description },
  };
}

interface Section {
  h: string;
  body: string[];
}

export default async function HowToPlayPage({ params }: HowToPlayPageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh';

  const rules: string[] = isZh
    ? [
        '武士数独由 5 个标准的 9×9 数独网格组成，呈十字形排列：四角各一个，中央一个。',
        '中央网格的四个角 3×3 宫，分别与四角网格共享——这正是"重叠区"。',
        '每个 9×9 网格都遵循标准数独规则：每行、每列、每个 3×3 宫内 1–9 各出现一次。',
        '重叠的 3×3 宫必须同时满足它所属的两个网格的规则，所以一个数字的影响会跨网格传播。',
      ]
    : [
        'Samurai Sudoku is made of 5 standard 9×9 Sudoku grids arranged in a cross: one in each corner and one in the center.',
        "The center grid shares each of its four corner 3×3 boxes with a corner grid — these are the overlap zones.",
        'Every 9×9 grid follows standard Sudoku rules: each row, column, and 3×3 box contains 1–9 exactly once.',
        'An overlapping box must satisfy the rules of both grids it belongs to, so a single digit ripples across grids.',
      ];

  const steps: Section[] = isZh
    ? [
        { h: '1. 从重叠区入手', body: ['重叠的 3×3 宫同时受两个网格约束，线索最密集。优先在这里找确定的数字，能同时推动两个网格。'] },
        { h: '2. 先扫描唯一候选', body: ['对每个空格，排除同行、同列、同宫已出现的数字。只剩一个候选的格子可以直接填入。'] },
        { h: '3. 利用跨网格联动', body: ['在重叠区填入一个数字后，立刻检查它在另一个网格里排除了哪些可能——这是武士数独特有的推理路径。'] },
        { h: '4. 善用候选标记', body: ['遇到困难时打开候选标记，把每格的可能数字记下来，缩小范围后再下手，避免反复试错。'] },
        { h: '5. 逐格收紧', body: ['每填一个数字都会改变周围格子的候选。保持"填入→重新扫描→再填入"的节奏，直到棋盘完成。'] },
      ]
    : [
        { h: '1. Start with the overlap zones', body: ['Overlapping 3×3 boxes are constrained by two grids at once, so they carry the most clues. Solving here advances both grids simultaneously.'] },
        { h: '2. Scan for single candidates', body: ['For each empty cell, eliminate digits already present in its row, column, and box. A cell with only one candidate can be filled immediately.'] },
        { h: '3. Chain deductions across grids', body: ['After placing a digit in an overlap zone, immediately check which possibilities it removes in the other grid — the deduction path unique to Samurai Sudoku.'] },
        { h: '4. Use candidate notes', body: ['When stuck, turn on notes to pencil in each cell’s possible digits. Narrowing the field first prevents trial-and-error mistakes.'] },
        { h: '5. Tighten cell by cell', body: ['Every placement changes nearby candidates. Keep a rhythm of place → rescan → place until the board is complete.'] },
      ];

  const faq = isZh
    ? [
        { q: '武士数独和普通数独有什么区别？', a: '普通数独是单个 9×9 网格，武士数独是 5 个 9×9 网格通过 4 个重叠 3×3 宫连成十字形，需要跨网格推理。' },
        { q: '武士数独有唯一解吗？', a: '本站每道生成题都会用回溯求解器验证唯一解。困难和 Evil 题可能需要比内置基础提示更复杂的推理。' },
        { q: '新手应该从哪个难度开始？', a: '建议从简单难度开始熟悉重叠规则，再依次挑战中等、困难，最后是 Evil 极难。' },
        { q: '需要靠猜吗？', a: '题目都有唯一解。建议先系统记录候选并检查重叠区；随意猜测很容易制造冲突。' },
      ]
    : [
        { q: 'How is Samurai Sudoku different from regular Sudoku?', a: 'Regular Sudoku is a single 9×9 grid. Samurai Sudoku links five 9×9 grids through four overlapping 3×3 boxes into a cross, requiring cross-grid reasoning.' },
        { q: 'Does every Samurai Sudoku have a unique solution?', a: 'Every generated puzzle is checked with a backtracking solver for exactly one solution. Hard and Evil puzzles may require deductions beyond the built-in basic hints.' },
        { q: 'Which difficulty should beginners start with?', a: 'Start with Easy to learn the overlap rules, then progress through Medium and Hard, and finally take on Evil.' },
        { q: 'Do I ever need to guess?', a: 'Each puzzle has one solution. Use systematic candidate notes and recheck the overlap zones before guessing, which can easily create conflicts.' },
      ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isZh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${locale}`) },
      { '@type': 'ListItem', position: 2, name: 'Samurai Sudoku', item: buildAbsoluteUrl(`/${locale}/games/samurai`) },
      { '@type': 'ListItem', position: 3, name: isZh ? '怎么玩' : 'How to Play', item: buildAbsoluteUrl(`/${locale}${PATH}`) },
    ],
  };

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: isZh ? '如何解武士数独' : 'How to solve Samurai Sudoku',
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.h,
      text: s.body.join(' '),
    })),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Script id="howto-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Script id="howto-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <Script id="howto-faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="container mx-auto max-w-3xl px-4 py-10">
        <nav className="text-xs text-muted-foreground mb-4 flex flex-wrap items-center gap-1.5" aria-label="Breadcrumb">
          <Link href={`/${locale}`} className="hover:text-foreground">{isZh ? '首页' : 'Home'}</Link>
          <span aria-hidden>/</span>
          <Link href={`/${locale}/games/samurai`} className="hover:text-foreground">Samurai Sudoku</Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">{isZh ? '怎么玩' : 'How to Play'}</span>
        </nav>

        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
          {isZh ? '如何玩武士数独' : 'How to Play Samurai Sudoku'}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          {isZh
            ? '武士数独把五个数独网格交织成一个十字形谜题。读懂重叠区，你就掌握了它的精髓。下面是完整规则与一套可复用的解题策略。'
            : 'Samurai Sudoku interlocks five Sudoku grids into one cross-shaped puzzle. Once you understand the overlap zones, the rest follows. Here are the full rules and a repeatable solving strategy.'}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {isZh ? '第一次接触五宫布局？' : 'New to the five-grid layout?'}{' '}
          <Link href={`/${locale}/games/samurai/what-is-samurai-sudoku`} className="font-medium text-primary hover:underline">
            {isZh ? '先看武士数独图解介绍。' : 'Start with the visual explanation of Samurai Sudoku.'}
          </Link>
        </p>
        <nav className="mt-5 flex flex-wrap gap-2 text-sm" aria-label={isZh ? '武士数独细分指南' : 'Samurai Sudoku focused guides'}>
          <Link href={`/${locale}/games/samurai/overlap-boxes`} className="rounded-md border px-3 py-2 text-primary hover:bg-primary/10">
            {isZh ? '重叠宫详解' : 'Overlap boxes'}
          </Link>
          <Link href={`/${locale}/games/samurai/candidate-notes`} className="rounded-md border px-3 py-2 text-primary hover:bg-primary/10">
            {isZh ? '候选数笔记' : 'Candidate notes'}
          </Link>
          <Link href={`/${locale}/games/samurai/evil-solving-path`} className="rounded-md border px-3 py-2 text-primary hover:bg-primary/10">
            {isZh ? 'Evil 解题路径' : 'Evil solving path'}
          </Link>
        </nav>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/${locale}/games/samurai`} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            {isZh ? '开始今日谜题' : "Play today's puzzle"}
          </Link>
          <Link href={`/${locale}/games/samurai/difficulty/easy`} className="px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors">
            {isZh ? '从简单题开始' : 'Start with Easy'}
          </Link>
          <Link href={`/${locale}/games/samurai/archive`} className="px-6 py-3 border border-muted-foreground/30 rounded-lg font-medium hover:bg-accent transition-colors">
            {isZh ? '浏览题库' : 'Browse the archive'}
          </Link>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{isZh ? '规则' : 'The rules'}</h2>
          <ol className="mt-4 space-y-3 list-decimal pl-5 text-muted-foreground leading-relaxed">
            {rules.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{isZh ? '解题策略（分步）' : 'Solving strategy (step by step)'}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isZh
              ? '每个步骤标题都可以点击展开/收起；读完第一步后可直接进入简单题练习重叠区。'
              : 'Each step heading can be tapped to expand or collapse. After the first step, jump into an Easy puzzle to practice overlap zones.'}
          </p>
          <div className="mt-4 space-y-4">
            {steps.map((s, index) => (
              <details key={s.h} open className="group rounded-xl border bg-background p-4 transition hover:border-primary/60">
                <summary className="cursor-pointer list-none text-lg font-medium text-foreground flex items-center justify-between gap-3">
                  <span>{s.h}</span>
                  <span className="text-primary transition-transform group-open:rotate-90" aria-hidden>➤</span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{s.body.join(' ')}</p>
                {index === 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/${locale}/games/samurai/difficulty/easy`} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                      {isZh ? '练习重叠区：简单题' : 'Practice overlap zones: Easy'}
                    </Link>
                    <Link href={`/${locale}/games/samurai/what-is-samurai-sudoku`} className="rounded-md border px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
                      {isZh ? '再看布局图解' : 'View the layout diagram'}
                    </Link>
                  </div>
                )}
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{isZh ? '按难度练习' : 'Practice by difficulty'}</h2>
          <p className="mt-2 text-muted-foreground">
            {isZh ? '从你舒适的难度开始，逐级进阶：' : 'Start where you are comfortable and level up:'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {([['easy', isZh ? '简单' : 'Easy'], ['medium', isZh ? '中等' : 'Medium'], ['hard', isZh ? '困难' : 'Hard'], ['evil', isZh ? 'Evil 极难' : 'Evil']] as const).map(([d, label]) => (
              <Link key={d} href={`/${locale}/games/samurai/difficulty/${d}`} className="rounded-md border px-4 py-2 hover:bg-accent transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border bg-primary/5 p-6 text-center">
          <h2 className="text-2xl font-semibold">{isZh ? '准备开始了吗？' : 'Ready to try it?'}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            {isZh
              ? '规则看完后不要停在教程页。先选简单题，把重叠区作为第一步练习。'
              : 'Do not stop on the guide page. Start with Easy and use the overlap boxes as your first move.'}
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/${locale}/games/samurai/difficulty/easy`} className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary/10">
              {isZh ? '从简单题开始' : 'Start with Easy'}
            </Link>
            <Link href={`/${locale}/games/samurai`} className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
              {isZh ? '开始今日谜题' : "Play today's puzzle"}
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{isZh ? '常见问题' : 'Frequently asked questions'}</h2>
          <div className="mt-4 space-y-4">
            {faq.map((f) => (
              <details key={f.q} className="group border rounded-lg bg-secondary/30 p-4">
                <summary className="cursor-pointer font-medium flex items-center justify-between">
                  <span>{f.q}</span>
                  <span className="text-primary group-open:rotate-90 transition-transform" aria-hidden>➤</span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
