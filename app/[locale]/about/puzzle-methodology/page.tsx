import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/about/puzzle-methodology';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? '武士数独题目如何生成与验证：唯一解、难度和修正流程'
    : 'How Samurai Sudoku Puzzles Are Generated and Validated';
  const description = isZh
    ? '了解本站武士数独的生成、唯一解验证、难度线索、自动化检查、错误修正、缓存刷新和攻略内容更新方法。'
    : 'Learn how this site generates Samurai Sudoku puzzles, validates unique solutions, assigns difficulty profiles, runs automated checks, and publishes corrections.';

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: { title, description, url: canonical, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function PuzzleMethodologyPage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const normalizedLocale = isZh ? 'zh' : 'en';
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: isZh ? '武士数独题目生成与验证方法' : 'Samurai Sudoku Puzzle Methodology',
    description: isZh
      ? '本站题目生成、唯一解验证、难度配置、自动化检查与修正机制。'
      : 'How the site generates, validates, grades, checks, and corrects Samurai Sudoku puzzles.',
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
      { '@type': 'ListItem', position: 2, name: isZh ? '关于我们' : 'About', item: buildAbsoluteUrl(`/${normalizedLocale}/about`) },
      { '@type': 'ListItem', position: 3, name: isZh ? '题目方法说明' : 'Puzzle methodology', item: pageUrl },
    ],
  };

  const sections = isZh
    ? [
        {
          title: '1. 先生成完整的五宫解盘',
          body: '生成器先创建一个随机化的完整 9×9 中央解盘，再通过行带、列栈和数字置换构造四个与中央网格重叠一致的角落网格。这样形成一个 21×21 的全局武士数独解盘，四个共享 3×3 宫在全局棋盘中只算一组真实单元。',
        },
        {
          title: '2. 挖空时持续检查唯一解',
          body: '生成器会随机选择可见格并尝试移除线索。每移除一个数字后，程序都会调用武士数独求解器检查整张全局棋盘是否仍然只有一个解；如果唯一性被破坏，就恢复该线索。发布脚本还会再次验证结构、答案、重叠区一致性和唯一解。',
        },
        {
          title: '3. 难度是线索配置，不是个人能力承诺',
          body: '简单、中等、困难和 Evil 使用不同的目标全局线索数、每个 9×9 网格的最低线索数和预计完成时间。当前配置分别约为 185、155、135 和 120 个全局线索，预计时间为 20、35、60 和 90 分钟。实际用时会受到数独经验、候选记录习惯和是否使用提示影响，因此难度标签是相对练习层级，不保证每个人的体验完全一致。',
        },
        {
          title: '4. 发布前运行自动化检查',
          body: '每个题目文件必须包含五个 9×9 初始网格和五个完整答案网格；所有值必须在允许范围内，给定数字必须与答案一致，重叠格在两个网格中的答案必须一致，完整答案不能有行、列或宫冲突。CI 还运行 TypeScript、单元测试、题库验证、生产构建、内链审计和页面质量审计。任何必需检查失败时，Pull Request 不应合并。',
        },
        {
          title: '5. 题目修正与缓存更新',
          body: '如果收到可复现的题目错误报告，我们会在源 JSON 中修正题面、答案或元数据，并重新运行题库校验。日期题的浏览器缓存现在要求重新验证，Service Worker 使用后台刷新策略：离线时仍可读取已缓存题目，恢复网络后会检查服务器是否有更新，而不是把旧题标记为一年不可变。',
        },
        {
          title: '6. 攻略内容的定位和更新',
          body: '规则页只解释五宫结构和操作；通关技巧页负责从开局到完成的完整流程；高级技巧页专门讲隐藏唯一、候选对、区块排除和跨网格推理。内容会根据实际游戏行为、错误报告和搜索意图调整，但不会把多个近义页面都写成同一篇“万能攻略”。',
        },
        {
          title: '7. 如何报告问题',
          body: '报告题目问题时，请提供题目日期、难度、出错位置、你看到的冲突或无法继续的步骤，以及设备或浏览器信息。我们会先复现，再检查题目 JSON、唯一解计数和界面状态。仅凭“太难”不会被视为题目错误，但无解、多解、重叠不一致或答案冲突属于必须处理的问题。',
        },
      ]
    : [
        {
          title: '1. Generate a complete five-grid solution first',
          body: 'The generator creates a randomized complete 9×9 center solution, then applies row-band, column-stack, and digit permutations to build four corner grids whose shared 3×3 boxes remain consistent with the center. The result is one 21×21 global Samurai Sudoku solution where each overlap is one real set of cells.',
        },
        {
          title: '2. Preserve a unique solution while removing clues',
          body: 'The generator shuffles playable cells and tries to remove clues. After each removal, the Samurai solver checks whether the entire global board still has one solution; a clue is restored when uniqueness would be lost. The publishing script validates structure, answers, overlap consistency, and uniqueness again before writing a dated puzzle file.',
        },
        {
          title: '3. Difficulty is a clue profile, not a promise about personal skill',
          body: 'Easy, Medium, Hard, and Evil use different target clue counts, minimum clues per 9×9 grid, and estimated completion times. The current profiles target roughly 185, 155, 135, and 120 global clues with estimates of 20, 35, 60, and 90 minutes. Actual time varies with experience, note-taking habits, and hint use.',
        },
        {
          title: '4. Run automated checks before publication',
          body: 'Every puzzle file must contain five 9×9 initial grids and five complete solution grids. Values must be valid, givens must match the solution, shared cells must agree across both grids, and the completed board must have no row, column, or box conflicts. CI also runs TypeScript, unit tests, corpus validation, a production build, internal-link auditing, and page-quality auditing.',
        },
        {
          title: '5. Correct puzzles and refresh caches safely',
          body: 'When a reproducible puzzle issue is reported, the source JSON can be corrected and the full corpus validation rerun. Dated puzzle responses now require browser revalidation, while the service worker uses background refresh: cached puzzles remain available offline, and connected users can receive corrected data instead of keeping a one-year immutable copy.',
        },
        {
          title: '6. Keep guide roles distinct',
          body: 'The rules page explains structure and controls. The solving-tips page owns the complete start-to-finish workflow. The advanced-techniques page focuses on hidden singles, pairs, box-line reduction, and cross-grid deductions. Search intent and real user behavior inform updates, but nearby pages should not all target the same broad strategy phrase.',
        },
        {
          title: '7. Report a problem with enough detail to reproduce it',
          body: 'Include the puzzle date, difficulty, affected cell or grid, the conflict or dead end you observed, and device or browser details. We first reproduce the issue, then inspect the puzzle JSON, solution count, and interface state. Difficulty alone is not an error, but no solution, multiple solutions, inconsistent overlaps, or answer conflicts require correction.',
        },
      ];

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      {[articleJsonLd, breadcrumbJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`puzzle-methodology-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href={`/${normalizedLocale}`} className="hover:text-foreground">{isZh ? '首页' : 'Home'}</Link>
        <span aria-hidden>/</span>
        <Link href={`/${normalizedLocale}/about`} className="hover:text-foreground">{isZh ? '关于我们' : 'About'}</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{isZh ? '题目方法说明' : 'Puzzle methodology'}</span>
      </nav>

      <header className="rounded-2xl border bg-primary/5 p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          {isZh ? '透明度与质量控制' : 'Transparency and quality control'}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-6xl">
          {isZh ? '武士数独题目如何生成与验证' : 'How Samurai Sudoku Puzzles Are Generated and Validated'}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {isZh
            ? '本站使用程序生成和验证题目，但不会把“程序生成”当成自动正确的保证。每道公开题仍需通过结构、答案、重叠区、唯一解和部署检查；出现可复现问题时，也必须允许修正后的题目刷新到用户端。'
            : 'The site generates and validates puzzles programmatically, but generation alone is not treated as proof of correctness. Public puzzles must pass structural, solution, overlap, uniqueness, and deployment checks, and reproducible corrections must be able to reach players.'}
        </p>
      </header>

      <div className="mt-10 space-y-5">
        {sections.map((section) => (
          <section key={section.title} className="rounded-xl border bg-card p-5 md:p-6">
            <h2 className="text-2xl font-semibold">{section.title}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-2xl border bg-secondary/30 p-6">
        <h2 className="text-2xl font-semibold">{isZh ? '相关页面' : 'Related pages'}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link href={`/${normalizedLocale}/games/samurai`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
            {isZh ? '开始今日谜题' : "Play today's puzzle"}
          </Link>
          <Link href={`/${normalizedLocale}/games/samurai/solving-tips`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
            {isZh ? '查看通关技巧' : 'Read solving tips'}
          </Link>
          <Link href={`/${normalizedLocale}/contact`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
            {isZh ? '报告题目或界面问题' : 'Report a puzzle or interface issue'}
          </Link>
          <Link href={`/${normalizedLocale}/privacy`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
            {isZh ? '查看隐私政策' : 'Read the privacy policy'}
          </Link>
        </div>
      </section>
    </article>
  );
}
