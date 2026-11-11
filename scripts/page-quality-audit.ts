import { pathToFileURL } from 'node:url';

const DEFAULT_THRESHOLD = 80;
const DEFAULT_BASE_URL = 'https://www.samuraisudoku.net';
const CONCURRENCY = 12;
const INCOMPLETE_HEXADOKU = 'incomplete 16×16 Sudoku controls';
const INCOMPLETE_KILLER = 'incomplete Killer Sudoku controls';
const INCOMPLETE_SOLVER = 'incomplete Sudoku solver controls';

export interface PageQualityBreakdown {
  performance: number;
  playability: number;
  demand: number;
  content: number;
  seo: number;
  internalLinks: number;
}

export interface PageQualityResult {
  url: string;
  path: string;
  category: string;
  score: number;
  breakdown: PageQualityBreakdown;
  issues: string[];
}

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function effectiveContentLength(text: string) {
  const cjkChars = text.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  return Math.round(text.length + cjkChars * 0.6);
}

function hasPattern(html: string, pattern: RegExp) {
  return pattern.test(html);
}

function uniqueInternalLinks(html: string, url: URL) {
  const links = new Set<string>();
  const linkPattern = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(html))) {
    try {
      const href = new URL(match[1], url);
      if (href.origin === url.origin && href.pathname !== url.pathname) {
        links.add(href.pathname);
      }
    } catch {
      continue;
    }
  }

  return links;
}

function categorizePath(path: string) {
  const standaloneSudokuGuides = new Set([
    '/sudoku-cross-hatching',
    '/sudoku-naked-triple',
    '/sudoku-swordfish',
    '/killer-sudoku-cheat-sheet',
  ]);

  if (path === '/' || path === '/games/samurai') return 'samurai-core';
  if (path === '/jigsaw-sudoku' || path === '/16x16-sudoku' || path === '/killer-sudoku') return 'sudoku-variant';
  if (path === '/sudoku-solver') return 'sudoku-solver';
  if (path === '/sudoku-for-kids' || path.startsWith('/sudoku-for-kids/')) return 'kids-sudoku';
  if (path === '/printable-sudoku' || path === '/blank-sudoku-grid-printable') return 'sudoku-printable';
  if (standaloneSudokuGuides.has(path)) return 'sudoku-guide';
  if (path === '/games/minesweeper') return 'minesweeper-core';
  if (path.startsWith('/games/minesweeper/')) return 'minesweeper-guide';
  if (/^\/games\/samurai\/\d{4}-\d{2}-\d{2}$/.test(path)) return 'samurai-puzzle';
  if (path.startsWith('/games/samurai/difficulty/')) return 'samurai-difficulty';
  if (path === '/games/samurai/archive') return 'samurai-archive';
  if (path.includes('/printable') || path.includes('/pdf')) return 'samurai-printable';
  if (path.startsWith('/games/samurai/')) return 'samurai-guide';
  if (
    path === '/about'
    || path.startsWith('/about/')
    || ['/contact', '/privacy', '/support', '/terms'].includes(path)
  ) {
    return 'trust-page';
  }
  return 'other';
}

function scoreDemand(pathname: string, category: string) {
  const path = pathname.toLowerCase();
  if (path === '/en' || path === '/zh' || path.endsWith('/games/samurai')) return 20;
  if (path.includes('printable') || path.includes('pdf')) return 20;
  if (path.includes('daily') || path.includes('archive')) return 18;
  if (category === 'sudoku-guide') return 17;
  if (category === 'sudoku-variant' || category === 'sudoku-solver') return 17;
  if (path.includes('/games/minesweeper')) return 18;
  if (category === 'kids-sudoku') return 17;
  if (path.includes('/difficulty/evil') || path.includes('/difficulty/hard')) return 17;
  if (path.includes('rules') || path.includes('how-to-play') || path.includes('overlap')) return 17;
  if (path.includes('first-move') || path.includes('choose-difficulty')) return 16;
  if (category === 'samurai-puzzle') return 15;
  if (category === 'samurai-guide' || category === 'minesweeper-guide') return 15;
  if (category === 'trust-page') return 13;
  return 10;
}

function scoreContent(textLength: number) {
  if (textLength >= 2500) return 25;
  if (textLength >= 1500) return 22;
  if (textLength >= 900) return 18;
  if (textLength >= 500) return 12;
  return 4;
}

function scorePerformance(byteLength: number) {
  if (byteLength <= 250_000) return 15;
  if (byteLength <= 500_000) return 12;
  if (byteLength <= 1_000_000) return 8;
  return 4;
}

