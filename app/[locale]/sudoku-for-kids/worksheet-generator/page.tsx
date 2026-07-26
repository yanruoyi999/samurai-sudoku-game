import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { KidsWorksheetGenerator } from '@/components/kids/KidsWorksheetGenerator';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/sudoku-for-kids/worksheet-generator';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? '儿童数独练习纸生成器：4×4 与 6×6 教师工具'
    : 'Sudoku Worksheet Generator for Kids: 4x4 and 6x6';
  const description = isZh
    ? '免费生成 4×4 或 6×6 儿童数独练习纸，选择难度、2/4/6 道题和是否附答案；全部题目来自唯一解验证题库。'
    : 'Build free 4x4 or 6x6 Sudoku worksheets for kids. Choose a level, 2/4/6 puzzles, and optional answer keys from verified unique-solution libraries.';

  return {
    title,
    description,
    keywords: isZh
      ? ['儿童数独练习纸生成器', '数独练习纸', '教师数独工具', '4×4 数独生成器', '6×6 数独生成器']
      : ['sudoku worksheet generator', 'sudoku worksheet generator for kids', 'teacher sudoku worksheets', '4x4 sudoku generator', '6x6 sudoku worksheets'],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function KidsWorksheetGeneratorPage({ params }: PageProps) {
  const { locale } = await params;
  const normalizedLocale = locale === 'zh' ? 'zh' : 'en';
  const isZh = normalizedLocale === 'zh';
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);

  const faqItems = isZh
    ? [
        ['生成器会随机制造未经检查的新题吗？', '不会。生成器只从本站已经通过结构、答案和唯一解测试的 4×4 与 6×6 题库中选题。'],
        ['为什么 6×6 单一难度最多只能选 4 题？', '当前每个 6×6 难度提供 4 道已验证题。选择混合难度时可以生成 6 题，并覆盖简单、中等和挑战三个层级。'],
        ['可以把答案放在练习纸后面吗？', '可以。勾选末尾附答案后，打印结果会先显示题目，再另起一页显示相同题号的完整答案。'],
        ['生成器会保存学生姓名或班级吗？', '不会。页面没有姓名、邮箱、学校或班级输入框，也不会创建儿童档案。'],
      ]
    : [
        ['Does the generator create unchecked puzzles?', 'No. It selects only from 4×4 and 6×6 libraries that have passed structure, answer, and unique-solution tests.'],
        ['Why can a single 6×6 level include only four puzzles?', 'Each current 6×6 level has four verified puzzles. Mixed level can create a six-puzzle set across Easy, Medium, and Challenge.'],
        ['Can answer keys appear after the worksheet?', 'Yes. Turn on Include answer keys to print the puzzles first and matching numbered solutions on a later page.'],
        ['Does the generator save student names or classes?', 'No. There are no name, email, school, or class fields, and no child profile is created.'],
      ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isZh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${normalizedLocale}`) },
      { '@type': 'ListItem', position: 2, name: isZh ? '儿童数独' : 'Sudoku for Kids', item: buildAbsoluteUrl(`/${normalizedLocale}/sudoku-for-kids`) },
      { '@type': 'ListItem', position: 3, name: isZh ? '练习纸生成器' : 'Worksheet generator', item: pageUrl },
    ],
  };

  const learningResourceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: isZh ? '儿童数独练习纸生成器' : 'Sudoku Worksheet Generator for Kids',
    url: pageUrl,
    learningResourceType: ['Worksheet generator', 'Teacher resource', 'Logic puzzle'],
    educationalUse: ['Classroom activity', 'Homework', 'Home practice'],
    isAccessibleForFree: true,
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return (
    <main className="min-h-screen bg-background">
      {[breadcrumbJsonLd, learningResourceJsonLd, faqJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`kids-worksheet-generator-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article className="mx-auto max-w-6xl px-4 py-10 md:py-14 print:max-w-none print:px-0 print:py-0">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground print:hidden" aria-label="Breadcrumb">
          <Link href={`/${normalizedLocale}`} className="hover:text-foreground">{isZh ? '首页' : 'Home'}</Link>
          <span aria-hidden>/</span>
          <Link href={`/${normalizedLocale}/sudoku-for-kids`} className="hover:text-foreground">{isZh ? '儿童数独' : 'Sudoku for Kids'}</Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">{isZh ? '练习纸生成器' : 'Worksheet generator'}</span>
        </nav>

        <header className="rounded-3xl border bg-primary/5 p-6 md:p-9 print:hidden">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {isZh ? '教师与家庭练习工具' : 'A tool for teachers and home practice'}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-6xl">
            {isZh ? '儿童数独练习纸生成器' : 'Sudoku Worksheet Generator for Kids'}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {isZh
              ? '选择 4×4 或 6×6、难度、题目数量和是否附答案，然后生成另一组或直接打印。生成器不会临时制造未经校验的题目，而是从 36 道唯一解题库中确定性选题。'
              : 'Choose 4×4 or 6×6, a level, a puzzle count, and optional answers. Generate another set or print immediately. The tool selects deterministically from 36 verified unique-solution puzzles rather than creating unchecked boards.'}
          </p>
        </header>

        <section className="mt-8 print:mt-0">
          <KidsWorksheetGenerator locale={normalizedLocale} />
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2 print:hidden">
          <div className="rounded-2xl border p-6">
            <h2 className="text-2xl font-semibold">{isZh ? '课堂使用建议' : 'Classroom use suggestion'}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {isZh
                ? '4×4 适合规则教学和短活动；6×6 适合已经能解释排除理由的学生。混合难度可以让同一张练习纸从建立信心逐步进入挑战。'
                : 'Use 4×4 for rule instruction and short activities. Use 6×6 after learners can explain eliminations. Mixed sets can move from confidence-building to challenge on one worksheet.'}
            </p>
          </div>
          <div className="rounded-2xl border bg-secondary/30 p-6">
            <h2 className="text-2xl font-semibold">{isZh ? '隐私边界' : 'Privacy boundary'}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {isZh
                ? '生成器只处理尺寸、难度、题数、答案开关和随机种子，不需要也不保存儿童姓名、邮箱、学校、班级或成绩。'
                : 'The generator uses only size, level, count, answer preference, and a selection seed. It does not request or save names, email addresses, schools, classes, or scores.'}
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-3 rounded-2xl border bg-primary/5 p-6 sm:grid-cols-2 lg:grid-cols-5 print:hidden">
          <Link href={`/${normalizedLocale}/sudoku-for-kids/printable`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '现成 4×4 练习' : 'Ready-made 4×4 set'}
          </Link>
          <Link href={`/${normalizedLocale}/sudoku-for-kids/answers`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '现成练习答案' : 'Ready-made answers'}
          </Link>
          <Link href={`/${normalizedLocale}/sudoku-for-kids/6x6`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '在线 6×6' : 'Play 6×6 online'}
          </Link>
          <Link href={`/${normalizedLocale}/sudoku-for-kids/resources`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '教学资源' : 'Teaching resources'}
          </Link>
          <Link href={`/${normalizedLocale}/sudoku-for-kids`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '儿童数独首页' : 'Kids Sudoku hub'}
          </Link>
        </section>

        <section className="mt-14 print:hidden">
          <h2 className="text-3xl font-semibold">{isZh ? '练习纸生成器常见问题' : 'Worksheet generator FAQ'}</h2>
          <div className="mt-5 space-y-4">
            {faqItems.map(([question, answer]) => (
              <details key={question} className="rounded-xl border bg-card p-5">
                <summary className="cursor-pointer font-semibold">{question}</summary>
                <p className="mt-3 leading-7 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
