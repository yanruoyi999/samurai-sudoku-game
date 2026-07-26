import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pagePath = 'app/[locale]/sudoku-for-kids/answers/page.tsx';

describe('Sudoku for Kids answer key page contract', () => {
  it('targets answer-key intent without competing with the broad hub', () => {
    expect(existsSync(pagePath)).toBe(true);
    const source = readFileSync(pagePath, 'utf8');
    expect(source).toContain('Sudoku for Kids Answer Keys');
    expect(source).toContain('CollectionPage');
    expect(source).toContain('ItemList');
    expect(source).toContain('showSolution');
  });

  it('connects back to worksheets, the hub, and teaching resources', () => {
    const source = readFileSync(pagePath, 'utf8');
    expect(source).toContain('/sudoku-for-kids/printable');
    expect(source).toContain('/sudoku-for-kids/resources');
    expect(source).toContain('/sudoku-for-kids');
  });
});
