import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pagePath = 'app/[locale]/sudoku-for-kids/page.tsx';

describe('Sudoku for Kids page contract', () => {
  it('keeps the broad keyword hub and structured learning data', () => {
    expect(existsSync(pagePath)).toBe(true);

    const source = readFileSync(pagePath, 'utf8');
    expect(source).toContain('Sudoku for Kids: Free Easy 4×4 Puzzle');
    expect(source).toContain('LearningResource');
    expect(source).toContain('FAQPage');
    expect(source).toContain('KidsSudoku4x4');
  });

  it('links to the complete kids sudoku product cluster', () => {
    const source = readFileSync(pagePath, 'utf8');
    expect(source).toContain('/sudoku-for-kids/printable');
    expect(source).toContain('/sudoku-for-kids/answers');
    expect(source).toContain('/sudoku-for-kids/6x6');
    expect(source).toContain('/sudoku-for-kids/worksheet-generator');
    expect(source).toContain('/sudoku-for-kids/resources');
  });

  it('covers parent, kindergarten, worksheet, and classroom long-tail intent', () => {
    const source = readFileSync(pagePath, 'utf8').toLowerCase();
    expect(source).toContain('sudoku for 5 year olds');
    expect(source).toContain('kindergarten');
    expect(source).toContain('sudoku worksheets for kids');
    expect(source).toContain('classroom');
    expect(source).toContain('no name, email, or child profile');
    expect(source).not.toContain('type="email"');
  });
});
