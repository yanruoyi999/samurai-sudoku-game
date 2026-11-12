import type { Metadata } from 'next';
import { SudokuGenerator } from '@/components/sudoku-generator/SudokuGenerator';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';

const path = '/sudoku-generator';
type Props = { params: Promise<{ locale: string }> };

const copy = {
  en: {
    title: 'Sudoku Generator | Create a Classic 9×9 Puzzle',
    heading: 'Sudoku Generator',
    description: 'Generate a classic 9×9 Sudoku in your browser. Every puzzle has one verified solution. Copy or print the clues, and reveal the answer when you’re ready.',
  },
  zh: {
    title: '数独生成器｜生成经典 9×9 数独',
    heading: '数独生成器',
    description: '在浏览器中生成经典 9×9 数独。每道题都经过唯一解验证，可以复制或打印题目，随时查看答案。',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const { title, description } = copy[locale];
  const url = buildLocalizedUrl(locale, path);

  return {
    title,
    description,
    alternates: { canonical: url, languages: buildLanguageAlternates(path) },
    openGraph: { title, description, url, type: 'website' },
    robots: { index: false, follow: true },
  };
}

export default async function SudokuGeneratorPage({ params }: Props) {
  const locale = (await params).locale === 'zh' ? 'zh' : 'en';
  const { heading, description } = copy[locale];

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-8 sm:py-12
      max-md:[&~a]:static max-md:[&~a]:mb-4 max-md:[&~a]:ml-auto max-md:[&~a]:mr-4
      print:space-y-0 print:p-0 print:[&~a]:hidden">
      <header className="space-y-3 print:hidden">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{heading}</h1>
        <p className="max-w-xl leading-7 text-muted-foreground">{description}</p>
      </header>
      <SudokuGenerator locale={locale} />
    </main>
  );
}
