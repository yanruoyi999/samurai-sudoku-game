import Link from 'next/link';

import type { HomeFeatureItem } from './home-types';

interface HomeHeroProps {
  browseArchiveLabel: string;
  description: string;
  features: HomeFeatureItem[];
  locale: string;
  playNowLabel: string;
}

export function HomeHero({
  browseArchiveLabel,
  description,
  features,
  locale,
  playNowLabel,
}: HomeHeroProps) {
  const isZh = locale === 'zh';

  return (
    <>
      <Link
        href={`/${locale}/games/samurai`}
        className="group inline-block rounded-2xl px-3 py-2 transition hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-label={isZh ? '打开今日武士数独谜题' : "Open today's Samurai Sudoku puzzle"}
      >
        <p className="text-sm md:text-base font-medium tracking-[0.25em] uppercase text-primary">
          {isZh ? '每日逻辑挑战' : 'Daily logic challenge'}
        </p>
        <h1 className="mt-3 font-display text-6xl md:text-8xl font-semibold tracking-tight leading-[0.95] group-hover:text-primary transition-colors">
          Samurai Sudoku
        </h1>
        <p className="mt-5 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
        <span className="mt-4 inline-flex text-sm font-medium text-primary opacity-80 group-hover:opacity-100">
          {isZh ? '点击标题即可开始今日谜题 →' : "Tap the title to start today's puzzle →"}
        </span>
      </Link>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
        <Link
          href={`/${locale}/games/samurai`}
          className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
        >
          {playNowLabel}
        </Link>
        <Link
          href={`/${locale}/games/samurai/archive`}
          className="px-8 py-4 border-2 border-primary text-primary rounded-lg font-semibold text-lg hover:bg-primary/10 transition-colors"
        >
          {browseArchiveLabel}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="p-6 rounded-lg border bg-secondary/40 hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h2 className="text-lg font-semibold mb-2">{feature.title}</h2>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
