import { readFile } from 'fs/promises';
import { join } from 'path';
import Link from 'next/link';
import { PuzzleIndex, Difficulty } from '@/lib/sudoku/types';

// Revalidate every hour
export const revalidate = 3600;

async function getPuzzleIndex(): Promise<PuzzleIndex> {
  try {
    const indexPath = join(process.cwd(), 'public/puzzles/index.json');
    const content = await readFile(indexPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load puzzle index:', error);
    return {
      puzzles: [],
      total: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: { difficulty?: string; page?: string };
}) {
  const index = await getPuzzleIndex();
  const currentPage = parseInt(searchParams.page || '1', 10);
  const selectedDifficulty = searchParams.difficulty as Difficulty | undefined;

  // Filter by difficulty
  let filteredPuzzles = index.puzzles;
  if (selectedDifficulty) {
    filteredPuzzles = index.puzzles.filter(
      (p) => p.difficulty === selectedDifficulty
    );
  }

  // Pagination
  const pageSize = 30;
  const totalPages = Math.ceil(filteredPuzzles.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedPuzzles = filteredPuzzles.slice(startIdx, endIdx);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
            >
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold">Puzzle Archive</h1>
            <p className="text-sm text-muted-foreground">
              {index.total} puzzles available
            </p>
          </div>

          <Link
            href="/games/samurai"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Play Today's Puzzle
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm font-medium">Filter by difficulty:</span>
          <div className="flex gap-2">
            <DifficultyFilter
              difficulty={null}
              label="All"
              currentDifficulty={selectedDifficulty}
            />
            <DifficultyFilter
              difficulty="easy"
              label="Easy"
              currentDifficulty={selectedDifficulty}
            />
            <DifficultyFilter
              difficulty="medium"
              label="Medium"
              currentDifficulty={selectedDifficulty}
            />
            <DifficultyFilter
              difficulty="hard"
              label="Hard"
              currentDifficulty={selectedDifficulty}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 text-sm text-muted-foreground">
          Showing {paginatedPuzzles.length} of {filteredPuzzles.length} puzzles
          {selectedDifficulty && ` (${selectedDifficulty})`}
        </div>

        {/* Puzzle List */}
        {paginatedPuzzles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No puzzles found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Difficulty</th>
                  <th className="text-left p-3 font-medium">Est. Time</th>
                  <th className="text-left p-3 font-medium">Tags</th>
                  <th className="text-right p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPuzzles.map((puzzle) => (
                  <tr
                    key={puzzle.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <span className="font-medium">{puzzle.id}</span>
                    </td>
                    <td className="p-3">
                      <DifficultyBadge difficulty={puzzle.difficulty} />
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {puzzle.estimatedTime} min
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {puzzle.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-secondary rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/games/samurai/${puzzle.id}`}
                        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors inline-block"
                      >
                        Play
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`?page=${currentPage - 1}${selectedDifficulty ? `&difficulty=${selectedDifficulty}` : ''}`}
                className="px-3 py-2 border rounded hover:bg-accent transition-colors"
              >
                Previous
              </Link>
            )}

            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages && (
              <Link
                href={`?page=${currentPage + 1}${selectedDifficulty ? `&difficulty=${selectedDifficulty}` : ''}`}
                className="px-3 py-2 border rounded hover:bg-accent transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function DifficultyFilter({
  difficulty,
  label,
  currentDifficulty,
}: {
  difficulty: Difficulty | null;
  label: string;
  currentDifficulty?: Difficulty;
}) {
  const isActive = difficulty === currentDifficulty || (!difficulty && !currentDifficulty);

  return (
    <Link
      href={difficulty ? `?difficulty=${difficulty}` : '/games/samurai/archive'}
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

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const colors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded ${colors[difficulty]}`}
    >
      {difficulty.toUpperCase()}
    </span>
  );
}
