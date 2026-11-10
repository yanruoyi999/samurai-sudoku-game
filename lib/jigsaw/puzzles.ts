export const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

type Puzzle = { id: string; regions: string; givens: string; solution: string };

// Original fixtures. Equal digits were exchanged across box edges in a
// constructed complete grid; the clues were reduced with a uniqueness check.
export const puzzles: readonly Puzzle[] = [
  {
    id: 'steps',
    regions: '000111122000012222001111222333445555333344555334444455666677788667778888666777888',
    givens: '000560800960008702814200000300056007008741300047020600006100473501370090003002000',
    solution: '732569814965418732814237965329856147658741329147923658296185473581374296473692581',
  },
  {
    id: 'bridges',
    regions: '000333666000333666001433667101443767111444777112544877212554887222555888222555888',
    givens: '095640230608001957031900000300079000406310009050000000079860100000020000023000048',
    solution: '795648231648231957231957486312579864486312579957486312579864123864123795123795648',
  },
  {
    id: 'switchbacks',
    regions: '001111122000112222000011222334444555333444455333345555667777888666777788666678888',
    givens: '038000004607000200010030007080075140570040006002000009800190003090320000403500001',
    solution: '238756914657419238914832657386975142579241386142683579865197423791324865423568791',
  },
];

export function arePeers(regions: string, a: number, b: number) {
  return a !== b && (
    Math.floor(a / 9) === Math.floor(b / 9) || a % 9 === b % 9 || regions[a] === regions[b]
  );
}

export function conflicts(regions: string, values: readonly number[]) {
  const found = new Set<number>();
  values.forEach((value, a) => {
    if (!value) return;
    for (let b = a + 1; b < values.length; b++) {
      if (value === values[b] && arePeers(regions, a, b)) { found.add(a); found.add(b); }
    }
  });
  return found;
}

export function isComplete(regions: string, values: readonly number[]) {
  return values.length === 81 && values.every(validDigit) && conflicts(regions, values).size === 0;
}

type Progress = { values: number[]; notes: number[][] };

function validDigit(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 9;
}

export function restoreProgress(givens: string, raw: string | null): Progress {
  let saved: {values?: unknown; notes?: unknown} | null = null;
  try { saved = raw ? JSON.parse(raw) : null; } catch { /* Start from the givens. */ }
  const savedValues = Array.isArray(saved?.values) ? saved.values : [];
  const savedNotes = Array.isArray(saved?.notes) ? saved.notes : [];
  const values = [...givens].map((given, i) => Number(given) || (validDigit(savedValues[i]) ? savedValues[i] : 0));
  const notes = values.map((value, i) => {
    const cell = savedNotes[i];
    return value || !Array.isArray(cell) ? [] : [...new Set(cell.filter(validDigit))].sort();
  });
  return { values, notes };
}
