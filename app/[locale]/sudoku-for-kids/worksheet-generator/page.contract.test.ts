import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pagePath = 'app/[locale]/sudoku-for-kids/worksheet-generator/page.tsx';

describe('teacher Sudoku worksheet generator page contract', () => {
  it('targets worksheet generator and teacher intent', () => {
    expect(existsSync(pagePath)).toBe(true);
    const source = readFileSync(pagePath, 'utf8');
    expect(source).toContain('Sudoku Worksheet Generator for Kids');
    expect(source).toContain('KidsWorksheetGenerator');
    expect(source).toContain('LearningResource');
    expect(source).toContain('FAQPage');
  });

  it('links to the hub, printable set, answers, 6x6, and resources', () => {
    const source = readFileSync(pagePath, 'utf8');
    expect(source).toContain('/sudoku-for-kids/printable');
    expect(source).toContain('/sudoku-for-kids/answers');
    expect(source).toContain('/sudoku-for-kids/6x6');
    expect(source).toContain('/sudoku-for-kids/resources');
    expect(source).toContain('/sudoku-for-kids');
  });
});
