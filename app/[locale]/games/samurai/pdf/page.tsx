import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LegacySamuraiPdfPackPage({ params }: PageProps) {
  const { locale } = await params;
  permanentRedirect(`/${locale}/printable-samurai-sudoku#paid-100-puzzle-pack`);
}
