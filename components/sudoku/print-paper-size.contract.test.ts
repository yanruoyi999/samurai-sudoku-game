import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const generatorPaths = [
  'components/sudoku/PrintableSudokuGenerator.tsx',
  'components/sudoku/BlankSudokuGridGenerator.tsx',
] as const;

describe('print paper size controls', () => {
  it.each(generatorPaths)('%s applies the selected paper size to @page CSS', (componentPath) => {
    const source = readFileSync(componentPath, 'utf8');

    expect(source).toContain('PrintablePageStyle');
    expect(source).toContain('<PrintablePageStyle paperSize={paperSize} />');
  });
});
