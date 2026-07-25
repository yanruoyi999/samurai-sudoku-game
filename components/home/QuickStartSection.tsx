import Link from 'next/link';

import type { HomeLinkItem } from './home-types';

interface QuickStartSectionProps {
  links: HomeLinkItem[];
  locale: string;
}

export function QuickStartSection({ links, locale }: QuickStartSectionProps) {
  return (
    <section className="pt-8 text-left" aria-labelledby="quick-start-heading">
      <h2 id="quick-start-heading" className="text-2xl md:text-3xl font-semibold text-center">
        {locale === 'zh' ? '你想先做什么？' : 'What would you like to do first?'}
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border bg-background/90 p-5 shadow-sm transition hover:border-primary hover:bg-primary/5"
          >
            <h3 className="text-lg font-semibold text-primary">{link.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{link.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
