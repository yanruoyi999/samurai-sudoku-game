import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pagePath = 'app/[locale]/sudoku-for-kids/6x6/page.tsx';

describe('6x6 Sudoku for Kids page contract', () => {
  it('targets 6x6 intent and explains 2x3 boxes', () => {
    expect(existsSync(pagePath)).toBe(true);
    const source = readFileSync(pagePath, 'utf8');
    expect(source).toContain('6×6 Sudoku for Kids');
    expect(source).toContain('2×3');
    expect(source).toContain('KidsSudoku6x6');
    expect(source).toContain('LearningResource');
    expect(source).toContain('FAQPage');
  });

  it('offers an easier fallback and teacher worksheet next step', () => {
    const source = readFileSync(pagePath, 'utf8');
    expect(source).toContain('/sudoku-for-kids');
    expect(source).toContain('/sudoku-for-kids/printable');
    expect(source).toContain('/sudoku-for-kids/worksheet-generator');
  });
});
