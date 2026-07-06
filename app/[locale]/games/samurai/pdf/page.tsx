import type { Metadata } from "next";
import Link from "next/link";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface SamuraiPdfPageProps {
  params: Promise<{ locale: string }>;
}

const PATH = "/games/samurai/pdf";
const DEFAULT_PRICE = "$4.95";

const pdfPackUrl =
  process.env.NEXT_PUBLIC_SUDOKU_PDF_PACK_URL ||
  process.env.NEXT_PUBLIC_SUDOKU_PRINTABLE_PACK_URL ||
  "";
const pdfPackPrice =
  process.env.NEXT_PUBLIC_SUDOKU_PDF_PACK_PRICE ||
  process.env.NEXT_PUBLIC_SUDOKU_PRINTABLE_PACK_PRICE ||
  DEFAULT_PRICE;

function buildPdfPackHref(locale: string) {
  if (!pdfPackUrl) {
    return `/${locale}/support`;
  }

  try {
    const url = new URL(pdfPackUrl);
    url.searchParams.set("utm_source", "samurai-sudoku");
    url.searchParams.set("utm_medium", "pdf-pack-page");
    url.searchParams.set("utm_campaign", "printable-pack");
    url.searchParams.set("locale", locale);
    return url.toString();
  } catch {
    return `/${locale}/support`;
  }
}

