import type { MetadataRoute } from 'next';

import { locales } from '@/i18n';
import { getPuzzleIndex } from '@/lib/puzzles';
import { buildAbsoluteUrl } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    { path: '', changeFrequency: 'daily' as const, priority: 1 },
    { path: '/games/samurai', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/games/samurai/archive', changeFrequency: 'weekly' as const, priority: 0.85 },
  ];
  const index = await getPuzzleIndex();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: buildAbsoluteUrl(`/${locale}${route.path}`),
        lastModified: new Date(index.lastUpdated),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [loc, buildAbsoluteUrl(`/${loc}${route.path}`)]),
          ),
        },
      });
    }

    for (const puzzle of index.puzzles) {
      const path = `/games/samurai/${puzzle.id}`;
      entries.push({
        url: buildAbsoluteUrl(`/${locale}${path}`),
        lastModified: new Date(index.lastUpdated),
        changeFrequency: 'monthly',
        priority: puzzle.difficulty === 'evil' || puzzle.difficulty === 'hard' ? 0.82 : 0.78,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [loc, buildAbsoluteUrl(`/${loc}${path}`)]),
          ),
        },
      });
    }
  }

  return entries;
}
