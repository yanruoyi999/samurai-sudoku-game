import Link from "next/link";
import { getLocale, getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getTranslations('home');
  const tGame = await getTranslations('game');
  const tArchive = await getTranslations('archive');

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            {tGame('title')}
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
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <p>{t('footer')}</p>
      </footer>
    </main>
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
    <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
