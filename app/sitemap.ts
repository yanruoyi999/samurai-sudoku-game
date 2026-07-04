import type { MetadataRoute } from 'next';

import { locales } from '@/i18n';
import { getPuzzleIndex } from '@/lib/puzzles';
import { buildAbsoluteUrl } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const difficulties = ['easy', 'medium', 'hard', 'evil'];
  const routes = [
    { path: '', changeFrequency: 'daily' as const, priority: 1, followsIndex: true },
    { path: '/games/samurai', changeFrequency: 'daily' as const, priority: 0.9, followsIndex: true },
    { path: '/games/samurai/archive', changeFrequency: 'weekly' as const, priority: 0.85, followsIndex: true },
    { path: '/games/samurai/what-is-samurai-sudoku', changeFrequency: 'monthly' as const, priority: 0.75 },
    { path: '/games/samurai/how-to-play', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/games/samurai/strategy-guide', changeFrequency: 'monthly' as const, priority: 0.72 },
    { path: '/games/samurai/beginners', changeFrequency: 'monthly' as const, priority: 0.71 },
    { path: '/games/samurai/paper-practice', changeFrequency: 'monthly' as const, priority: 0.69 },
    { path: '/games/samurai/difficulty-guide', changeFrequency: 'monthly' as const, priority: 0.7 },
    ...difficulties.map((difficulty) => ({
      path: `/games/samurai/difficulty/${difficulty}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      followsIndex: true,
    })),
    { path: '/support', changeFrequency: 'monthly' as const, priority: 0.55 },
    { path: '/about', changeFrequency: 'yearly' as const, priority: 0.4 },
    { path: '/contact', changeFrequency: 'yearly' as const, priority: 0.4 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
  ];
  const index = await getPuzzleIndex();
  const indexLastModified = new Date(index.lastUpdated);
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: buildAbsoluteUrl(`/${locale}${route.path}`),
        ...(route.followsIndex ? { lastModified: indexLastModified } : {}),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            ...Object.fromEntries(
              locales.map((loc) => [loc, buildAbsoluteUrl(`/${loc}${route.path}`)]),
            ),
            'x-default': buildAbsoluteUrl(`/en${route.path}`),
          },
        },
      });
    }

    for (const puzzle of index.puzzles) {
      const path = `/games/samurai/${puzzle.id}`;
      entries.push({
        url: buildAbsoluteUrl(`/${locale}${path}`),
        lastModified: new Date(`${puzzle.id}T00:00:00.000Z`),
        changeFrequency: 'monthly',
        priority: puzzle.difficulty === 'evil' || puzzle.difficulty === 'hard' ? 0.82 : 0.78,
        alternates: {
          languages: {
            ...Object.fromEntries(
              locales.map((loc) => [loc, buildAbsoluteUrl(`/${loc}${path}`)]),
            ),
            'x-default': buildAbsoluteUrl(`/en${path}`),
          },
        },
      });
    }
  }

  return entries;
}
