import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pagePath = 'app/[locale]/sudoku-for-kids/printable/page.tsx';

describe('printable Sudoku for Kids page contract', () => {
  it('targets printable worksheet intent with useful structured data', () => {
    expect(existsSync(pagePath)).toBe(true);
    const source = readFileSync(pagePath, 'utf8');
    expect(source).toContain('Sudoku for Kids Printable Worksheets');
    expect(source).toContain('LearningResource');
    expect(source).toContain('ItemList');
    expect(source).toContain('KidsSudokuPrintGrid');
    expect(source).toContain('KidsPrintButton');
  });

  it('renders two worksheets per level and connects answers and generator', () => {
    const source = readFileSync(pagePath, 'utf8');
    expect(source).toContain("['easy', 'medium', 'challenge']");
    expect(source).toContain('slice(0, 2)');
    expect(source).toContain('/sudoku-for-kids/answers');
    expect(source).toContain('/sudoku-for-kids/worksheet-generator');
    expect(source).toContain('/sudoku-for-kids');
    expect(source).toContain('No signup or email');
  });
});