function hasNineDigitPad(html: string) {
  const pad = html.match(/<div\b[^>]*\brole=["']group["'][^>]*\baria-label=["'](?:Number pad|屏幕数字键)["'][^>]*>([\s\S]*?)<\/div>/i)?.[1];
  if (!pad) return false;
  const digits = Array.from(pad.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi), ([, text]) => text.trim());
  return digits.sort().join(',') === '1,2,3,4,5,6,7,8,9';
}

function hasAll81Cells(indexes: number[]) {
  return indexes.length === 81 && new Set(indexes).size === 81 && indexes.every(index => index < 81);
}

function hasSolverControls(html: string) {
  const board = html.match(/<div\b[^>]*\brole=["']group["'][^>]*\baria-label=["'](?:Sudoku input grid|数独输入棋盘)["'][^>]*>([\s\S]*?)<\/div>/i)?.[1];
  if (!board || !hasNineDigitPad(html)) return false;
  const indexes = Array.from(board.matchAll(/<button\b[^>]*\bdata-solver-cell=["'](\d+)["']/gi), ([, index]) => Number(index));
  return hasAll81Cells(indexes)
    && hasPattern(html, /<textarea\b[^>]*\bdata-solver-paste(?=[\s=>])/i)
    && hasPattern(html, /<button\b[^>]*\bdata-solver-action=["']solve["']/i);
}

function hasKillerControls(html: string) {
  const board = html.match(/<div\b[^>]*\brole=["']group["'][^>]*\baria-label=["'](?:Killer Sudoku board|杀手数独棋盘)["'][^>]*>([\s\S]*?)<\/div>/i)?.[1];
  if (!board || !hasNineDigitPad(html)) return false;

  const cells = Array.from(board.matchAll(/<button\b[^>]*\bdata-killer-cell=["'](\d+)["'][^>]*>([\s\S]*?)<\/button>/gi));
  if (!hasAll81Cells(cells.map(([, index]) => Number(index)))) return false;

  const cageSums = cells.flatMap(([, , body]) =>
    Array.from(body.matchAll(/<span\b[^>]*\bdata-killer-sum=["']([1-9]\d?)["'][^>]*>\s*\1\s*<\/span>/gi), ([, total]) => Number(total)),
  );
  // Each row sums to 45, and the cages partition all nine rows.
  return cageSums.every(sum => sum <= 45) && cageSums.reduce((total, sum) => total + sum, 0) === 405;
}

function scorePlayability(category: string, html: string, path: string) {
  const hasInteractiveControl = hasPattern(html, /<(button|input|select|textarea)\b/i);

  if (category === 'sudoku-solver') return hasSolverControls(html) ? 15 : 7;
  if (category === 'samurai-core' || category === 'minesweeper-core') return hasInteractiveControl ? 15 : 12;
  if (category === 'sudoku-variant') {
    if (path === '/killer-sudoku') return hasKillerControls(html) ? 15 : 7;
    if (path === '/16x16-sudoku') {
      const hasBoard = hasPattern(html, /<div\b[^>]*\brole=["']grid["'][^>]*\baria-label=["'](?:16×16 Sudoku board|16×16 数独棋盘)["']/i);
      const cells = new Set(Array.from(html.matchAll(/<button\b[^>]*\bdata-hexadoku-cell=["'](\d+)["']/gi), match => Number(match[1]))
        .filter(index => index >= 0 && index < 256));
      const numberPad = html.match(/<div\b[^>]*\brole=["']group["'][^>]*\baria-label=["'](?:Number pad|屏幕数字键)["'][^>]*>([\s\S]*?)<\/div>/i)?.[1];
      const hasPad = numberPad?.match(/<button\b/gi)?.length === 16;
      return hasBoard && cells.size === 256 && hasPad ? 15 : 7;
    }
    const hasBoard = hasPattern(html, /<div\b[^>]*\baria-label=["'](?:Jigsaw Sudoku board|不规则数独棋盘)["'][^>]*>\s*<button\b/i);
    const hasPad = hasPattern(html, /<div\b[^>]*\baria-label=["'](?:Number pad|数字键)["'][^>]*>\s*<button\b/i);
    return hasBoard && hasPad ? 15 : 7;
  }
  if (category === 'kids-sudoku') return hasInteractiveControl ? 15 : 11;
  if (category === 'samurai-puzzle') return hasInteractiveControl ? 15 : 12;
  if (category === 'samurai-difficulty' || category === 'samurai-archive') return hasInteractiveControl ? 14 : 12;
  if (category === 'samurai-printable') return hasInteractiveControl ? 13 : 12;
  if (category === 'sudoku-printable') return hasInteractiveControl ? 15 : 12;
  if (category === 'sudoku-guide') return hasInteractiveControl ? 15 : 11;
  if (category.endsWith('-guide')) return 11;
  if (category === 'trust-page') return 8;
  return 7;
}

function scoreSeo(html: string, issues: string[]) {
  let score = 0;

  if (hasPattern(html, /<title>[^<]{4,}<\/title>/i)) score += 4;
  else issues.push('missing title');

  if (hasPattern(html, /<meta\s+name=["']description["'][^>]*content=["'][^"']{24,}["']/i)) score += 5;
  else issues.push('missing description');

  if (hasPattern(html, /<link\s+rel=["']canonical["'][^>]*href=["'][^"']+["']/i)) score += 3;
  else issues.push('missing canonical');

  if (hasPattern(html, /application\/ld\+json/i)) score += 3;
  else issues.push('missing structured data');

  return score;
}

export function scoreHtmlPage(url: URL, html: string): PageQualityResult {
  const path = url.pathname.replace(/^\/(en|zh)(?=\/|$)/, '') || '/';
  const category = categorizePath(path);
  const issues: string[] = [];
  const textLength = effectiveContentLength(stripTags(html));
  const internalLinkCount = uniqueInternalLinks(html, url).size;
  const breakdown: PageQualityBreakdown = {
    performance: scorePerformance(Buffer.byteLength(html)),
    playability: scorePlayability(category, html, path),
    demand: scoreDemand(url.pathname, category),
    content: scoreContent(textLength),
    seo: scoreSeo(html, issues),
    internalLinks: Math.min(10, internalLinkCount * 5),
  };

  if (textLength < 900 && category !== 'trust-page') issues.push('thin content');
  if (internalLinkCount < 2) issues.push('too few internal links');
  if (path === '/16x16-sudoku' && breakdown.playability < 15) issues.push(INCOMPLETE_HEXADOKU);
  if (path === '/killer-sudoku' && breakdown.playability < 15) issues.push(INCOMPLETE_KILLER);
  if (path === '/sudoku-solver' && breakdown.playability < 15) issues.push(INCOMPLETE_SOLVER);

  return {
    url: url.toString(),
    path: url.pathname,
    category,
    score: Object.values(breakdown).reduce((total, value) => total + value, 0),
    breakdown,
    issues,
  };
}

function parseSitemapLocations(xml: string) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
}

export function normalizeSitemapLocations(locations: string[], base: URL) {
  const isLocalAudit = ['localhost', '127.0.0.1', '::1'].includes(base.hostname);
  return locations
    .map((location) => new URL(location))
    .filter((location) => isLocalAudit || location.origin === base.origin)
    .map((location) => (isLocalAudit ? new URL(`${location.pathname}${location.search}`, base) : location));
}

async function mapLimit<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>) {
  const results: R[] = [];
  for (let index = 0; index < items.length; index += limit) {
    const batch = items.slice(index, index + limit);
    results.push(...(await Promise.all(batch.map(mapper))));
  }
  return results;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml,text/xml',
      'user-agent': 'SamuraiSudokuQualityAudit/1.0',
    },
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

export async function auditPageQuality(baseUrl: string, threshold = DEFAULT_THRESHOLD) {
  const base = new URL(baseUrl);
  const sitemapXml = await fetchText(new URL('/sitemap.xml', base).toString());
  const locations = normalizeSitemapLocations(parseSitemapLocations(sitemapXml), base);
  if (locations.length === 0) throw new Error(`No crawlable URLs found in sitemap for ${baseUrl}`);

  const results = await mapLimit(locations, CONCURRENCY, async (url) => {
    const html = await fetchText(url.toString());
    return scoreHtmlPage(url, html);
  });
  return {
    results,
    failing: results.filter((result) => result.score < threshold
      || result.issues.includes(INCOMPLETE_HEXADOKU) || result.issues.includes(INCOMPLETE_KILLER)
      || result.issues.includes(INCOMPLETE_SOLVER)),
    threshold,
  };
}

function summarize(results: PageQualityResult[]) {
  const byCategory = new Map<string, PageQualityResult[]>();
  for (const result of results) {
    byCategory.set(result.category, [...(byCategory.get(result.category) ?? []), result]);
  }

  return Array.from(byCategory.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, items]) => {
      const scores = items.map((item) => item.score);
      return {
        category,
        count: items.length,
        min: Math.min(...scores),
        avg: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
      };
    });
}

async function main() {
  const args = process.argv.slice(2);
  const reportOnly = args.includes('--report-only');
  const thresholdArg = args.find((arg) => arg.startsWith('--threshold='));
  const threshold = thresholdArg ? Number(thresholdArg.split('=')[1]) : DEFAULT_THRESHOLD;
  const baseUrl = args.find((arg) => !arg.startsWith('--')) ?? DEFAULT_BASE_URL;
  const { results, failing } = await auditPageQuality(baseUrl, threshold);

  console.log(`Audited ${results.length} sitemap pages at ${baseUrl}.`);
  console.log(`Required minimum score: ${threshold}.`);
  for (const row of summarize(results)) {
    console.log(`${row.category}: count=${row.count} min=${row.min} avg=${row.avg}`);
  }

  if (failing.length > 0) {
    console.log('\nPages below threshold or missing required controls:');
    for (const result of failing.slice(0, 50)) {
      console.log(`${result.score} ${result.path} [${result.category}] issues=${result.issues.join(', ') || 'none'}`);
    }
  } else {
    console.log('\nAll pages meet the quality threshold.');
  }

  if (failing.length > 0 && !reportOnly) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
