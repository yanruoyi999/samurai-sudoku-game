import type { Locale } from '@/i18n';
import { columns, dots, edges, rows, type Clue } from '@/lib/shingoki/board';

export function ShingokiBoard({ clues, selected, disabled, onSelect, locale }: {
  clues: Clue[];
  selected: string[];
  disabled: boolean;
  onSelect: (id: string) => void;
  locale: Locale;
}) {
  const zh = locale === 'zh';
  const position = (x: number, y: number) => ({ gridColumn: x + 2, gridRow: y + 2 });
  return <figure className="w-full max-w-sm space-y-3">
    <div role="group" aria-label={zh ? 'Shingoki 点阵棋盘' : 'Shingoki dot board'}
      className="grid grid-cols-[1.25rem_repeat(7,minmax(0,1fr))] grid-rows-[1.25rem_repeat(7,minmax(0,1fr))] place-items-center rounded-lg border border-border bg-card p-1 text-sm font-medium aspect-square">
      {columns.map((letter, x) => <span aria-hidden="true" key={letter} style={position(x * 2, -1)}>{letter}</span>)}
      {rows.map((number, y) => <span aria-hidden="true" key={number} style={position(-1, y * 2)}>{number}</span>)}
      {dots.map((dot, i) => {
        const clue = clues.find(item => item.dot === dot);
        const name = clue ? (clue.color === 'white' ? (zh ? '白圈' : 'white circle') : (zh ? '黑圈' : 'black circle')) : '';
        return <span key={dot} aria-hidden="true" title={dot + ' ' + name}
          style={position(i % 4 * 2, Math.floor(i / 4) * 2)}
          className={'pointer-events-none z-10 grid place-items-center rounded-full ' + (clue
            ? 'size-7 border-2 border-black text-base font-bold ' + (clue.color === 'white' ? 'bg-white text-black' : 'bg-black text-white dark:border-white')
            : 'size-2 bg-foreground')}>{clue?.count}</span>;
      })}
      {edges.map(edge => {
        const drawn = selected.includes(edge.id);
        const orientation = edge.horizontal ? 'h-0 w-[200%] border-t' : 'h-[200%] w-0 border-l';
        const ink = drawn
          ? (edge.horizontal ? 'border-t-4' : 'border-l-4') + ' border-foreground'
          : 'border-dashed border-muted-foreground';
        return <button type="button" key={edge.id} aria-pressed={drawn} aria-label={edge.id}
          disabled={disabled} onClick={() => onSelect(edge.id)} style={position(edge.x, edge.y)}
          className="relative flex h-full w-full items-center justify-center rounded touch-manipulation hover:bg-muted focus-visible:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
          <span aria-hidden="true" className={'pointer-events-none absolute ' + orientation + ' ' + ink} />
        </button>;
      })}
    </div>
    <figcaption className="text-sm text-muted-foreground">{clues.map(clue => {
      const color = clue.color === 'white' ? (zh ? '白圈' : 'white') : (zh ? '黑圈' : 'black');
      return clue.dot + ' ' + color + ' ' + clue.count;
    }).join(' · ')}</figcaption>
  </figure>;
}
