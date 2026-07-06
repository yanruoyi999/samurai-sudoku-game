import type { MetadataRoute } from 'next';

import { locales } from '@/i18n';
import { getPuzzleIndex } from '@/lib/puzzles';
import { buildAbsoluteUrl } from '@/lib/site-url';
import type { Difficulty, PuzzleMetadata } from '@/lib/sudoku/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const HIGH_INTENT_DIFFICULTIES = new Set<Difficulty>(['hard', 'evil']);

function getPuzzleAgeDays(puzzleId: string, referenceDate: Date) {
  const puzzleDate = new Date(`${puzzleId}T00:00:00.000Z`);
  if (Number.isNaN(puzzleDate.getTime())) return Number.POSITIVE_INFINITY;

  return Math.max(0, Math.floor((referenceDate.getTime() - puzzleDate.getTime()) / DAY_MS));
}

function getPuzzleSitemapHints(puzzle: PuzzleMetadata, referenceDate: Date) {
  const ageDays = getPuzzleAgeDays(puzzle.id, referenceDate);
  const isHighIntent = HIGH_INTENT_DIFFICULTIES.has(puzzle.difficulty);

  if (ageDays <= 14) {
    return {
      changeFrequency: 'weekly' as const,
      priority: isHighIntent ? 0.72 : 0.68,
    };
  }

  if (ageDays <= 90) {
    return {
      changeFrequency: 'monthly' as const,
      priority: isHighIntent ? 0.58 : 0.54,
    };
  }

  return {
    changeFrequency: 'yearly' as const,
    priority: isHighIntent ? 0.44 : 0.4,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const difficulties = ['easy', 'medium', 'hard', 'evil'];
  const routes = [
    { path: '', changeFrequency: 'daily' as const, priority: 1, followsIndex: true },
    { path: '/games/samurai', changeFrequency: 'daily' as const, priority: 0.9, followsIndex: true },
    { path: '/games/samurai/daily', changeFrequency: 'daily' as const, priority: 0.86, followsIndex: true },
    { path: '/games/samurai/archive', changeFrequency: 'weekly' as const, priority: 0.85, followsIndex: true },
    { path: '/games/samurai/what-is-samurai-sudoku', changeFrequency: 'monthly' as const, priority: 0.75 },
    { path: '/games/samurai/how-to-play', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/games/samurai/solver', changeFrequency: 'monthly' as const, priority: 0.74 },
    { path: '/games/samurai/printable', changeFrequency: 'monthly' as const, priority: 0.73 },
    { path: '/games/samurai/pdf', changeFrequency: 'monthly' as const, priority: 0.72 },
    { path: '/games/samurai/pdf/sample', changeFrequency: 'monthly' as const, priority: 0.68 },
    { path: '/games/samurai/strategy-guide', changeFrequency: 'monthly' as const, priority: 0.72 },
    { path: '/games/samurai/beginners', changeFrequency: 'monthly' as const, priority: 0.71 },
    { path: '/games/samurai/paper-practice', changeFrequency: 'monthly' as const, priority: 0.69 },
    { path: '/games/samurai/difficulty-guide', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/games/minesweeper', changeFrequency: 'weekly' as const, priority: 0.66 },
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
      const hints = getPuzzleSitemapHints(puzzle, indexLastModified);
      entries.push({
        url: buildAbsoluteUrl(`/${locale}${path}`),
        lastModified: new Date(`${puzzle.id}T00:00:00.000Z`),
        changeFrequency: hints.changeFrequency,
        priority: hints.priority,
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
