import type { Metadata } from "next";
import Link from "next/link";

import { buildLanguageAlternates } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface WhatIsSamuraiSudokuPageProps {
  params: Promise<{ locale: string }>;
}

const PATH = "/games/samurai/what-is-samurai-sudoku";

export async function generateMetadata({
  params,
}: WhatIsSamuraiSudokuPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const canonical = buildAbsoluteUrl(`/${locale}${PATH}`);
  const title = isZh
    ? "什么是武士数独？五宫重叠规则图解"
    : "What Is Samurai Sudoku? Five-Grid Rules Explained";
  const description = isZh
    ? "用图解了解武士数独：五个 9×9 网格如何重叠、与普通数独有什么区别，以及新手应该从哪里开始。"
    : "Learn what Samurai Sudoku is, how five 9x9 grids overlap, how it differs from regular Sudoku, and where beginners should start.";

  return {
    title,
    description,
    keywords: isZh
      ? ["什么是武士数独", "武士数独规则", "五宫数独", "重叠数独"]
      : ["what is samurai sudoku", "samurai sudoku rules", "five grid sudoku", "overlapping sudoku"],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function GridBlock({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div
      className={`absolute grid grid-cols-3 overflow-hidden border-2 border-foreground/70 bg-background/90 shadow-sm ${className}`}
      aria-label={label}
    >
      {Array.from({ length: 9 }, (_, index) => (
        <span
          key={index}
          className="aspect-square border border-foreground/20 bg-primary/5"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function SamuraiDiagram({ isZh }: { isZh: boolean }) {
  return (
    <figure className="mx-auto mt-8 max-w-xl">
      <div
        className="relative mx-auto aspect-square w-full max-w-md rounded-lg border bg-secondary/30 p-3"
        role="img"
        aria-label={
          isZh
            ? "五个九宫数独组成的武士数独布局图"
            : "Diagram of five overlapping Sudoku grids in a Samurai Sudoku"
        }
      >
        <GridBlock className="left-[3%] top-[3%] w-[43%]" label={isZh ? "左上网格" : "Top-left grid"} />
        <GridBlock className="right-[3%] top-[3%] w-[43%]" label={isZh ? "右上网格" : "Top-right grid"} />
        <GridBlock className="left-[28.5%] top-[28.5%] z-10 w-[43%] border-primary bg-primary/10" label={isZh ? "中央网格" : "Center grid"} />
        <GridBlock className="bottom-[3%] left-[3%] w-[43%]" label={isZh ? "左下网格" : "Bottom-left grid"} />
        <GridBlock className="bottom-[3%] right-[3%] w-[43%]" label={isZh ? "右下网格" : "Bottom-right grid"} />
      </div>
      <figcaption className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
        {isZh
          ? "中央网格的四个角与四个外侧网格各共享一个 3×3 宫。重叠格同时属于两个网格。"
          : "Each corner of the center grid shares one 3x3 box with an outer grid. Every shared cell belongs to two grids."}
      </figcaption>
    </figure>
  );
}

export default async function WhatIsSamuraiSudokuPage({
  params,
}: WhatIsSamuraiSudokuPageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const pageUrl = buildAbsoluteUrl(`/${locale}${PATH}`);
  const faq = isZh
    ? [
        {
          question: "武士数独一共有多少个格子？",
          answer: "五个 9×9 网格共有 405 个格位，但四个重叠的 3×3 宫各被计算两次，因此实际可见格子是 369 个。",
        },
        {
          question: "武士数独和普通数独的规则一样吗？",
          answer: "每个独立 9×9 网格都遵循普通数独规则；额外难点是重叠格必须同时满足两个网格。",
        },
        {
          question: "新手可以直接玩武士数独吗？",
          answer: "可以。先从简单难度开始，并优先观察重叠区，因为那里同时受到两个网格约束。",
        },
        {
          question: "武士数独需要猜吗？",
          answer: "本站题目会验证唯一解。遇到困难时应记录候选并重新检查重叠区，而不是随机猜测。",
        },
      ]
    : [
        {
          question: "How many cells are in a Samurai Sudoku?",
          answer: "Five 9x9 grids contain 405 grid positions, but four shared 3x3 boxes are counted twice, leaving 369 visible cells.",
        },
        {
          question: "Does Samurai Sudoku use the same rules as regular Sudoku?",
          answer: "Each individual 9x9 grid follows standard Sudoku rules. The extra challenge is that every overlapping cell must satisfy two grids.",
        },
        {
          question: "Can a beginner play Samurai Sudoku?",
          answer: "Yes. Start on Easy and look at the overlap zones first because those cells receive constraints from two grids.",
        },
        {
          question: "Do you need to guess in Samurai Sudoku?",
          answer: "Puzzles on this site are checked for a unique solution. Use candidate notes and recheck the overlap zones before guessing.",
        },
      ];
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isZh ? "什么是武士数独？" : "What Is Samurai Sudoku?",
    description: isZh
      ? "五宫重叠数独的定义、布局和基础规则。"
      : "A definition, layout guide, and rule overview for five-grid Samurai Sudoku.",
    mainEntityOfPage: pageUrl,
    inLanguage: isZh ? "zh-CN" : "en-US",
    author: {
      "@type": "Organization",
      name: "Samurai Sudoku",
      url: buildAbsoluteUrl(`/${locale}`),
    },
    publisher: {
      "@type": "Organization",
      name: "Samurai Sudoku",
      url: buildAbsoluteUrl(`/${locale}`),
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
        name: isZh ? "什么是武士数独" : "What Is Samurai Sudoku",
        item: pageUrl,
      },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {[articleSchema, faqSchema, breadcrumbSchema].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href={`/${locale}`} className="hover:text-foreground">
          {isZh ? "首页" : "Home"}
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/${locale}/games/samurai`} className="hover:text-foreground">
          Samurai Sudoku
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{isZh ? "它是什么" : "What it is"}</span>
      </nav>

      <header>
        <p className="text-sm font-medium uppercase text-primary">
          {isZh ? "五宫重叠数独入门" : "Five-grid Sudoku explained"}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {isZh ? "什么是武士数独？" : "What Is Samurai Sudoku?"}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {isZh
            ? "武士数独是一种由五个相互重叠的 9×9 数独组成的大型逻辑谜题。四个外侧网格分别与中央网格共享一个 3×3 宫，因此一个数字可能同时推进两个网格。"
            : "Samurai Sudoku is one large logic puzzle made from five overlapping 9x9 Sudoku grids. Each outer grid shares one 3x3 box with the center, so a single digit can advance two grids at once."}
        </p>
      </header>

      <SamuraiDiagram isZh={isZh} />

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">{isZh ? "核心规则" : "The core rules"}</h2>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-muted-foreground">
          <li>{isZh ? "每个 9×9 网格的每行必须包含 1–9，且不能重复。" : "Every row in each 9x9 grid contains 1–9 without repetition."}</li>
          <li>{isZh ? "每个 9×9 网格的每列必须包含 1–9，且不能重复。" : "Every column in each 9x9 grid contains 1–9 without repetition."}</li>
          <li>{isZh ? "每个 3×3 宫必须包含 1–9，且不能重复。" : "Every 3x3 box contains 1–9 without repetition."}</li>
          <li>{isZh ? "重叠格同时属于中央网格和一个外侧网格，必须同时满足两边规则。" : "An overlap cell belongs to the center grid and one outer grid, so it must satisfy both."}</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">{isZh ? "和普通数独有什么区别？" : "How is it different from regular Sudoku?"}</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-secondary/60">
              <tr>
                <th className="px-4 py-3 font-semibold">{isZh ? "比较项" : "Feature"}</th>
                <th className="px-4 py-3 font-semibold">{isZh ? "普通数独" : "Regular Sudoku"}</th>
                <th className="px-4 py-3 font-semibold">{isZh ? "武士数独" : "Samurai Sudoku"}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-3">{isZh ? "网格数量" : "Number of grids"}</td>
                <td className="px-4 py-3 text-muted-foreground">1</td>
                <td className="px-4 py-3 text-muted-foreground">5</td>
              </tr>
              <tr>
                <td className="px-4 py-3">{isZh ? "可见格子" : "Visible cells"}</td>
                <td className="px-4 py-3 text-muted-foreground">81</td>
                <td className="px-4 py-3 text-muted-foreground">369</td>
              </tr>
              <tr>
                <td className="px-4 py-3">{isZh ? "推理范围" : "Deduction range"}</td>
                <td className="px-4 py-3 text-muted-foreground">{isZh ? "单个网格" : "One grid"}</td>
                <td className="px-4 py-3 text-muted-foreground">{isZh ? "跨重叠区联动" : "Across shared boxes"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 rounded-lg border bg-secondary/30 p-6">
        <h2 className="text-2xl font-semibold">{isZh ? "新手从哪里开始？" : "Where should a beginner start?"}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {isZh
            ? "先从简单难度开始，优先扫描四个重叠宫。重叠区受两个网格限制，通常比外围格子更容易排除候选。填入一个数字后，立即检查它对另一个网格造成的影响。"
            : "Start on Easy and scan the four overlap boxes first. Because two grids constrain them, they often eliminate candidates faster than outer cells. After placing a digit, immediately check its effect on the other grid."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/${locale}/games/samurai`} className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
            {isZh ? "开始今日谜题" : "Play today's puzzle"}
          </Link>
          <Link href={`/${locale}/games/samurai/how-to-play`} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10">
            {isZh ? "阅读完整解题策略" : "Read the solving guide"}
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">{isZh ? "常见问题" : "Frequently asked questions"}</h2>
        <div className="mt-4 space-y-4">
          {faq.map((item) => (
            <details key={item.question} className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium">{item.question}</summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </article>
  );
}
