import { describe, expect, it } from 'vitest';

import { analyzePuzzleFile } from './difficulty-analyzer';

describe('analyzePuzzleFile', () => {
  it('classifies representative daily puzzles with the Samurai difficulty scale', async () => {
    await expect(analyzePuzzleFile('public/puzzles/2026/2026-06-25.json')).resolves.toMatchObject({
      difficulty: 'easy',
    });
    await expect(analyzePuzzleFile('public/puzzles/2026/2026-06-26.json')).resolves.toMatchObject({
      difficulty: 'medium',
    });
    await expect(analyzePuzzleFile('public/puzzles/2026/2026-06-20.json')).resolves.toMatchObject({
      difficulty: 'hard',
    });
    await expect(analyzePuzzleFile('public/puzzles/2026/2026-06-24.json')).resolves.toMatchObject({
      difficulty: 'evil',
    });
  });
});
