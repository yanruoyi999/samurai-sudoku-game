import {
  KIDS_SUDOKU_4X4_PUZZLES,
  KIDS_SUDOKU_6X6_PUZZLES,
  type KidsSudokuLevel,
  type KidsSudokuPuzzle,
} from './puzzles';

export type KidsWorksheetSize = 4 | 6;
export type KidsWorksheetLevel = KidsSudokuLevel | 'mixed';
export type KidsWorksheetCount = 2 | 4 | 6;

export interface KidsWorksheetOptions {
  size: KidsWorksheetSize;
  level: KidsWorksheetLevel;
  count: KidsWorksheetCount;
  seed: number;
  includeAnswers: boolean;
}

export interface KidsWorksheetSelection {
  puzzles: KidsSudokuPuzzle[];
  includeAnswers: boolean;
}

const LEVELS: KidsSudokuLevel[] = ['easy', 'medium', 'challenge'];
const COUNTS: KidsWorksheetCount[] = [2, 4, 6];

function seededShuffle<T>(values: readonly T[], seed: number) {
  const result = [...values];
  let state = (Math.trunc(seed) >>> 0) || 1;

  function nextRandom() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  }

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function getLibrary(size: KidsWorksheetSize) {
  if (size === 4) return KIDS_SUDOKU_4X4_PUZZLES;
  if (size === 6) return KIDS_SUDOKU_6X6_PUZZLES;
  throw new Error(`Unsupported Kids Sudoku worksheet size: ${size}`);
}

function validateOptions(options: KidsWorksheetOptions) {
  if (options.size !== 4 && options.size !== 6) {
    throw new Error(`Unsupported Kids Sudoku worksheet size: ${options.size}`);
  }
  if (options.level !== 'mixed' && !LEVELS.includes(options.level)) {
    throw new Error(`Unsupported Kids Sudoku worksheet level: ${options.level}`);
  }
  if (!COUNTS.includes(options.count)) {
    throw new Error(`Unsupported Kids Sudoku worksheet count: ${options.count}`);
  }
  if (!Number.isFinite(options.seed)) {
    throw new Error('Worksheet seed must be a finite number.');
  }
}

function selectMixed(
  library: readonly KidsSudokuPuzzle[],
  count: KidsWorksheetCount,
  seed: number,
) {
  const buckets = LEVELS.map((level, index) => ({
    level,
    puzzles: seededShuffle(
      library.filter((puzzle) => puzzle.level === level),
      seed + index * 997,
    ),
    cursor: 0,
  }));
  const selected: KidsSudokuPuzzle[] = [];
  const startingLevel = Math.abs(Math.trunc(seed)) % LEVELS.length;

  while (selected.length < count) {
    let added = false;
    for (let offset = 0; offset < buckets.length && selected.length < count; offset += 1) {
      const bucket = buckets[(startingLevel + offset) % buckets.length];
      const puzzle = bucket.puzzles[bucket.cursor];
      if (!puzzle) continue;
      bucket.cursor += 1;
      selected.push(puzzle);
      added = true;
    }
    if (!added) break;
  }

  return selected;
}

export function selectWorksheetPuzzles(
  options: KidsWorksheetOptions,
): KidsWorksheetSelection {
  validateOptions(options);
  const library = getLibrary(options.size);
  const candidates = options.level === 'mixed'
    ? selectMixed(library, options.count, options.seed)
    : seededShuffle(
        library.filter((puzzle) => puzzle.level === options.level),
        options.seed,
      ).slice(0, options.count);

  if (candidates.length < options.count) {
    throw new Error(
      `Not enough verified puzzles for ${options.size}x${options.size} ${options.level}: requested ${options.count}, found ${candidates.length}.`,
    );
  }

  return {
    puzzles: candidates,
    includeAnswers: options.includeAnswers,
  };
}
