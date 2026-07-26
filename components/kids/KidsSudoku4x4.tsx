import { KidsSudokuActivity } from '@/components/kids/KidsSudokuActivity';
import { KIDS_SUDOKU_4X4_PUZZLES } from '@/lib/kids-sudoku/puzzles';

interface KidsSudoku4x4Props {
  locale: string;
}

export function KidsSudoku4x4({ locale }: KidsSudoku4x4Props) {
  const normalizedLocale = locale === 'zh' ? 'zh' : 'en';

  return (
    <KidsSudokuActivity
      locale={normalizedLocale}
      puzzles={KIDS_SUDOKU_4X4_PUZZLES}
      nextStageHref={`/${normalizedLocale}/sudoku-for-kids/6x6`}
      nextStageLabel={{
        en: 'Try 6×6 Sudoku',
        zh: '尝试 6×6 数独',
      }}
    />
  );
}
