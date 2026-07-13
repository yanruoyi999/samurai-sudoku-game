import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LegacyPrintableSamuraiSudokuPage({ params }: PageProps) {
  const { locale } = await params;
  redirect(`/${locale}/printable-samurai-sudoku`);
}
