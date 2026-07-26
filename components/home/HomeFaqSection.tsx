import type { HomeFaqItem } from './home-types';

interface HomeFaqSectionProps {
  items: HomeFaqItem[];
  title: string;
}

export function HomeFaqSection({ items, title }: HomeFaqSectionProps) {
  return (
    <section className="mt-16 space-y-6 text-left">
      <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center">
        {title}
      </h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((item) => (
          <details
            key={item.question}
            className="group border rounded-lg bg-background/80 p-4 transition-all"
          >
            <summary className="cursor-pointer text-lg font-medium text-foreground flex items-center justify-between">
              <span>{item.question}</span>
              <span className="text-primary group-open:rotate-90 transition-transform" aria-hidden>
                ➤
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
