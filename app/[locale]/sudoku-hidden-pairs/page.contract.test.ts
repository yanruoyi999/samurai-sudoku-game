import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('discovers the hidden pair lesson in the sitemap and two context pages', () => {
  for (const file of ['app/sitemap.ts', 'app/[locale]/games/samurai/strategy-guide/page.tsx', 'app/[locale]/games/samurai/evil-stuck-after-two-grids/page.tsx']) {
    expect(readFileSync(file, 'utf8'), file).toContain('/sudoku-hidden-pairs');
  }
});

import { renderToStaticMarkup } from 'react-dom/server';
import HiddenPairsPage, { generateMetadata } from './page';
import { scoreHtmlPage } from '@/scripts/page-quality-audit';

it('renders a complete row whose locations, eliminations and witnesses are valid', async () => {
  const html = renderToStaticMarkup(await HiddenPairsPage({ params: Promise.resolve({ locale: 'en' }) }));
  const body = html.match(/<tbody>(.*?)<\/tbody>/)?.[1] ?? '';
  const rows = [...body.matchAll(/<tr>(.*?)<\/tr>/g)].map(m => [...m[1].matchAll(/<td[^>]*>(.*?)<\/td>/g)].map(x => x[1]));
  expect(rows).toHaveLength(9);
  const before = rows.map(row => [...row[1].matchAll(/\d/g)].map(m => Number(m[0])));
  const after = rows.map(row => [...row[2].matchAll(/\d/g)].map(m => Number(m[0])));
  expect(before).toEqual([[1,2,7],[1,3,4],[3,5],[4,6],[5,8],[2,4,7,9],[6,9],[1,8,9],[3,8,9]]);
  expect([2,7].map(d => before.flatMap((set, i) => set.includes(d) ? [i + 1] : []))).toEqual([[1,6],[1,6]]);
  expect(before.flatMap((set, i) => set.filter(d => !after[i].includes(d)).map(d => [i + 1,d]))).toEqual([[1,1],[6,4],[6,9]]);
  for (const witness of [[2,1,3,4,5,7,6,8,9],[7,1,3,4,5,2,6,8,9]]) {
    expect(html).toContain(witness.join(','));
    expect(new Set(witness).size).toBe(9);
    expect(witness.every((d,i) => before[i].includes(d) && after[i].includes(d))).toBe(true);
  }
  const modified = before.map(set => [...set]); modified[1].push(7);
  expect(modified.flatMap((set,i) => set.includes(7) ? [i+1] : [])).toEqual([1,2,6]);
  const counter = [1,7,3,4,5,2,6,8,9];
  expect(html).toContain(counter.join(','));
  expect(new Set(counter).size).toBe(9);
  expect(counter.every((d,i) => modified[i].includes(d))).toBe(true);
  expect(counter[0]).toBe(1);
});

it('renders localized article schema, canonical metadata and quality content', async () => {
  for (const locale of ['en','zh']) {
    const props = { params: Promise.resolve({ locale }) };
    const html = renderToStaticMarkup(await HiddenPairsPage(props));
    const meta = await generateMetadata(props);
    const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    const article = schemas.find(s => s['@type'] === 'TechArticle');
    expect(article.mainEntityOfPage).toMatch(new RegExp(`/${locale}/sudoku-hidden-pairs$`));
    expect(article.inLanguage).toBe(locale === 'zh' ? 'zh-CN' : 'en-US');
    expect(article.datePublished).toBeUndefined();
    expect(String(meta.alternates?.canonical)).toContain(`/${locale}/sudoku-hidden-pairs`);
    expect(meta.alternates?.languages).toHaveProperty('en');
    expect(meta.alternates?.languages).toHaveProperty('zh');
    expect(scoreHtmlPage(new URL(`https://example.com/${locale}/sudoku-hidden-pairs`), html).issues).not.toContain('missing structured data');
  }
});
