export const CANONICAL_HOST = 'www.samuraisudoku.net';

const REDIRECT_HOSTS = new Set([
  'samuraisudoku.net',
  'samurai-sudoku-game.vercel.app'
]);

function getHostname(hostHeader: string | null): string | null {
  const authority = hostHeader?.trim();
  if (!authority) return null;

  try {
    return new URL(`http://${authority}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function getCanonicalRedirectUrl(
  requestUrl: URL,
  hostHeader: string | null
): URL | null {
  const hostname = getHostname(hostHeader);
  if (!hostname) return null;

  const isAlias = REDIRECT_HOSTS.has(hostname);
  const needsCanonicalTransport =
    hostname === CANONICAL_HOST &&
    (requestUrl.protocol !== 'https:' || requestUrl.port !== '');

  if (!isAlias && !needsCanonicalTransport) {
    return null;
  }

  const redirectUrl = new URL(requestUrl.toString());
  redirectUrl.protocol = 'https:';
  redirectUrl.hostname = CANONICAL_HOST;
  redirectUrl.port = '';
  return redirectUrl;
}
