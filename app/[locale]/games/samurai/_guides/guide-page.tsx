import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { TrackedLink } from '@/components/analytics/TrackedLink';
import { isLocale, type Locale } from '@/i18n';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

type GuideKey =
  | 'beginners'
  | 'strategy'
  | 'paperPractice'
  | 'difficulty'
  | 'daily'
  | 'printable'
  | 'solver';

interface GuideItem {
  title: string;
  body: string;
}

interface GuideContent {
  title: string;
  description: string;
  intro: string;
  backLabel: string;
  items: GuideItem[];
  primaryCta: string;
  secondaryCta: string;
}

interface GuideDefinition {
  path: string;
  backHref: string;
  primaryHref: string;
  secondaryHref: string;
  keywords?: Record<Locale, string[]>;
  numbered?: boolean;
  content: Record<Locale, GuideContent>;
}

interface SamuraiGuidePageProps {
  guide: GuideKey;
  locale: string;
}

const guidePages: Record<GuideKey, GuideDefinition> = {
  daily: {
    path: '/games/samurai/daily',
    backHref: '/games/samurai',
    primaryHref: '/games/samurai',
    secondaryHref: '/games/samurai/archive',
    numbered: true,
    keywords: {
      en: ['daily samurai sudoku', 'daily sudoku challenge', 'samurai sudoku today', 'online samurai sudoku'],
      zh: ['每日武士数独', '今日数独', '在线武士数独', '每日逻辑游戏'],
    },
    content: {
      en: {
        title: 'Daily Samurai Sudoku',
        description:
          'Play the daily Samurai Sudoku challenge online, track local progress, and use the archive when you want another five-grid puzzle.',
        intro:
          'The daily puzzle is the main habit loop: one fresh Samurai Sudoku, five overlapping grids, local progress, notes, hints, and a dated archive when you want more practice.',
        backLabel: 'Back to game',
        items: [
          {
            title: 'Start with today, not the full archive',
            body: 'A single dated puzzle keeps practice focused. Finish today first, then choose another puzzle by difficulty if you still want more.',
          },
          {
            title: 'Use notes before guessing',
            body: 'Candidate notes are especially important on a five-grid board because each overlap placement can remove possibilities from two grids.',
          },
          {
            title: 'Build a repeatable streak',
            body: 'Daily practice works best when you repeat the same process: scan overlap boxes, fill singles, add notes, then return to the center grid.',
          },
          {
            title: 'Use the archive for missed days',
            body: 'Every public puzzle has a dated URL, so you can replay older boards, compare difficulty, and resume practice at your own pace.',
          },
        ],
        primaryCta: "Play today's puzzle",
        secondaryCta: 'Browse archive',
      },
      zh: {
        title: '每日武士数独',
        description: '在线挑战每日武士数独，保存本地进度；想继续练习时可进入日期归档题库。',
        intro: '每日题是最适合养成习惯的入口：一题新鲜的五宫重叠数独，支持本地进度、候选数、提示和日期归档。',
        backLabel: '返回游戏',
        items: [
          {
            title: '先完成今日题，不要一开始翻题库',
            body: '每日固定一题能让练习更聚焦。先完成今天的题，再按难度选择更多历史题。',
          },
          {
            title: '先做候选，不要猜',
            body: '五宫棋盘里候选数更重要，因为重叠区的一个数字可能同时排除两个网格里的可能。',
          },
          {
            title: '形成稳定打卡流程',
            body: '建议每次都按同样顺序练习：扫重叠宫、找唯一候选、添加候选数，再回到中心网格复查。',
          },
          {
            title: '用归档补练错过的日期',
            body: '每道公开题都有独立日期 URL，你可以重玩旧题、比较难度，并按自己的节奏继续练习。',
          },
        ],
        primaryCta: '开始今日谜题',
        secondaryCta: '浏览题库归档',
      },
    },
  },
  beginners: {
    path: '/games/samurai/beginners',
    backHref: '/games/samurai/how-to-play',
    primaryHref: '/games/samurai/difficulty/easy',
    secondaryHref: '/games/samurai/strategy-guide',
    keywords: {
      en: ['samurai sudoku for beginners', 'beginner samurai sudoku', 'easy samurai sudoku guide'],
      zh: ['武士数独入门', '武士数独新手', '简单武士数独教程'],
    },
    content: {
      en: {
        title: 'Samurai Sudoku for Beginners',
        description:
          'A beginner-friendly Samurai Sudoku guide covering the five-grid layout, overlap boxes, candidates, and how to start with easy puzzles.',
        intro:
          'If you can play regular Sudoku, Samurai Sudoku is not as strange as it looks. The key is learning to read five grids and four overlap zones together.',
        backLabel: 'Back to rules',
        items: [
          {
            title: 'Think of it as five regular Sudokus first',
            body: 'Each 9x9 grid still follows normal Sudoku rules. Do not let the large board intimidate you; first identify the boundaries of each grid.',
          },
          {
            title: 'Overlap boxes are the key',
            body: 'The four corner boxes of the center grid are shared with the corner grids. Numbers here affect two grids at the same time.',
          },
          {
            title: 'Start on Easy',
            body: 'Easy puzzles provide more givens, which helps you learn the five-grid structure before moving to Medium or Hard.',
          },
          {
            title: 'Do not rush to guess',
            body: 'When stuck, add candidate notes and check how rows, columns, boxes, and overlap zones remove possibilities.',
          },
        ],
        primaryCta: 'Start with Easy',
        secondaryCta: 'Read strategy guide',
      },
      zh: {
        title: '武士数独新手指南',
        description: '给新手的武士数独入门指南：理解五宫结构、重叠区、候选数和从简单题开始练习的方法。',
        intro: '如果你会普通数独，武士数独的核心并不陌生。关键是学会把五个网格和四个重叠区一起看。',
        backLabel: '返回规则说明',
        items: [
          {
            title: '先把它看成五个普通数独',
            body: '每个 9x9 网格仍然遵循普通数独规则。不要一开始就被大棋盘吓到，先找到每个网格的边界。',
          },
          {
            title: '重叠区是关键',
            body: '中心网格的四个角落 3x3 宫与四角网格共享。这里的数字同时影响两个网格，是新手最应该关注的区域。',
          },
          {
            title: '从简单难度开始',
            body: '简单题会给出更多线索，让你熟悉五宫结构。熟悉后再尝试中等和困难题。',
          },
          {
            title: '不要急着猜',
            body: '遇到卡住时先做候选数标记，检查行、列、宫和重叠区的排除关系。',
          },
        ],
        primaryCta: '从简单题开始',
        secondaryCta: '继续看策略指南',
      },
    },
  },
  strategy: {
    path: '/games/samurai/strategy-guide',
    backHref: '/games/samurai/how-to-play',
    primaryHref: '/games/samurai',
    secondaryHref: '/games/samurai/archive',
    numbered: true,
    keywords: {
      en: ['samurai sudoku strategy', 'samurai sudoku solving tips', 'how to solve samurai sudoku'],
      zh: ['武士数独技巧', '武士数独解题策略', '武士数独攻略'],
    },
    content: {
      en: {
        title: 'Samurai Sudoku Strategy Guide',
        description:
          'Learn a reliable Samurai Sudoku solving process: overlap boxes, candidates, hidden singles, and cross-grid deductions.',
        intro:
          'This is a repeatable process for daily practice: start with overlap boxes, build candidates, then use cross-grid logic to solve harder puzzles.',
        backLabel: 'Back to rules',
        items: [
          {
            title: 'Start with the whole-board view',
            body: 'Samurai Sudoku is not five separate puzzles. It is five grids sharing information. First inspect the four overlap boxes and note which two grids each one controls.',
          },
          {
            title: 'Place only justified digits',
            body: 'Begin with single candidates, then hidden singles: a digit that can appear in only one cell within a row, column, or box.',
          },
          {
            title: 'Recheck after every overlap placement',
            body: 'A number placed in an overlap box affects both the center grid and a corner grid. After each placement, scan the other grid for newly removed possibilities.',
          },
          {
            title: 'Use pairs on hard puzzles',
            body: 'When singles disappear, look for paired candidates in a row, column, or box. Pairs can remove candidates elsewhere and reopen the puzzle.',
          },
        ],
        primaryCta: "Play today's puzzle",
        secondaryCta: 'Browse archive',
      },
      zh: {
        title: '武士数独解题策略指南',
        description: '从重叠宫、候选数、唯一位置到跨网格联动，学习武士数独的稳定解题步骤。',
        intro: '这是一套适合日常练习的稳定流程：先找重叠宫，再做候选数，最后用跨网格联动推进困难题。',
        backLabel: '返回玩法规则',
        items: [
          {
            title: '先建立全局视角',
            body: '武士数独不是五道独立数独，而是五个共享信息的网格。先观察四个重叠 3x3 宫，标出它们同时影响哪两个网格。',
          },
          {
            title: '从确定候选开始',
            body: '每次只填有明确逻辑依据的数字。先找单一候选，再找某行、列或宫中只能放在一个位置的数字。',
          },
          {
            title: '重叠宫填完立刻复查',
            body: '重叠区域的一个数字会同时影响中心网格和角落网格。每次填入后，都回到另一个网格检查新排除的可能。',
          },
          {
            title: '困难题使用候选对',
            body: '当没有单一候选时，观察同一行、列或宫里的成对候选。候选对可以排除其他格子的可能，逐步打开局面。',
          },
        ],
        primaryCta: '开始今日谜题',
        secondaryCta: '浏览题库',
      },
    },
  },
  paperPractice: {
    path: '/games/samurai/paper-practice',
    backHref: '/games/samurai/archive',
    primaryHref: '/games/samurai/archive',
    secondaryHref: '/games/samurai/strategy-guide',
    keywords: {
      en: ['samurai sudoku paper practice', 'print samurai sudoku practice', 'paper sudoku notes'],
      zh: ['武士数独纸笔练习', '打印武士数独练习', '数独候选数纸笔'],
    },
    content: {
      en: {
        title: 'Samurai Sudoku Paper Practice Guide',
        description:
          'Use paper-style practice for Samurai Sudoku with candidate notes, overlap marking, difficulty choice, and review habits.',
        intro:
          'Paper-style practice is useful for slower reasoning. You can mark candidates carefully, track your logic, and review each step.',
        backLabel: 'Back to archive',
        items: [
          {
            title: 'Choose the right difficulty first',
            body: 'Start with Easy or Medium. Hard and Evil puzzles are better once candidates and overlap logic feel natural.',
          },
          {
            title: 'Leave room for candidates',
            body: 'Paper-style solving needs space for small notes inside empty cells. A larger page or landscape layout helps.',
          },
          {
            title: 'Mark overlap zones',
            body: 'Lightly mark the four shared 3x3 boxes so you remember to check both grids after each placement.',
          },
          {
            title: 'Review mistakes',
            body: 'If a contradiction appears, return to the last unsupported assumption and rebuild the candidate notes.',
          },
        ],
        primaryCta: 'Choose a puzzle',
        secondaryCta: 'Read solving strategy',
      },
      zh: {
        title: '武士数独纸笔练习指南',
        description: '用纸笔练习武士数独：候选数、重叠区标记、难度选择和复盘方法。',
        intro: '纸笔式练习适合深度思考。你可以更认真地标候选数、记录推理路径，并复盘每一步。',
        backLabel: '返回题库',
        items: [
          {
            title: '先选择合适难度',
            body: '从简单或中等开始。困难和 Evil 题更适合熟悉候选数和重叠区推理的玩家。',
          },
          {
            title: '留出候选数空间',
            body: '纸笔练习时，空格里要能写小候选数。使用较大页面或横向布局会更舒服。',
          },
          {
            title: '标记重叠区',
            body: '把四个共享 3x3 宫轻轻标出，有助于提醒自己跨网格检查。',
          },
          {
            title: '复盘错误路径',
            body: '如果出现矛盾，回到最近一次无依据猜测，重新检查候选数。',
          },
        ],
        primaryCta: '选择一道题',
        secondaryCta: '查看解题策略',
      },
    },
  },
  difficulty: {
    path: '/games/samurai/difficulty-guide',
    backHref: '/games/samurai',
    primaryHref: '/games/samurai/difficulty/easy',
    secondaryHref: '/games/samurai/strategy-guide',
    keywords: {
      en: ['samurai sudoku difficulty', 'hard samurai sudoku', 'evil samurai sudoku'],
      zh: ['武士数独难度', '困难武士数独', 'Evil 武士数独'],
    },
    content: {
      en: {
        title: 'Samurai Sudoku Difficulty Guide',
        description:
          'Understand Easy, Medium, Hard, and Evil Samurai Sudoku difficulty levels and choose the right practice path.',
        intro:
          'Choosing the right difficulty keeps practice sustainable. Start with structure, then add candidates and cross-grid reasoning as you improve.',
        backLabel: 'Back to game',
        items: [
          {
            title: 'Easy',
            body: 'Best for first-time Samurai Sudoku players. More givens help you learn the five-grid layout and overlap boxes.',
          },
          {
            title: 'Medium',
            body: 'Best once the rules feel natural. You will use more candidates and cross-grid eliminations.',
          },
          {
            title: 'Hard',
            body: 'Best for players comfortable with candidates, hidden singles, and candidate pairs.',
          },
          {
            title: 'Evil',
            body: 'Best for long reasoning sessions. Expect careful note management and patient review.',
          },
        ],
        primaryCta: 'Start with Easy',
        secondaryCta: 'Read strategy guide',
      },
      zh: {
        title: '武士数独难度选择指南',
        description: '了解 Easy、Medium、Hard、Evil 武士数独难度差异，选择适合自己的练习路线。',
        intro: '选择合适难度能让练习更稳定。先用简单题熟悉结构，再逐步增加候选数和跨网格推理。',
        backLabel: '返回游戏',
        items: [
          {
            title: 'Easy',
            body: '适合第一次接触武士数独，给出数字更多，重点是熟悉五个网格和重叠宫。',
          },
          {
            title: 'Medium',
            body: '适合已经理解规则的玩家，需要更多候选数和跨网格排除。',
          },
          {
            title: 'Hard',
            body: '适合稳定使用候选数、唯一位置和候选对的玩家。',
          },
          {
            title: 'Evil',
            body: '适合想要长时间推理挑战的玩家，需要耐心复盘和更严格的候选管理。',
          },
        ],
        primaryCta: '从 Easy 开始',
        secondaryCta: '查看策略指南',
      },
    },
  },
  printable: {
    path: '/games/samurai/printable',
    backHref: '/games/samurai/paper-practice',
    primaryHref: '/games/samurai/archive',
    secondaryHref: '/games/samurai/paper-practice',
    numbered: true,
    keywords: {
      en: ['printable samurai sudoku', 'samurai sudoku pdf', 'printable sudoku puzzles', 'samurai sudoku with answers'],
      zh: ['可打印武士数独', '武士数独 PDF', '打印数独题', '武士数独答案'],
    },
    content: {
      en: {
        title: 'Printable Samurai Sudoku',
        description:
          'Use Samurai Sudoku as printable logic practice: choose a dated puzzle, print cleanly from the browser, and keep answer checking online.',
        intro:
          'Printable Samurai Sudoku works best when the page is treated as a practice sheet: choose the right difficulty, print the puzzle view, solve slowly, then return online to check progress.',
        backLabel: 'Back to paper practice',
        items: [
          {
            title: 'Choose the difficulty before printing',
            body: 'Easy and Medium are better for classrooms or casual practice. Hard and Evil are better for long sessions where candidate notes matter.',
          },
          {
            title: 'Print one dated puzzle at a time',
            body: 'A dated URL makes the sheet easy to file, share, and revisit. Use the archive to pick the exact board you want to print.',
          },
          {
            title: 'Leave space for candidates',
            body: 'Samurai Sudoku has 369 visible cells, so paper solving needs generous page size and room for small candidate notes.',
          },
          {
            title: 'Return online for hints and checking',
            body: 'After paper solving, open the same dated puzzle online to use conflict highlighting, hints, and completion tracking.',
          },
        ],
        primaryCta: 'Choose a printable puzzle',
        secondaryCta: 'Read paper practice guide',
      },
      zh: {
        title: '可打印武士数独',
        description: '把武士数独作为可打印逻辑练习：选择日期题目，在浏览器中打印，并回到线上检查进度。',
        intro: '可打印武士数独最适合作为纸笔练习单：先选合适难度，打印题面，慢慢推理，再回到线上检查和继续。',
        backLabel: '返回纸笔练习',
        items: [
          {
            title: '打印前先选难度',
            body: '简单和中等适合课堂、休闲或老人练习；困难和 Evil 更适合需要候选数的长时间推理。',
          },
          {
            title: '一次打印一道日期题',
            body: '日期 URL 方便归档、分享和复盘。你可以在题库里选择具体某一天的棋盘打印。',
          },
          {
            title: '给候选数留空间',
            body: '武士数独有 369 个可见格，纸笔解题需要更大的页面和足够空间记录小候选数。',
          },
          {
            title: '回到线上检查和提示',
            body: '纸上推理后，打开同一日期题的线上版本，可使用冲突高亮、提示和完成状态记录。',
          },
        ],
        primaryCta: '选择可打印题目',
        secondaryCta: '查看纸笔练习指南',
      },
    },
  },
  solver: {
    path: '/games/samurai/solver',
    backHref: '/games/samurai/strategy-guide',
    primaryHref: '/games/samurai',
    secondaryHref: '/games/samurai/how-to-play',
    numbered: true,
    keywords: {
      en: ['samurai sudoku solver', 'samurai sudoku hint', 'samurai sudoku help', 'solve samurai sudoku'],
      zh: ['武士数独求解器', '武士数独提示', '武士数独解题帮助', '武士数独怎么解'],
    },
    content: {
      en: {
        title: 'Samurai Sudoku Solver & Hint Guide',
        description:
          'Use solver-style Samurai Sudoku help without spoiling the board: candidates, overlap checks, hints, and conflict review.',
        intro:
          'A useful solver should teach the next logical step, not simply dump an answer. Use this process with the in-game hint, notes, and conflict tools.',
        backLabel: 'Back to strategy',
        items: [
          {
            title: 'Check whether the stuck cell belongs to one or two grids',
            body: 'Overlap cells receive constraints from both grids. Before filling a number, confirm the row, column, and box rules in each connected grid.',
          },
          {
            title: 'List candidates before asking for a hint',
            body: 'Candidate notes make a hint more useful because you can see which digit was eliminated and why the next move is legal.',
          },
          {
            title: 'Use conflicts as a diagnostic tool',
            body: 'If a conflict appears, do not continue guessing. Clear the unsupported placement and return to the last candidate change.',
          },
          {
            title: 'Prefer explanations over full solutions',
            body: 'The fastest way to improve is to understand the next deduction. Full answers finish one puzzle, but explanations improve the next ten.',
          },
        ],
        primaryCta: 'Use hints in the game',
        secondaryCta: 'Review the rules',
      },
      zh: {
        title: '武士数独求解器与提示指南',
        description: '用求解器式思路获得武士数独帮助：候选数、重叠区检查、提示和冲突复盘，而不是直接看答案。',
        intro: '好的求解器应该教你下一步逻辑，而不是直接给完整答案。你可以配合游戏内提示、候选数和冲突检查使用这套流程。',
        backLabel: '返回解题策略',
        items: [
          {
            title: '先判断卡住的格子属于一个还是两个网格',
            body: '重叠格同时受两个网格约束。填数前要同时检查相关网格里的行、列和 3×3 宫规则。',
          },
          {
            title: '请求提示前先列候选',
            body: '先写候选数，提示才更有价值：你能看到某个数字为什么被排除，以及下一步为什么成立。',
          },
          {
            title: '把冲突当成诊断工具',
            body: '如果出现冲突，不要继续猜。清除没有逻辑依据的填数，回到上一次候选变化重新检查。',
          },
          {
            title: '优先理解解释，而不是完整答案',
            body: '真正提升解题能力的是理解下一步推理。完整答案只解决一题，解释能帮助你解决后面的题。',
          },
        ],
        primaryCta: '在游戏中使用提示',
        secondaryCta: '复习玩法规则',
      },
    },
  },
};

