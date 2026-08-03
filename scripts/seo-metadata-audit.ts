import { pathToFileURL } from 'node:url';

const DEFAULT_BASE_URL = 'https://www.samuraisudoku.net';
const CONCURRENCY = 12;
const EN_TITLE_MIN = 28;
const EN_TITLE_MAX = 70;
const EN_DESCRIPTION_MIN = 90;
const EN_DESCRIPTION_MAX = 180;
const ZH_TITLE_MIN = 8;
const ZH_TITLE_MAX = 36;
const ZH_DESCRIPTION_MIN = 32;
const ZH_DESCRIPTION_MAX = 100;

export interface SeoMetadataResult {
  url: string;
  path: string;
  locale: 'en' | 'zh';
  title: string;
  description: string;
  canonical: string;
  issues: string[];
  warnings: string[];
}

type AttributeMap = Record<string, string>;

function decodeHtml(value: string) {
  const named: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    quot: '"',
  };

  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (entity, name: string) => named[name.toLowerCase()] ?? entity)
    .replace(/\s+/g, ' ')
    .trim();
}

function parseAttributes(tag: string): AttributeMap {
  const attributes: AttributeMap = {};
  const pattern = /([\w:-]+)\s*=\s*(["'])(.*?)\2/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(tag))) {
    attributes[match[1].toLowerCase()] = decodeHtml(match[3]);
  }

  return attributes;
}

function extractTitle(html: string) {
  // Next.js may stream document metadata after the body shell. SVGs can also
  // contain their own <title>, so the first title in the response is not
  // necessarily the document title. The final title is the resolved metadata.
  const matches = Array.from(html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi));
  const match = matches.at(-1);
  return match ? decodeHtml(match[1].replace(/<[^>]+>/g, ' ')) : '';
}

function extractMetaContent(html: string, name: string) {
  let content = '';
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    if ((attributes.name ?? '').toLowerCase() === name.toLowerCase()) {
      content = attributes.content ?? '';
    }
  }
  return content;
}

function extractCanonical(html: string) {
  let canonical = '';
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    const rel = (attributes.rel ?? '').toLowerCase().split(/\s+/);
    if (rel.includes('canonical')) canonical = attributes.href ?? '';
  }
  return canonical;
}

function extractHreflangs(html: string) {
  const values = new Set<string>();
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    const rel = (attributes.rel ?? '').toLowerCase().split(/\s+/);
    if (rel.includes('alternate') && attributes.hreflang) {
      values.add(attributes.hreflang.toLowerCase());
    }
  }
  return values;
}

function parseSitemapLocations(xml: string) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => decodeHtml(match[1]));
}

function localeForPath(pathname: string): 'en' | 'zh' {
  return pathname === '/zh' || pathname.startsWith('/zh/') ? 'zh' : 'en';
}

function checkLength(
  label: string,
  value: string,
  minimum: number,
  maximum: number,
  issues: string[],
  warnings: string[],
) {
  if (!value) {
    issues.push(`missing ${label}`);
    return;
  }
  if (value.length < minimum) issues.push(`${label} too short (${value.length} < ${minimum})`);
  if (value.length > maximum) warnings.push(`${label} longer than recommended (${value.length} > ${maximum})`);
}

function canonicalMatches(expected: URL, canonical: string) {
  try {
    const parsed = new URL(canonical);
    return (
      parsed.protocol === 'https:'
      && parsed.hostname === 'www.samuraisudoku.net'
      && parsed.pathname === expected.pathname
      && parsed.search === expected.search
      && parsed.hash === ''
    );
  } catch {
    return false;
  }
}

