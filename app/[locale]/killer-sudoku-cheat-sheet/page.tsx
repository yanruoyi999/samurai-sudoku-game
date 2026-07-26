import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { KillerSudokuCheatSheet } from "@/components/sudoku/KillerSudokuCheatSheet";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = "/killer-sudoku-cheat-sheet";

const faq = {
  en: [
    {
      question: "What is a Killer Sudoku cheat sheet?",
      answer:
        "It is a reference table of distinct digits that can make each cage sum. It reduces arithmetic work but does not solve row, column, box, or cage-position logic for you.",
    },
    {
      question: "Can a digit repeat inside a Killer Sudoku cage?",
      answer:
        "Under standard Killer Sudoku rules, a digit cannot repeat inside one cage. A valid puzzle may state a different rule, so always check its instructions.",
    },
    {
      question: "Does the order of a combination matter?",
      answer:
        "No. A 10 cage with two cells may contain 1 and 9, 2 and 8, 3 and 7, or 4 and 6. The grid constraints determine which digit belongs in each cell.",
    },
    {
      question: "Is the combination calculator a Killer Sudoku solver?",
      answer:
        "No. It lists mathematically possible no-repeat combinations. You must still remove combinations that conflict with existing digits and candidate positions.",
    },
    {
      question: "Can I print the Killer Sudoku combination table?",
      answer:
        "Yes. Use Print or save PDF to create a clean reference for two-, three-, and four-cell cages.",
    },
  ],
  zh: [
    {
      question: "Killer Sudoku 速查表是什么？",
      answer:
        "它列出每个笼格总和可能对应的不重复数字组合，能减少心算，但不会替你完成行、列、宫和笼格位置推理。",
    },
    {
      question: "Killer Sudoku 笼格内可以重复数字吗？",
      answer:
        "标准规则下，同一笼格不能重复数字。若具体题目另有说明，应以题目规则为准。",
    },
    {
      question: "组合内数字顺序重要吗？",
      answer:
        "不重要。两格总和 10 可以是 1+9、2+8、3+7 或 4+6；每个数字放在哪一格，要继续结合行列宫约束判断。",
    },
    {
      question: "组合计算器等于 Killer Sudoku 解题器吗？",
      answer:
        "不等于。它只列出数学上可能的不重复组合，你仍需删除与已有数字和候选位置冲突的组合。",
    },
    {
      question: "可以打印 Killer Sudoku 组合表吗？",
      answer:
        "可以。点击打印或另存 PDF，即可获得两格、三格和四格笼的清晰速查表。",
    },
  ],
} as const;

