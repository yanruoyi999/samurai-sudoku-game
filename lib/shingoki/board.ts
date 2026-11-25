export type Clue = { dot: string; color: 'white' | 'black'; count: number };
export const puzzles: [Clue[], Clue[]] = [
  [
    { dot: 'B1', color: 'white', count: 2 }, { dot: 'A1', color: 'black', count: 5 },
    { dot: 'C2', color: 'black', count: 2 }, { dot: 'D4', color: 'black', count: 3 },
  ],
  [
    { dot: 'A3', color: 'white', count: 2 }, { dot: 'A2', color: 'black', count: 3 },
    { dot: 'D1', color: 'black', count: 4 }, { dot: 'C3', color: 'black', count: 2 },
  ],
];

export const columns = ['A', 'B', 'C', 'D'];
export const rows = [1, 2, 3, 4];
export const dots = rows.flatMap(row => columns.map(column => column + row));
export const edges = dots.flatMap((dot, index) => {
  const x = index % 4;
  const y = Math.floor(index / 4);
  return [
    ...(x < 3 ? [{ id: dot + '-' + dots[index + 1], a: index, b: index + 1, x: x * 2 + 1, y: y * 2, horizontal: true }] : []),
    ...(y < 3 ? [{ id: dot + '-' + dots[index + 4], a: index, b: index + 4, x: x * 2, y: y * 2 + 1, horizontal: false }] : []),
  ];
});

const byId = new Map(edges.map(edge => [edge.id, edge]));

export function isEdge(value: unknown): value is string {
  return typeof value === 'string' && byId.has(value);
}

export function isSolvedLoop(clues: Clue[], selected: string[]): boolean {
  const neighbors: number[][] = dots.map(() => []);
  if (selected.length < 4 || new Set(selected).size !== selected.length) return false;
  for (const id of selected) {
    const edge = byId.get(id);
    if (!edge) return false;
    neighbors[edge.a].push(edge.b);
    neighbors[edge.b].push(edge.a);
  }
  if (neighbors.some(adjacent => adjacent.length !== 0 && adjacent.length !== 2)) return false;

  const start = neighbors.findIndex(adjacent => adjacent.length === 2);
  const loop = [start];
  let previous = start;
  let current = neighbors[start][0];
  while (current !== start) {
    loop.push(current);
    const [a, b] = neighbors[current];
    const next = a === previous ? b : a;
    previous = current;
    current = next;
  }
  if (loop.length !== selected.length) return false;

  const at = (i: number) => loop[(i + loop.length) % loop.length];
  return clues.every(clue => {
    const i = loop.indexOf(dots.indexOf(clue.dot));
    if (i < 0) return false;
    // In row-major order, a horizontal step is ±1 and a vertical step is ±4.
    const isStraight = at(i - 1) - at(i) === at(i) - at(i + 1);
    if ((clue.color === 'white') !== isStraight) return false;
    let count = 0;
    for (const step of [-1, 1]) {
      const direction = at(i + step) - at(i);
      let j = i;
      while (at(j + step) - at(j) === direction) {
        count++;
        j += step;
      }
    }
    return count === clue.count;
  });
}
