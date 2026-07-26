import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pagePath = 'app/[locale]/sudoku-for-kids/resources/page.tsx';

describe('Kids Sudoku parent and teacher resources page contract', () => {
  it('provides actionable teaching and parent guidance', () => {
    expect(existsSync(pagePath)).toBe(true);
    const source = readFileSync(pagePath, 'utf8').toLowerCase();
    expect(source).toContain('10-minute');
    expect(source).toContain('parent prompts');
    expect(source).toContain('differentiation');
    expect(source).toContain('progression');
    expect(source).toContain('privacy');
    expect(source).toContain('learningresource');
    expect(source).toContain('faqpage');
  });

  it('links throughout the Kids Sudoku cluster', () => {
    const source = readFileSync(pagePath, 'utf8');
    expect(source).toContain('/sudoku-for-kids/printable');
    expect(source).toContain('/sudoku-for-kids/answers');
    expect(source).toContain('/sudoku-for-kids/6x6');
    expect(source).toContain('/sudoku-for-kids/worksheet-generator');
    expect(source).toContain('/sudoku-for-kids');
  });
});
