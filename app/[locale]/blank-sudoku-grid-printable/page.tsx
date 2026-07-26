import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { BlankSudokuGridGenerator } from '@/components/sudoku/BlankSudokuGridGenerator';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/blank-sudoku-grid-printable';

const COPY = {
  en: {
    title: 'Blank Sudoku Grid Printable: Free PDF, PNG and SVG',
    description:
      'Create blank printable Sudoku grids in 4x4, 6x6, 9x9, and Samurai formats. Choose A4 or US Letter and print 1, 2, 4, or 6 grids per page.',
    intro:
      'Build a clean empty Sudoku sheet for copying a puzzle, teaching candidates, designing your own Sudoku, or working through a solution by hand.',
  },
  zh: {
    title: '空白数独网格打印：免费 PDF、PNG 和 SVG',
    description:
      '生成 4×4、6×6、9×9 和武士数独空白网格，支持 A4、US Letter，以及每页 1、2、4、6 个网格。',
    intro:
      '生成整洁的空白数独练习纸，可用于抄题、讲解候选数、自己设计数独，或在纸上拆解解题步骤。',
  },
} as const;

const FAQS = {
  en: [
    {
      question: 'Can I download a blank Sudoku grid as a PDF?',
      answer: 'Yes. Select the template and layout, choose Print or save PDF, then select Save as PDF in the browser print dialog.',
    },
    {
      question: 'Which blank Sudoku grid sizes are included?',
      answer: 'The generator includes 4x4, 6x6, standard 9x9, and a five-grid 21x21 Samurai Sudoku template.',
    },
    {
      question: 'Can I print multiple blank grids on one page?',
      answer: 'Yes. Choose 1, 2, 4, or 6 grids per page. A4 and US Letter are both available.',
    },
    {
      question: 'What are blank Sudoku grids used for?',
      answer: 'They are useful for copying newspaper puzzles, teaching solving techniques, recording candidate notes, building worksheets, and designing original puzzles.',
    },
  ],
  zh: [
    {
      question: '可以把空白数独网格下载成 PDF 吗？',
      answer: '可以。选择模板和排版，点击“打印或另存 PDF”，再在浏览器打印对话框中选择“另存为 PDF”。',
    },
    {
      question: '包含哪些空白数独尺寸？',
      answer: '包含 4×4、6×6、标准 9×9，以及五个网格组成的 21×21 武士数独模板。',
    },
    {
      question: '一页可以打印多个空白网格吗？',
      answer: '可以。每页可选 1、2、4、6 个网格，并支持 A4 和 US Letter。',
    },
    {
      question: '空白数独网格适合做什么？',
      answer: '适合抄写报纸题目、讲解解题技巧、记录候选数、制作练习纸，以及设计原创数独。',
    },
  ],
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const normalizedLocale = locale === 'zh' ? 'zh' : 'en';
  const copy = COPY[normalizedLocale];
  const canonical = buildLocalizedUrl(normalizedLocale, PATH);

  return {
    title: copy.title,
    description: copy.description,
    keywords: normalizedLocale === 'zh'
      ? ['空白数独网格打印', '数独空白表格', '9×9 数独网格 PDF', '空白武士数独']
      : ['blank printable sudoku', 'blank sudoku printable', 'sudoku grid printable blank', 'printable blank sudoku grid', 'empty sudoku printable'],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: { title: copy.title, description: copy.description, url: canonical, type: 'website' },
    twitter: { card: 'summary_large_image', title: copy.title, description: copy.description },
  };
}

