import Link from 'next/link';
import { Difficulty } from '@/lib/sudoku/types';
import { getTranslations } from 'next-intl/server';
import { GameHistoryArchive } from '@/components/GameHistoryArchive';

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

  const selectedDifficulty = searchParams.difficulty as Difficulty | undefined;
  const locale = params.locale;

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
              Your game history
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

        {/* Game History Archive - Client Component */}
        <GameHistoryArchive selectedDifficulty={selectedDifficulty} />
      </main>
    </div>
  );
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
