import { pathToFileURL } from 'node:url';

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
export const INDEXNOW_KEY = '9f46aa9b43b74af0a17cf9a8ca85e6d1';
const DEFAULT_SITE_URL = 'https://www.samuraisudoku.net';

function resolveSiteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
}

export function normalizeIndexNowUrls(candidates, siteUrl) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error('IndexNow requires at least one explicit URL.');
  }

  const site = new URL(siteUrl);
  const normalized = new Set();

  for (const candidate of candidates) {
    try {
      const url = new URL(candidate, site);
      if (url.origin !== site.origin) continue;
      url.hash = '';
      normalized.add(url.toString());
    } catch {
      // Ignore malformed candidates; the empty-result guard below stays explicit.
    }
  }

  if (normalized.size === 0) {
    throw new Error('IndexNow received no valid same-site URLs.');
  }
  if (normalized.size > 10_000) {
    throw new Error('IndexNow accepts at most 10,000 URLs per submission.');
  }

  return [...normalized];
}

export function buildIndexNowPayload(
  candidates,
  { siteUrl = resolveSiteUrl(), key = INDEXNOW_KEY } = {},
) {
  const site = new URL(siteUrl);
  return {
    host: site.host,
    key,
    keyLocation: new URL(`/${key}.txt`, site).toString(),
    urlList: normalizeIndexNowUrls(candidates, site.toString()),
  };
}

export function readExplicitUrls(args) {
  const urls = [];

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== '--url') {
      throw new Error(`Unknown argument: ${args[index]}`);
    }
    const value = args[index + 1];
    if (!value) {
      throw new Error('Each --url flag must be followed by a path or absolute URL.');
    }
    urls.push(value);
    index += 1;
  }

  if (urls.length === 0) {
    throw new Error('Pass each changed production URL explicitly with --url.');
  }

  return urls;
}

export async function submitIndexNow(
  candidates,
  { siteUrl = resolveSiteUrl(), key = INDEXNOW_KEY, fetchImpl = fetch } = {},
) {
  const payload = buildIndexNowPayload(candidates, { siteUrl, key });
  const response = await fetchImpl(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = (await response.text()).trim();
    throw new Error(
      `IndexNow rejected the submission with HTTP ${response.status}${detail ? `: ${detail}` : ''}`,
    );
  }

  return { status: response.status, submitted: payload.urlList.length };
}

async function main() {
  const urls = readExplicitUrls(process.argv.slice(2));
  const result = await submitIndexNow(urls);
  console.info(`IndexNow accepted ${result.submitted} URL(s) with HTTP ${result.status}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
