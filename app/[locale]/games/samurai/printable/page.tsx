import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LegacyPrintableSamuraiSudokuPage({ params }: PageProps) {
  const { locale } = await params;
  permanentRedirect(`/${locale}/printable-samurai-sudoku#free-3-puzzle-pack`);
}
