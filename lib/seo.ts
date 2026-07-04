import { locales } from '@/i18n';
import { buildAbsoluteUrl } from '@/lib/site-url';

function normalizeLocalizedPath(path = ''): string {
  if (!path || path === '/') return '';
  return path.startsWith('/') ? path : `/${path}`;
}

export function buildLocalizedUrl(locale: string, path = ''): string {
  return buildAbsoluteUrl(`/${locale}${normalizeLocalizedPath(path)}`);
}

export function buildLanguageAlternates(path = ''): Record<string, string> {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [locale, buildLocalizedUrl(locale, path)]),
    ),
    'x-default': buildLocalizedUrl('en', path),
  };
}
