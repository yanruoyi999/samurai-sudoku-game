"use client";

import { useMemo, useState } from 'react';

import { trackInteraction } from '@/lib/analytics/events';
import {
  buildBlankSudokuGridSvg,
  getBlankGridFileStem,
  type BlankSudokuGridTemplate,
} from '@/lib/sudoku/blank-grid';

interface BlankSudokuGridGeneratorProps {
  locale: string;
}

type GridCount = 1 | 2 | 4 | 6;
type PaperSize = 'a4' | 'letter';
type LineWeight = 'normal' | 'bold';

const TEMPLATES: BlankSudokuGridTemplate[] = ['4x4', '6x6', '9x9', 'samurai'];
const COUNTS: GridCount[] = [1, 2, 4, 6];

function templateLabel(template: BlankSudokuGridTemplate, isZh: boolean) {
  if (template === 'samurai') return isZh ? '武士数独 21×21' : 'Samurai Sudoku 21x21';
  return `${template} ${isZh ? '空白网格' : 'blank grid'}`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BlankSudokuGridGenerator({ locale }: BlankSudokuGridGeneratorProps) {
  const normalizedLocale = locale === 'zh' ? 'zh' : 'en';
  const isZh = normalizedLocale === 'zh';
  const [template, setTemplate] = useState<BlankSudokuGridTemplate>('9x9');
  const [count, setCount] = useState<GridCount>(2);
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  const [lineWeight, setLineWeight] = useState<LineWeight>('normal');
  const svg = useMemo(
    () => buildBlankSudokuGridSvg({ template, lineWeight }),
    [lineWeight, template],
  );

  const eventProperties = {
    locale: normalizedLocale,
    template,
    count,
    paper_size: paperSize,
    line_weight: lineWeight,
  };

  const printGrid = () => {
    trackInteraction('blank_sudoku_grid_print', eventProperties);
    window.print();
  };

  const downloadSvg = () => {
    downloadBlob(
      new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
      `${getBlankGridFileStem(template)}.svg`,
    );
    trackInteraction('blank_sudoku_grid_download', {
      ...eventProperties,
      format: 'svg',
    });
  };

  const downloadPng = () => {
    const source = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const sourceUrl = URL.createObjectURL(source);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1600;
      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(sourceUrl);
        return;
      }
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `${getBlankGridFileStem(template)}.png`);
          trackInteraction('blank_sudoku_grid_download', {
            ...eventProperties,
            format: 'png',
          });
        }
        URL.revokeObjectURL(sourceUrl);
      }, 'image/png');
    };
    image.onerror = () => URL.revokeObjectURL(sourceUrl);
    image.src = sourceUrl;
  };

  return (
    <section className="border bg-card p-5 md:p-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 print:hidden">
        <label className="grid gap-2 text-sm font-medium">
          <span>{isZh ? '网格模板' : 'Grid template'}</span>
          <select
            value={template}
            onChange={(event) => setTemplate(event.target.value as BlankSudokuGridTemplate)}
            className="rounded-md border bg-background px-3 py-2"
          >
            {TEMPLATES.map((option) => (
              <option key={option} value={option}>{templateLabel(option, isZh)}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          <span>{isZh ? '每页网格数' : 'Grids per page'}</span>
          <select
            value={count}
            onChange={(event) => setCount(Number(event.target.value) as GridCount)}
            className="rounded-md border bg-background px-3 py-2"
          >
            {COUNTS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          <span>{isZh ? '纸张' : 'Paper'}</span>
          <select
            value={paperSize}
            onChange={(event) => setPaperSize(event.target.value as PaperSize)}
            className="rounded-md border bg-background px-3 py-2"
          >
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          <span>{isZh ? '线条' : 'Line weight'}</span>
          <select
            value={lineWeight}
            onChange={(event) => setLineWeight(event.target.value as LineWeight)}
            className="rounded-md border bg-background px-3 py-2"
          >
            <option value="normal">{isZh ? '标准' : 'Standard'}</option>
            <option value="bold">{isZh ? '加粗' : 'Bold'}</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={printGrid}
          className="rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {isZh ? '打印或另存 PDF' : 'Print or save PDF'}
        </button>
        <button
          type="button"
          onClick={downloadPng}
          className="rounded-md border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10"
        >
          {isZh ? '下载 PNG' : 'Download PNG'}
        </button>
        <button
          type="button"
          onClick={downloadSvg}
          className="rounded-md border px-5 py-3 font-semibold hover:bg-accent"
        >
          {isZh ? '下载 SVG' : 'Download SVG'}
        </button>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground print:hidden">
        {isZh
          ? 'PDF 通过浏览器打印对话框生成；PNG 适合插入讲义或演示文稿；SVG 适合无损缩放和二次排版。所有模板均为空白，不含答案或题目数字。'
          : 'Use the browser print dialog to save a PDF. PNG works well in worksheets and slides, while SVG stays sharp when resized. Every template is empty and contains no puzzle digits or answers.'}
      </p>

      <section
        className={[
          'mt-8 grid gap-6',
          count === 1 ? 'grid-cols-1' : 'grid-cols-2 print:grid-cols-2 print:gap-3',
        ].join(' ')}
        data-paper-size={paperSize}
        aria-label={isZh ? '空白数独网格预览' : 'Blank Sudoku grid preview'}
      >
        {Array.from({ length: count }, (_, index) => (
          <figure key={index} className="break-inside-avoid border bg-white p-3 print:border-0 print:p-2">
            <figcaption className="mb-2 text-center text-sm font-semibold text-slate-900">
              {templateLabel(template, isZh)} · {index + 1}
            </figcaption>
            <div
              className="mx-auto aspect-square w-full max-w-[34rem]"
              dangerouslySetInnerHTML={{
                __html: svg.replaceAll('blank-grid-title', `blank-grid-title-${index}`),
              }}
            />
          </figure>
        ))}
      </section>
    </section>
  );
}
