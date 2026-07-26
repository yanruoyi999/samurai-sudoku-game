import { describe, expect, it } from 'vitest';

import { generateMetadata } from '@/app/[locale]/blank-sudoku-grid-printable/page';

describe('blank Sudoku grid printable metadata', () => {
  it('consolidates blank-grid keyword variants on one canonical page', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });

    expect(metadata.title).toContain('Blank Sudoku Grid Printable');
    expect(metadata.alternates?.canonical).toContain('/en/blank-sudoku-grid-printable');
    expect(metadata.keywords).toContain('sudoku grid printable blank');
    expect(metadata.keywords).toContain('empty sudoku printable');
  });
});
