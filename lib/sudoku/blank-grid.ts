export type BlankSudokuGridTemplate = '4x4' | '6x6' | '9x9' | 'samurai';

interface BlankGridOptions {
  template: BlankSudokuGridTemplate;
  lineWeight?: 'normal' | 'bold';
}

interface GridSpec {
  rows: number;
  columns: number;
  boxRows: number;
  boxColumns: number;
}

const CELL_SIZE = 32;
const MARGIN = 8;

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function getStandardSpec(template: Exclude<BlankSudokuGridTemplate, 'samurai'>): GridSpec {
  if (template === '4x4') {
    return { rows: 4, columns: 4, boxRows: 2, boxColumns: 2 };
  }
  if (template === '6x6') {
    return { rows: 6, columns: 6, boxRows: 2, boxColumns: 3 };
  }
  return { rows: 9, columns: 9, boxRows: 3, boxColumns: 3 };
}

function line({
  x1,
  y1,
  x2,
  y2,
  thick,
  lineWeight,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thick: boolean;
  lineWeight: 'normal' | 'bold';
}) {
  const regularWidth = lineWeight === 'bold' ? 1.5 : 1;
  const thickWidth = lineWeight === 'bold' ? 3.5 : 2.5;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111827" stroke-width="${thick ? thickWidth : regularWidth}" />`;
}

function renderBoard({
  originRow,
  originColumn,
  spec,
  lineWeight,
}: {
  originRow: number;
  originColumn: number;
  spec: GridSpec;
  lineWeight: 'normal' | 'bold';
}) {
  const x = MARGIN + originColumn * CELL_SIZE;
  const y = MARGIN + originRow * CELL_SIZE;
  const width = spec.columns * CELL_SIZE;
  const height = spec.rows * CELL_SIZE;
  const lines: string[] = [
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#ffffff" />`,
  ];

  for (let row = 0; row <= spec.rows; row += 1) {
    lines.push(line({
      x1: x,
      y1: y + row * CELL_SIZE,
      x2: x + width,
      y2: y + row * CELL_SIZE,
      thick: row % spec.boxRows === 0,
      lineWeight,
    }));
  }
  for (let column = 0; column <= spec.columns; column += 1) {
    lines.push(line({
      x1: x + column * CELL_SIZE,
      y1: y,
      x2: x + column * CELL_SIZE,
      y2: y + height,
      thick: column % spec.boxColumns === 0,
      lineWeight,
    }));
  }

  return lines.join('');
}

export function buildBlankSudokuGridSvg({
  template,
  lineWeight = 'normal',
}: BlankGridOptions) {
  const isSamurai = template === 'samurai';
  const rows = isSamurai ? 21 : getStandardSpec(template).rows;
  const columns = isSamurai ? 21 : getStandardSpec(template).columns;
  const width = columns * CELL_SIZE + MARGIN * 2;
  const height = rows * CELL_SIZE + MARGIN * 2;
  const title = template === 'samurai'
    ? 'Blank Samurai Sudoku grid'
    : `Blank ${template} Sudoku grid`;

  const content = isSamurai
    ? [
        [0, 0],
        [0, 12],
        [6, 6],
        [12, 0],
        [12, 12],
      ].map(([originRow, originColumn]) => renderBoard({
        originRow,
        originColumn,
        spec: { rows: 9, columns: 9, boxRows: 3, boxColumns: 3 },
        lineWeight,
      })).join('')
    : renderBoard({
        originRow: 0,
        originColumn: 0,
        spec: getStandardSpec(template),
        lineWeight,
      });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="blank-grid-title">`,
    `<title id="blank-grid-title">${escapeXml(title)}</title>`,
    `<rect width="${width}" height="${height}" fill="#ffffff" />`,
    content,
    '</svg>',
  ].join('');
}

export function getBlankGridFileStem(template: BlankSudokuGridTemplate) {
  return template === 'samurai'
    ? 'blank-samurai-sudoku-grid'
    : `blank-${template}-sudoku-grid`;
}
