import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { locales } from "@/i18n";
import {
  MINESWEEPER_GUIDE_SLUGS,
  getMinesweeperGuide,
} from "@/lib/minesweeper/guides";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface MinesweeperGuidePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    MINESWEEPER_GUIDE_SLUGS.map((slug) => ({
      locale,
      slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: MinesweeperGuidePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getMinesweeperGuide(slug);
  if (!guide) {
    return {
      title: locale === "zh" ? "扫雷指南" : "Minesweeper guide",
      robots: { index: false, follow: true },
    };
  }

  const normalizedLocale = locale === "zh" ? "zh" : "en";
  const path = `/games/minesweeper/${guide.slug}`;
  const canonical = buildLocalizedUrl(normalizedLocale, path);

  return {
    title: guide.title[normalizedLocale],
    description: guide.description[normalizedLocale],
    keywords: guide.keywords[normalizedLocale],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      title: guide.title[normalizedLocale],
      description: guide.description[normalizedLocale],
      url: canonical,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: guide.title[normalizedLocale],
      description: guide.description[normalizedLocale],
    },
  };
}

export default async function MinesweeperGuidePage({
  params,
}: MinesweeperGuidePageProps) {
  const { locale, slug } = await params;
  const guide = getMinesweeperGuide(slug);
  if (!guide) notFound();

  const normalizedLocale = locale === "zh" ? "zh" : "en";
  const isZh = normalizedLocale === "zh";
  const path = `/games/minesweeper/${guide.slug}`;
  const canonical = buildAbsoluteUrl(`/${normalizedLocale}${path}`);
  const gameHref = `/${normalizedLocale}/games/minesweeper`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((item) => ({
      "@type": "Question",
      name: item.question[normalizedLocale],
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer[normalizedLocale],
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isZh ? "首页" : "Home", item: buildAbsoluteUrl(`/${normalizedLocale}`) },
      { "@type": "ListItem", position: 2, name: isZh ? "在线扫雷" : "Minesweeper Online", item: buildAbsoluteUrl(gameHref) },
      { "@type": "ListItem", position: 3, name: guide.title[normalizedLocale], item: canonical },
    ],
  };

  return (
    <>
      <Script
        id={`minesweeper-guide-faq-jsonld-${normalizedLocale}-${guide.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id={`minesweeper-guide-breadcrumb-jsonld-${normalizedLocale}-${guide.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="min-h-screen bg-background px-4 py-8 md:py-12">
        <article className="mx-auto max-w-4xl">
          <nav className="mb-6 flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href={`/${normalizedLocale}`} className="hover:text-foreground">
              {isZh ? "首页" : "Home"}
            </Link>
            <span>/</span>
            <Link href={gameHref} className="hover:text-foreground">
              {isZh ? "在线扫雷" : "Minesweeper"}
            </Link>
            <span>/</span>
            <span className="text-foreground">{guide.title[normalizedLocale]}</span>
          </nav>

          <header className="border-b pb-8">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
              {guide.eyebrow[normalizedLocale]}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
              {guide.title[normalizedLocale]}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {guide.description[normalizedLocale]}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                href={gameHref}
                eventName="minesweeper_guide_cta_click"
                eventProperties={{ guide: guide.slug, locale: normalizedLocale, location: "hero" }}
                className="rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {isZh ? "打开在线扫雷" : "Play Minesweeper online"}
              </TrackedLink>
              <Link
                href={`/${normalizedLocale}/games/samurai`}
                className="rounded-lg border border-primary px-6 py-3 text-center font-semibold text-primary hover:bg-primary/10"
              >
                {isZh ? "玩武士数独" : "Play Samurai Sudoku"}
              </Link>
            </div>
          </header>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px]">
            <div className="space-y-8">
              {guide.sections.map((section) => (
                <section key={section.heading.en} className="rounded-lg border bg-background p-6">
                  <h2 className="text-2xl font-semibold">{section.heading[normalizedLocale]}</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {section.body[normalizedLocale]}
                  </p>
                  {section.bullets ? (
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                      {section.bullets[normalizedLocale].map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}

              <section className="rounded-lg border bg-secondary/30 p-6">
                <h2 className="text-2xl font-semibold">
                  {isZh ? "如何在棋盘上使用这页" : "How to apply this on a live board"}
                </h2>
                <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
                  <p>
                    {isZh
                      ? "读完规则后，立刻回到初级棋盘验证一次：先找已经打开的数字边界，再只处理能被数字证明的格子。不要从棋盘另一侧随机点击，也不要把“像雷”的格子直接插旗。"
                      : "After reading the rule, test it immediately on a beginner board: start from the revealed number edge and only act on cells the numbers can prove. Do not jump randomly across the board or flag a square just because it feels risky."}
                  </p>
                  <p>
                    {isZh
                      ? "如果一个数字周围的旗帜数量已经等于它本身，剩余相邻隐藏格就是下一批安全格；如果一个数字接触的隐藏格数量正好等于还缺的雷数，这些隐藏格才应该插旗。卡住时，先复查最近三次旗帜，而不是立刻开新局。"
                      : "When a number already touches the same number of flags, the remaining hidden neighbors are your next safe cells. When the hidden neighbors exactly match the missing mine count, those cells should be flagged. If you stall, review your last three flags before starting a new board."}
                  </p>
                  <p>
                    {isZh
                      ? "扫雷适合训练局部约束推理；如果你喜欢更长线的候选数和重叠区域推理，也可以切到武士数独练习同一类逻辑耐心。"
                      : "Minesweeper trains local constraint reasoning. If you want a longer-form version of the same logic habit, Samurai Sudoku lets you practice candidates, overlap boxes, and slower deduction."}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-sm">
                  <Link
                    href={gameHref}
                    className="rounded-md border bg-background px-3 py-2 font-medium hover:border-primary hover:text-primary"
                  >
                    {isZh ? "在线练习扫雷" : "Practice Minesweeper"}
                  </Link>
                  <Link
                    href={`/${normalizedLocale}/games/minesweeper/beginner-strategy`}
                    className="rounded-md border bg-background px-3 py-2 font-medium hover:border-primary hover:text-primary"
                  >
                    {isZh ? "新手策略" : "Beginner strategy"}
                  </Link>
                  <Link
                    href={`/${normalizedLocale}/games/samurai`}
                    className="rounded-md border bg-background px-3 py-2 font-medium hover:border-primary hover:text-primary"
                  >
                    {isZh ? "武士数独" : "Samurai Sudoku"}
                  </Link>
                </div>
              </section>

              <section className="rounded-lg border bg-secondary/30 p-6">
                <h2 className="text-2xl font-semibold">{isZh ? "常见问题" : "FAQ"}</h2>
                <div className="mt-4 space-y-4">
                  {guide.faq.map((item) => (
                    <section key={item.question.en} className="rounded-lg border bg-background p-4">
                      <h3 className="font-semibold">{item.question[normalizedLocale]}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.answer[normalizedLocale]}
                      </p>
                    </section>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded-lg border bg-primary/5 p-5">
                <h2 className="font-semibold">{isZh ? "扫雷长尾指南" : "Minesweeper guides"}</h2>
                <div className="mt-4 grid gap-2 text-sm">
                  {MINESWEEPER_GUIDE_SLUGS.map((relatedSlug) => {
                    const relatedGuide = getMinesweeperGuide(relatedSlug);
                    if (!relatedGuide) return null;

                    return (
                      <Link
                        key={relatedSlug}
                        href={`/${normalizedLocale}/games/minesweeper/${relatedSlug}`}
                        className={`rounded-md border px-3 py-2 hover:border-primary hover:bg-primary/5 ${
                          relatedSlug === guide.slug ? "border-primary text-primary" : "bg-background"
                        }`}
                      >
                        {relatedGuide.title[normalizedLocale]}
                      </Link>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-lg border bg-background p-5">
                <h2 className="font-semibold">{isZh ? "练习入口" : "Practice"}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {isZh
                    ? "读完规则后，回到在线棋盘用初级难度验证每个数字模式。"
                    : "After reading, return to the board and test each pattern on Beginner first."}
                </p>
                <TrackedLink
                  href={gameHref}
                  eventName="minesweeper_guide_cta_click"
                  eventProperties={{ guide: guide.slug, locale: normalizedLocale, location: "sidebar" }}
                  className="mt-4 block rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {isZh ? "开始练习" : "Start practicing"}
                </TrackedLink>
              </section>
            </aside>
          </div>
        </article>
      </main>
    </>
  );
}
