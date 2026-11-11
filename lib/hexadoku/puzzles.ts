import { hexadokuBoards } from './boards';

export const HEXADOKU_SIZE = 16;
export const HEXADOKU_CELLS = HEXADOKU_SIZE ** 2;
export const HEXADOKU_DIGITS = Array.from({ length: HEXADOKU_SIZE }, (_, index) => index + 1);
const encoded = '0123456789ABCDEFG';
const allNotes = (1 << HEXADOKU_SIZE) - 1;

export type HexadokuLevel = (typeof hexadokuBoards)[number]['level'];

export type HexadokuPuzzle = {
  id: string;
  level: HexadokuLevel;
  blanks: number;
  givens: readonly number[];
  solution: readonly number[];
};

export const hexadokuPuzzles: HexadokuPuzzle[] = hexadokuBoards.map(board => ({
  ...board,
  givens: decode(board.givens),
  solution: decode(board.solution),
}));

function decode(board: string) {
  return Array.from(board.replace(/\s/g, ''), symbol => encoded.indexOf(symbol));
}

export function valueForHexadokuKey(key: string) {
  return key.length === 1 ? encoded.indexOf(key.toUpperCase()) : -1;
}

export function hexadokuBox(index: number) {
  return Math.floor(index / 64) * 4 + Math.floor(index % 16 / 4);
}

export type HexadokuProgress = { entries: number[]; notes: number[] };

export function readHexadokuProgress(raw: string | null, puzzle: HexadokuPuzzle): HexadokuProgress {
  let stored: Partial<HexadokuProgress> | null = null;
  try {
    if (raw) stored = JSON.parse(raw);
  } catch {
    // A damaged local entry starts this puzzle afresh.
  }
  const restore = (values: unknown, max: number) => puzzle.givens.map((given, index) => {
    const value = Array.isArray(values) && values.length === HEXADOKU_CELLS ? values[index] : 0;
    return !given && Number.isInteger(value) && value >= 0 && value <= max ? value : 0;
  });
  const entries = restore(stored?.entries, HEXADOKU_SIZE);
  return { entries, notes: restore(stored?.notes, allNotes).map((value, index) => entries[index] ? 0 : value) };
}
