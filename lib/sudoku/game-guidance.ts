import type { Difficulty } from './types';

export interface GameGuidanceLink {
  key: 'solving-tips' | 'first-move' | 'candidate-notes' | 'overlap-boxes';
  href: string;
  label: string;
  description: string;
}

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'evil'];

const COPY = {
  en: [
    {
      key: 'solving-tips',
      path: '/games/samurai/solving-tips',
      label: 'Solving tips',
      description: 'Follow the complete path from first move to finish.',
    },
    {
      key: 'first-move',
      path: '/games/samurai/first-move-strategy',
      label: 'First move guide',
      description: 'Select a cell first and learn where to begin.',
    },
    {
      key: 'candidate-notes',
      path: '/games/samurai/candidate-notes',
      label: 'Candidate notes',
      description: 'Use notes when singles stop appearing.',
    },
    {
      key: 'overlap-boxes',
      path: '/games/samurai/overlap-boxes',
      label: 'Overlap boxes',
      description: 'Understand the shared 3x3 regions that connect two grids.',
    },
  ],
  zh: [
    {
      key: 'solving-tips',
      path: '/games/samurai/solving-tips',
      label: '通关技巧',
      description: '从第一步到完成，按完整流程继续推进。',
    },
    {
      key: 'first-move',
      path: '/games/samurai/first-move-strategy',
      label: '第一步攻略',
      description: '先选空格，再判断应该从哪里开始。',
    },
    {
      key: 'candidate-notes',
      path: '/games/samurai/candidate-notes',
      label: '候选数技巧',
      description: '唯一候选消失时，用笔记缩小范围。',
    },
    {
      key: 'overlap-boxes',
      path: '/games/samurai/overlap-boxes',
      label: '重叠宫详解',
      description: '理解同时连接两个网格的共享 3x3 区域。',
    },
  ],
} as const;

export function getNextDifficulty(difficulty: Difficulty | null | undefined): Difficulty | null {
  if (!difficulty) return 'easy';

  const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
  const nextDifficulty = DIFFICULTY_ORDER[currentIndex + 1];

  return nextDifficulty ?? null;
}

export function getGameGuidanceLinks(locale: string): GameGuidanceLink[] {
  const normalizedLocale = locale === 'zh' ? 'zh' : 'en';

  return COPY[normalizedLocale].map((link) => ({
    key: link.key,
    href: `/${normalizedLocale}${link.path}`,
    label: link.label,
    description: link.description,
  }));
}
