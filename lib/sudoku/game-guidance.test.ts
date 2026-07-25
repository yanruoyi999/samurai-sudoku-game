import { describe, expect, it } from 'vitest';

import { getGameGuidanceLinks, getNextDifficulty } from './game-guidance';

describe('getNextDifficulty', () => {
  it('progresses through easy, medium, hard, and stops at evil', () => {
    expect(getNextDifficulty('easy')).toBe('medium');
    expect(getNextDifficulty('medium')).toBe('hard');
    expect(getNextDifficulty('hard')).toBe('evil');
    expect(getNextDifficulty('evil')).toBeNull();
  });

  it('falls back to easy when difficulty is missing', () => {
    expect(getNextDifficulty(null)).toBe('easy');
  });
});

describe('getGameGuidanceLinks', () => {
  it('returns localized Chinese guide links', () => {
    expect(getGameGuidanceLinks('zh').map((link) => link.href)).toEqual([
      '/zh/games/samurai/solving-tips',
      '/zh/games/samurai/first-move-strategy',
      '/zh/games/samurai/candidate-notes',
      '/zh/games/samurai/overlap-boxes',
    ]);
  });

  it('falls back to English copy for unknown locales', () => {
    const links = getGameGuidanceLinks('fr');

    expect(links[0].href).toBe('/en/games/samurai/solving-tips');
    expect(links[0].label).toBe('Solving tips');
  });
});