const steps = {
  en: [
    {
      title: "Read the cage size and sum",
      body: "Count the cells in the cage and note the small target sum in its corner.",
    },
    {
      title: "List distinct combinations",
      body: "Use the calculator or table to list combinations that use no repeated digit.",
    },
    {
      title: "Apply row, column, and box limits",
      body: "Remove combinations containing digits already fixed in any shared unit.",
    },
    {
      title: "Check each candidate position",
      body: "A combination can remain only when every one of its digits has at least one legal cell in the cage.",
    },
  ],
  zh: [
    {
      title: "读取笼格数量与总和",
      body: "数清笼格包含的单元格，并记录角落标注的目标总和。",
    },
    {
      title: "列出不重复组合",
      body: "使用计算器或速查表，列出不包含重复数字的全部组合。",
    },
    {
      title: "叠加行列宫限制",
      body: "删除包含同一行、列或宫中已确定数字的组合。",
    },
    {
      title: "验证每个候选位置",
      body: "只有当组合中的每个数字都能在笼格内找到至少一个合法位置时，该组合才能保留。",
    },
  ],
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const normalizedLocale = isZh ? "zh" : "en";
  const canonical = buildLocalizedUrl(normalizedLocale, PATH);
  const title = isZh
    ? "Killer Sudoku 组合速查表与笼格计算器"
    : "Killer Sudoku Cheat Sheet and Cage Calculator";
  const description = isZh
    ? "免费查询 Killer Sudoku 笼格总和的不重复数字组合，并打印两格、三格和四格组合速查表。"
    : "Find no-repeat digit combinations for any Killer Sudoku cage sum, then print a free cheat sheet for two-, three-, and four-cell cages.";

  return {
    title,
    description,
    keywords: isZh
      ? ["Killer Sudoku 速查表", "杀手数独组合", "Killer Sudoku 计算器", "杀手数独总和"]
      : [
          "killer sudoku cheat sheet",
          "killer sudoku combinations",
          "killer sudoku calculator",
          "sudoku killer combinations",
        ],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: { title, description, url: canonical, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function KillerSudokuCheatSheetPage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const normalizedLocale = isZh ? "zh" : "en";
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);
  const faqItems = faq[normalizedLocale];
  const localizedSteps = steps[normalizedLocale];
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: isZh
        ? "Killer Sudoku 组合速查表与笼格计算器"
        : "Killer Sudoku Cheat Sheet and Cage Calculator",
      description: isZh
        ? "互动查询并打印不重复笼格组合。"
        : "An interactive, printable reference for no-repeat cage combinations.",
      mainEntityOfPage: pageUrl,
      datePublished: "2026-07-26",
      dateModified: "2026-07-26",
      inLanguage: isZh ? "zh-CN" : "en-US",
      author: { "@type": "Organization", name: "Samurai Sudoku" },
      publisher: { "@type": "Organization", name: "Samurai Sudoku" },
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: isZh
        ? "如何使用 Killer Sudoku 组合"
        : "How to use Killer Sudoku cage combinations",
      step: localizedSteps.map((item, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: item.title,
        text: item.body,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: isZh ? "首页" : "Home",
          item: buildAbsoluteUrl(`/${normalizedLocale}`),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: isZh ? "Killer Sudoku 速查表" : "Killer Sudoku cheat sheet",
          item: pageUrl,
        },
      ],
    },
  ];

  return (
    <article className="pb-14">
      {schemas.map((schema, index) => (
        <Script
          key={index}
          id={`killer-sudoku-cheat-sheet-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="mx-auto max-w-5xl px-4 pt-8 print:hidden">
        <nav className="flex flex-wrap gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href={`/${normalizedLocale}`}>{isZh ? "首页" : "Home"}</Link>
          <span>/</span>
          <span className="text-foreground">
            {isZh ? "Killer Sudoku 速查表" : "Killer Sudoku cheat sheet"}
          </span>
        </nav>

        <header className="max-w-4xl py-9">
          <p className="text-sm font-semibold text-primary">
            {isZh ? "相邻数独变体实验资源" : "Adjacent Sudoku variant resource"}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
            {isZh
              ? "Killer Sudoku 组合速查表"
              : "Killer Sudoku Cheat Sheet"}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            {isZh
              ? "输入笼格数量与目标总和，立即获得 1–9 中互不重复的合法组合；随后可打印两格、三格和四格的完整参考表。"
              : "Enter a cage size and target sum to get every valid no-repeat combination from 1–9, then print the complete two-, three-, and four-cell reference."}
          </p>
          <a
            href="#calculator"
            className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground"
          >
            {isZh ? "打开组合计算器" : "Open the cage calculator"}
          </a>
          <p className="mt-5 text-xs text-muted-foreground">
            {isZh ? "发布并更新于 " : "Published and updated "}
            <time dateTime="2026-07-26">2026-07-26</time>
          </p>
        </header>
      </div>

      <section className="border-y bg-muted/30 print:hidden">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h2 className="text-lg font-semibold">{isZh ? "直接答案" : "Direct answer"}</h2>
          <p className="mt-2 max-w-4xl leading-7 text-muted-foreground">
            {isZh
              ? "Killer Sudoku 速查表列出指定格数和总和的全部不重复数字组合。它只能缩小组合范围，不能代替行、列、宫和每个候选位置的逻辑验证。"
              : "A Killer Sudoku cheat sheet lists every distinct-digit combination for a cage size and sum. It narrows the arithmetic possibilities, but row, column, box, and candidate-position logic still decide the placement."}
          </p>
        </div>
      </section>

      <div id="calculator">
        <KillerSudokuCheatSheet locale={normalizedLocale} />
      </div>

      <section className="mx-auto max-w-5xl px-4 py-12 print:hidden">
        <h2 className="text-2xl font-semibold">
          {isZh ? "如何正确使用组合表" : "How to use the combinations correctly"}
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {localizedSteps.map((step, index) => (
            <li key={step.title} className="border p-5">
              <p className="text-sm font-semibold text-primary">
                {isZh ? `第 ${index + 1} 步` : `Step ${index + 1}`}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 leading-7 text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">
            {isZh ? "常见问题" : "Frequently asked questions"}
          </h2>
          <div className="mt-5 divide-y border-y">
            {faqItems.map((item) => (
              <section key={item.question} className="py-5">
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{item.answer}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-semibold">
            {isZh ? "继续练习数独逻辑" : "Continue with Sudoku logic"}
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <TrackedLink
              href={`/${normalizedLocale}/printable-sudoku`}
              eventName="killer_cheat_sheet_related_click"
              eventProperties={{ locale: normalizedLocale, target: "printable_sudoku" }}
              className="border p-4 font-semibold hover:border-primary"
            >
              {isZh ? "标准数独打印中心" : "Printable Sudoku center"}
            </TrackedLink>
            <TrackedLink
              href={`/${normalizedLocale}/sudoku-naked-triple`}
              eventName="killer_cheat_sheet_related_click"
              eventProperties={{ locale: normalizedLocale, target: "naked_triple" }}
              className="border p-4 font-semibold hover:border-primary"
            >
              {isZh ? "学习裸三链候选排除" : "Learn Naked Triple eliminations"}
            </TrackedLink>
            <TrackedLink
              href={`/${normalizedLocale}/games/samurai/candidate-notes`}
              eventName="killer_cheat_sheet_related_click"
              eventProperties={{ locale: normalizedLocale, target: "candidate_notes" }}
              className="border p-4 font-semibold hover:border-primary"
            >
              {isZh ? "候选数笔记完整指南" : "Candidate notes guide"}
            </TrackedLink>
            <TrackedLink
              href={`/${normalizedLocale}/games/samurai`}
              eventName="killer_cheat_sheet_related_click"
              eventProperties={{ locale: normalizedLocale, target: "samurai_online" }}
              className="border p-4 font-semibold hover:border-primary"
            >
              {isZh ? "在线玩武士数独" : "Play Samurai Sudoku online"}
            </TrackedLink>
          </div>
        </section>
      </section>
    </article>
  );
}
