import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const activityPath = 'components/kids/KidsSudokuActivity.tsx';

describe('Kids Sudoku shared activity contract', () => {
  it('persists progress and uses a stable keyboard listener', () => {
    expect(existsSync(activityPath)).toBe(true);
    const source = readFileSync(activityPath, 'utf8');

    expect(source).toContain('useCallback');
    expect(source).toContain('readKidsSudokuProgress');
    expect(source).toContain('writeKidsSudokuProgress');
    expect(source).toMatch(/useEffect\([\s\S]*addEventListener\(["']keydown["'][\s\S]*\}, \[handleKeyDown\]\)/);
  });

  it('offers levels, completion analytics, and useful next steps', () => {
    const source = readFileSync(activityPath, 'utf8');

    expect(source).toContain('kids_sudoku_level_change');
    expect(source).toContain('kids_sudoku_completed');
    expect(source).toContain('kids_sudoku_completion_cta_click');
    expect(source).toContain('completedPuzzleIds');
    expect(source).toContain('Printable worksheets');
    expect(source).toContain('Another puzzle');
  });

  it('keeps 4x4 and 6x6 wrappers as small adapters', () => {
    const fourByFourPath = 'components/kids/KidsSudoku4x4.tsx';
    const sixBySixPath = 'components/kids/KidsSudoku6x6.tsx';

    expect(existsSync(fourByFourPath)).toBe(true);
    expect(existsSync(sixBySixPath)).toBe(true);

    const fourByFour = readFileSync(fourByFourPath, 'utf8');
    const sixBySix = readFileSync(sixBySixPath, 'utf8');
    expect(fourByFour).toContain('KIDS_SUDOKU_4X4_PUZZLES');
    expect(sixBySix).toContain('KIDS_SUDOKU_6X6_PUZZLES');
    expect(fourByFour).toContain('KidsSudokuActivity');
    expect(sixBySix).toContain('KidsSudokuActivity');
  });
});
