import type { Metadata } from 'next';
import Link from 'next/link';

import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface SupportPageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/support';

const typeformUrl =
  process.env.NEXT_PUBLIC_SUDOKU_TYPEFORM_URL ||
  process.env.NEXT_PUBLIC_TYPEFORM_URL ||
  '';
const typeformFormId =
  process.env.NEXT_PUBLIC_SUDOKU_TYPEFORM_FORM_ID ||
  process.env.NEXT_PUBLIC_TYPEFORM_FORM_ID ||
  '';

function buildSupportHref(locale: string) {
  const base = typeformUrl || (typeformFormId ? `https://form.typeform.com/to/${typeformFormId}` : '');

  if (!base) {
    return `mailto:feedback@samuraisudoku.net?subject=${encodeURIComponent(
      locale === 'zh' ? '武士数独订阅候补名单' : 'Samurai Sudoku supporter waitlist',
    )}`;
  }

  try {
    const url = new URL(base);
    url.searchParams.set('source', 'samurai-sudoku-support');
    url.searchParams.set('locale', locale);
    url.searchParams.set('page', `/${locale}${PATH}`);
    return url.toString();
  } catch {
    return '';
  }
}

export async function generateMetadata({ params }: SupportPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? '支持武士数独 — 订阅与无广告体验计划'
    : 'Support Samurai Sudoku — Subscription and Ad-Free Plans';
  const description = isZh
    ? '加入武士数独支持者候补名单，帮助我们继续提供每日题库、解题指南、离线体验与更快的在线棋盘。'
    : 'Join the Samurai Sudoku supporter waitlist and help fund daily puzzles, solving guides, offline play, and a faster online board.';

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SupportPage({ params }: SupportPageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const supportHref = buildSupportHref(locale);
  const isExternalSupportHref = supportHref.startsWith('http');
  const pageUrl = buildAbsoluteUrl(`/${locale}${PATH}`);

  const benefits = isZh
    ? [
        '每日武士数独题库持续生成、校验与归档。',
        '保持核心玩法免费，并把广告与棋盘操作区清晰分离。',
        '优先开发无广告体验、打印题、进阶统计与更难题型。',
        '用反馈数据决定下一批内容与功能，而不是盲目堆页面。',
      ]
    : [
        'Keep the daily Samurai Sudoku archive generated, validated, and maintained.',
        'Keep the core game free while separating any ads from puzzle controls.',
        'Prioritize ad-free play, printable puzzles, advanced stats, and harder puzzle packs.',
        'Use feedback data to decide what to build next instead of publishing thin pages.',
      ];

  const roadmap = isZh
    ? [
        ['无广告体验', '支持者可隐藏广告位，专注解题。'],
        ['打印与离线包', '下载适合纸笔练习的题目与答案。'],
        ['进阶统计', '记录完成时间、失误、提示使用与难度进步。'],
      ]
    : [
        ['Ad-free play', 'Supporters can hide ad placements and focus on solving.'],
        ['Printable and offline packs', 'Download puzzle-and-solution sets for paper practice.'],
        ['Advanced stats', 'Track completion time, mistakes, hints, and difficulty progress.'],
      ];

  const faq = isZh
    ? [
        {
          question: '现在已经可以付费订阅吗？',
          answer: '暂未开放正式付费。当前页面用于收集支持者候补名单和功能偏好，避免在没有真实需求前过早接入支付。',
        },
        {
          question: '免费题目会消失吗？',
          answer: '不会。核心在线武士数独、每日题和基础指南会继续免费；订阅方向更适合无广告、打印包和高级统计。',
        },
        {
          question: '未来加入广告会影响解题吗？',
          answer: '不会把广告伪装成导航、下载或棋盘按钮。广告位会与游戏控件保持清晰区隔，以保护用户体验和政策合规。',
        },
      ]
    : [
        {
          question: 'Can I subscribe today?',
          answer: 'Not yet. This page collects the supporter waitlist and feature preferences before payment is added.',
        },
        {
          question: 'Will free puzzles go away?',
          answer: 'No. The core online Samurai Sudoku game, daily puzzles, and basic guides should remain free. Subscription ideas focus on ad-free play, printable packs, and advanced stats.',
        },
        {
          question: 'Will ads interfere with solving?',
          answer: 'No. Ads should never be disguised as navigation, download links, or board controls. Any ad placement should remain clearly separated from gameplay.',
        },
      ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isZh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${locale}`) },
      { '@type': 'ListItem', position: 2, name: isZh ? '支持' : 'Support', item: pageUrl },
    ],
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {[faqSchema, breadcrumbSchema].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href={`/${locale}`} className="hover:text-foreground">
          {isZh ? '首页' : 'Home'}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{isZh ? '支持' : 'Support'}</span>
      </nav>

      <section className="rounded-2xl border bg-secondary/30 px-5 py-10 text-center md:px-10">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
          {isZh ? '支持每日逻辑题库' : 'Support the daily puzzle archive'}
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
          {isZh ? '让武士数独保持免费、快速、可持续。' : 'Keep Samurai Sudoku free, fast, and sustainable.'}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {isZh
            ? '我们正在评估两条变现路径：合规广告与轻量订阅。你的反馈会决定先做无广告体验、打印题包、进阶统计，还是更多高难度题库。'
            : 'We are evaluating two monetization paths: compliant ads and a lightweight subscription. Your feedback decides whether we build ad-free play, printable packs, advanced stats, or more hard puzzle archives first.'}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={supportHref || `/${locale}/contact`}
            target={isExternalSupportHref ? '_blank' : undefined}
            rel={isExternalSupportHref ? 'noopener noreferrer' : undefined}
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isZh ? '加入支持者候补名单' : 'Join the supporter waitlist'}
          </a>
          <Link href={`/${locale}/games/samurai`} className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary/10">
            {isZh ? '继续玩今日题目' : "Play today's puzzle"}
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-[1fr_0.9fr]">
        <div className="rounded-xl border p-6">
          <h2 className="text-2xl font-semibold">{isZh ? '支持会带来什么？' : 'What your support funds'}</h2>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border bg-background p-6">
          <h2 className="text-2xl font-semibold">{isZh ? '变现原则' : 'Monetization principles'}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {isZh
              ? '如果上线广告，我们会优先保证页面导航清晰、棋盘可用、广告标识明确，并避免任何误导式点击设计。订阅功能会围绕真实玩家价值，而不是限制基础玩法。'
              : 'If ads are added, we will prioritize clear navigation, playable boards, clearly labeled ad placements, and no misleading click design. Subscription features should add real player value rather than blocking the core game.'}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">{isZh ? '候选订阅功能' : 'Possible supporter features'}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {roadmap.map(([title, body]) => (
            <div key={title} className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-xl border p-6">
        <h2 className="text-2xl font-semibold">{isZh ? '常见问题' : 'Questions before joining'}</h2>
        <div className="mt-4 space-y-4">
          {faq.map((item) => (
            <details key={item.question} className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium">{item.question}</summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-3 rounded-xl border bg-muted/30 p-6 text-sm md:grid-cols-3">
        <Link href={`/${locale}/games/samurai/archive`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '浏览题库归档' : 'Browse the puzzle archive'}
        </Link>
        <Link href={`/${locale}/games/samurai/strategy-guide`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '阅读解题策略' : 'Read the strategy guide'}
        </Link>
        <Link href={`/${locale}/contact`} className="rounded-lg border bg-background px-4 py-3 hover:border-primary hover:bg-primary/5">
          {isZh ? '联系与合作' : 'Contact and partnerships'}
        </Link>
      </section>
    </main>
  );
}