export function auditHtmlMetadata(
  expectedUrl: URL,
  html: string,
  headers: Headers = new Headers(),
): SeoMetadataResult {
  const locale = localeForPath(expectedUrl.pathname);
  const title = extractTitle(html);
  const description = extractMetaContent(html, 'description');
  const canonical = extractCanonical(html);
  const robots = extractMetaContent(html, 'robots').toLowerCase();
  const xRobotsTag = (headers.get('x-robots-tag') ?? '').toLowerCase();
  const hreflangs = extractHreflangs(html);
  const issues: string[] = [];
  const warnings: string[] = [];

  if (locale === 'zh') {
    checkLength('title', title, ZH_TITLE_MIN, ZH_TITLE_MAX, issues, warnings);
    checkLength('description', description, ZH_DESCRIPTION_MIN, ZH_DESCRIPTION_MAX, issues, warnings);
  } else {
    checkLength('title', title, EN_TITLE_MIN, EN_TITLE_MAX, issues, warnings);
    checkLength('description', description, EN_DESCRIPTION_MIN, EN_DESCRIPTION_MAX, issues, warnings);
  }

  if (!canonical) issues.push('missing canonical');
  else if (!canonicalMatches(expectedUrl, canonical)) issues.push(`canonical mismatch (${canonical})`);

  if (robots.includes('noindex') || xRobotsTag.includes('noindex')) {
    issues.push('sitemap URL is marked noindex');
  }

  for (const required of ['en', 'zh', 'x-default']) {
    if (!hreflangs.has(required)) issues.push(`missing hreflang ${required}`);
  }

  return {
    url: expectedUrl.toString(),
    path: expectedUrl.pathname,
    locale,
    title,
    description,
    canonical,
    issues,
    warnings,
  };
}

async function fetchText(url: URL) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml,text/xml',
      'user-agent': 'SamuraiSudokuSeoMetadataAudit/1.0',
    },
  });
  if (!response.ok) throw new Error(`${url.toString()} returned ${response.status}`);
  return { body: await response.text(), headers: response.headers };
}

async function mapLimit<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>) {
  const results: R[] = [];
  for (let index = 0; index < items.length; index += limit) {
    const batch = items.slice(index, index + limit);
    results.push(...(await Promise.all(batch.map(mapper))));
  }
  return results;
}

export async function auditSeoMetadata(baseUrl: string) {
  const base = new URL(baseUrl);
  const sitemapResponse = await fetchText(new URL('/sitemap.xml', base));
  const productionUrls = parseSitemapLocations(sitemapResponse.body).map((location) => new URL(location));
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(base.hostname);

  if (productionUrls.length === 0) {
    throw new Error(`No sitemap URLs found at ${new URL('/sitemap.xml', base).toString()}`);
  }

  const results = await mapLimit(productionUrls, CONCURRENCY, async (expectedUrl) => {
    const fetchUrl = isLocal
      ? new URL(`${expectedUrl.pathname}${expectedUrl.search}`, base)
      : expectedUrl;
    const response = await fetchText(fetchUrl);
    return auditHtmlMetadata(expectedUrl, response.body, response.headers);
  });

  const titleOwners = new Map<string, string>();
  const descriptionOwners = new Map<string, string>();
  for (const result of results) {
    const titleKey = `${result.locale}:${result.title.toLowerCase()}`;
    const descriptionKey = `${result.locale}:${result.description.toLowerCase()}`;
    const titleOwner = titleOwners.get(titleKey);
    const descriptionOwner = descriptionOwners.get(descriptionKey);

    if (result.title && titleOwner && titleOwner !== result.path) {
      result.issues.push(`duplicate title (also ${titleOwner})`);
    } else if (result.title) {
      titleOwners.set(titleKey, result.path);
    }

    if (result.description && descriptionOwner && descriptionOwner !== result.path) {
      result.issues.push(`duplicate description (also ${descriptionOwner})`);
    } else if (result.description) {
      descriptionOwners.set(descriptionKey, result.path);
    }
  }

  return {
    results,
    failing: results.filter((result) => result.issues.length > 0),
    warningPages: results.filter((result) => result.warnings.length > 0),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const reportOnly = args.includes('--report-only');
  const baseUrl = args.find((argument) => !argument.startsWith('--')) ?? DEFAULT_BASE_URL;
  const { results, failing, warningPages } = await auditSeoMetadata(baseUrl);

  console.log(`Audited SEO metadata for ${results.length} sitemap pages at ${baseUrl}.`);
  console.log(`Pages with blocking metadata issues: ${failing.length}.`);
  console.log(`Pages with non-blocking length recommendations: ${warningPages.length}.`);

  for (const result of failing) {
    console.log(`${result.path}: ${result.issues.join('; ')}`);
  }

  for (const result of warningPages.slice(0, 20)) {
    console.log(`WARN ${result.path}: ${result.warnings.join('; ')}`);
  }

  if (failing.length > 0 && !reportOnly) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
