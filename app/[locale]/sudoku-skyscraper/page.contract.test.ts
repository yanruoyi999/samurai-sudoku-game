import { existsSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

it('adds a distinct bilingual one-digit lesson and two discovery edges', async () => {
  expect(existsSync('app/[locale]/sudoku-skyscraper/page.tsx'), 'new lesson exists').toBe(true);
  const page = await import('./page');
  for (const locale of ['en', 'zh']) {
    const props = { params: Promise.resolve({ locale }) };
    const html = renderToStaticMarkup(await page.default(props));
    const meta = await page.generateMetadata(props);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(String(meta.alternates?.canonical)).toContain(`/${locale}/sudoku-skyscraper`);
    expect(meta.alternates?.languages).toHaveProperty('en');
    expect(meta.alternates?.languages).toHaveProperty('zh');
    expect(html).toContain('r1c2'); expect(html).toContain('r3c8');
    expect(html).toContain('r6c2'); expect(html).toContain('r6c8');
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    expect(schemas.find(x => x['@type'] === 'TechArticle').mainEntityOfPage).toContain(`/${locale}/sudoku-skyscraper`);
    const faq = schemas.find(x => x['@type'] === 'FAQPage');
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(3);
    for (const q of faq.mainEntity) expect(html).toContain(q.name);
  }
  expect(readFileSync('app/sitemap.ts','utf8')).toContain('/sudoku-skyscraper');
  for (const route of ['strategy-guide','evil-stuck-after-two-grids']) expect(readFileSync(`app/[locale]/games/samurai/${route}/page.tsx`, 'utf8')).toContain('/sudoku-skyscraper');
});

it('validates the rendered endpoints and distinguishes a broken strong link', async () => {
  expect(existsSync('app/[locale]/sudoku-skyscraper/page.tsx')).toBe(true);
  const page = await import('./page');
  const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ locale: 'en' }) }));
  expect(html).toContain('r1c7'); expect(html).toContain('r3c1'); expect(html).toContain('r9c2');
  expect(html).toContain('not a complete Sudoku puzzle');
  expect(html).toContain('exactly two');
  const strongPairs = [...html.matchAll(/data-column="(\d+)" data-rows="([\d,]+)"/g)].map(m => ({ column: Number(m[1]), rows: m[2].split(',').map(Number) }));
  expect(strongPairs).toEqual([{ column: 2, rows: [1,6] }, { column: 8, rows: [3,6] }]);
  const witness = html.match(/data-near-miss-witness="([\d,]+)"/)![1].split(',').map(Number);
  expect(witness).toHaveLength(9);
  expect(new Set(witness).size).toBe(9);
  expect(new Set(witness.map((col,row) => Math.floor(row/3)*3+Math.floor((col-1)/3))).size).toBe(9);
  expect(witness[0]).toBe(7); expect(witness[5]).toBe(8); expect(witness[8]).toBe(2);

  // Exhaustive local proof: a roof must be true if each column is a strong pair
  // and the two base cells share a row. No uniqueness assumption is used.
  const allowed: boolean[][] = [];
  for (let bits=0; bits<16; bits++) {
    const [a,b,c,d] = [0,1,2,3].map(n => Boolean(bits & (1<<n)));
    if (Number(a)+Number(b)===1 && Number(c)+Number(d)===1 && !(b&&d)) allowed.push([a,b,c,d]);
  }
  expect(allowed.length).toBeGreaterThan(0);
  expect(allowed.every(([a,,,d]) => a || d)).toBe(false); // endpoints are a,c, not a,d
  expect(allowed.every(([a,,c]) => a || c)).toBe(true);
  const sees=(a:number[], b:number[]) => a[0]===b[0] || a[1]===b[1] || (Math.floor((a[0]-1)/3)===Math.floor((b[0]-1)/3) && Math.floor((a[1]-1)/3)===Math.floor((b[1]-1)/3));
  for (const target of [[1,7],[3,1]]) expect([[1,2],[3,8]].every(roof => sees(target,roof))).toBe(true);
  expect(sees([2,5],[1,2]) && sees([2,5],[3,8])).toBe(false);
  // A third candidate r9c2 can be true while both roofs are false and r6c8 is true.
  const counter={a:false,b:false,extra:true,c:false,d:true};
  expect(Number(counter.a)+Number(counter.b)+Number(counter.extra)).toBe(1);
  expect(Number(counter.c)+Number(counter.d)).toBe(1);
  expect(counter.b&&counter.d).toBe(false);
  expect(counter.a||counter.c).toBe(false);
});
