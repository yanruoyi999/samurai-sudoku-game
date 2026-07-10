#!/usr/bin/env tsx

const MIN_INTERNAL_LINKS = 2;
const CONCURRENCY = 16;
const MAX_PAGES = 1000;
const LOCALIZED_PATH = /^\/(en|zh)(?:\/|$)/;
const DATED_PUZZLE_PATH = /^(\/(?:en|zh)\/games\/samurai)\/(\d{4}-\d{2}-\d{2})$/;

interface PageAudit {
  path: string;
  status: number;
  internalLinks: string[];
  discoveredPaths: string[];
  error?: string;
}

function decodeHref(href: string) {
  return href.replaceAll('&amp;', '&');
}

function extractInternalPaths(html: string, currentUrl: URL, origin: string) {
  const internalPaths = new Set<string>();
  const anchorPattern = /<a\b[^>]*\bhref=(?:"([^"]+)"|'([^']+)')/gi;

  for (const match of html.matchAll(anchorPattern)) {
    const href = match[1] ?? match[2];
    if (!href) continue;

    try {
      const target = new URL(decodeHref(href), currentUrl);
      if (target.origin !== origin || !LOCALIZED_PATH.test(target.pathname)) continue;

      internalPaths.add(target.pathname);
    } catch {
      // Ignore malformed or non-URL href values.
    }
  }

  return internalPaths;
}

async function auditPage(url: URL, origin: string): Promise<PageAudit> {
  try {
    const response = await fetch(url, { redirect: 'follow' });
    const contentType = response.headers.get('content-type') ?? '';

    if (!response.ok || !contentType.includes('text/html')) {
      return {
        path: url.pathname,
        status: response.status,
        internalLinks: [],
        discoveredPaths: [],
        error: `Expected an HTML 200 response, received ${response.status} ${contentType || 'without content type'}`,
      };
    }

    const currentUrl = new URL(response.url);
    const html = await response.text();
    const discoveredPaths = extractInternalPaths(html, currentUrl, origin);
    const internalLinks = [...discoveredPaths]
      .filter((path) => path !== currentUrl.pathname)
      .sort();

    return {
      path: url.pathname,
      status: response.status,
      internalLinks,
      discoveredPaths: [...discoveredPaths].sort(),
    };
  } catch (error) {
    return {
      path: url.pathname,
      status: 0,
      internalLinks: [],
      discoveredPaths: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  const requestedBaseUrl = process.argv[2]
    ?? process.env.INTERNAL_LINK_AUDIT_BASE_URL
    ?? 'http://localhost:3000';
  const baseUrl = new URL(requestedBaseUrl);
  const origin = baseUrl.origin;
  const sitemapUrl = new URL('/sitemap.xml', origin);
  const sitemapResponse = await fetch(sitemapUrl);

  if (!sitemapResponse.ok) {
    throw new Error(`Could not load ${sitemapUrl.href}: HTTP ${sitemapResponse.status}`);
  }

  const sitemapXml = await sitemapResponse.text();
  const sitemapPaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => new URL(match[1]).pathname)
    .filter((path) => LOCALIZED_PATH.test(path));
  const queuedPaths = new Set(sitemapPaths);

  for (const path of sitemapPaths) {
    const match = path.match(DATED_PUZZLE_PATH);
    if (match) {
      queuedPaths.add(`${match[1]}/printable/${match[2]}`);
    }
  }

  const queue = [...queuedPaths];
  const audits: PageAudit[] = [];

  for (let offset = 0; offset < queue.length; offset += CONCURRENCY) {
    const batch = queue.slice(offset, offset + CONCURRENCY);
    const results = await Promise.all(
      batch.map((path) => auditPage(new URL(path, origin), origin)),
    );

    audits.push(...results);

    for (const result of results) {
      for (const discoveredPath of result.discoveredPaths) {
        if (!queuedPaths.has(discoveredPath)) {
          queuedPaths.add(discoveredPath);
          queue.push(discoveredPath);
        }
      }
    }

    if (queue.length > MAX_PAGES) {
      throw new Error(`Internal-link discovery exceeded the ${MAX_PAGES}-page safety limit.`);
    }
  }

  const failures = audits
    .filter((audit) => audit.error || audit.internalLinks.length < MIN_INTERNAL_LINKS)
    .sort((left, right) => left.path.localeCompare(right.path));

  console.log(`Audited ${audits.length} localized HTML pages at ${origin}.`);
  console.log(`Required unique internal links per page: ${MIN_INTERNAL_LINKS}.`);

  if (failures.length > 0) {
    console.error(`Found ${failures.length} page(s) below the internal-link requirement:`);
    for (const failure of failures) {
      const detail = failure.error ?? `${failure.internalLinks.length} unique internal link(s)`;
      console.error(`- ${failure.path}: ${detail}`);
    }
    process.exitCode = 1;
    return;
  }

  const minimum = Math.min(...audits.map((audit) => audit.internalLinks.length));
  console.log(`All pages passed. Lowest observed count: ${minimum}.`);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
