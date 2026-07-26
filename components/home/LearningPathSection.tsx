import Link from 'next/link';

import type { HomeLinkItem } from './home-types';

interface LearningPathSectionProps {
  links: HomeLinkItem[];
  locale: string;
}

export function LearningPathSection({ links, locale }: LearningPathSectionProps) {
  const isZh = locale === 'zh';

  return (
    <section className="mt-20 space-y-6 text-left">
      <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center">
        {isZh ? '学习路径' : 'Learning path'}
      </h2>
      <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto text-center">
        {isZh
          ? '先掌握规则和第一步，再选择难度、学习完整通关流程，最后进入中高级技巧和专项练习。'
          : 'Learn the rules and first move, choose a difficulty, follow the full solving workflow, then move into advanced and specialist practice.'}
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border bg-background/80 p-5 text-left shadow-sm transition hover:border-primary hover:bg-primary/5"
          >
            <h3 className="text-lg font-medium text-primary mb-2">{link.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{link.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
