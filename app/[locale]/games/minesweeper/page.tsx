import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import MinesweeperGameClient from "@/components/minesweeper/MinesweeperGameClient";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface MinesweeperPageProps {
  params: Promise<{ locale: string }>;
}

const PATH = "/games/minesweeper";

export async function generateMetadata({ params }: MinesweeperPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const title = isZh
    ? "在线扫雷 - 免费经典逻辑游戏"
    : "Minesweeper Online - Free Classic Logic Game";
  const description = isZh
    ? "免费在线玩经典扫雷，支持初级、中级、专家三种难度、旗帜模式、计时和第一步安全开局。"
    : "Play free online Minesweeper with beginner, intermediate, and expert boards, flag mode, timer, and a safe first click.";
  const canonical = buildLocalizedUrl(locale, PATH);

  return {
    title,
    description,
    keywords: isZh
      ? ["扫雷", "在线扫雷", "免费扫雷", "逻辑游戏", "益智游戏"]
      : ["minesweeper", "minesweeper online", "free minesweeper", "logic game", "puzzle game"],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function MinesweeperPage({ params }: MinesweeperPageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const canonical = buildAbsoluteUrl(`/${locale}${PATH}`);
  const faqItems = isZh
    ? [
        {
          question: "在线扫雷是免费的吗？",
          answer: "是。这个扫雷页面可以直接在浏览器中免费游玩，不需要注册账号。",
        },
        {
          question: "第一下会踩雷吗？",
          answer: "不会。棋盘在第一次点击后生成，并排除你第一次点击的格子。",
        },
        {
          question: "扫雷和武士数独有什么关系？",
          answer: "两者都是高频、低门槛、可重复练习的逻辑游戏，适合用同一个站点测试玩家留存和订阅意图。",
        },
      ]
    : [
        {
          question: "Is Minesweeper free to play here?",
          answer: "Yes. This Minesweeper board runs in the browser for free and does not require an account.",
        },
        {
          question: "Can the first click hit a mine?",
          answer: "No. The board is generated after the first click and keeps that clicked cell safe.",
        },
        {
          question: "Why add Minesweeper next to Samurai Sudoku?",
          answer: "Both are high-frequency logic games with repeat play, difficulty progression, and measurable retention potential.",
        },
      ];

  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: isZh ? "在线扫雷" : "Minesweeper Online",
    url: canonical,
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: isZh ? "zh-CN" : "en-US",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const gameJsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: isZh ? "在线扫雷" : "Minesweeper Online",
    url: canonical,
    isAccessibleForFree: true,
    educationalUse: "logic training",
    inLanguage: isZh ? "zh-CN" : "en-US",
    keywords: isZh ? "扫雷, 在线扫雷, 免费扫雷, 逻辑游戏" : "minesweeper online, free minesweeper, logic game",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isZh ? "首页" : "Home", item: buildAbsoluteUrl(`/${locale}`) },
      { "@type": "ListItem", position: 2, name: isZh ? "扫雷" : "Minesweeper", item: canonical },
    ],
  };

  return (
    <>
      <Script
        id={`minesweeper-webapp-jsonld-${locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <Script
        id={`minesweeper-game-jsonld-${locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id={`minesweeper-faq-jsonld-${locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id={`minesweeper-breadcrumb-jsonld-${locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <MinesweeperGameClient locale={locale} isZh={isZh} />

      <section className="border-t bg-background px-4 py-12">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="grid gap-6 md:grid-cols-3">
            {faqItems.map((item) => (
              <section key={item.question} className="rounded-lg border p-5">
                <h2 className="font-semibold">{item.question}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </section>
            ))}
          </div>

          <div className="flex flex-col justify-center gap-3 text-center sm:flex-row">
            <Link
              href={`/${locale}/games/samurai`}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {isZh ? "玩每日武士数独" : "Play Samurai Sudoku"}
            </Link>
            <Link
              href={`/${locale}/games/samurai/archive`}
              className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary/10"
            >
              {isZh ? "浏览数独题库" : "Browse Sudoku archive"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
