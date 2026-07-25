import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pagePath = 'app/[locale]/sudoku-for-kids/page.tsx';

describe('Sudoku for Kids page contract', () => {
  it('publishes a useful localized learning page with structured data and internal links', () => {
    expect(existsSync(pagePath)).toBe(true);

    const source = readFileSync(pagePath, 'utf8');
    expect(source).toContain('Sudoku for Kids: Free Easy 4×4 Puzzle');
    expect(source).toContain('LearningResource');
    expect(source).toContain('FAQPage');
    expect(source).toContain('/games/samurai/daily');
    expect(source).toContain('/games/samurai/how-to-play');
    expect(source).toContain('/printable-samurai-sudoku');
    expect(source).toContain('/about/puzzle-methodology');
    expect(source).toContain('KidsSudoku4x4');
  });
});
