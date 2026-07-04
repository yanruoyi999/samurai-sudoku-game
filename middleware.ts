import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './i18n';

const CANONICAL_HOST = 'www.samuraisudoku.net';
const REDIRECT_HOSTS = new Set(['samuraisudoku.net']);

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Always use locale prefix
  localePrefix: 'always',

  // Page metadata and sitemap own hreflang links. Disabling this avoids an
  // unprefixed x-default Link header while localePrefix is always enabled.
  alternateLinks: false
});

export default function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase();

  if (hostname && REDIRECT_HOSTS.has(hostname)) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  const pathLocale = request.nextUrl.pathname.split('/')[1];
  const locale = locales.find((candidate) => candidate === pathLocale) ?? 'en';
  const response = intlMiddleware(request);
  response.headers.set('Content-Language', locale);
  return response;
}

export const config = {
  // Match internationalized pathnames and crawl-entry files that need canonical host redirects.
  matcher: ['/', '/(zh|en)/:path*', '/sitemap.xml', '/robots.txt', '/ads.txt', '/llms.txt']
};