function normalizeLocale(locale: string): Locale {
  return isLocale(locale) ? locale : 'en';
}

function localizedHref(locale: Locale, href: string) {
  return `/${locale}${href}`;
}

export function generateGuideMetadata(guide: GuideKey, locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const definition = guidePages[guide];
  const content = definition.content[normalizedLocale];
  const canonical = buildLocalizedUrl(normalizedLocale, definition.path);

  return {
    title: content.title,
    description: content.description,
    keywords: definition.keywords?.[normalizedLocale],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(definition.path),
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url: canonical,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: content.title,
      description: content.description,
    },
  };
}

function getPrimaryEventName(guide: GuideKey) {
  if (guide === 'daily') return 'daily_puzzle_intent_click';
  if (guide === 'printable') return 'printable_intent_click';
  if (guide === 'solver') return 'solver_intent_click';
  return 'samurai_guide_primary_cta_click';
}

export function SamuraiGuidePage({ guide, locale }: SamuraiGuidePageProps) {
  const normalizedLocale = normalizeLocale(locale);
  const definition = guidePages[guide];
  const content = definition.content[normalizedLocale];
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${definition.path}`);
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: content.description,
    mainEntityOfPage: pageUrl,
    inLanguage: normalizedLocale === 'zh' ? 'zh-CN' : 'en-US',
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
      {
        '@type': 'ListItem',
        position: 1,
        name: normalizedLocale === 'zh' ? '首页' : 'Home',
        item: buildAbsoluteUrl(`/${normalizedLocale}`),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Samurai Sudoku',
        item: buildAbsoluteUrl(`/${normalizedLocale}/games/samurai`),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: content.title,
        item: pageUrl,
      },
    ],
  };
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: content.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title,
      description: item.body,
    })),
  };

  return (
    <>
      <Script
        id={`samurai-guide-article-jsonld-${guide}-${normalizedLocale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id={`samurai-guide-breadcrumb-jsonld-${guide}-${normalizedLocale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id={`samurai-guide-itemlist-jsonld-${guide}-${normalizedLocale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <article className="container mx-auto max-w-3xl px-4 py-10">
        <Link
          href={localizedHref(normalizedLocale, definition.backHref)}
          className="text-primary hover:underline"
        >
          ← {content.backLabel}
        </Link>
        <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {content.title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{content.intro}</p>
        <section className="mt-10 space-y-5">
          {content.items.map((item, index) => (
            <section key={item.title} className="rounded-lg border bg-background p-6">
              <h2 className="text-xl font-semibold">
                {definition.numbered ? `${index + 1}. ` : ''}
                {item.title}
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">{item.body}</p>
            </section>
          ))}
        </section>
        <footer className="mt-10 flex flex-wrap gap-3">
          <TrackedLink
            href={localizedHref(normalizedLocale, definition.primaryHref)}
            eventName={getPrimaryEventName(guide)}
            eventProperties={{
              locale: normalizedLocale,
              guide,
              destination: definition.primaryHref,
            }}
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {content.primaryCta}
          </TrackedLink>
          <TrackedLink
            href={localizedHref(normalizedLocale, definition.secondaryHref)}
            eventName="samurai_guide_secondary_cta_click"
            eventProperties={{
              locale: normalizedLocale,
              guide,
              destination: definition.secondaryHref,
            }}
            className="rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-primary/10"
          >
            {content.secondaryCta}
          </TrackedLink>
        </footer>
      </article>
    </>
  );
}
