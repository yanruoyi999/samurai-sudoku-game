import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { isLocale, locales, type Locale } from '@/i18n';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

const GUIDE_PATH = '/games/samurai/evil-stuck-after-two-grids';
const UPDATED_AT = '2026-07-07';

interface TextPair {
  title: string;
  body: string;
}

interface GuideSource {
  label: string;
  href: string;
  note: string;
}

interface GuideContent {
  metaTitle: string;
  title: string;
  eyebrow: string;
  description: string;
  intro: string;
  quickAnswerTitle: string;
  quickAnswer: string;
  painTitle: string;
  painIntro: string;
  painPoints: TextPair[];
  recoveryTitle: string;
  recoveryIntro: string;
  recoverySteps: TextPair[];
  checklistTitle: string;
  checklist: string[];
  mistakesTitle: string;
  mistakes: TextPair[];
  faqTitle: string;
  faqs: TextPair[];
  sourceTitle: string;
  sources: GuideSource[];
  ctaTitle: string;
  ctaBody: string;
  primaryCta: string;
  secondaryCta: string;
  keywords: string[];
}

const sources = {
  sudokuPulse: 'https://sudokupulse.com/articles/samurai-sudoku-guide/',
  sudokuADay: 'https://sudokuaday.com/sudoku-variants/samurai-sudoku',
  conceptisTips: 'https://www.conceptispuzzles.com/index.aspx?uri=puzzle%2Fsudoku%2Ftips',
  conceptisTechniques: 'https://www.conceptispuzzles.com/index.aspx?uri=puzzle%2Fsudoku%2Ftechniques',
  redditStuck: 'https://www.reddit.com/r/sudoku/comments/1hdtt19/stuck_on_samurai_sudoku/',
  redditCandidates: 'https://www.reddit.com/r/sudoku/comments/1ocy9ic/i_dont_know_how_to_proceed/',
};

