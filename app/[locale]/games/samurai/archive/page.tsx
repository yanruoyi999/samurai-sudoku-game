import Link from 'next/link';
import type { Metadata } from 'next';
import { Difficulty } from '@/lib/sudoku/types';
import { getTranslations } from 'next-intl/server';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { GameHistoryArchive } from '@/components/GameHistoryArchive';
import { PRINTABLE_PUZZLE_OPEN_EVENT } from '@/lib/analytics/event-names';
import { getPuzzleIndex, isPuzzleDifficulty } from '@/lib/puzzles';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';

type ArchiveSearchParams = {
  difficulty?: string;
  page?: string;
};

const EMPTY_SEARCH_PARAMS: ArchiveSearchParams = {};

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<ArchiveSearchParams>;
}): Promise<Metadata> {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve(EMPTY_SEARCH_PARAMS),
  ]);
  const isZh = locale === 'zh';
  const canonical = buildLocalizedUrl(locale, '/games/samurai/archive');
  const hasFilteredView = Boolean(resolvedSearchParams.difficulty || resolvedSearchParams.page);

  return {
    title: isZh ? '武士数独题库归档 - 在线玩与打印' : 'Samurai Sudoku Archive - Play or Print Daily Puzzles',
    description: isZh
      ? '按日期与难度浏览全部公开武士数独，可直接在线游玩，或打印题面与答案并保存为 PDF。'
      : 'Browse public Samurai Sudoku puzzles by date and difficulty. Play online or print each puzzle with its answer key and save it as PDF.',
    alternates: {
      canonical,
      languages: buildLanguageAlternates('/games/samurai/archive'),
    },
    robots: hasFilteredView
      ? {
          index: false,
          follow: true,
        }
      : undefined,
    openGraph: {
      title: isZh ? '武士数独题库归档 - 在线玩与打印' : 'Samurai Sudoku Archive - Play or Print Daily Puzzles',
      description: isZh
        ? '按日期与难度浏览全部公开武士数独，可在线游玩或打印题面和答案。'
        : 'Browse dated Samurai Sudoku puzzles, play online, or print each puzzle with its answer key.',
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: isZh ? '武士数独题库归档 - 在线玩与打印' : 'Samurai Sudoku Archive - Play or Print Daily Puzzles',
      description: isZh
        ? '按日期与难度浏览公开武士数独，在线玩或打印答案版。'
        : 'Browse dated Samurai Sudoku puzzles, play online, or print answer-key editions.',
    },
  };
}

export default async function ArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<ArchiveSearchParams>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const t = await getTranslations('archive');
  const tCommon = await getTranslations('common');
  const tGame = await getTranslations('game');

  const selectedDifficulty = isPuzzleDifficulty(resolvedSearchParams.difficulty)
    ? resolvedSearchParams.difficulty
    : undefined;
  const pageParam = Number(resolvedSearchParams.page);
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
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {locale === 'zh' ? '按难度浏览：' : 'Browse by difficulty:'}
              </span>
              {(['easy', 'medium', 'hard', 'evil'] as const).map((d) => (
                <Link
                  key={d}
                  href={`/${locale}/games/samurai/difficulty/${d}`}
                  className="rounded-md border px-3 py-1 hover:bg-accent transition-colors"
                >
                  {tGame(`difficulty.${d}`)}
                </Link>
              ))}
              <TrackedLink
                href={`/${locale}/printable-samurai-sudoku`}
                eventName="archive_printable_hub_click"
                eventProperties={{ locale, location: 'archive_header' }}
                className="rounded-md border border-primary/40 px-3 py-1 font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                {locale === 'zh' ? '免费可打印题' : 'Free printables'}
              </TrackedLink>
            </div>
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
                        <div className="flex justify-end gap-2">
                          <TrackedLink
                            href={`/${locale}/games/samurai/printable/${puzzle.id}`}
                            eventName={PRINTABLE_PUZZLE_OPEN_EVENT}
                            eventProperties={{
                              locale,
                              puzzle_id: puzzle.id,
                              difficulty: puzzle.difficulty,
                              location: 'archive_table',
                            }}
                            className="inline-flex rounded-md border px-3 py-1 font-medium text-primary hover:bg-primary/10"
                          >
                            {locale === 'zh' ? '打印 / PDF' : 'Print / PDF'}
                          </TrackedLink>
                          <Link
                            href={`/${locale}/games/samurai/${puzzle.id}`}
                            className="inline-flex rounded-md bg-primary px-3 py-1 text-primary-foreground hover:bg-primary/90"
                          >
                            {t('play')}
                          </Link>
                        </div>
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

        <section className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-semibold">
            {locale === 'zh' ? '如何使用日期题库' : 'How to use the dated Samurai Sudoku archive'}
          </h2>
          <div className="mt-4 max-w-4xl space-y-4 leading-relaxed text-muted-foreground">
            <p>
              {locale === 'zh'
                ? '每道题都有固定日期 URL，适合记录进度、补练错过的每日题，或按相同难度连续练习。筛选和分页仅用于浏览，所有可收录题目都保持独立日期页面。'
                : 'Every puzzle has a stable dated URL for resuming progress, catching up on missed daily puzzles, or practicing several boards at the same difficulty. Filters and pagination are browsing tools; each indexable puzzle keeps its own dated page.'}
            </p>
            <p>
              {locale === 'zh'
                ? '纸笔解题时，点击每行的“打印 / PDF”打开黑白题面与独立答案页。需要批量下载时，请使用免费可打印武士数独中心的 20 题 A4 或 US Letter PDF。'
                : 'For paper solving, use Print / PDF on any row to open a clean black-and-white puzzle and a separate answer page. For a batch download, use the free printable Samurai Sudoku center and its 20-puzzle A4 or US Letter PDFs.'}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <Link href={`/${locale}/games/samurai/daily`} className="rounded-md border px-3 py-2 hover:bg-accent">
              {locale === 'zh' ? '今日武士数独' : "Today's Samurai Sudoku"}
            </Link>
            <Link href={`/${locale}/printable-samurai-sudoku`} className="rounded-md border px-3 py-2 hover:bg-accent">
              {locale === 'zh' ? '免费可打印武士数独' : 'Free printable Samurai Sudoku'}
            </Link>
            <Link href={`/${locale}/games/samurai/paper-practice`} className="rounded-md border px-3 py-2 hover:bg-accent">
              {locale === 'zh' ? '纸笔练习流程' : 'Paper practice workflow'}
            </Link>
          </div>
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
  const href = difficulty
    ? `/${locale}/games/samurai/difficulty/${difficulty}`
    : `/${locale}/games/samurai/archive`;

  return (
    <Link
      href={href}
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
