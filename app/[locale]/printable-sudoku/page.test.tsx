import { describe, expect, it } from 'vitest';

import { generateMetadata } from '@/app/[locale]/printable-sudoku/page';

describe('printable Sudoku page metadata', () => {
  it('keeps all standard printable variants on one canonical English hub', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });

    expect(metadata.title).toContain('Printable Sudoku');
    expect(metadata.description).toContain('answers');
    expect(metadata.alternates?.canonical).toContain('/en/printable-sudoku');
    expect(metadata.keywords).toContain('sudoku puzzles printable pdf with answers');
  });

  it('publishes a localized Chinese canonical', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'zh' }) });

    expect(metadata.title).toContain('数独打印');
    expect(metadata.alternates?.canonical).toContain('/zh/printable-sudoku');
  });
});