export async function generateMetadata({
  params,
}: SamuraiPdfPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? "武士数独 PDF 打印包 — 题目与答案"
    : "Samurai Sudoku PDF Pack — Printable Puzzles and Answers";
  const description = isZh
    ? "获取适合纸笔练习的武士数独 PDF 打印包：分难度题目、答案页、A4/Letter 打印流程和在线检查入口。"
    : "Get a Samurai Sudoku PDF pack for paper practice: difficulty-based puzzles, answer keys, A4/Letter printing, and online checking links.";

  return {
    title,
    description,
    keywords: isZh
      ? ["武士数独 PDF", "可打印武士数独", "数独 PDF", "武士数独答案"]
      : [
          "samurai sudoku pdf",
          "printable samurai sudoku pdf",
          "samurai sudoku with answers",
          "sudoku puzzle pack",
        ],
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

export default async function SamuraiPdfPage({ params }: SamuraiPdfPageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const purchaseHref = buildPdfPackHref(locale);
  const hasCheckout = purchaseHref.startsWith("http");
  const pageUrl = buildAbsoluteUrl(`/${locale}${PATH}`);

  const features = isZh
    ? [
        ["分难度练习", "Easy、Medium、Hard、Evil 分组，适合从热身到长时间推理。"],
        ["题面与答案分离", "先打印题面，答案页单独核对，适合自练、课堂和家庭练习。"],
        ["线上检查入口", "每道日期题都可以回到在线版，用提示、冲突高亮和完成状态检查。"],
        ["适合纸笔候选", "为 369 个可见格的五宫布局保留候选数空间，强调慢推理。"],
      ]
    : [
        ["Practice by difficulty", "Easy, Medium, Hard, and Evil sections support warmups through long reasoning sessions."],
        ["Puzzle and answer pages", "Print puzzle sheets first, then keep answer keys separate for checking after solving."],
        ["Online checking links", "Dated puzzles can be reopened online for hints, conflict highlighting, and completion tracking."],
        ["Built for candidate notes", "The five-grid 369-cell layout is intended for slower paper reasoning with candidate space."],
      ];

  const useCases = isZh
    ? [
        "想离线练习武士数独的玩家",
        "给学生或社群准备逻辑题的老师",
        "喜欢纸笔候选数和慢推理的数独玩家",
        "想一次保存多道题和答案的打印用户",
      ]
    : [
        "Players who want offline Samurai Sudoku practice",
        "Teachers preparing logic worksheets for students or clubs",
        "Sudoku solvers who prefer paper candidate notes",
        "Print users who want multiple puzzles and answer keys saved together",
      ];

  const faq = isZh
    ? [
        {
          question: "PDF 包上线前可以做什么？",
          answer: "如果购买链接尚未配置，按钮会跳到支持者候补名单。你仍然可以先使用免费可打印题面。正式支付链接配置后，本页 CTA 会自动指向购买页。",
        },
        {
          question: "免费打印页还会保留吗？",
          answer: "会。免费在线题面和单题打印继续保留。PDF 包用于批量保存、按难度整理和离线练习。",
        },
        {
          question: "PDF 包和在线题有什么区别？",
          answer: "在线题适合互动解题、提示和进度记录；PDF 包适合一次打印多题、纸笔候选和离线使用。",
        },
      ]
    : [
        {
          question: "What happens before the PDF pack is ready?",
          answer: "If no checkout URL is configured yet, the button goes to the supporter waitlist. Free single-puzzle printing still works. Once a checkout URL is configured, this page automatically points to it.",
        },
        {
          question: "Will free printable pages remain available?",
          answer: "Yes. Free online puzzle sheets and single-puzzle printing remain available. The PDF pack is for bundled saving, difficulty organization, and offline practice.",
        },
        {
          question: "How is the PDF pack different from online puzzles?",
          answer: "Online puzzles are best for interactive solving, hints, and progress tracking. The PDF pack is best for batch printing, paper notes, and offline use.",
        },
      ];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: isZh ? "武士数独 PDF 打印包" : "Samurai Sudoku PDF Pack",
    description: isZh
      ? "按难度整理的可打印武士数独题目与答案包。"
      : "A printable Samurai Sudoku puzzle and answer pack organized by difficulty.",
    brand: {
      "@type": "Brand",
      name: "Samurai Sudoku",
    },
    offers: {
      "@type": "Offer",
      price: pdfPackPrice.replace(/[^0-9.]/g, "") || "4.95",
      priceCurrency: "USD",
      availability: hasCheckout ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: pageUrl,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isZh ? "首页" : "Home",
        item: buildAbsoluteUrl(`/${locale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Samurai Sudoku",
        item: buildAbsoluteUrl(`/${locale}/games/samurai`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: isZh ? "PDF 打印包" : "PDF Pack",
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {[productSchema, faqSchema, breadcrumbSchema].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <nav
        className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link href={`/${locale}`} className="hover:text-foreground">
          {isZh ? "首页" : "Home"}
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/${locale}/games/samurai`} className="hover:text-foreground">
          Samurai Sudoku
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/${locale}/games/samurai/printable`} className="hover:text-foreground">
          {isZh ? "可打印" : "Printable"}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{isZh ? "PDF 打印包" : "PDF Pack"}</span>
      </nav>

      <section className="rounded-2xl border bg-secondary/30 px-5 py-10 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
              {isZh ? "离线纸笔练习包" : "Offline paper practice pack"}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-6xl">
              {isZh ? "武士数独 PDF 打印包" : "Samurai Sudoku PDF Pack"}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {isZh
                ? "把在线每日题库延展成可保存、可打印、可离线练习的 PDF 包。适合纸笔候选数、课堂练习、长期训练和完成后核对答案。"
                : "Turn the daily online archive into a saveable, printable, offline PDF pack for candidate notes, classroom practice, long sessions, and answer checking."}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                href={purchaseHref}
                eventName={hasCheckout ? "pdf_pack_purchase_click" : "pdf_pack_waitlist_click"}
                eventProperties={{
                  locale,
                  location: "pdf_pack_hero",
                  price: pdfPackPrice,
                  destination: hasCheckout ? "checkout" : "support_waitlist",
                }}
                className="rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {hasCheckout
                  ? isZh
                    ? `获取 PDF 包 ${pdfPackPrice}`
                    : `Get the PDF pack ${pdfPackPrice}`
                  : isZh
                  ? "加入 PDF 包候补名单"
                  : "Join the PDF pack waitlist"}
              </TrackedLink>
              <TrackedLink
                href={`/${locale}/games/samurai/printable`}
                eventName="pdf_pack_free_printable_click"
                eventProperties={{ locale, location: "pdf_pack_hero" }}
                className="rounded-lg border border-primary px-6 py-3 text-center font-semibold text-primary hover:bg-primary/10"
              >
                {isZh ? "先用免费打印题" : "Try free printable puzzles"}
              </TrackedLink>
            </div>
          </div>

          <aside className="rounded-xl border bg-background p-6">
            <p className="text-sm font-medium text-muted-foreground">
              {isZh ? "建议价格" : "Target price"}
            </p>
            <p className="mt-2 text-4xl font-semibold">{pdfPackPrice}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {hasCheckout
                ? isZh
                  ? "购买后可获得适合离线练习的武士数独打印包。免费单题打印仍会继续保留。"
                  : "Purchase gives you an offline-friendly Samurai Sudoku print pack. Free single-puzzle printing remains available."
                : isZh
                ? "PDF 包正在准备中。先加入候补名单，我们会优先通知愿意购买打印包的玩家。"
                : "The PDF pack is being prepared. Join the waitlist and we will notify players who want a bundled print pack first."}
            </p>
          </aside>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {features.map(([title, body]) => (
          <article key={title} className="rounded-xl border bg-card p-5">
            <h2 className="text-xl font-semibold text-primary">{title}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{body}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-xl border p-6">
        <h2 className="text-2xl font-semibold">
          {isZh ? "适合哪些人？" : "Who this is for"}
        </h2>
        <ul className="mt-4 grid gap-3 text-muted-foreground md:grid-cols-2">
          {useCases.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-primary" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">{isZh ? "常见问题" : "Questions"}</h2>
        <div className="mt-4 space-y-4">
          {faq.map((item) => (
            <details key={item.question} className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium">{item.question}</summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
