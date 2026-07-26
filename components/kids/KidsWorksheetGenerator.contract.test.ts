import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const componentPath = 'components/kids/KidsWorksheetGenerator.tsx';

describe('Kids Sudoku worksheet generator component', () => {
  it('offers size, level, count, answer, regenerate, and print controls', () => {
    expect(existsSync(componentPath)).toBe(true);
    const source = readFileSync(componentPath, 'utf8');
    expect(source).toContain('selectWorksheetPuzzles');
    expect(source).toContain('includeAnswers');
    expect(source).toContain('Generate another set');
    expect(source).toContain('KidsSudokuPrintGrid');
    expect(source).toContain('KidsPrintButton');
  });

  it('tracks generation without collecting personal data', () => {
    const source = readFileSync(componentPath, 'utf8');
    expect(source).toContain('kids_sudoku_worksheet_generate');
    expect(source).toContain('size');
    expect(source).toContain('level');
    expect(source).toContain('count');
    expect(source).not.toContain('type="email"');
    expect(source).not.toContain('childName');
  });
});
