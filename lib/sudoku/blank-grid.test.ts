import { describe, expect, it } from 'vitest';

import {
  buildBlankSudokuGridSvg,
  getBlankGridFileStem,
  type BlankSudokuGridTemplate,
} from '@/lib/sudoku/blank-grid';

describe('blank Sudoku grid SVG generator', () => {
  it.each([
    ['4x4', 10],
    ['6x6', 14],
    ['9x9', 20],
  ] as const)('builds a complete %s grid', (template, expectedLines) => {
    const svg = buildBlankSudokuGridSvg({ template });

    expect(svg).toContain('<svg');
    expect(svg).toContain(`Blank ${template} Sudoku grid`);
    expect(svg.match(/<line /g)).toHaveLength(expectedLines);
    expect(svg).not.toContain('undefined');
  });

  it('builds five overlapping 9x9 boards for Samurai Sudoku', () => {
    const svg = buildBlankSudokuGridSvg({ template: 'samurai', lineWeight: 'bold' });

    expect(svg).toContain('viewBox="0 0 688 688"');
    expect(svg.match(/<rect x=/g)).toHaveLength(5);
    expect(svg.match(/<line /g)).toHaveLength(100);
    expect(svg).toContain('stroke-width="3.5"');
  });

  it.each(['4x4', '6x6', '9x9', 'samurai'] as BlankSudokuGridTemplate[])(
    'uses a descriptive file stem for %s',
    (template) => {
      expect(getBlankGridFileStem(template)).toContain('sudoku-grid');
    },
  );
});
