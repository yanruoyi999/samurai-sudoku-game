import { TrackedLink } from '@/components/analytics/TrackedLink';

import type { HomeLogicGameLink } from './home-types';

interface LogicGameSectionProps {
  links: HomeLogicGameLink[];
  locale: string;
}

export function LogicGameSection({ links, locale }: LogicGameSectionProps) {
  const isZh = locale === 'zh';

  return (
    <section className="mt-20 space-y-6 text-left">
      <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center">
        {isZh ? '更多高频逻辑游戏' : 'More high-frequency logic games'}
      </h2>
      <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto text-center">
        {isZh
          ? '保留武士数独作为核心，同时测试扫雷这类更高频、低门槛的益智游戏入口。'
          : 'Samurai Sudoku remains the core game while Minesweeper tests a lower-friction repeat-play entry point.'}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {links.map((link) => (
          <TrackedLink
            key={link.href}
            href={link.href}
            eventName="home_logic_game_click"
            eventProperties={{ game: link.game, locale }}
            className="rounded-lg border bg-background/80 p-5 text-left shadow-sm transition hover:border-primary hover:bg-primary/5"
          >
            <h3 className="text-lg font-medium text-primary mb-2">{link.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{link.body}</p>
          </TrackedLink>
        ))}
      </div>
    </section>
  );
}
