import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { PrintableSudokuGenerator } from '@/components/sudoku/PrintableSudokuGenerator';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/printable-sudoku';

const COPY = {
  en: {
    title: 'Free Printable Sudoku Puzzles With Answers',
    description:
      'Generate free printable 9x9 Sudoku puzzles with answers. Choose Easy, Medium, Hard, or Expert, A4 or US Letter, large print, and 1, 2, 4, or 6 puzzles.',
    intro:
      'Create a clean Sudoku worksheet in seconds. Choose the difficulty, page density, paper size, and whether to include answer keys, then print directly or save the result as a PDF.',
    eyebrow: 'Free 9x9 worksheet generator',
    generatorTitle: 'Build your printable Sudoku set',
  },
  zh: {
    title: '免费数独打印题：可选难度并附答案',
    description:
      '免费生成可打印的 9×9 数独题和答案，可选简单、中等、困难、专家，支持 A4、US Letter、大字版以及每页 1、2、4、6 题。',
    intro:
      '几秒钟生成整洁的数独练习纸。选择难度、每页题量、纸张和答案页，然后直接打印，或在浏览器中另存为 PDF。',
    eyebrow: '免费 9×9 练习纸生成器',
    generatorTitle: '生成你的可打印数独题',
  },
} as const;

const FAQS = {
  en: [
    {
      question: 'Are these printable Sudoku puzzles free?',
      answer: 'Yes. The generator is free, requires no account, and can be printed or saved as a PDF from your browser.',
    },
    {
      question: 'Do the printable Sudoku puzzles include answers?',
      answer: 'Answer keys are optional. Keep the Answer keys checkbox selected to place complete solutions after the puzzle pages.',
    },
    {
      question: 'Can I print on A4 and US Letter paper?',
      answer: 'Yes. Select A4 or US Letter before printing. The grids use high-contrast black lines that remain clear on either paper size.',
    },
    {
      question: 'How are the puzzle difficulties checked?',
      answer: 'Each puzzle is stored with a matching solution and automatically tested for exactly one solution. Difficulty labels are assigned to the curated source patterns.',
    },
    {
      question: 'Can I print large Sudoku grids?',
      answer: 'Yes. Enable Large-print mode for one larger puzzle at a time, useful for low-vision solvers or extra candidate-note space.',
    },
  ],
  zh: [
    {
      question: '这些数独打印题免费吗？',
      answer: '免费。生成器无需账号，可以直接打印，也可以通过浏览器另存为 PDF。',
    },
    {
      question: '打印题包含答案吗？',
      answer: '答案页可选。保留“附答案页”选项，完整答案会排在题目之后。',
    },
    {
      question: '支持 A4 和 US Letter 吗？',
      answer: '支持。打印前选择 A4 或 US Letter；两种纸张都会保留清晰的黑白粗细宫线。',
    },
    {
      question: '题目难度和答案如何验证？',
      answer: '每道题都保存对应答案，并通过自动化程序确认只有一个解；难度来自人工筛选的基础题型。',
    },
    {
      question: '可以打印大字数独吗？',
      answer: '可以。开启“大字单题版”后，每页重点展示一题，适合需要更大数字或更多候选笔记空间的用户。',
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
      ? ['数独打印', '免费数独打印题', '数独 PDF 答案', '大字数独打印', '9×9 数独练习纸']
      : ['sudoku printable', 'printable sudoku', 'free printable sudoku', 'sudoku puzzles printable pdf with answers', 'large print sudoku printable'],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
    },
  };
}

