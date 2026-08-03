import { describe, expect, it } from 'vitest';

import { auditHtmlMetadata } from './seo-metadata-audit';

function pageHtml({
  title,
  description,
  canonical,
  robots,
}: {
  title: string;
  description: string;
  canonical: string;
  robots?: string;
}) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>${title}</title>
        <meta name="description" content="${description}" />
        ${robots ? `<meta name="robots" content="${robots}" />` : ''}
        <link rel="canonical" href="${canonical}" />
        <link rel="alternate" hrefLang="en" href="https://www.samuraisudoku.net/en/example" />
        <link rel="alternate" hrefLang="zh" href="https://www.samuraisudoku.net/zh/example" />
        <link rel="alternate" hrefLang="x-default" href="https://www.samuraisudoku.net/en/example" />
      </head>
      <body><h1>Example</h1></body>
    </html>
  `;
}

describe('SEO metadata audit', () => {
  it('accepts complete English metadata on a sitemap URL', () => {
    const url = new URL('https://www.samuraisudoku.net/en/example');
    const result = auditHtmlMetadata(
      url,
      pageHtml({
        title: 'Samurai Sudoku Printable Practice Plan and Free PDF Guide',
        description: 'Build a Samurai Sudoku paper-solving routine with printable puzzles, answer keys, overlap-box guidance, and a free PDF sampler.',
        canonical: url.toString(),
      }),
    );

    expect(result.issues).toEqual([]);
  });

  it('uses the final streamed document title instead of an earlier SVG title', () => {
    const url = new URL('https://www.samuraisudoku.net/en/example');
    const html = `<svg><title>Decorative board icon</title></svg>${pageHtml({
      title: 'Samurai Sudoku Printable Practice Plan and Free PDF Guide',
      description: 'Build a Samurai Sudoku paper-solving routine with printable puzzles, answer keys, overlap-box guidance, and a free PDF sampler.',
      canonical: url.toString(),
    })}`;

    const result = auditHtmlMetadata(url, html);
    expect(result.title).toBe('Samurai Sudoku Printable Practice Plan and Free PDF Guide');
    expect(result.issues).toEqual([]);
  });

  it('accepts complete Chinese metadata without applying English character limits', () => {
    const url = new URL('https://www.samuraisudoku.net/zh/example');
    const result = auditHtmlMetadata(
      url,
      pageHtml({
        title: '武士数独在线练习与可打印题库指南',
        description: '在线练习武士数独，了解五宫重叠规则、候选数与解题步骤，并使用带答案的免费打印样题继续纸笔训练。',
        canonical: url.toString(),
      }),
    );

    expect(result.issues).toEqual([]);
  });

  it('reports titles and descriptions that are too short for useful search snippets', () => {
    const url = new URL('https://www.samuraisudoku.net/en/example');
    const result = auditHtmlMetadata(
      url,
      pageHtml({
        title: 'Sudoku',
        description: 'Play Sudoku.',
        canonical: url.toString(),
      }),
    );

    expect(result.issues).toContain('title too short (6 < 28)');
    expect(result.issues).toContain('description too short (12 < 90)');
  });

  it('keeps long but valid snippets as non-blocking recommendations', () => {
    const url = new URL('https://www.samuraisudoku.net/en/example');
    const result = auditHtmlMetadata(
      url,
      pageHtml({
        title: 'A Very Detailed Samurai Sudoku Printable Practice Plan With More Than Seventy Characters',
        description: 'This deliberately detailed description explains Samurai Sudoku printable puzzles, answer keys, overlap boxes, candidate notes, paper sizes, and classroom practice in more than one hundred and eighty characters for testing.',
        canonical: url.toString(),
      }),
    );

    expect(result.issues).toEqual([]);
    expect(result.warnings).toEqual([
      expect.stringContaining('title longer than recommended'),
      expect.stringContaining('description longer than recommended'),
    ]);
  });

  it('rejects noindex directives on URLs published in the sitemap', () => {
    const url = new URL('https://www.samuraisudoku.net/en/example');
    const html = pageHtml({
      title: 'Samurai Sudoku Printable Practice Plan and Free PDF Guide',
      description: 'Build a Samurai Sudoku paper-solving routine with printable puzzles, answer keys, overlap-box guidance, and a free PDF sampler.',
      canonical: url.toString(),
      robots: 'noindex,follow',
    });

    expect(auditHtmlMetadata(url, html).issues).toContain('sitemap URL is marked noindex');
    expect(
      auditHtmlMetadata(url, html.replace('noindex,follow', 'index,follow'), new Headers({
        'x-robots-tag': 'noindex, nofollow',
      })).issues,
    ).toContain('sitemap URL is marked noindex');
  });

  it('requires a matching canonical and bilingual hreflang links', () => {
    const url = new URL('https://www.samuraisudoku.net/en/example');
    const html = pageHtml({
      title: 'Samurai Sudoku Printable Practice Plan and Free PDF Guide',
      description: 'Build a Samurai Sudoku paper-solving routine with printable puzzles, answer keys, overlap-box guidance, and a free PDF sampler.',
      canonical: 'https://www.samuraisudoku.net/en/other',
    }).replace(/<link rel="alternate" hrefLang="zh"[^>]+>/, '');
    const result = auditHtmlMetadata(url, html);

    expect(result.issues).toContain('canonical mismatch (https://www.samuraisudoku.net/en/other)');
    expect(result.issues).toContain('missing hreflang zh');
  });
});
