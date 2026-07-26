import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { SwordfishTrainer } from "@/components/sudoku/SwordfishTrainer";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = "/sudoku-swordfish";

const steps = {
  en: [
    {
      title: "Choose one candidate digit",
      body: "Swordfish is a candidate-position technique, so start with one digit only. Mark every legal position for that digit before looking for a pattern.",
    },
    {
      title: "Find three base rows or columns",
      body: "Choose three rows where the digit appears in two or three candidate cells. A column-based Swordfish uses three columns instead; do not mix the two orientations.",
    },
    {
      title: "Check the union of cover lines",
      body: "Combine the candidate columns used by the three base rows. The union must contain exactly three columns. If it spreads to four, the pattern is not a Swordfish.",
    },
    {
      title: "Eliminate only outside the base lines",
      body: "The digit must occupy the three cover columns somewhere in the three base rows. Remove that digit from other rows in those columns, then rescan for singles.",
    },
  ],
  zh: [
    {
      title: "只选择一个候选数字",
      body: "剑鱼是候选位置技巧，因此每次只追踪一个数字。先标出该数字的全部合法位置，再寻找结构，不能把不同数字的候选混在一起。",
    },
    {
      title: "找到三条基准行或基准列",
      body: "按行剑鱼需要三行，每行包含该数字的两个或三个候选；按列剑鱼则使用三列。两个方向不能混合计算。",
    },
    {
      title: "检查覆盖线并集",
      body: "合并三条基准行使用的候选列，其并集必须正好只有三列。若扩散到四列，即使图形相似，也不是可执行排除的剑鱼。",
    },
    {
      title: "只删除基准线之外的候选",
      body: "目标数字必定占据三条覆盖列与三条基准行的交点，因此可以删除覆盖列在其他行的同数字候选，之后再扫描唯一数。",
    },
  ],
} as const;

