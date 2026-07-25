import { describe, expect, it } from 'vitest';

import { SAMURAI_GUIDES, getSamuraiLearningPath } from './guides';

describe('Samurai guide registry', () => {
  it('uses unique slugs and primary keywords in each locale', () => {
    const slugs = SAMURAI_GUIDES.map((guide) => guide.slug);
    const enKeywords = SAMURAI_GUIDES.map((guide) => guide.en.primaryKeyword);
    const zhKeywords = SAMURAI_GUIDES.map((guide) => guide.zh.primaryKeyword);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(enKeywords).size).toBe(enKeywords.length);
    expect(new Set(zhKeywords).size).toBe(zhKeywords.length);
  });

  it('orders the core learning path from definition to advanced help', () => {
    expect(getSamuraiLearningPath('zh').map((guide) => guide.key)).toEqual([
      'what-is',
      'how-to-play',
      'beginners',
      'first-move',
      'choose-difficulty',
      'solving-tips',
      'strategy-guide',
      'overlap-boxes',
      'candidate-notes',
      'evil-solving-path',
      'solver',
    ]);
  });

  it('falls back to English localization for unsupported locales', () => {
    const first = getSamuraiLearningPath('fr')[0];

    expect(first.href).toBe('/en/games/samurai/what-is-samurai-sudoku');
    expect(first.title).toBe('What is Samurai Sudoku?');
  });
});
