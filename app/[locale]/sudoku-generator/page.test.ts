import { describe, expect, it } from 'vitest';
import { buildLocalizedUrl } from '@/lib/seo';
import { generateMetadata } from './page';

describe('Sudoku generator page metadata', () => {
  it.each(['en', 'zh'])('keeps the %s trial out of the index and links both versions', async (locale) => {
    const path = '/sudoku-generator';
    const metadata = await generateMetadata({ params: Promise.resolve({ locale }) });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates).toEqual({
      canonical: buildLocalizedUrl(locale, path),
      languages: {
        en: buildLocalizedUrl('en', path),
        zh: buildLocalizedUrl('zh', path),
        'x-default': buildLocalizedUrl('en', path),
      },
    });
  });
});