const faq = {
  en: [
    {
      question: "What is a Swordfish in Sudoku?",
      answer: "A Swordfish is a three-by-three candidate pattern. In three rows, one digit is restricted to the same three columns, or vice versa. That digit can then be removed from the rest of those cover columns or rows.",
    },
    {
      question: "Does every base row need exactly two candidates?",
      answer: "No. Each base line can contain two or three candidates, provided the union across the three base lines uses exactly three cover lines.",
    },
    {
      question: "What is the difference between X-Wing and Swordfish?",
      answer: "They use the same logic at different orders. X-Wing uses two base and two cover lines, Swordfish uses three, and Jellyfish uses four.",
    },
    {
      question: "Can Swordfish candidates be in different 3×3 boxes?",
      answer: "Yes. Swordfish is based on rows and columns, not box alignment. Every candidate must still be legal under its box constraints.",
    },
    {
      question: "How do I use Swordfish in Samurai Sudoku?",
      answer: "Build the pattern inside one 9×9 grid's coordinate system. If an elimination touches an overlap cell, verify it against the connected grid before updating notes there.",
    },
  ],
  zh: [
    {
      question: "数独剑鱼是什么？",
      answer: "剑鱼是三乘三候选结构：某数字在三行中只分布于同样三列，或在三列中只分布于同样三行，因此可以删除这些覆盖线在基准线之外的同数字候选。",
    },
    {
      question: "每条基准行必须正好有两个候选吗？",
      answer: "不必。每条基准线可以有两个或三个候选，只要三条基准线的候选覆盖线并集正好为三条。",
    },
    {
      question: "X-Wing 和剑鱼有什么区别？",
      answer: "它们使用同一种逻辑，但阶数不同。X-Wing 使用两条基准线与两条覆盖线，剑鱼使用三条，Jellyfish 使用四条。",
    },
    {
      question: "剑鱼候选可以分布在不同的 3×3 宫吗？",
      answer: "可以。剑鱼依据行列结构，而不是宫的位置；但每个候选仍必须满足所在宫的约束。",
    },
    {
      question: "武士数独如何使用剑鱼？",
      answer: "必须在一个 9×9 网格的坐标体系内建立剑鱼。若删除项位于重叠格，还要用相连网格再次验证并同步候选。",
    },
  ],
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const normalizedLocale = isZh ? "zh" : "en";
  const canonical = buildLocalizedUrl(normalizedLocale, PATH);
  const title = isZh
    ? "数独剑鱼技巧图解：识别、验证与候选排除"
    : "Sudoku Swordfish Explained: Find and Use the Pattern";
  const description = isZh
    ? "用互动候选棋盘学习数独剑鱼：验证三条基准线与覆盖线并集，识别反例，比较 X-Wing、Swordfish 与 Jellyfish。"
    : "Learn the Sudoku Swordfish technique with an interactive candidate grid. Validate base and cover lines, reject near misses, and compare X-Wing, Swordfish, and Jellyfish.";

  return {
    title,
    description,
    keywords: isZh
      ? ["数独剑鱼", "剑鱼数独", "数独剑鱼技巧", "数独候选排除", "武士数独剑鱼"]
      : [
          "sudoku swordfish",
          "swordfish sudoku",
          "swordfish in sudoku",
          "sudoku swordfish explained",
          "how to identify swordfish pattern in sudoku",
        ],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: { title, description, url: canonical, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SudokuSwordfishPage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const normalizedLocale = isZh ? "zh" : "en";
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);
  const localizedSteps = steps[normalizedLocale];
  const faqItems = faq[normalizedLocale];
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: isZh ? "数独剑鱼技巧图解" : "Sudoku Swordfish Explained",
      description: isZh
        ? "通过互动正反例学习三阶鱼形候选结构。"
        : "An interactive guide to valid and invalid three-order fish patterns.",
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
      name: isZh ? "如何识别数独剑鱼" : "How to identify a Sudoku Swordfish",
      totalTime: "PT10M",
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
          name: isZh ? "解题技巧" : "Solving techniques",
          item: buildAbsoluteUrl(`/${normalizedLocale}/games/samurai/strategy-guide`),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: isZh ? "剑鱼" : "Swordfish",
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
          id={`sudoku-swordfish-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="mx-auto max-w-5xl px-4 pt-8">
        <nav className="flex flex-wrap gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href={`/${normalizedLocale}`}>{isZh ? "首页" : "Home"}</Link>
          <span>/</span>
          <Link href={`/${normalizedLocale}/games/samurai/strategy-guide`}>
            {isZh ? "解题技巧" : "Solving techniques"}
          </Link>
          <span>/</span>
          <span className="text-foreground">{isZh ? "剑鱼" : "Swordfish"}</span>
        </nav>

        <header className="max-w-4xl py-9">
          <p className="text-sm font-semibold text-primary">
            {isZh ? "候选结构互动课" : "Interactive candidate-pattern lesson"}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
            {isZh ? "数独剑鱼技巧图解" : "Sudoku Swordfish Explained"}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            {isZh
              ? "剑鱼不是看见三个矩形角就删除候选。真正的证明来自候选并集：三条基准线上的同一数字，必须被限制在恰好三条覆盖线中。"
              : "Swordfish is not a visual guess based on three corners. Its proof comes from a candidate union: one digit on three base lines must be restricted to exactly three cover lines."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href="#interactive-swordfish" className="rounded-lg bg-primary px-5 py-3 text-center font-semibold text-primary-foreground">
              {isZh ? "打开互动候选图" : "Open the interactive pattern"}
            </a>
            <TrackedLink
              href={`/${normalizedLocale}/games/samurai/difficulty/evil`}
              eventName="swordfish_evil_practice_click"
              eventProperties={{ locale: normalizedLocale, page: PATH }}
              className="rounded-lg border px-5 py-3 text-center font-semibold hover:border-primary"
            >
              {isZh ? "在极难题中练习" : "Practice on an Evil puzzle"}
            </TrackedLink>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            {isZh ? "发布并更新于 " : "Published and updated "}
            <time dateTime="2026-07-26">2026-07-26</time>
          </p>
        </header>
      </div>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h2 className="text-lg font-semibold">{isZh ? "直接答案" : "Direct answer"}</h2>
          <p className="mt-2 max-w-4xl leading-7 text-muted-foreground">
            {isZh
              ? "数独剑鱼是三阶鱼形结构：同一个候选数字在三行中只出现在三列，或在三列中只出现在三行。这个数字必定在三条覆盖线与三条基准线的交点中出现三次，因此可删除覆盖线在基准线之外的同数字候选。"
              : "A Sudoku Swordfish is a three-order fish pattern. One candidate digit in three rows is confined to three columns, or vice versa. The digit must occupy three intersections, so it can be removed from those cover lines outside the base lines."}
          </p>
        </div>
      </section>

      <div id="interactive-swordfish" className="scroll-mt-20">
        <SwordfishTrainer locale={normalizedLocale} />
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <section className="py-12">
          <h2 className="text-3xl font-semibold">
            {isZh ? "用四步验证，而不是凭形状猜" : "Verify the pattern in four steps"}
          </h2>
          <ol className="mt-7 grid gap-4 md:grid-cols-2">
            {localizedSteps.map((item, index) => (
              <li key={item.title} className="border-l-4 border-primary bg-muted/30 p-5">
                <p className="text-xs font-semibold text-primary">{isZh ? `步骤 ${index + 1}` : `Step ${index + 1}`}</p>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-y py-12">
          <h2 className="text-3xl font-semibold">
            {isZh ? "X-Wing、Swordfish 与 Jellyfish" : "X-Wing vs Swordfish vs Jellyfish"}
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            {isZh
              ? "三种技巧不是互不相关的图案，而是同一套“基准线数量等于覆盖线并集数量”的证明。阶数越高，肉眼追踪越难，但删除规则没有变化。"
              : "These are not unrelated shapes. They use the same proof: the number of base lines equals the size of the cover-line union. Higher orders are harder to spot, but the elimination rule does not change."}
          </p>
          <div className="mt-7 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left">
              <thead><tr className="border-y bg-muted/40"><th className="p-3">{isZh ? "技巧" : "Technique"}</th><th className="p-3">{isZh ? "基准线" : "Base lines"}</th><th className="p-3">{isZh ? "覆盖线" : "Cover lines"}</th><th className="p-3">{isZh ? "典型用途" : "Typical use"}</th></tr></thead>
              <tbody>
                {[
                  ["X-Wing", "2", "2", isZh ? "最容易识别的鱼形" : "First fish pattern to learn"],
                  ["Swordfish", "3", "3", isZh ? "困难题常见进阶排除" : "Advanced elimination in hard puzzles"],
                  ["Jellyfish", "4", "4", isZh ? "稀有且候选密集" : "Rare, candidate-heavy extension"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b"><th className="p-3">{row[0]}</th><td className="p-3">{row[1]}</td><td className="p-3">{row[2]}</td><td className="p-3 text-muted-foreground">{row[3]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div>
              <p className="text-sm font-semibold text-primary">{isZh ? "武士数独边界" : "Samurai Sudoku boundary"}</p>
              <h2 className="mt-2 text-3xl font-semibold">
                {isZh ? "不能把五个网格的行列当成一张 21×21 普通棋盘" : "Do not build one fish across unrelated grids"}
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                {isZh
                  ? "武士数独由五个独立的 9×9 数独通过四个重叠宫连接。剑鱼的行列定义属于某一个 9×9 网格，所以必须先选定中央或角落网格，再在它的九行九列中建立结构。不能把左上网格的一行、中央网格的一行和右下网格的一行拼成三条基准线。"
                  : "Samurai Sudoku connects five separate 9×9 grids through four overlap boxes. Swordfish rows and columns belong to one selected grid. You cannot combine a row from the top-left grid, one from the center, and one from the bottom-right as three base lines."}
              </p>
              <p className="mt-4 leading-7 text-muted-foreground">
                {isZh
                  ? "如果删除项落在共享格，这个删除在当前网格中成立，但候选笔记也必须同步到相连网格。随后检查另一个网格是否因此产生唯一数、显性三数组或新的交叉排除。"
                  : "If an elimination lands in a shared cell, apply it in the current grid and synchronize that candidate note with the connected grid. Then check whether the other grid gains a single, naked triple, or fresh cross hatch."}
              </p>
            </div>
            <aside className="border-l-4 border-amber-500 bg-amber-50 p-5 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
              <h3 className="font-semibold">{isZh ? "删除前的四项检查" : "Four checks before deleting"}</h3>
              <ul className="mt-3 space-y-3 text-sm leading-6">
                <li>{isZh ? "候选数字是否相同？" : "Same candidate digit?"}</li>
                <li>{isZh ? "基准线是否恰好三条？" : "Exactly three base lines?"}</li>
                <li>{isZh ? "覆盖线并集是否恰好三条？" : "Exactly three cover lines?"}</li>
                <li>{isZh ? "删除项是否在基准线之外？" : "Elimination outside the base lines?"}</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="border-y py-12">
          <h2 className="text-3xl font-semibold">{isZh ? "常见误判" : "Common false positives"}</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {[
              {
                title: isZh ? "候选扩散到了第四条覆盖线" : "A fourth cover line appears",
                body: isZh ? "这是最常见的反例。图形可能仍像鱼，但三行候选并集为四列时，数字没有被锁定在三列中。" : "The shape may still look plausible, but a four-column union does not lock the digit into three columns.",
              },
              {
                title: isZh ? "删除了基准线内部候选" : "Removing a candidate inside a base line",
                body: isZh ? "剑鱼只证明覆盖线在三条基准线之外的同数字候选不可能。交点内部候选必须保留。" : "The proof removes the digit only from cover lines outside the bases. Intersection candidates must remain.",
              },
              {
                title: isZh ? "混用按行和按列结构" : "Mixing row and column orientation",
                body: isZh ? "先确定基准线方向。按行剑鱼的覆盖线只能是列；按列剑鱼的覆盖线只能是行。" : "Choose one orientation. Row-based fish use columns as covers; column-based fish use rows.",
              },
              {
                title: isZh ? "候选笔记没有更新" : "Using stale candidate notes",
                body: isZh ? "任何新落子都会改变候选。识别剑鱼前先清理受影响的行、列和宫，否则可能用已经不合法的候选构造假结构。" : "Refresh notes after every placement. Stale candidates can manufacture a pattern that no longer exists.",
              },
            ].map((item) => (
              <section key={item.title} className="rounded-lg border p-5">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{item.body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-3xl font-semibold">{isZh ? "常见问题" : "Frequently asked questions"}</h2>
          <div className="mt-6 divide-y border-y">
            {faqItems.map((item) => (
              <details key={item.question} className="py-5">
                <summary className="cursor-pointer font-semibold">{item.question}</summary>
                <p className="mt-3 max-w-4xl leading-7 text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="border-t pt-12">
          <p className="text-sm font-semibold text-primary">{isZh ? "继续学习" : "Continue learning"}</p>
          <h2 className="mt-2 text-3xl font-semibold">{isZh ? "从候选基础到进阶鱼形" : "Build the candidate-technique ladder"}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/sudoku-cross-hatching", title: isZh ? "交叉排除" : "Cross hatching", body: isZh ? "先掌握无需完整候选的扫描。" : "Start with visual scanning." },
              { href: "/sudoku-naked-triple", title: isZh ? "显性三数组" : "Naked triple", body: isZh ? "练习候选集合与并集。" : "Practice candidate sets and unions." },
              { href: "/games/samurai/candidate-notes", title: isZh ? "候选笔记" : "Candidate notes", body: isZh ? "建立准确、可维护的候选层。" : "Keep a reliable candidate layer." },
              { href: "/printable-sudoku", title: isZh ? "打印练习题" : "Printable practice", body: isZh ? "离线标注候选并验证结构。" : "Mark candidates on paper." },
              { href: "/killer-sudoku-cheat-sheet", title: isZh ? "杀手数独速查表" : "Killer Sudoku cheat sheet", body: isZh ? "在独立变体页查询无重复数字组合。" : "Look up no-repeat cage combinations in the isolated variant guide." },
            ].map((item) => (
              <Link key={item.href} href={`/${normalizedLocale}${item.href}`} className="rounded-lg border p-5 hover:border-primary hover:bg-primary/5">
                <h3 className="font-semibold text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
