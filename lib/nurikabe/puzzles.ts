export const SIZE = 5;
const CELL_COUNT = SIZE * SIZE;

export type Mark = 'blank' | 'sea' | 'island';
export type Reason = 'size' | 'connected' | 'square';
type Clues = Readonly<Partial<Record<number, number>>>;
type Deduction = {
  cell: number;
  sea: readonly number[];
  mark: Exclude<Mark, 'blank'>;
  reason: Reason;
};

export const lessonClues: Clues = { 1: 2, 3: 3, 11: 1, 13: 1, 20: 3, 23: 2 };
export const practiceClues: Clues = { 1: 1, 4: 2, 10: 1, 13: 2, 19: 2, 21: 3 };
export const deductions: readonly Deduction[] = [
  { cell: 12, sea: [], mark: 'sea', reason: 'size' },
  { cell: 7, sea: [2, 12], mark: 'sea', reason: 'connected' },
  { cell: 21, sea: [16, 17, 22], mark: 'island', reason: 'square' },
];

export function checkDeduction(
  step: Deduction,
  cell: number,
  mark: Exclude<Mark, 'blank'>,
  reason: Reason,
) {
  if (cell !== step.cell) return 'cell';
  if (mark !== step.mark) return 'mark';
  if (reason !== step.reason) return 'reason';
  return 'correct';
}

function neighbors(cell: number): number[] {
  const result: number[] = [];
  const column = cell % SIZE;
  if (cell >= SIZE) result.push(cell - SIZE);
  if (cell + SIZE < CELL_COUNT) result.push(cell + SIZE);
  if (column > 0) result.push(cell - 1);
  if (column < SIZE - 1) result.push(cell + 1);
  return result;
}

export function checkBoard(clues: Clues, marks: readonly Mark[]) {
  if (marks.length !== CELL_COUNT || marks.includes('blank')) return 'incomplete';

  for (let cell = 0; cell < CELL_COUNT; cell++) {
    if (marks[cell] !== 'sea') continue;
    if (clues[cell] !== undefined) return 'invalid';
    if (cell % SIZE === SIZE - 1 || cell + SIZE >= CELL_COUNT) continue;
    if ([cell + 1, cell + SIZE, cell + SIZE + 1].every((other) => marks[other] === 'sea')) {
      return 'invalid';
    }
  }

  const visited = new Set<number>();
  let seaComponents = 0;
  for (let cell = 0; cell < CELL_COUNT; cell++) {
    if (visited.has(cell)) continue;
    const mark = marks[cell];
    const group = [cell];
    visited.add(cell);
    for (let head = 0; head < group.length; head++) {
      for (const next of neighbors(group[head])) {
        if (marks[next] !== mark || visited.has(next)) continue;
        group.push(next);
        visited.add(next);
      }
    }
    if (mark === 'sea') {
      seaComponents++;
      if (seaComponents > 1) return 'invalid';
    } else {
      const numbered = group.filter((member) => clues[member] !== undefined);
      if (numbered.length !== 1 || clues[numbered[0]] !== group.length) return 'invalid';
    }
  }
  return seaComponents === 1 ? 'solved' : 'invalid';
}