export default async function BlankSudokuGridPrintablePage({ params }: PageProps) {
  const { locale } = await params;
  const normalizedLocale = locale === 'zh' ? 'zh' : 'en';
  const isZh = normalizedLocale === 'zh';
  const copy = COPY[normalizedLocale];
  const faqs = FAQS[normalizedLocale];
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isZh ? '首页' : 'Home',
        item: buildAbsoluteUrl(`/${normalizedLocale}`),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isZh ? '空白数独网格' : 'Blank Sudoku Grid',
        item: pageUrl,
      },
    ],
  };
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: copy.title,
    description: copy.description,
    url: pageUrl,
    isAccessibleForFree: true,
    inLanguage: normalizedLocale === 'zh' ? 'zh-CN' : 'en',
  };
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <main className="min-h-screen bg-background">
      {[breadcrumbJsonLd, webPageJsonLd, faqJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`blank-sudoku-grid-jsonld-${index}-${normalizedLocale}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article className="mx-auto max-w-6xl px-4 py-10 md:py-14 print:max-w-none print:px-0 print:py-0">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground print:hidden" aria-label="Breadcrumb">
          <Link href={`/${normalizedLocale}`} className="hover:text-foreground">{isZh ? '首页' : 'Home'}</Link>
          <span aria-hidden>/</span>
          <Link href={`/${normalizedLocale}/printable-sudoku`} className="hover:text-foreground">{isZh ? '可打印数独' : 'Printable Sudoku'}</Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">{isZh ? '空白网格' : 'Blank grids'}</span>
        </nav>

        <header className="border bg-primary/5 p-6 md:p-8 print:hidden">
          <p className="text-sm font-semibold uppercase text-primary">
            {isZh ? '一个页面覆盖所有空白模板' : 'One hub for every blank template'}
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{copy.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#blank-grid-generator" className="rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
              {isZh ? '创建空白网格' : 'Create a blank grid'}
            </a>
            <Link href={`/${normalizedLocale}/printable-sudoku`} className="rounded-md border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10">
              {isZh ? '打印带题目的数独' : 'Print puzzles with answers'}
            </Link>
          </div>
        </header>

        <section id="blank-grid-generator" className="mt-8 scroll-mt-28">
          <h2 className="mb-4 text-2xl font-semibold md:text-3xl">
            {isZh ? '选择网格、纸张和输出格式' : 'Choose a grid, paper, and output format'}
          </h2>
          <BlankSudokuGridGenerator locale={normalizedLocale} />
        </section>

        <section className="mt-12 grid gap-8 md:grid-cols-2 print:hidden">
          <div>
            <h2 className="text-3xl font-semibold">{isZh ? '哪种模板适合你？' : 'Which template should you use?'}</h2>
            <div className="mt-5 space-y-4 leading-7 text-muted-foreground">
              <p><strong className="text-foreground">4×4 / 6×6:</strong> {isZh ? '适合儿童、课堂演示和刚开始学习宫规则的用户。' : 'best for children, classroom demonstrations, and first lessons on box rules.'}</p>
              <p><strong className="text-foreground">9×9:</strong> {isZh ? '适合抄写普通数独、记录候选数和拆解高级技巧。' : 'best for copying standard puzzles, recording candidates, and diagramming techniques.'}</p>
              <p><strong className="text-foreground">{isZh ? '武士数独' : 'Samurai Sudoku'}:</strong> {isZh ? '适合规划五个重叠网格，尤其是中心和四个共享宫。' : 'best for mapping five overlapping grids, especially the center and four shared boxes.'}</p>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-semibold">{isZh ? '打印与文件格式' : 'Print and file formats'}</h2>
            <div className="mt-5 space-y-4 leading-7 text-muted-foreground">
              <p>{isZh ? 'PDF 保留固定纸张排版，适合直接打印和分享。PNG 适合放入作业、文档或演示文稿。SVG 在放大后仍然清晰，适合教师和内容创作者二次排版。' : 'PDF preserves a fixed paper layout for printing and sharing. PNG drops easily into worksheets and slides. SVG remains sharp at any scale for teachers and puzzle creators.'}</p>
              <p>{isZh ? '标准线适合日常使用；加粗线在黑白打印机、低墨量或视力辅助场景下更容易辨认宫线。' : 'Standard lines suit everyday use. Bold lines make box boundaries easier to recognize on monochrome printers, low-ink settings, and low-vision worksheets.'}</p>
            </div>
          </div>
        </section>

        <section className="mt-12 border bg-secondary/20 p-6 md:p-8 print:hidden">
          <h2 className="text-3xl font-semibold">{isZh ? '相关练习资源' : 'Related practice resources'}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${normalizedLocale}/printable-samurai-sudoku`} className="border bg-background p-4 font-semibold hover:border-primary">
              {isZh ? '武士数独打印包' : 'Samurai Sudoku printables'}
            </Link>
            <Link href={`/${normalizedLocale}/sudoku-cross-hatching`} className="border bg-background p-4 font-semibold hover:border-primary">
              {isZh ? '交叉排除法练习' : 'Cross-hatching practice'}
            </Link>
            <Link href={`/${normalizedLocale}/sudoku-naked-triple`} className="border bg-background p-4 font-semibold hover:border-primary">
              {isZh ? '裸三数候选训练' : 'Naked Triple candidates'}
            </Link>
            <Link href={`/${normalizedLocale}/games/samurai/candidate-notes`} className="border bg-background p-4 font-semibold hover:border-primary">
              {isZh ? '武士数独候选笔记' : 'Samurai candidate notes'}
            </Link>
          </div>
        </section>

        <section className="mt-12 print:hidden">
          <h2 className="text-3xl font-semibold">{isZh ? '常见问题' : 'Blank grid FAQ'}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <section key={faq.question} className="border p-5">
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{faq.answer}</p>
              </section>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
