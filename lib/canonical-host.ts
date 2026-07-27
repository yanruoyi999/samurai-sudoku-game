export const CANONICAL_HOST = 'www.samuraisudoku.net';

const REDIRECT_HOSTS = new Set([
  'samuraisudoku.net',
  'samurai-sudoku-game.vercel.app'
]);

export function getCanonicalRedirectUrl(
  requestUrl: URL,
  hostHeader: string | null
): URL | null {
  const hostname = hostHeader?.split(':')[0].toLowerCase();

  if (!hostname || !REDIRECT_HOSTS.has(hostname)) {
    return null;
  }

  const redirectUrl = new URL(requestUrl.toString());
  redirectUrl.protocol = 'https:';
  redirectUrl.hostname = CANONICAL_HOST;
  redirectUrl.port = '';
  return redirectUrl;
}
