import { permanentRedirect } from "next/navigation";

interface PrintablePuzzlePageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PrintablePuzzlePage({
  params,
}: PrintablePuzzlePageProps) {
  const { locale } = await params;
  permanentRedirect(`/${locale}/printable-samurai-sudoku#free-3-puzzle-pack`);
}
