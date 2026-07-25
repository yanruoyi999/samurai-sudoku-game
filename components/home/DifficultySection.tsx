import Link from 'next/link';

import { getSamuraiGuide } from '@/lib/samurai/guides';

interface DifficultySectionProps {
  locale: string;
}

export function DifficultySection({ locale }: DifficultySectionProps) {
  const isZh = locale === 'zh';
  const definitionGuide = getSamuraiGuide(locale, 'what-is');
  const difficultyGuide = getSamuraiGuide(locale, 'choose-difficulty');
  const rulesGuide = getSamuraiGuide(locale, 'how-to-play');

  const difficulties = [
    ['easy', isZh ? '简单' : 'Easy', isZh ? '轻松入门' : 'Gentle start'],
    ['medium', isZh ? '中等' : 'Medium', isZh ? '稳步推理' : 'Steady logic'],
    ['hard', isZh ? '困难' : 'Hard', isZh ? '深度推理' : 'Deep deduction'],
    ['evil', isZh ? 'Evil 极难' : 'Evil', isZh ? '终极挑战' : 'Ultimate test'],
  ] as const;

  return (
    <section className="mt-20 space-y-6">
      <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
        {isZh ? '按难度选择' : 'Choose your difficulty'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {difficulties.map(([difficulty, label, subtitle]) => (
          <Link
            key={difficulty}
            href={`/${locale}/games/samurai/difficulty/${difficulty}`}
            className="rounded-lg border bg-secondary/40 p-5 text-left hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <div className="text-lg font-semibold">{label}</div>
            <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-center">
        {[definitionGuide, difficultyGuide, rulesGuide].map((guide) => (
          <Link
            key={guide.key}
            href={guide.href}
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            {guide.title}
            <span aria-hidden>→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
