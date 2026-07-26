import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pagePath = 'app/[locale]/sudoku-cross-hatching/page.tsx';
const trainerPath = 'components/sudoku/CrossHatchingTrainer.tsx';

describe('Sudoku cross-hatching page contract', () => {
  it('owns the complete cross-hatching keyword cluster on one canonical page', () => {
    expect(existsSync(pagePath)).toBe(true);
    const source = readFileSync(pagePath, 'utf8');

    expect(source).toContain('Sudoku Cross Hatching: Step-by-Step Scanning Technique');
    expect(source).toContain('Sudoku Cross Hatching Explained');
    expect(source).toContain('what is cross hatching in sudoku');
    expect(source).toContain("const PATH = '/sudoku-cross-hatching'");
    expect(source).toContain('buildLanguageAlternates(PATH)');
  });

  it('uses a visual trainer, structured answers, and four relevant next steps', () => {
    const source = readFileSync(pagePath, 'utf8');

    expect(source).toContain('CrossHatchingTrainer');
    expect(source).toMatch(/["']@type["']:\s*["']HowTo["']/);
    expect(source).toMatch(/["']@type["']:\s*["']FAQPage["']/);
    expect(source).toContain('/games/samurai/first-move-strategy');
    expect(source).toContain('/games/samurai/overlap-boxes');
    expect(source).toContain('/games/samurai/strategy-guide');
    expect(source).toContain('/games/samurai/difficulty/easy');
  });

  it('keeps the interactive grid accessible and measures practice actions', () => {
    expect(existsSync(trainerPath)).toBe(true);
    const source = readFileSync(trainerPath, 'utf8');

    expect(source).toContain('aria-label');
    expect(source).toContain('cross_hatching_step_view');
    expect(source).toContain('cross_hatching_cell_attempt');
    expect(source).toContain('aspect-square');
    expect(source).toContain('aria-disabled');
    expect(source).toContain('tabIndex');
    expect(source).not.toContain('disabled={value !== 0');
    expect(source).toMatch(
      /const interactive =\s*inTargetBox\s*&&\s*value === 0/,
    );
  });
});
