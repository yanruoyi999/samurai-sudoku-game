import type { Metadata } from 'next';

import { generateGuideMetadata, SamuraiGuidePage } from '../_guides/guide-page';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const GUIDE = 'solver';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateGuideMetadata(GUIDE, locale);
}

export default async function SamuraiSudokuSolverPage({ params }: PageProps) {
  const { locale } = await params;
  return <SamuraiGuidePage guide={GUIDE} locale={locale} />;
}
