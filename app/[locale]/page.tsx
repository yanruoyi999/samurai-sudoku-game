import Link from "next/link";
import Script from "next/script";
import { getLocale, getTranslations, getMessages } from 'next-intl/server';

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getTranslations('home');

  const messages = await getMessages({ locale });
  const homeMessages = (messages as any)?.home ?? {};
  const seoSection = homeMessages.seoSection ?? {};
  const faqSection = homeMessages.faq ?? {};

  const seoPoints: string[] = Array.isArray(seoSection.points)
    ? seoSection.points
    : [];
  const faqItems: { question: string; answer: string }[] = Array.isArray(
    faqSection.items
  )
    ? faqSection.items
    : [];
  const seoPointHeading: string =
    typeof seoSection.pointHeading === 'string'
      ? seoSection.pointHeading
      : t('seoSection.title');

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
        <p className="text-sm md:text-base font-medium tracking-[0.25em] uppercase text-primary">
          {locale === 'zh' ? '每日逻辑挑战' : 'Daily logic challenge'}
        </p>
        <h1 className="font-display text-6xl md:text-8xl font-semibold tracking-tight leading-[0.95]">
          Samurai Sudoku
        </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              href={`/${locale}/games/samurai`}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
            >
              {t('playNow')}
            </Link>

            <Link
              href={`/${locale}/games/samurai/archive`}
              className="px-8 py-4 border-2 border-primary text-primary rounded-lg font-semibold text-lg hover:bg-primary/10 transition-colors"
            >
              {t('browseArchive')}
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <FeatureCard
              icon="📱"
              title={t('features.offline')}
              description={t('features.offlineDesc')}
            />
            <FeatureCard
              icon="💡"
              title={t('features.intelligent')}
              description={t('features.intelligentDesc')}
            />
            <FeatureCard
              icon="📊"
              title={t('features.progress')}
              description={t('features.progressDesc')}
            />
          </div>

          <section className="mt-20 space-y-6 text-left">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center">
              {t('seoSection.title')}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto text-center">
              {t('seoSection.description')}
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {seoPoints.map((point, index) => (
                <div
                  key={index}
                  className="p-5 rounded-lg border bg-background/80 shadow-sm"
                >
                  <h3 className="text-lg font-medium text-primary mb-2">
                    {`${seoPointHeading} ${index + 1}`}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-2">
              <Link
                href={`/${locale}/games/samurai/archive`}
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
              >
                {t('seoSection.cta')}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </section>

          <section className="mt-16 space-y-6 text-left">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center">
              {t('faq.title')}
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqItems.map((item, index) => (
                <details
                  key={index}
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
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <p>{t('footer')}</p>
        <nav
          aria-label={locale === 'zh' ? '网站信息' : 'Site information'}
          className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2"
        >
          <Link href={`/${locale}/about`} className="text-primary hover:text-primary/80">
            {t('about')}
          </Link>
          <Link href={`/${locale}/contact`} className="text-primary hover:text-primary/80">
            {t('contact')}
          </Link>
          <Link href={`/${locale}/privacy`} className="text-primary hover:text-primary/80">
            {t('privacy')}
          </Link>
        </nav>
      </footer>
    </main>

    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      strategy="afterInteractive"
    />
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg border bg-secondary/40 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
