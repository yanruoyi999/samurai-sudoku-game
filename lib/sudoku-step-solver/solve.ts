export const sudokuDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const cells = Array.from({ length: 81 }, (_, i) => i);
const row = (cell: number) => Math.floor(cell / 9);
const col = (cell: number) => cell % 9;
const box = (cell: number) => Math.floor(cell / 27) * 3 + Math.floor(col(cell) / 3);
const memberships = cells.map(cell => [row(cell), 9 + col(cell), 18 + box(cell)]);
const units = Array.from({ length: 27 }, (_, unit) => cells.filter(cell => memberships[cell].includes(unit)));
const peers = memberships.map(own => [...new Set(own.flatMap(unit => units[unit]))]);
const allDigits = (1 << 9) - 1;
const bit = (digit: number) => 1 << (digit - 1);
const digitOf = (mask: number) => 32 - Math.clz32(mask);
const maskSizes = Array.from({ length: allDigits + 1 }, (_, mask) => {
  let size = 0;
  for (; mask; mask &= mask - 1) size += 1;
  return size;
});

type Conflict = { unit: number; digit: number; cells: number[] };
export type SudokuStep =
  | { type: 'naked-single'; cell: number; digit: number }
  | { type: 'hidden-single'; cell: number; digit: number; unit: number }
  | { type: 'locked-candidate'; digit: number; source: number; target: number; anchors: number[]; removed: number[] };
export type SudokuResult =
  | { status: 'invalid' | 'none' | 'multiple' | 'limit' }
  | { status: 'conflict'; conflicts: Conflict[] }
  | { status: 'unique'; solution: number[]; steps: SudokuStep[]; logicComplete: boolean };

export function parseSudoku(text: string) {
  const compact = text.replace(/\s/g, '');
  if (!/^[0-9.]{81}$/.test(compact)) return null;
  return [...compact].map(char => char === '.' ? 0 : Number(char));
}

function usedDigits(board: readonly number[]) {
  return units.map(unit => unit.reduce((mask, cell) => board[cell] ? mask | bit(board[cell]) : mask, 0));
}

function available(used: readonly number[], cell: number) {
  const [r, c, b] = memberships[cell];
  return allDigits & ~(used[r] | used[c] | used[b]);
}

function exactSolutions(input: readonly number[]) {
  const board = [...input];
  const used = usedDigits(board);
  const solutions: number[][] = [];
  let remainingNodes = 3_000_000;

  function search() {
    if (remainingNodes-- <= 0) return;
    let next = -1;
    let options = 0;
    let smallest = 10;
    for (const cell of cells) {
      if (board[cell]) continue;
      const candidates = available(used, cell);
      const size = maskSizes[candidates];
      if (!size) return;
      if (size < smallest) {
        next = cell;
        options = candidates;
        smallest = size;
        if (size === 1) break;
      }
    }

    if (next === -1) {
      solutions.push([...board]);
      return;
    }
    const [r, c, b] = memberships[next];
    for (; options && solutions.length < 2 && remainingNodes > 0; options &= options - 1) {
      const choice = options & -options;
      board[next] = digitOf(choice);
      used[r] |= choice;
      used[c] |= choice;
      used[b] |= choice;
      search();
      board[next] = 0;
      used[r] ^= choice;
      used[c] ^= choice;
      used[b] ^= choice;
    }
  }

  search();
  return { solutions, exhausted: remainingNodes <= 0 };
}

function logicalTrace(input: readonly number[]) {
  const board = [...input];
  const used = usedDigits(board);
  const candidates = board.map((value, cell) => value ? 0 : available(used, cell));
  const steps: SudokuStep[] = [];

  function nextStep(): SudokuStep | undefined {
    const single = candidates.findIndex(mask => maskSizes[mask] === 1);
    if (single >= 0) return { type: 'naked-single', cell: single, digit: digitOf(candidates[single]) };

    const placements = units.map(unit => sudokuDigits.map(digit => unit.filter(cell => candidates[cell] & bit(digit))));
    for (const [unit, numbers] of placements.entries()) {
      const position = numbers.findIndex(found => found.length === 1);
      if (position >= 0) return { type: 'hidden-single', cell: numbers[position][0], digit: position + 1, unit };
    }

    for (const [source, numbers] of placements.entries()) {
      for (const [index, anchors] of numbers.entries()) {
        if (anchors.length < 2) continue;
        for (const target of memberships[anchors[0]]) {
          // A box can lock a digit into a line, or a line into one box.
          if ((source >= 18) === (target >= 18) || !anchors.every(cell => memberships[cell].includes(target))) continue;
          const removed = placements[target][index].filter(cell => !memberships[cell].includes(source));
          if (removed.length) return { type: 'locked-candidate', digit: index + 1, source, target, anchors, removed };
        }
      }
    }
  }

  for (let step = nextStep(); step; step = nextStep()) {
    steps.push(step);
    const mask = bit(step.digit);
    if (step.type === 'locked-candidate') {
      for (const cell of step.removed) candidates[cell] &= ~mask;
    } else {
      board[step.cell] = step.digit;
      candidates[step.cell] = 0;
      for (const cell of peers[step.cell]) candidates[cell] &= ~mask;
    }
  }
  return { steps, logicComplete: board.every(Boolean) };
}

export function solveSudoku(input: readonly number[]): SudokuResult {
  if (input.length !== 81 || cells.some(i => !Number.isInteger(input[i]) || input[i] < 0 || input[i] > 9)) {
    return { status: 'invalid' };
  }
  const conflicts = units.flatMap((unit, index) => sudokuDigits.flatMap(digit => {
    const repeated = unit.filter(cell => input[cell] === digit);
    return repeated.length > 1 ? [{ unit: index, digit, cells: repeated }] : [];
  }));
  if (conflicts.length) return { status: 'conflict', conflicts };

  const { solutions, exhausted } = exactSolutions(input);
  if (solutions.length === 2) return { status: 'multiple' };
  if (exhausted) return { status: 'limit' };
  if (!solutions.length) return { status: 'none' };
  return { status: 'unique', solution: solutions[0], ...logicalTrace(input) };
}
