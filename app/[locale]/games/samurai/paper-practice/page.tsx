import type { Metadata } from 'next';

import { generateGuideMetadata, SamuraiGuidePage } from '../_guides/guide-page';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const GUIDE = 'paperPractice';
const ZH_DESCRIPTION = '用纸笔练习武士数独，学习候选数、重叠区标记、难度选择和完整复盘方法。';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const metadata = generateGuideMetadata(GUIDE, locale);

  return locale === 'zh'
    ? { ...metadata, description: ZH_DESCRIPTION }
    : metadata;
}

export default async function PaperPracticePage({ params }: PageProps) {
  const { locale } = await params;
  return <SamuraiGuidePage guide={GUIDE} locale={locale} />;
}