export default async function PrintableSudokuPage({ params }: PageProps) {
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
        name: isZh ? '可打印数独' : 'Printable Sudoku',
        item: pageUrl,
      },
    ],
  };
  const learningResourceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: copy.title,
    description: copy.description,
    url: pageUrl,
    learningResourceType: ['Worksheet generator', 'Logic puzzle'],
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
      {[breadcrumbJsonLd, learningResourceJsonLd, faqJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`printable-sudoku-jsonld-${index}-${normalizedLocale}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article className="mx-auto max-w-6xl px-4 py-10 md:py-14 print:max-w-none print:px-0 print:py-0">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground print:hidden" aria-label="Breadcrumb">
          <Link href={`/${normalizedLocale}`} className="hover:text-foreground">
            {isZh ? '首页' : 'Home'}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">{isZh ? '可打印数独' : 'Printable Sudoku'}</span>
        </nav>

        <header className="border bg-primary/5 p-6 md:p-8 print:hidden">
          <p className="text-sm font-semibold uppercase text-primary">{copy.eyebrow}</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{copy.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#generator" className="rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
              {isZh ? '立即生成打印题' : 'Generate printable puzzles'}
            </a>
            <Link href={`/${normalizedLocale}/printable-samurai-sudoku`} className="rounded-md border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10">
              {isZh ? '武士数独打印中心' : 'Samurai Sudoku printables'}
            </Link>
            <Link href={`/${normalizedLocale}/blank-sudoku-grid-printable`} className="rounded-md border px-5 py-3 font-semibold hover:bg-accent">
              {isZh ? '空白数独网格' : 'Blank Sudoku grids'}
            </Link>
          </div>
        </header>

        <section id="generator" className="mt-8 scroll-mt-28">
          <h2 className="mb-4 text-2xl font-semibold md:text-3xl">{copy.generatorTitle}</h2>
          <PrintableSudokuGenerator locale={normalizedLocale} />
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-2 print:hidden">
          <div>
            <h2 className="text-3xl font-semibold">
              {isZh ? '从简单到专家的清晰难度梯度' : 'A clear path from Easy to Expert'}
            </h2>
            <div className="mt-5 space-y-4 leading-7 text-muted-foreground">
              <p>
                {isZh
                  ? '简单题适合熟悉行、列、宫规则；中等题需要更稳定地找唯一候选；困难和专家题会要求候选数、锁定候选以及更长的逻辑链。混合模式适合做一组逐步升难的练习。'
                  : 'Easy puzzles reinforce row, column, and box scanning. Medium puzzles require steadier single-candidate work. Hard and Expert sets benefit from pencil marks, locked candidates, and longer logical chains. Mixed mode creates a useful progression in one worksheet.'}
              </p>
              <p>
                {isZh
                  ? '每道题的题面、答案和唯一解都会在自动化测试中核对。生成器只改变所选题组和排版，不会通过 URL 参数制造重复收录页面。'
                  : 'The grid, answer, and unique-solution property of every puzzle are covered by automated tests. Generator controls change the selected set and layout without creating indexable parameter variants.'}
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-semibold">
              {isZh ? '为实际打印而设计' : 'Designed for real printing'}
            </h2>
            <ul className="mt-5 space-y-3 leading-7 text-muted-foreground">
              <li><strong className="text-foreground">A4 / US Letter:</strong> {isZh ? '两种常见纸张都可直接使用。' : 'both common paper formats are supported.'}</li>
              <li><strong className="text-foreground">{isZh ? '每组 1、2、4、6 题' : '1, 2, 4, or 6 puzzles'}:</strong> {isZh ? '在大空间与节省纸张之间选择。' : 'choose more writing room or lower paper use.'}</li>
              <li><strong className="text-foreground">{isZh ? '答案页' : 'Answer keys'}:</strong> {isZh ? '答案单独排在题目之后，避免提前看到。' : 'solutions follow the puzzles so they are not revealed early.'}</li>
              <li><strong className="text-foreground">{isZh ? '大字版' : 'Large print'}:</strong> {isZh ? '提供更大的数字与候选笔记空间。' : 'larger digits and more room for pencil marks.'}</li>
            </ul>
          </div>
        </section>

        <section className="mt-12 border bg-secondary/20 p-6 md:p-8 print:hidden">
          <h2 className="text-3xl font-semibold">
            {isZh ? '下一步练习与专项资源' : 'Next practice and focused resources'}
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${normalizedLocale}/sudoku-cross-hatching`} className="border bg-background p-4 font-semibold hover:border-primary">
              {isZh ? '交叉排除法教程' : 'Cross-hatching tutorial'}
            </Link>
            <Link href={`/${normalizedLocale}/sudoku-swordfish`} className="border bg-background p-4 font-semibold hover:border-primary">
              {isZh ? 'Swordfish 剑鱼技巧' : 'Sudoku Swordfish'}
            </Link>
            <Link href={`/${normalizedLocale}/sudoku-naked-triple`} className="border bg-background p-4 font-semibold hover:border-primary">
              {isZh ? '裸三数组技巧' : 'Naked Triple guide'}
            </Link>
            <Link href={`/${normalizedLocale}/sudoku-for-kids/printable`} className="border bg-background p-4 font-semibold hover:border-primary">
              {isZh ? '儿童 4×4 打印题' : '4x4 Sudoku for kids'}
            </Link>
          </div>
        </section>

        <section className="mt-12 print:hidden">
          <h2 className="text-3xl font-semibold">{isZh ? '常见问题' : 'Printable Sudoku FAQ'}</h2>
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
