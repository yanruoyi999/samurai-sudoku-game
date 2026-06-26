import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { locales } from './i18n';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Always use locale prefix
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  const pathLocale = request.nextUrl.pathname.split('/')[1];
  const locale = locales.find((candidate) => candidate === pathLocale) ?? 'en';
  const response = intlMiddleware(request);
  response.headers.set('Content-Language', locale);
  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(zh|en)/:path*']
};
