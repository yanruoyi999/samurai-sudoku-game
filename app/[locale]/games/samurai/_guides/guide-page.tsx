import type { Metadata } from 'next';
import Link from 'next/link';

import { isLocale, locales, type Locale } from '@/i18n';
import { buildAbsoluteUrl } from '@/lib/site-url';

type GuideKey = 'beginners' | 'strategy' | 'paperPractice' | 'difficulty';

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
  numbered?: boolean;
  content: Record<Locale, GuideContent>;
}

interface SamuraiGuidePageProps {
  guide: GuideKey;
  locale: string;
}

const guidePages: Record<GuideKey, GuideDefinition> = {
  beginners: {
    path: '/games/samurai/beginners',
    backHref: '/games/samurai/how-to-play',
    primaryHref: '/games/samurai/difficulty/easy',
    secondaryHref: '/games/samurai/strategy-guide',
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
  const canonical = buildAbsoluteUrl(localizedHref(normalizedLocale, definition.path));

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(
          locales.map((loc) => [loc, buildAbsoluteUrl(localizedHref(loc, definition.path))]),
        ),
        'x-default': buildAbsoluteUrl(localizedHref('en', definition.path)),
      },
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url: canonical,
      type: 'article',
    },
  };
}

export function SamuraiGuidePage({ guide, locale }: SamuraiGuidePageProps) {
  const normalizedLocale = normalizeLocale(locale);
  const definition = guidePages[guide];
  const content = definition.content[normalizedLocale];

  return (
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
        <Link
          href={localizedHref(normalizedLocale, definition.primaryHref)}
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {content.primaryCta}
        </Link>
        <Link
          href={localizedHref(normalizedLocale, definition.secondaryHref)}
          className="rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-primary/10"
        >
          {content.secondaryCta}
        </Link>
      </footer>
    </article>
  );
}