const content: Record<Locale, GuideContent> = {
  en: {
    metaTitle: 'Evil Samurai Sudoku Stuck After Two Grids - Unlock the Third Grid',
    title: 'Evil Samurai Sudoku stuck after two grids: how to unlock the third grid',
    eyebrow: 'Evil Samurai Sudoku troubleshooting',
    description:
      'A practical recovery guide for evil Samurai Sudoku players who finish two grids, then get stuck because the third grid will not open.',
    intro:
      'This is the page to use when an evil Samurai Sudoku feels impossible after two grids or two large regions are mostly solved. The usual problem is not a broken puzzle. It is a missed overlap transfer, stale candidate notes, or a pair hidden inside a shared 3x3 box.',
    quickAnswerTitle: 'Short diagnosis',
    quickAnswer:
      'When the third grid refuses to move, stop trying to finish it in isolation. Go back to the shared box that connects it to the center grid, rebuild candidates in that overlap, then transfer every placement and elimination into both connected 9x9 grids.',
    painTitle: 'Why the third grid locks up',
    painIntro:
      'Samurai Sudoku has five 9x9 grids and four shared boxes. Those overlaps create extra solving power, but they also create the most common failure mode on evil puzzles: one old note or one missed transfer makes the next grid look dead.',
    painPoints: [
      {
        title: 'The overlap was filled, but the consequence was not transferred',
        body: 'A digit placed in a shared box belongs to two grids. If you update only the corner grid and forget the center grid, the next grid loses the clue that should have opened it.',
      },
      {
        title: 'Candidates are correct for grid one, but stale for grid three',
        body: 'After two grids, many notes were written before later overlap placements. On evil puzzles those old notes often leave false possibilities that hide a single, pair, or locked candidate.',
      },
      {
        title: 'The solver is using the wrong 9x9 context',
        body: 'A shared cell has one value, but its row and column belong to different 9x9 views depending on which grid you are reading. Do not extend a row or column rule across the empty space between grids.',
      },
      {
        title: 'The third grid needs external information',
        body: 'If two passes through a corner grid produce no singles, it usually needs information from its overlap with the center grid. Staying inside that corner only repeats the same dead scan.',
      },
      {
        title: 'A naked or hidden pair is sitting in the shared box',
        body: 'Real stuck examples often resolve when the overlap box forces a small pair such as 1/8. The pair does not fill a cell immediately, but it removes enough candidates to reopen a nearby row, column, or box.',
      },
      {
        title: 'A guess created a quiet contradiction',
        body: 'Evil Samurai Sudoku can survive several moves after a bad guess before the contradiction becomes visible. If a row, column, box, or overlap cannot contain a required digit, roll back to the last unsupported move.',
      },
    ],
    recoveryTitle: 'The seven-pass recovery method',
    recoveryIntro:
      'Use this sequence when you have finished two grids, the third grid is stuck, and hints no longer feel useful. The goal is to rebuild one small bridge between grids, not to rewrite all 369 visible cells at once.',
    recoverySteps: [
      {
        title: '1. Freeze every guess and mark the last certain move',
        body: 'Do not add another speculative digit. If you are unsure which move was fully justified, clear the newest weak placements before continuing.',
      },
      {
        title: '2. Choose the overlap that feeds the stuck grid',
        body: 'Find the shared 3x3 box between the stuck corner and the center grid. Treat this box as the active bridge for the next few minutes.',
      },
      {
        title: '3. Rebuild candidates only inside that bridge',
        body: 'Erase or ignore old notes in the shared box. Recompute each cell from the corner grid row, corner grid column, shared box, center grid row, and center grid column.',
      },
      {
        title: '4. Read the same shared box twice',
        body: 'First read it as part of the corner grid, then read it as part of the center grid. Look for a digit that appears in only one possible cell in either view.',
      },
      {
        title: '5. Search pairs before searching the whole board',
        body: 'If no single appears, look for naked pairs, hidden pairs, and locked candidates in the active shared box. These patterns often unlock evil boards without guessing.',
      },
      {
        title: '6. Transfer eliminations immediately',
        body: 'When the bridge removes a candidate, update both connected grids before scanning again. The useful move may appear in the center grid, not in the stuck corner.',
      },
      {
        title: '7. Move outward only after the bridge changes',
        body: 'Once the overlap produces a placement or elimination, scan the connected row, column, and box around it. Then return to the third grid and repeat.',
      },
    ],
    checklistTitle: 'Two-grid audit checklist',
    checklist: [
      'Every filled overlap cell has been copied mentally into both grids.',
      'No row or column rule is being applied across the gap between separate grids.',
      'The stuck grid has one active overlap selected instead of four half-checked areas.',
      'Candidates in that shared box were rebuilt after the last placement.',
      'Pairs and locked candidates were checked before any guess.',
      'Any contradiction is traced back to the last unsupported placement.',
    ],
    mistakesTitle: 'What not to do when evil Samurai Sudoku stalls',
    mistakes: [
      {
        title: 'Do not fill the entire board with shallow notes',
        body: 'Full notes can help, but writing all 369 visible cells without refreshing overlaps creates noise. Start with the bridge that affects the stuck grid.',
      },
      {
        title: 'Do not solve one corner as a separate puzzle',
        body: 'A corner grid may be intentionally underconstrained until the center grid supplies overlap information. The puzzle is designed as one linked system.',
      },
      {
        title: 'Do not trust old notes after an overlap move',
        body: 'Every shared placement changes two grids. Old candidates near the overlap should be treated as suspect until rebuilt.',
      },
      {
        title: 'Do not guess because the third grid feels empty',
        body: 'If you must guess, make it a marked trial. But first exhaust overlap singles, pairs, and locked candidates. Most evil stalls come from a missed bridge deduction.',
      },
    ],
    faqTitle: 'FAQ',
    faqs: [
      {
        title: 'Is the evil puzzle broken if I solved two grids but cannot open the third?',
        body: 'Usually no. On this site, public generated puzzles are checked for a unique solution. A two-grid stall normally means an overlap deduction, candidate refresh, or rollback point was missed.',
      },
      {
        title: 'Why does completing two grids make the next grid harder?',
        body: 'Because you now carry more derived information. If one derived note is stale, the next grid can look blocked even though the actual board has enough logic to continue.',
      },
      {
        title: 'Should I write full candidate notes?',
        body: 'Use full candidates only when you can maintain them. For most stuck moments, rebuild candidates in one overlap and its connected rows first. That gives cleaner signal.',
      },
      {
        title: 'Which grid should I switch to after two passes produce nothing?',
        body: 'Switch to the center grid side of the overlap that touches the stuck corner. If the corner has no internal progress, it needs cross-grid information.',
      },
      {
        title: 'What if I already guessed and now the puzzle contradicts itself?',
        body: 'Do not patch around the contradiction. Clear the guessed branch, return to the last certain board state, and rebuild candidates in the overlap that first looked impossible.',
      },
    ],
    sourceTitle: 'Research basis',
    sources: [
      {
        label: 'SudokuPulse Samurai Sudoku guide',
        href: sources.sudokuPulse,
        note: 'Defines the five-grid layout, shared boxes, and the need to alternate between grids.',
      },
      {
        label: 'Sudoku a Day Samurai Sudoku guide',
        href: sources.sudokuADay,
        note: 'Explains why overlap zones are the crossfire and why candidates should be tracked per grid.',
      },
      {
        label: 'Conceptis Sudoku tips and techniques',
        href: sources.conceptisTips,
        note: 'Supports the no-guessing, pencilmark, and double-check workflow for harder puzzles.',
      },
      {
        label: 'Conceptis Sudoku solving techniques',
        href: sources.conceptisTechniques,
        note: 'Shows why harder puzzles move beyond simple scanning into candidate-based deductions.',
      },
      {
        label: 'Community stuck examples on Reddit',
        href: sources.redditStuck,
        note: 'Shows the real pain point: players can be stuck for multiple moves until an overlap pair is identified.',
      },
      {
        label: 'Community candidate-note examples on Reddit',
        href: sources.redditCandidates,
        note: 'Supports the recommendation to rebuild full candidates in the region that is actually stuck.',
      },
    ],
    ctaTitle: 'Continue with the right next page',
    ctaBody:
      'If you are stuck in an active game, open the candidate-note guide first. If you want a fresh evil board, use the evil difficulty page and apply the seven-pass recovery method from the start.',
    primaryCta: 'Read candidate-note workflow',
    secondaryCta: 'Play an evil puzzle',
    keywords: [
      'evil samurai sudoku stuck',
      'samurai sudoku stuck after two grids',
      'samurai sudoku third grid stuck',
      'samurai sudoku overlap candidate deadlock',
      "why can't I solve evil samurai sudoku",
      'samurai sudoku impossible after two grids',
    ],
  },
  zh: {
    metaTitle: 'Evil 武士数独做完两个网格后卡住 - 如何打开第三个网格',
    title: 'Evil 武士数独做完两个网格后卡住：如何打开第三个网格',
    eyebrow: 'Evil 武士数独卡关诊断',
    description:
      '面向 Evil 武士数独玩家的实战排查攻略：为什么做完两个网格后第三个网格打不开，以及如何从重叠区和候选数恢复推进。',
    intro:
      '如果你经常在 Evil 武士数独里做完两个网格或两个大区域后卡住，第三个网格怎么扫都没有数，这篇就是为这个痛点写的。多数情况下不是题坏了，而是重叠区没有同步、候选数过期，或者共享 3x3 宫里藏着一个候选对。',
    quickAnswerTitle: '先给结论',
    quickAnswer:
      '第三个网格打不开时，不要继续把它当成孤立 9x9 来硬扫。先回到它和中心网格相连的共享 3x3 宫，重建这个重叠区的候选数，再把每一个填数和排除同步到两个关联网格。',
    painTitle: '为什么第三个网格会锁死',
    painIntro:
      '武士数独由五个 9x9 网格和四个共享 3x3 宫组成。重叠区会带来更多线索，但也制造了 Evil 题最常见的卡点：一个旧候选或一次漏同步，就会让下一个网格看起来完全没路。',
    painPoints: [
      {
        title: '重叠区填了数，但没有把影响传给另一个网格',
        body: '共享宫里的数字同时属于两个 9x9。你如果只更新了角落网格，没有更新中心网格，第三个网格就会缺少本该打开局面的线索。',
      },
      {
        title: '候选数对第一个网格正确，但对第三个网格已经过期',
        body: '做完两个网格后，很多候选是在更早阶段写下的。Evil 题里这些旧候选会掩盖唯一候选、候选对或锁定候选。',
      },
      {
        title: '在共享格附近用了错误的 9x9 视角',
        body: '共享格的数字只有一个，但你查看它的行列时，要明确自己是在读角落网格还是中心网格。不要把行列规则跨过两个网格之间的空白区域。',
      },
      {
        title: '第三个网格需要外部信息',
        body: '如果一个角落网格扫两轮都没有唯一数，通常说明它需要中心网格通过重叠区提供信息。继续只扫这个角落，只是在重复同一个死循环。',
      },
      {
        title: '共享宫里藏着显性或隐性候选对',
        body: '真实玩家卡关案例里，经常是重叠区形成 1/8 这类候选对。它不会马上填出一个格子，但会排除附近行、列、宫里的候选，从而重新打开局面。',
      },
      {
        title: '之前的猜测制造了延迟出现的矛盾',
        body: 'Evil 武士数独里，一次错误猜测可能过好几步才显出矛盾。如果某行、某列、某宫或某个重叠区已经无法放入必要数字，就要回滚到上一次没有充分依据的填数。',
      },
    ],
    recoveryTitle: '七步恢复法',
    recoveryIntro:
      '当你已经完成两个网格，第三个网格卡住，提示也看不出帮助时，用下面这套顺序。目标不是一次性重写 369 个可见格子的候选，而是先修好一个连接两个网格的桥。',
    recoverySteps: [
      {
        title: '1. 暂停所有猜测，标记最后一步确定填数',
        body: '不要再加新的试探数字。如果你不确定哪一步有完整逻辑依据，先清掉最近的弱推断，再继续排查。',
      },
      {
        title: '2. 选中通往卡住网格的重叠区',
        body: '找到卡住角落网格和中心网格共享的 3x3 宫。接下来几分钟只把这个共享宫当作主动突破口。',
      },
      {
        title: '3. 只重建这个桥里的候选数',
        body: '擦掉或暂时忽略共享宫里的旧候选。每一格都从角落网格的行、列、宫，以及中心网格的行、列重新计算。',
      },
      {
        title: '4. 同一个共享宫读两遍',
        body: '第一遍把它当作角落网格的一部分读，第二遍把它当作中心网格的一部分读。看某个数字是否在任一视角里只剩一个位置。',
      },
      {
        title: '5. 没有唯一数时先找候选对',
        body: '如果没有直接唯一候选，就在这个共享宫里找显性候选对、隐性候选对和锁定候选。Evil 题经常靠这些结构打开。',
      },
      {
        title: '6. 任何排除都立刻同步',
        body: '只要这个桥排除了一个候选，就马上更新两个关联网格。真正能填的数可能出现在中心网格，而不是卡住的角落。',
      },
      {
        title: '7. 桥发生变化后再向外扩展',
        body: '重叠区产生填数或排除后，再扫描它连接的行、列、宫。然后回到第三个网格复查。',
      },
    ],
    checklistTitle: '两个网格后卡住的审计清单',
    checklist: [
      '每个已填的重叠格，都已经在两个网格里同步考虑。',
      '没有把行列规则跨过不同网格之间的空白区域。',
      '卡住网格只选了一个主动重叠区，而不是四处浅扫。',
      '这个共享宫的候选数是在最后一次填数之后重新计算的。',
      '在猜测前，已经检查过候选对和锁定候选。',
      '任何矛盾都能追溯到上一次没有充分依据的填数。',
    ],
    mistakesTitle: 'Evil 武士数独卡住时不要这样做',
    mistakes: [
      {
        title: '不要一口气给全盘写浅候选',
        body: '完整候选有用，但如果不刷新重叠区，会制造大量噪音。先处理影响卡住网格的那座桥。',
      },
      {
        title: '不要把一个角落当成独立题硬解',
        body: '角落网格可能故意需要中心网格提供信息。武士数独是一个联动系统，不是五道互不相关的题。',
      },
      {
        title: '不要信任重叠区变化前的旧候选',
        body: '共享区每填一个数都会改变两个网格。重叠区附近的旧候选，在重算前都应该视为可疑。',
      },
      {
        title: '不要因为第三个网格空就猜',
        body: '如果一定要猜，也要明确标记为试探分支。但在那之前，先穷尽重叠区唯一数、候选对和锁定候选。',
      },
    ],
    faqTitle: '常见问题',
    faqs: [
      {
        title: '做完两个网格后第三个打不开，是不是题坏了？',
        body: '通常不是。本站公开生成题会检查唯一解。两个网格后卡住，更多是漏了重叠区推理、候选数刷新或需要回滚某个无依据填数。',
      },
      {
        title: '为什么做完两个网格后反而更难？',
        body: '因为你已经带着很多推导信息。如果其中一个候选过期，后面的网格就会看起来被堵死，虽然真实棋盘仍然有逻辑路径。',
      },
      {
        title: '我应该写完整候选数吗？',
        body: '如果你能维护完整候选，可以写。大多数卡点更适合先重建一个重叠区及其连接行列的候选，这样信号更干净。',
      },
      {
        title: '扫两轮都没进展时应该切到哪个网格？',
        body: '切到卡住角落对应的中心网格重叠区。如果角落内部没有进展，它需要跨网格信息。',
      },
      {
        title: '如果我已经猜了，现在出现矛盾怎么办？',
        body: '不要继续修补矛盾。清掉猜测分支，回到最后一个确定状态，再从最早看起来不可能的重叠区重建候选。',
      },
    ],
    sourceTitle: '调研依据',
    sources: [
      {
        label: 'SudokuPulse 武士数独指南',
        href: sources.sudokuPulse,
        note: '说明五网格结构、共享宫，以及需要在不同网格之间切换推理。',
      },
      {
        label: 'Sudoku a Day 武士数独指南',
        href: sources.sudokuADay,
        note: '强调重叠区是交叉火力点，并建议按网格追踪候选数。',
      },
      {
        label: 'Conceptis 数独技巧',
        href: sources.conceptisTips,
        note: '支持不要猜、使用 pencilmark、填数后复查的困难题流程。',
      },
      {
        label: 'Conceptis 数独解题技术',
        href: sources.conceptisTechniques,
        note: '说明困难题需要从简单扫描进入候选数推理。',
      },
      {
        label: 'Reddit 真实卡关案例',
        href: sources.redditStuck,
        note: '展示玩家在重叠区候选对没有识别前，会持续卡住多步。',
      },
      {
        label: 'Reddit 候选数卡关案例',
        href: sources.redditCandidates,
        note: '支持在真正卡住的区域重建候选数，而不是盲目继续扫全盘。',
      },
    ],
    ctaTitle: '下一步该看哪里',
    ctaBody:
      '如果你正在一局里卡住，先看候选数笔记流程。如果你想重新开一题练习，就进入 Evil 难度页，从第一步开始套用七步恢复法。',
    primaryCta: '看候选数笔记流程',
    secondaryCta: '开始 Evil 题',
    keywords: [
      'Evil 武士数独卡住',
      '武士数独两个网格后卡住',
      '武士数独第三个网格打不开',
      '武士数独重叠区候选数卡住',
      '极难武士数独无法通关',
      '武士数独做不下去',
    ],
  },
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

function resolveLocale(locale: string): Locale {
  return isLocale(locale) ? locale : 'en';
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const page = content[locale];
  const canonical = buildLocalizedUrl(locale, GUIDE_PATH);

  return {
    title: page.metaTitle,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(GUIDE_PATH),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      type: 'article',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
    },
  };
}

export default async function EvilStuckAfterTwoGridsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const isZh = locale === 'zh';
  const page = content[locale];
  const canonical = buildLocalizedUrl(locale, GUIDE_PATH);
  const articleId = `${canonical}#article`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': articleId,
    headline: page.title,
    description: page.description,
    inLanguage: isZh ? 'zh-CN' : 'en-US',
    datePublished: UPDATED_AT,
    dateModified: UPDATED_AT,
    mainEntityOfPage: canonical,
    author: {
      '@type': 'Organization',
      name: 'Samurai Sudoku',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Samurai Sudoku',
      url: buildAbsoluteUrl('/'),
    },
    citation: [
      sources.sudokuPulse,
      sources.sudokuADay,
      sources.conceptisTips,
      sources.conceptisTechniques,
      sources.redditStuck,
      sources.redditCandidates,
    ],
    keywords: page.keywords.join(', '),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((item) => ({
      '@type': 'Question',
      name: item.title,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.body,
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: buildAbsoluteUrl(`/${locale}`) },
      { '@type': 'ListItem', position: 2, name: 'Samurai Sudoku', item: buildAbsoluteUrl(`/${locale}/games/samurai`) },
      { '@type': 'ListItem', position: 3, name: page.title, item: canonical },
    ],
  };

  return (
    <>
      <Script
        id={`evil-stuck-article-jsonld-${locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id={`evil-stuck-faq-jsonld-${locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id={`evil-stuck-breadcrumb-jsonld-${locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="min-h-screen bg-background text-foreground">
        <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-16">
          <nav className="mb-8 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Link href={`/${locale}/games/samurai`} className="hover:text-foreground">
              Samurai Sudoku
            </Link>
            <span>/</span>
            <Link href={`/${locale}/games/samurai/difficulty/evil`} className="hover:text-foreground">
              {isZh ? 'Evil 难度' : 'Evil difficulty'}
            </Link>
          </nav>

          <header className="space-y-5 border-b pb-10">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {page.eyebrow}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              {page.title}
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              {page.intro}
            </p>
            <div className="rounded-lg border bg-primary/5 p-5">
              <h2 className="text-lg font-semibold">{page.quickAnswerTitle}</h2>
              <p className="mt-2 leading-7 text-muted-foreground">{page.quickAnswer}</p>
            </div>
          </header>

          <section className="space-y-5 py-10">
            <h2 className="text-2xl font-semibold tracking-tight">{page.painTitle}</h2>
            <p className="leading-7 text-muted-foreground">{page.painIntro}</p>
            <div className="grid gap-4 md:grid-cols-2">
              {page.painPoints.map((item) => (
                <section key={item.title} className="rounded-lg border p-5">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                </section>
              ))}
            </div>
          </section>

          <section className="space-y-5 border-t py-10">
            <h2 className="text-2xl font-semibold tracking-tight">{page.recoveryTitle}</h2>
            <p className="leading-7 text-muted-foreground">{page.recoveryIntro}</p>
            <ol className="space-y-4">
              {page.recoverySteps.map((item) => (
                <li key={item.title} className="rounded-lg border bg-background p-5">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 leading-7 text-muted-foreground">{item.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid gap-6 border-t py-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{page.checklistTitle}</h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
                {page.checklist.map((item) => (
                  <li key={item} className="rounded-md border px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{page.mistakesTitle}</h2>
              <div className="mt-5 space-y-4">
                {page.mistakes.map((item) => (
                  <section key={item.title}>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </section>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t py-10">
            <h2 className="text-2xl font-semibold tracking-tight">{page.faqTitle}</h2>
            {page.faqs.map((item) => (
              <section key={item.title} className="rounded-lg border p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{item.body}</p>
              </section>
            ))}
          </section>

          <section className="space-y-4 border-t py-10">
            <h2 className="text-2xl font-semibold tracking-tight">{page.sourceTitle}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {page.sources.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border p-5 transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <h3 className="font-semibold text-primary">{source.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{source.note}</p>
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-secondary/30 p-6">
            <h2 className="text-2xl font-semibold tracking-tight">{page.ctaTitle}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{page.ctaBody}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/games/samurai/candidate-notes`}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {page.primaryCta}
              </Link>
              <Link
                href={`/${locale}/games/samurai/difficulty/evil`}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                {page.secondaryCta}
              </Link>
              <Link
                href={`/${locale}/games/samurai/evil-solving-path`}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                {isZh ? '继续看 Evil 解题路径' : 'Continue to evil solving path'}
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
