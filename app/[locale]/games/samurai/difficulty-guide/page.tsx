import { permanentRedirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function DifficultyGuideRedirect({ params }: PageProps) {
  const { locale } = await params;
  const normalizedLocale = locale === 'zh' ? 'zh' : 'en';

  permanentRedirect(`/${normalizedLocale}/games/samurai/choose-difficulty`);
}
