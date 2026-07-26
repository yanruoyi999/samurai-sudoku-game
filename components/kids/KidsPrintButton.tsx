"use client";

import { trackInteraction } from '@/lib/analytics/events';
import { cn } from '@/lib/utils';

interface KidsPrintButtonProps {
  locale: string;
  location: string;
  label: string;
  className?: string;
}

export function KidsPrintButton({
  locale,
  location,
  label,
  className,
}: KidsPrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        trackInteraction('kids_sudoku_worksheet_print', {
          locale: locale === 'zh' ? 'zh' : 'en',
          location,
        });
        window.print();
      }}
      className={cn(
        'rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90 print:hidden',
        className,
      )}
    >
      {label}
    </button>
  );
}
