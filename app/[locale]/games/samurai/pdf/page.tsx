import type { Metadata } from "next";
import Link from "next/link";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { PayPalCheckout } from "@/components/payments/PayPalCheckout";
import {
  getPdfPackPrice,
  getPdfPackPriceAmount,
  getPdfPackProductName,
} from "@/lib/paypal";
import { getPayPalClientId, isPayPalOrdersConfigured } from "@/lib/paypal-api";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface SamuraiPdfPageProps {
  params: Promise<{ locale: string }>;
}

const PATH = "/games/samurai/pdf";

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
  const autoDeliveryEnabled = isPayPalOrdersConfigured();
  const payPalClientId = getPayPalClientId();
  const pdfPackPrice = getPdfPackPrice();
  const pdfPackProductName = getPdfPackProductName();
  const pageUrl = buildAbsoluteUrl(`/${locale}${PATH}`);
  const supportHref = `/${locale}/contact`;

  const features = isZh
    ? [
        ["100 道验证题", "Easy、Medium、Hard、Evil 各 25 题，所有答案来自已通过程序校验的题库。"],
        ["完整答案页", "每道题都有同编号答案页，题面与答案分区排列，避免提前看到答案。"],
        ["A4 + US Letter", "一个 ZIP 包含 A4 和 US Letter、一页 1 题和一页 2 题共四份矢量 PDF，黑白打印清晰。"],
        ["付款后自动下载", autoDeliveryEnabled ? "PayPal 捕获成功后立即生成限时下载链接，无需等待人工邮件。" : "结账未配置时会暂停付款并引导联系客服，不会跳转到个人收款页面。"],
      ]
    : [
        ["100 validated puzzles", "The pack contains 25 Easy, 25 Medium, 25 Hard, and 25 Evil puzzles from the program-validated corpus."],
        ["Complete answer pages", "Every puzzle has a matching numbered answer page in a separate section to prevent spoilers."],
        ["A4 + US Letter", "One ZIP contains four vector PDFs: A4 and US Letter in both one-puzzle and two-puzzle layouts."],
        ["Automatic delivery", autoDeliveryEnabled ? "A time-limited download link appears immediately after PayPal confirms capture." : "If checkout is not configured, payments pause and customers are directed to support instead of a personal payment page."],
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
          question: "如何购买 PDF 包？",
          answer: autoDeliveryEnabled
            ? "点击 PayPal 按钮并批准付款。服务器只在 PayPal 确认金额、币种和商品全部匹配且状态为 COMPLETED 后显示下载链接。"
            : "当前付款入口暂停。请通过联系页咨询恢复时间；本站不会在自动验单不可用时把你跳转到个人收款页面。",
        },
        {
          question: "免费打印页还会保留吗？",
          answer: "会。免费在线题面和单题打印继续保留。PDF 包用于批量保存、按难度整理和离线练习。",
        },
        {
          question: "付款后多久可以拿到文件？",
          answer: autoDeliveryEnabled
            ? "PayPal 确认捕获后立即显示下载按钮。刷新页面时，浏览器会用本地保存的订单号和恢复密钥重新核验并恢复下载。"
            : "结账恢复前不会接收付款。恢复后，PayPal 确认捕获成功即会显示下载按钮。",
        },
        {
          question: "PDF 包和在线题有什么区别？",
          answer: "在线题适合互动解题、提示和进度记录；PDF 包适合一次打印多题、纸笔候选和离线使用。",
        },
      ]
    : [
        {
          question: "How do I buy the PDF pack?",
          answer: autoDeliveryEnabled
            ? "Approve payment with the PayPal button. The server reveals a download only after PayPal confirms a COMPLETED capture whose product, currency, and amount all match."
            : "Payments are paused while checkout is unavailable. Contact support for the restoration status; the site will not redirect you to a personal payment page.",
        },
        {
          question: "Will free printable pages remain available?",
          answer: "Yes. Free online puzzle sheets and single-puzzle printing remain available. The PDF pack is for bundled saving, difficulty organization, and offline practice.",
        },
        {
          question: "How long does delivery take after payment?",
          answer: autoDeliveryEnabled
            ? "The download button appears as soon as PayPal confirms capture. If the page is refreshed, the saved order ID and private recovery key are used to restore access."
            : "No payment is accepted until checkout is restored. Once available, the download appears immediately after PayPal confirms capture.",
        },
        {
          question: "How is the PDF pack different from online puzzles?",
          answer: "Online puzzles are best for interactive solving, hints, and progress tracking. The PDF pack is best for batch printing, paper notes, and offline use.",
        },
      ];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: isZh ? "武士数独 PDF 打印包" : pdfPackProductName,
    description: isZh
      ? "按难度整理的可打印武士数独题目与答案包。"
      : "A printable Samurai Sudoku puzzle and answer pack organized by difficulty.",
    brand: {
      "@type": "Brand",
      name: "Samurai Sudoku",
    },
    offers: {
      "@type": "Offer",
      price: getPdfPackPriceAmount(),
      priceCurrency: "USD",
      availability: autoDeliveryEnabled
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: pageUrl,
      seller: {
        "@type": "Organization",
        name: "Samurai Sudoku",
      },
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
        <Link href={`/${locale}/printable-samurai-sudoku`} className="hover:text-foreground">
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
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-start">
              <PayPalCheckout
                autoDeliveryEnabled={autoDeliveryEnabled}
                clientId={payPalClientId}
                locale={locale}
                price={pdfPackPrice}
                supportHref={supportHref}
              />
              <TrackedLink
                href={`/${locale}/printable-samurai-sudoku`}
                eventName="pdf_pack_free_printable_click"
                eventProperties={{ locale, location: "pdf_pack_hero" }}
                className="rounded-lg border border-primary px-6 py-3 text-center font-semibold text-primary hover:bg-primary/10"
              >
                {isZh ? "先用免费打印题" : "Try free printable puzzles"}
              </TrackedLink>
              <TrackedLink
                href={`/${locale}/games/samurai/pdf/sample`}
                eventName="pdf_pack_sample_click"
                eventProperties={{ locale, location: "pdf_pack_hero" }}
                className="rounded-lg border px-6 py-3 text-center font-semibold transition-colors hover:bg-accent"
              >
                {isZh ? "查看免费样稿" : "View free sample pack"}
              </TrackedLink>
            </div>
          </div>

          <aside className="rounded-xl border bg-background p-6">
            <p className="text-sm font-medium text-muted-foreground">
              {isZh ? "当前价格" : "Current price"}
            </p>
            <p className="mt-2 text-4xl font-semibold">{pdfPackPrice}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {autoDeliveryEnabled
                ? isZh
                  ? "安全结账在本页完成。PayPal 确认付款后立即显示 100 题 ZIP 下载，链接有效期 7 天。"
                  : "Secure checkout stays on this page. A 100-puzzle ZIP download appears immediately after PayPal confirms payment and remains valid for 7 days."
                : isZh
                ? "当前付款入口暂停，不会跳转到个人收款页面。结账恢复后才会重新开放购买。"
                : "Payments are paused and will not redirect to a personal payment page. Purchasing reopens only after checkout is restored."}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
            >
              {autoDeliveryEnabled
                ? isZh ? "付款或下载问题" : "Payment or download help"
                : isZh ? "询问结账恢复时间" : "Ask when checkout will return"}
            </Link>
            <span className="mx-2 text-muted-foreground" aria-hidden>·</span>
            <Link
              href={`/${locale}/terms`}
              className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
            >
              {isZh ? "购买与退款条款" : "Purchase and refund terms"}
            </Link>
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
