import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import Page, { generateMetadata } from './page';
import sitemap from '@/app/sitemap';

const route = '/sudoku-pronunciation';

describe('Sudoku pronunciation guide contract', () => {
  for (const locale of ['en', 'zh']) {
    it(`${locale}: serves pronunciation, spelling and honest external listening`, async () => {
      const props = { params: Promise.resolve({ locale }) };
      const metadata = await generateMetadata(props);
      expect(String(metadata.alternates?.canonical)).toBe(`https://www.samuraisudoku.net/${locale}${route}`);
      expect(metadata.alternates?.languages).toHaveProperty('en');
      expect(metadata.alternates?.languages).toHaveProperty('zh');
      const html = renderToStaticMarkup(await Page(props));
      expect(html.match(/<h1(?:\s|>)/g)).toHaveLength(1);
      expect(html).toContain('suˈdəʊkuː');
      expect(html).toContain('soo-DOH-koo');
      expect(html).toContain('s-u-d-o-k-u');
      expect(html).toContain('oxfordlearnersdictionaries.com');
      expect(html).toContain('collinsdictionary.com');
      expect(html).not.toMatch(/<audio|<iframe|auto[Pp]lay/);
      expect(html).toContain(`href="/${locale}/games/samurai/how-to-play"`);
      const scripts = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
      const article = scripts.find((x) => x['@type'] === 'Article');
      expect(article).toBeDefined();
      expect(article.inLanguage).toBe(locale === 'zh' ? 'zh-CN' : 'en-US');
      expect(article.datePublished).toBeUndefined();
      const faq = scripts.find((x) => x['@type'] === 'FAQPage');
      expect(faq?.mainEntity.length).toBeGreaterThanOrEqual(3);
      for (const item of faq.mainEntity) {
        expect(html).toContain(item.name.replace(/'/g, '&#x27;'));
        expect(item.acceptedAnswer.text.length).toBeGreaterThan(30);
      }
      if (locale === 'zh') {
        expect(html).toContain('第二个音节');
        expect(html).toContain('不是日语');
        expect(html).toContain('aria-label="面包屑导航"');
      } else {
        expect(html).toContain('second syllable');
        expect(html).toContain('not a Japanese');
      }
    });
  }
  it('is discoverable from two existing context pages and the bilingual sitemap', async () => {
    for (const file of ['app/[locale]/games/samurai/how-to-play/page.tsx', 'app/[locale]/about/page.tsx']) {
      expect(fs.readFileSync(path.resolve(file), 'utf8')).toContain('/sudoku-pronunciation');
    }
    const entries = await sitemap();
    for (const locale of ['en', 'zh']) {
      expect(entries.filter((entry) => entry.url === `https://www.samuraisudoku.net/${locale}${route}`)).toHaveLength(1);
    }
  });
});
