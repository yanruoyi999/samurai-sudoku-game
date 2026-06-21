import Link from 'next/link';
import type { Metadata } from 'next';
import { Difficulty } from '@/lib/sudoku/types';
import { getTranslations } from 'next-intl/server';
import { GameHistoryArchive } from '@/components/GameHistoryArchive';
import { getPuzzleIndex, isPuzzleDifficulty } from '@/lib/puzzles';
import { locales } from '@/i18n';
import { buildAbsoluteUrl } from '@/lib/site-url';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isZh = params.locale === 'zh';

  return {
    title: isZh ? '武士数独题库归档' : 'Samurai Sudoku Puzzle Archive',
    description: isZh
      ? '浏览全部公开武士数独题目，按难度筛选并直接在线游玩。'
      : 'Browse all public Samurai Sudoku puzzles, filter by difficulty, and play online.',
    alternates: {
      canonical: buildAbsoluteUrl(`/${params.locale}/games/samurai/archive`),
      languages: Object.fromEntries(
        locales.map((locale) => [
          locale,
          buildAbsoluteUrl(`/${locale}/games/samurai/archive`),
        ])
      ),
    },
  };
}

export default async function ArchivePage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { difficulty?: string; page?: string };
}) {
  const t = await getTranslations('archive');
  const tCommon = await getTranslations('common');
  const tGame = await getTranslations('game');

  const selectedDifficulty = isPuzzleDifficulty(searchParams.difficulty)
    ? searchParams.difficulty
    : undefined;
  const locale = params.locale;
  const pageParam = Number(searchParams.page);
  const currentPage = Number.isInteger(pageParam) && pageParam > 0
    ? pageParam
    : 1;
  const pageSize = 24;
  const index = await getPuzzleIndex();
  const filteredPuzzles = selectedDifficulty
    ? index.puzzles.filter((puzzle) => puzzle.difficulty === selectedDifficulty)
    : index.puzzles;
  const totalPages = Math.max(1, Math.ceil(filteredPuzzles.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const visiblePuzzles = filteredPuzzles.slice(pageStart, pageStart + pageSize);
  const showingStart = filteredPuzzles.length === 0 ? 0 : pageStart + 1;
  const showingEnd = Math.min(pageStart + visiblePuzzles.length, filteredPuzzles.length);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <Link
              href={`/${locale}`}
              className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
            >
              {tCommon('backToHome')}
            </Link>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('description')}
            </p>
          </div>

          <Link
            href={`/${locale}/games/samurai`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {t('playToday') || 'Play Now'}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm font-medium">{tGame('difficulty.label')}:</span>
          <div className="flex gap-2 flex-wrap">
            <DifficultyFilter
              difficulty={null}
              label={t('filters.all')}
              locale={locale}
              currentDifficulty={selectedDifficulty}
            />
            <DifficultyFilter
              difficulty="easy"
              label={tGame('difficulty.easy')}
              locale={locale}
              currentDifficulty={selectedDifficulty}
            />
            <DifficultyFilter
              difficulty="medium"
              label={tGame('difficulty.medium')}
              locale={locale}
              currentDifficulty={selectedDifficulty}
            />
            <DifficultyFilter
              difficulty="hard"
              label={tGame('difficulty.hard')}
              locale={locale}
              currentDifficulty={selectedDifficulty}
            />
            <DifficultyFilter
              difficulty="evil"
              label={tGame('difficulty.evil')}
              locale={locale}
              currentDifficulty={selectedDifficulty}
            />
          </div>
        </div>

        <section className="rounded-lg border bg-card overflow-hidden">
          <div className="border-b px-4 py-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">
                {locale === 'zh' ? '公开题库' : 'Public puzzle library'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('pagination.showing', {
                  start: showingStart,
                  end: showingEnd,
                  total: filteredPuzzles.length,
                })}
              </p>
            </div>
          </div>

          {visiblePuzzles.length === 0 ? (
            <div className="px-4 py-10 text-center text-muted-foreground">
              {t('noResults')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t('table.id')}</th>
                    <th className="px-4 py-3 font-medium">{t('table.difficulty')}</th>
                    <th className="px-4 py-3 font-medium">{t('table.estimatedTime')}</th>
                    <th className="px-4 py-3 font-medium">{t('table.tags')}</th>
                    <th className="px-4 py-3 font-medium text-right">{t('table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePuzzles.map((puzzle) => (
                    <tr key={puzzle.id} className="border-t">
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/${locale}/games/samurai/${puzzle.id}`}
                          className="hover:text-primary"
                        >
                          {puzzle.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {tGame(`difficulty.${puzzle.difficulty}`)}
                      </td>
                      <td className="px-4 py-3">
                        {puzzle.estimatedTime} {t('minutesShort')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {puzzle.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/${locale}/games/samurai/${puzzle.id}`}
                          className="inline-flex rounded-md bg-primary px-3 py-1 text-primary-foreground hover:bg-primary/90"
                        >
                          {t('play')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="flex items-center justify-between border-t px-4 py-3 text-sm">
              {safePage > 1 ? (
                <Link
                  href={buildArchiveHref(locale, selectedDifficulty, safePage - 1)}
                  className="rounded border px-3 py-1 hover:bg-accent"
                >
                  {t('pagination.previous')}
                </Link>
              ) : (
                <span className="rounded border px-3 py-1 text-muted-foreground opacity-50">
                  {t('pagination.previous')}
                </span>
              )}
              <span className="text-muted-foreground">
                {t('pagination.page')} {safePage} {t('pagination.of')} {totalPages}
              </span>
              {safePage < totalPages ? (
                <Link
                  href={buildArchiveHref(locale, selectedDifficulty, safePage + 1)}
                  className="rounded border px-3 py-1 hover:bg-accent"
                >
                  {t('pagination.next')}
                </Link>
              ) : (
                <span className="rounded border px-3 py-1 text-muted-foreground opacity-50">
                  {t('pagination.next')}
                </span>
              )}
            </nav>
          ) : null}
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">
            {locale === 'zh' ? '我的本地完成记录' : 'My local completion history'}
          </h2>
          <GameHistoryArchive selectedDifficulty={selectedDifficulty} />
        </section>
      </main>
    </div>
  );
}

function buildArchiveHref(locale: string, difficulty: Difficulty | undefined, page: number) {
  const params = new URLSearchParams();
  if (difficulty) params.set('difficulty', difficulty);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return `/${locale}/games/samurai/archive${query ? `?${query}` : ''}`;
}

function DifficultyFilter({
  difficulty,
  label,
  currentDifficulty,
  locale,
}: {
  difficulty: Difficulty | null;
  label: string;
  currentDifficulty?: Difficulty;
  locale: string;
}) {
  const isActive = difficulty === currentDifficulty || (!difficulty && !currentDifficulty);
  const basePath = `/${locale}/games/samurai/archive`;

  return (
    <Link
      href={difficulty ? `${basePath}?difficulty=${difficulty}` : basePath}
      className={`px-3 py-1 text-sm rounded border transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-accent'
      }`}
    >
      {label}
    </Link>
  );
}
