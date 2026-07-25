import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { getSamuraiGuide } from '@/lib/samurai/guides';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface HowToPlayPageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/games/samurai/how-to-play';

export async function generateMetadata({ params }: HowToPlayPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const guide = getSamuraiGuide(locale, 'how-to-play');
  const title = isZh
    ? '武士数独怎么玩：五宫规则、重叠区与操作说明'
    : 'How to Play Samurai Sudoku: Five-Grid Rules & Controls';
  const description = isZh
    ? '武士数独规则与操作说明：认识五个重叠 9×9 网格，了解行列宫规则、重叠区、选格输入、候选标记和难度入口。'
    : 'Learn the Samurai Sudoku rules and controls: five overlapping 9×9 grids, shared boxes, cell selection, number input, candidate notes, and difficulty links.';
  const canonical = buildLocalizedUrl(locale, PATH);

  return {
    title,
    description,
    keywords: isZh
      ? [guide.primaryKeyword, '武士数独规则', '五宫数独规则', '武士数独操作说明']
      : [guide.primaryKeyword, 'samurai sudoku rules', 'five grid sudoku rules', 'samurai sudoku controls'],
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
        '中央网格的四个角 3×3 宫，分别与四角网格共享——这正是“重叠区”。',
        '每个 9×9 网格都遵循标准数独规则：每行、每列、每个 3×3 宫内 1–9 各出现一次。',
        '重叠的 3×3 宫必须同时满足它所属的两个网格的规则，所以一个数字的影响会跨网格传播。',
      ]
    : [
        'Samurai Sudoku is made of 5 standard 9×9 Sudoku grids arranged in a cross: one in each corner and one in the center.',
        'The center grid shares each of its four corner 3×3 boxes with a corner grid — these are the overlap zones.',
        'Every 9×9 grid follows standard Sudoku rules: each row, column, and 3×3 box contains 1–9 exactly once.',
        'An overlapping box must satisfy the rules of both grids it belongs to, so a single digit affects two grids.',
      ];

  const steps: Section[] = isZh
    ? [
        { h: '1. 先选中一个可填写空格', body: ['移动端和电脑端都要先点空格，再使用下方数字键或键盘输入 1–9。题目给定数字不能修改。'] },
        { h: '2. 检查所在行、列和 3×3 宫', body: ['准备输入前，确认该数字没有在当前 9×9 网格的同行、同列或同宫重复。'] },
        { h: '3. 重叠格要同时检查两个网格', body: ['如果空格位于共享 3×3 宫，还要检查它在中央网格和角落网格中的两套行列宫约束。'] },
        { h: '4. 不确定时切换候选模式', body: ['候选标记用于记录可能数字，不等于正式填入。确定答案后再关闭候选模式并输入数字。'] },
        { h: '5. 用提示、撤销和冲突检查辅助操作', body: ['提示用于指出下一步，撤销用于回退输入，冲突检查用于发现重复数字；这些工具不会替代完整推理。'] },
      ]
    : [
        { h: '1. Select an editable empty cell first', body: ['On mobile or desktop, choose an empty cell before tapping the number pad or typing 1–9. Given clues cannot be changed.'] },
        { h: '2. Check its row, column, and 3×3 box', body: ['Before entering a digit, confirm it does not repeat in the same row, column, or box of the active 9×9 grid.'] },
        { h: '3. Check both grids for an overlap cell', body: ['If the cell sits inside a shared 3×3 box, apply the row, column, and box rules from both the center and corner grids.'] },
        { h: '4. Switch on Candidates when uncertain', body: ['Candidate mode records possible digits without committing a final answer. Turn it off when you are ready to enter the solved value.'] },
        { h: '5. Use hints, undo, and conflict checking as controls', body: ['Hints point to a next step, Undo reverses input, and conflict checking shows duplicates. These controls support rather than replace the solving process.'] },
      ];

  const faq = isZh
    ? [
        { q: '武士数独和普通数独有什么区别？', a: '普通数独是单个 9×9 网格，武士数独是 5 个 9×9 网格通过 4 个重叠 3×3 宫连成十字形，需要同时满足共享区域两边的规则。' },
        { q: '为什么点数字没有反应？', a: '通常是因为还没有先选中可填写的空格。先点棋盘空格，再点数字；题目给定数字不能修改。' },
        { q: '新手应该从哪个难度开始？', a: '建议从简单难度开始熟悉选格、输入、候选和重叠区，再依次挑战中等、困难和 Evil。' },
        { q: '本页和通关技巧有什么区别？', a: '本页解释规则和操作；通关技巧页提供从开局、中盘到完成的完整解题流程。' },
      ]
    : [
        { q: 'How is Samurai Sudoku different from regular Sudoku?', a: 'Regular Sudoku is one 9×9 grid. Samurai Sudoku links five grids through four shared 3×3 boxes, and every overlap must satisfy both connected grids.' },
        { q: 'Why does tapping a number do nothing?', a: 'Usually no editable cell has been selected. Choose an empty cell first, then tap a number. Given clues cannot be edited.' },
        { q: 'Which difficulty should beginners start with?', a: 'Start with Easy to learn selection, number entry, candidate notes, and overlap behavior before moving to Medium, Hard, and Evil.' },
        { q: 'How is this page different from the solving tips guide?', a: 'This page explains rules and controls. The solving tips guide provides the complete workflow from opening move to completion.' },
      ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isZh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${locale}`) },
      { '@type': 'ListItem', position: 2, name: 'Samurai Sudoku', item: buildAbsoluteUrl(`/${locale}/games/samurai`) },
      { '@type': 'ListItem', position: 3, name: isZh ? '玩法规则' : 'How to Play', item: buildAbsoluteUrl(`/${locale}${PATH}`) },
    ],
  };

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: isZh ? '武士数独规则与操作步骤' : 'Samurai Sudoku rules and controls',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.h,
      text: step.body.join(' '),
    })),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
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
          <span className="text-foreground">{isZh ? '玩法规则' : 'How to Play'}</span>
        </nav>

        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
          {isZh ? '武士数独怎么玩' : 'How to Play Samurai Sudoku'}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          {isZh
            ? '本页专门解释五宫结构、基础规则和网站操作。读完后，你应该知道如何选格、输入数字、使用候选和检查重叠格；完整通关方法请进入通关技巧页面。'
            : 'This page focuses on the five-grid structure, core rules, and site controls. After reading it, you should know how to select cells, enter digits, use notes, and check overlap cells. Use the solving-tips page for the full solving workflow.'}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {isZh ? '第一次接触五宫布局？' : 'New to the five-grid layout?'}{' '}
          <Link href={`/${locale}/games/samurai/what-is-samurai-sudoku`} className="font-medium text-primary hover:underline">
            {isZh ? '先看武士数独图解介绍。' : 'Start with the visual explanation of Samurai Sudoku.'}
          </Link>
        </p>

        <nav className="mt-5 flex flex-wrap gap-2 text-sm" aria-label={isZh ? '武士数独学习指南' : 'Samurai Sudoku learning guides'}>
          <Link href={`/${locale}/games/samurai/first-move-strategy`} className="rounded-md border px-3 py-2 text-primary hover:bg-primary/10">
            {isZh ? '第一步攻略' : 'First move guide'}
          </Link>
          <Link href={`/${locale}/games/samurai/choose-difficulty`} className="rounded-md border px-3 py-2 text-primary hover:bg-primary/10">
            {isZh ? '难度选择' : 'Choose difficulty'}
          </Link>
          <Link href={`/${locale}/games/samurai/solving-tips`} className="rounded-md border px-3 py-2 text-primary hover:bg-primary/10">
            {isZh ? '完整通关技巧' : 'Complete solving tips'}
          </Link>
          <Link href={`/${locale}/games/samurai/strategy-guide`} className="rounded-md border px-3 py-2 text-primary hover:bg-primary/10">
            {isZh ? '中高级技巧' : 'Advanced techniques'}
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
          <h2 className="text-2xl font-semibold">{isZh ? '核心规则' : 'Core rules'}</h2>
          <ol className="mt-4 space-y-3 list-decimal pl-5 text-muted-foreground leading-relaxed">
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{isZh ? '基础操作顺序' : 'Basic control sequence'}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isZh
              ? '每个标题都可以展开或收起；这里讲的是如何操作棋盘，不替代完整解题策略。'
              : 'Each heading can be expanded or collapsed. These steps explain board operation rather than advanced solving strategy.'}
          </p>
          <div className="mt-4 space-y-4">
            {steps.map((step, index) => (
              <details key={step.h} open className="group rounded-xl border bg-background p-4 transition hover:border-primary/60">
                <summary className="cursor-pointer list-none text-lg font-medium text-foreground flex items-center justify-between gap-3">
                  <span>{step.h}</span>
                  <span className="text-primary transition-transform group-open:rotate-90" aria-hidden>➤</span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{step.body.join(' ')}</p>
                {index === 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/${locale}/games/samurai/first-move-strategy`} className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
                      {isZh ? '查看第一步图文攻略' : 'Read the first-move guide'}
                    </Link>
                    <Link href={`/${locale}/games/samurai/difficulty/easy`} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                      {isZh ? '打开简单题练操作' : 'Practice controls on Easy'}
                    </Link>
                  </div>
                )}
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{isZh ? '按难度进入游戏' : 'Enter the game by difficulty'}</h2>
          <p className="mt-2 text-muted-foreground">
            {isZh ? '不确定选哪个难度时，先阅读难度选择指南。' : 'Read the difficulty guide first if you are unsure which level to choose.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {([['easy', isZh ? '简单' : 'Easy'], ['medium', isZh ? '中等' : 'Medium'], ['hard', isZh ? '困难' : 'Hard'], ['evil', isZh ? 'Evil 极难' : 'Evil']] as const).map(([difficulty, label]) => (
              <Link key={difficulty} href={`/${locale}/games/samurai/difficulty/${difficulty}`} className="rounded-md border px-4 py-2 hover:bg-accent transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border bg-primary/5 p-6 text-center">
          <h2 className="text-2xl font-semibold">{isZh ? '已经会操作，接下来怎么通关？' : 'Know the controls—what comes next?'}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            {isZh
              ? '进入通关技巧主页面，学习从重叠宫开局、处理中盘卡点到完成复盘的完整流程。'
              : 'Open the main solving-tips guide for the full workflow from overlap opening to mid-game stalls and post-solve review.'}
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/${locale}/games/samurai/solving-tips`} className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
              {isZh ? '查看通关技巧' : 'Read solving tips'}
            </Link>
            <Link href={`/${locale}/games/samurai/difficulty/easy`} className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary/10">
              {isZh ? '从简单题开始' : 'Start with Easy'}
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{isZh ? '常见问题' : 'Frequently asked questions'}</h2>
          <div className="mt-4 space-y-4">
            {faq.map((item) => (
              <details key={item.q} className="group border rounded-lg bg-secondary/30 p-4">
                <summary className="cursor-pointer font-medium flex items-center justify-between">
                  <span>{item.q}</span>
                  <span className="text-primary group-open:rotate-90 transition-transform" aria-hidden>➤</span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
