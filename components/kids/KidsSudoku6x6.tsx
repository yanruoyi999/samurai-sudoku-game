import { KidsSudokuActivity } from '@/components/kids/KidsSudokuActivity';
import { KIDS_SUDOKU_6X6_PUZZLES } from '@/lib/kids-sudoku/puzzles';

interface KidsSudoku6x6Props {
  locale: string;
}

export function KidsSudoku6x6({ locale }: KidsSudoku6x6Props) {
  const normalizedLocale = locale === 'zh' ? 'zh' : 'en';

  return (
    <KidsSudokuActivity
      locale={normalizedLocale}
      puzzles={KIDS_SUDOKU_6X6_PUZZLES}
      nextStageHref={`/${normalizedLocale}/sudoku-for-kids/worksheet-generator`}
      nextStageLabel={{
        en: 'Build a worksheet',
        zh: '生成练习纸',
      }}
    />
  );
}
