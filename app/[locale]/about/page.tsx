import type { Metadata } from 'next';
import Link from 'next/link';

import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const canonical = buildLocalizedUrl(locale, '/about');

  return {
    title: isZh ? '关于武士数独' : 'About Samurai Sudoku',
    description: isZh
      ? '了解武士数独的题目标准、本地优先设计、生成验证方法和每日逻辑训练目标。'
      : "Learn about Samurai Sudoku's puzzle standards, local-first design, validation methodology, and daily logic-training mission.",
    alternates: {
      canonical,
      languages: buildLanguageAlternates('/about'),
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Samurai Sudoku',
    url: buildAbsoluteUrl(`/${locale}`),
    description: isZh
      ? '提供每日五宫重叠数独、难度题库和解题指南的免费在线站点。'
      : 'A free online site for daily five-grid Samurai Sudoku puzzles, difficulty archives, and solving guides.',
    email: 'feedback@samuraisudoku.net',
  };
  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: isZh ? '关于武士数独' : 'About Samurai Sudoku',
    url: buildAbsoluteUrl(`/${locale}/about`),
    inLanguage: isZh ? 'zh-CN' : 'en-US',
    mainEntity: organizationSchema,
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {[organizationSchema, aboutPageSchema].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <Link href={`/${locale}`} className="text-sm font-medium text-primary hover:text-primary/80">
        {isZh ? '返回首页' : 'Back to home'}
      </Link>

      <h1 className="mt-6 text-4xl font-semibold tracking-tight">
        {isZh ? '关于武士数独' : 'About Samurai Sudoku'}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {isZh
          ? '武士数独是一个专注于五宫重叠数独的免费在线站点。我们的目标是提供清晰、可靠、适合反复练习的每日逻辑谜题，并公开说明题目如何生成、验证和修正。'
          : 'Samurai Sudoku is a free online site focused on five-grid overlapping Sudoku. Our goal is to provide clear, reliable daily logic puzzles worth returning to and to explain how puzzles are generated, validated, and corrected.'}
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">{isZh ? '我们重视什么' : 'What We Prioritize'}</h2>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>{isZh ? '题目可靠：发布前检查网格、答案、重叠一致性、唯一解和难度数据。' : 'Reliable puzzles: grids, solutions, overlap consistency, uniqueness, and difficulty data are checked before publication.'}</li>
          <li>{isZh ? '专注解题：没有强制注册，核心体验直接可用。' : 'Focused solving: no required account and immediate access to the core game.'}</li>
          <li>{isZh ? '本地优先：进行中的棋局和设置主要保存在你的浏览器中。' : 'Local-first progress: active games and settings are primarily stored in your browser.'}</li>
          <li>{isZh ? '持续改进：根据可复现错误、实际行为和反馈修正题目与界面。' : 'Continuous improvement: puzzle and interface issues are corrected from reproducible reports, real behavior, and feedback.'}</li>
        </ul>
      </section>

      <section className="mt-10 rounded-xl border bg-primary/5 p-5">
        <h2 className="text-2xl font-semibold">{isZh ? '题目是怎么做出来的？' : 'How are the puzzles made?'}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {isZh
            ? '我们使用程序构造完整五宫解盘，在逐步移除线索时持续检查唯一解，并在 Pull Request 中运行题库、测试、构建、内链和页面质量检查。方法说明页列出当前真实流程、难度依据、缓存更新和错误报告要求。'
            : 'We build complete five-grid solutions, preserve uniqueness while removing clues, and run corpus, test, build, link, and page-quality checks in pull requests. The methodology page documents the current process, difficulty profiles, cache updates, and reporting requirements.'}
        </p>
        <Link
          href={`/${locale}/about/puzzle-methodology`}
          className="mt-4 inline-flex rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10"
        >
          {isZh ? '阅读题目生成与审核方法' : 'Read the puzzle methodology'}
        </Link>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">{isZh ? '武士数独是什么' : 'What Is Samurai Sudoku?'}</h2>
        <p className="leading-relaxed text-muted-foreground">
          {isZh
            ? '武士数独由五个相互重叠的 9×9 数独组成。四个角落网格与中心网格共享区域，因此一个数字可能同时影响两个网格。'
            : 'Samurai Sudoku combines five overlapping 9×9 Sudoku grids. Each corner grid shares cells with the center, so one number can affect two grids at once.'}
        </p>
        <Link href={`/${locale}/games/samurai/what-is-samurai-sudoku`} className="font-medium text-primary hover:text-primary/80">
          {isZh ? '阅读武士数独图解介绍' : 'Read the visual introduction to Samurai Sudoku'}
        </Link>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/games/samurai`}
          className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {isZh ? '开始今日谜题' : "Play Today's Puzzle"}
        </Link>
        <Link
          href={`/${locale}/contact`}
          className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10"
        >
          {isZh ? '联系我们' : 'Contact Us'}
        </Link>
      </div>
    </main>
  );
}
