"use client";

import { TrackedLink } from '@/components/analytics/TrackedLink';
import { getGameGuidanceLinks } from '@/lib/sudoku/game-guidance';
import type { Difficulty } from '@/lib/sudoku/types';
import { cn } from '@/lib/utils';

interface GameGuidancePanelProps {
  className?: string;
  difficulty: Difficulty | null;
  locale: string;
  location: 'game_body' | 'completion_card';
  puzzleId: string | null;
}

export function GameGuidancePanel({
  className,
  difficulty,
  locale,
  location,
  puzzleId,
}: GameGuidancePanelProps) {
  const isZh = locale === 'zh';
  const links = getGameGuidanceLinks(locale);

  return (
    <details className={cn('group rounded-lg border bg-secondary/30', className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold">
        <span>{isZh ? '遇到困难？查看针对性技巧' : 'Stuck? Open a focused guide'}</span>
        <span className="text-primary transition-transform group-open:rotate-90" aria-hidden>
          ➤
        </span>
      </summary>

      <div className="grid gap-2 border-t p-3 sm:grid-cols-2">
        {links.map((link) => (
          <TrackedLink
            key={link.key}
            href={link.href}
            eventName="game_help_link_click"
            eventProperties={{
              destination: link.href,
              difficulty: difficulty ?? '',
              locale,
              location,
              puzzle_id: puzzleId ?? '',
            }}
            className="rounded-md border bg-background px-3 py-2 transition-colors hover:border-primary hover:bg-primary/5"
          >
            <span className="block text-sm font-semibold text-primary">{link.label}</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              {link.description}
            </span>
          </TrackedLink>
        ))}
      </div>
    </details>
  );
}
