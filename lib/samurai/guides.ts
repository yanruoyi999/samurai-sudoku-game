export type SamuraiGuideKey =
  | 'what-is'
  | 'how-to-play'
  | 'beginners'
  | 'first-move'
  | 'choose-difficulty'
  | 'solving-tips'
  | 'strategy-guide'
  | 'overlap-boxes'
  | 'candidate-notes'
  | 'evil-solving-path'
  | 'solver';

type GuideLocale = 'en' | 'zh';

interface SamuraiGuideCopy {
  title: string;
  description: string;
  role: string;
  primaryKeyword: string;
}

export interface SamuraiGuideDefinition {
  key: SamuraiGuideKey;
  slug: string;
  order: number;
  en: SamuraiGuideCopy;
  zh: SamuraiGuideCopy;
}

export interface LocalizedSamuraiGuide extends SamuraiGuideCopy {
  key: SamuraiGuideKey;
  slug: string;
  href: string;
  order: number;
}

export const SAMURAI_GUIDES: readonly SamuraiGuideDefinition[] = [
  {
    key: 'what-is',
    slug: 'what-is-samurai-sudoku',
    order: 10,
    en: {
      title: 'What is Samurai Sudoku?',
      description: 'Understand the five-grid layout, shared 3×3 boxes, and how it differs from regular Sudoku.',
      role: 'Definition and visual layout',
      primaryKeyword: 'what is samurai sudoku',
    },
    zh: {
      title: '什么是武士数独？',
      description: '看懂五宫布局、共享的 3×3 宫，以及它和普通数独的区别。',
      role: '定义与布局图解',
      primaryKeyword: '什么是武士数独',
    },
  },
  {
    key: 'how-to-play',
    slug: 'how-to-play',
    order: 20,
    en: {
      title: 'How to play Samurai Sudoku',
      description: 'Learn the rules, controls, overlap behavior, and the basic solving loop.',
      role: 'Rules and controls',
      primaryKeyword: 'how to play samurai sudoku',
    },
    zh: {
      title: '武士数独怎么玩',
      description: '学习完整规则、操作方式、重叠区作用和基础解题循环。',
      role: '规则与操作',
      primaryKeyword: '武士数独怎么玩',
    },
  },
  {
    key: 'beginners',
    slug: 'beginners',
    order: 30,
    en: {
      title: 'Samurai Sudoku beginner guide',
      description: 'Follow a beginner-friendly learning path from layout basics to your first completed puzzle.',
      role: 'Beginner learning path',
      primaryKeyword: 'samurai sudoku beginner guide',
    },
    zh: {
      title: '武士数独新手入门',
      description: '从布局基础到完成第一题，按适合新手的顺序逐步练习。',
      role: '新手学习路径',
      primaryKeyword: '武士数独新手入门',
    },
  },
  {
    key: 'first-move',
    slug: 'first-move-strategy',
    order: 40,
    en: {
      title: 'Samurai Sudoku first move',
      description: 'Select a cell before entering a number and find a productive opening around overlap boxes.',
      role: 'Opening interaction and first deduction',
      primaryKeyword: 'samurai sudoku first move',
    },
    zh: {
      title: '武士数独第一步攻略',
      description: '先选格再输入数字，并在重叠区附近找到有效的开局落点。',
      role: '开局操作与第一步推理',
      primaryKeyword: '武士数独第一步',
    },
  },
  {
    key: 'choose-difficulty',
    slug: 'choose-difficulty',
    order: 50,
    en: {
      title: 'Choose Samurai Sudoku difficulty',
      description: 'Compare Easy, Medium, Hard, Evil, New Game, and the puzzle archive before choosing.',
      role: 'Difficulty and puzzle selection',
      primaryKeyword: 'samurai sudoku difficulty levels',
    },
    zh: {
      title: '武士数独难度怎么选',
      description: '分清简单、中等、困难、Evil、新游戏和全部题库分别适合什么场景。',
      role: '难度与题目选择',
      primaryKeyword: '武士数独难度怎么选',
    },
  },
  {
    key: 'solving-tips',
    slug: 'solving-tips',
    order: 60,
    en: {
      title: 'Samurai Sudoku solving tips',
      description: 'Use the primary start-to-finish workflow for overlaps, singles, notes, rescanning, and review.',
      role: 'Primary solving hub',
      primaryKeyword: 'samurai sudoku solving tips',
    },
    zh: {
      title: '武士数独通关技巧',
      description: '用重叠宫、唯一候选、候选数、复查和复盘建立从开局到通关的完整流程。',
      role: '通关技巧主入口',
      primaryKeyword: '武士数独通关技巧',
    },
  },
  {
    key: 'strategy-guide',
    slug: 'strategy-guide',
    order: 70,
    en: {
      title: 'Advanced Samurai Sudoku techniques',
      description: 'Study intermediate and advanced deductions after the basic solving workflow feels natural.',
      role: 'Intermediate and advanced techniques',
      primaryKeyword: 'advanced samurai sudoku techniques',
    },
    zh: {
      title: '武士数独高级技巧',
      description: '掌握基础通关流程后，继续学习中高级候选与跨网格推理技术。',
      role: '中高级推理技术',
      primaryKeyword: '武士数独高级技巧',
    },
  },
  {
    key: 'overlap-boxes',
    slug: 'overlap-boxes',
    order: 80,
    en: {
      title: 'Samurai Sudoku overlap boxes',
      description: 'Understand the four shared 3×3 regions that connect the center and corner grids.',
      role: 'Overlap-box specialist guide',
      primaryKeyword: 'samurai sudoku overlap boxes',
    },
    zh: {
      title: '武士数独重叠宫详解',
      description: '理解连接中央网格和四个角落网格的四个共享 3×3 区域。',
      role: '重叠宫专项指南',
      primaryKeyword: '武士数独重叠宫',
    },
  },
  {
    key: 'candidate-notes',
    slug: 'candidate-notes',
    order: 90,
    en: {
      title: 'Samurai Sudoku candidate notes',
      description: 'Use pencil marks without filling the whole board with stale or noisy candidates.',
      role: 'Candidate-note specialist guide',
      primaryKeyword: 'samurai sudoku candidate notes',
    },
    zh: {
      title: '武士数独候选数技巧',
      description: '学习如何记录候选，同时避免整盘候选过期或信息过载。',
      role: '候选数专项指南',
      primaryKeyword: '武士数独候选数',
    },
  },
  {
    key: 'evil-solving-path',
    slug: 'evil-solving-path',
    order: 100,
    en: {
      title: 'Evil Samurai Sudoku strategy',
      description: 'Follow a disciplined workflow for hard and Evil boards without unsupported guessing.',
      role: 'Hard and Evil specialist workflow',
      primaryKeyword: 'evil samurai sudoku strategy',
    },
    zh: {
      title: 'Evil 武士数独解题路径',
      description: '用严格的候选、重叠区复查和回退流程推进困难与 Evil 题。',
      role: '困难与 Evil 专项路径',
      primaryKeyword: 'Evil 武士数独解题路径',
    },
  },
  {
    key: 'solver',
    slug: 'solver',
    order: 110,
    en: {
      title: 'Samurai Sudoku hint solver',
      description: 'Understand how focused hints identify the next logical step without revealing a full solution.',
      role: 'Hint and solver behavior',
      primaryKeyword: 'samurai sudoku hint solver',
    },
    zh: {
      title: '武士数独提示与求解',
      description: '了解提示如何解释下一步逻辑，而不是直接展示完整答案。',
      role: '提示与求解行为',
      primaryKeyword: '武士数独提示求解',
    },
  },
] as const;

function normalizeGuideLocale(locale: string): GuideLocale {
  return locale === 'zh' ? 'zh' : 'en';
}

export function getSamuraiGuide(locale: string, key: SamuraiGuideKey): LocalizedSamuraiGuide {
  const guide = SAMURAI_GUIDES.find((item) => item.key === key);
  if (!guide) {
    throw new Error(`Unknown Samurai guide key: ${key}`);
  }

  const normalizedLocale = normalizeGuideLocale(locale);
  const copy = guide[normalizedLocale];

  return {
    key: guide.key,
    slug: guide.slug,
    href: `/${normalizedLocale}/games/samurai/${guide.slug}`,
    order: guide.order,
    ...copy,
  };
}

export function getSamuraiLearningPath(locale: string): LocalizedSamuraiGuide[] {
  return [...SAMURAI_GUIDES]
    .sort((left, right) => left.order - right.order)
    .map((guide) => getSamuraiGuide(locale, guide.key));
}
