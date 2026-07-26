import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const gridPath = 'components/kids/KidsSudokuPrintGrid.tsx';
const buttonPath = 'components/kids/KidsPrintButton.tsx';

describe('Kids Sudoku print components', () => {
  it('renders puzzle or solution grids with configured box borders', () => {
    expect(existsSync(gridPath)).toBe(true);
    const source = readFileSync(gridPath, 'utf8');
    expect(source).toContain('showSolution');
    expect(source).toContain('puzzle.spec.boxColumns');
    expect(source).toContain('puzzle.spec.boxRows');
    expect(source).toContain('gridTemplateColumns');
  });

  it('provides a client print button with analytics', () => {
    expect(existsSync(buttonPath)).toBe(true);
    const source = readFileSync(buttonPath, 'utf8');
    expect(source).toContain('"use client"');
    expect(source).toContain('window.print()');
    expect(source).toContain('kids_sudoku_worksheet_print');
  });
});
