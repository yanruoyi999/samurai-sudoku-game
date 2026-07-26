import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { NakedTripleTrainer } from "@/components/sudoku/NakedTripleTrainer";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = "/sudoku-naked-triple";

const steps = {
  en: [
    { title: "Stay inside one unit", body: "A naked triple belongs to one row, one column, or one 3×3 box. Do not combine three cells that do not share a unit." },
    { title: "Choose three unsolved cells", body: "Each member cell should contain two or three candidates. The cells may show pairs such as {2,5}, {2,7}, and {5,7}; they do not need identical notes." },
    { title: "Take the candidate union", body: "Merge all digits from the three cells. If the union contains exactly three digits, those digits must occupy those three cells in some order." },
    { title: "Remove the three digits from peers", body: "Delete the union digits from every other unsolved cell in that same unit. Do not remove them from unrelated rows, columns, or boxes." },
  ],
  zh: [
    { title: "限定在同一个单位", body: "显性三数组必须属于同一行、同一列或同一个 3×3 宫。不能把三个不共享单位的格子拼成一组。" },
    { title: "选择三个未解格", body: "每个成员格应有两个或三个候选。它们可以是 {2,5}、{2,7}、{5,7} 这样的候选对，不要求三个格写着完全相同的候选。" },
    { title: "计算候选并集", body: "合并三个格的全部候选。若并集正好只有三个数字，这三个数字必定以某种顺序占据这三个格。" },
    { title: "从同单位其他格删除", body: "可从同一行、列或宫的其余未解格删除这三个数字，但不能跨到不相关的单位执行删除。" },
  ],
} as const;

const faq = {
  en: [
    { question: "What is a naked triple in Sudoku?", answer: "A naked triple is three cells in one unit whose combined candidates contain exactly three digits. Those digits are locked into the three cells and can be removed from the unit's other cells." },
    { question: "Do all three cells need three candidates?", answer: "No. A common triple is made from three pairs, such as {2,5}, {2,7}, and {5,7}. Each cell's candidates only need to be a subset of the same three-digit union." },
    { question: "What is the difference between a naked and hidden triple?", answer: "A naked triple starts from three cells containing only three digits. A hidden triple starts from three digits that appear only in three cells, even when those cells contain extra candidates." },
    { question: "Can one of the cells have a single candidate?", answer: "A solved naked single should be placed first. After placing it and updating notes, re-evaluate the unit instead of treating it as part of a triple." },
    { question: "How do naked triples work in Samurai Sudoku overlaps?", answer: "A triple can be formed within one grid's row, column, or box. In a shared box, synchronize any eliminations with the connected grid because the physical cells are the same." },
  ],
  zh: [
    { question: "数独显性三数组是什么？", answer: "显性三数组是同一单位内的三个格，其候选并集正好为三个数字。这三个数字被锁定在三个格中，因此可从单位内其他格删除。" },
    { question: "三个格都必须有三个候选吗？", answer: "不必。常见结构是三个候选对，例如 {2,5}、{2,7}、{5,7}。每格候选只需属于同一个三数字并集。" },
    { question: "显性三数组与隐藏三数组有什么区别？", answer: "显性三数组从三个只含三种数字的格子出发；隐藏三数组从三个只出现在三格中的数字出发，即使这些格还写着额外候选。" },
    { question: "其中一个格可以只有一个候选吗？", answer: "显性唯一应当先落子。更新相关候选后再重新检查单位，而不是把已经确定的单格继续当成三数组成员。" },
    { question: "武士数独重叠宫如何使用显性三数组？", answer: "三数组仍必须属于某一网格的一行、一列或一宫。若发生在共享宫，删除候选后要同步相连网格，因为它们是同一组物理格。" },
  ],
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const normalizedLocale = isZh ? "zh" : "en";
  const canonical = buildLocalizedUrl(normalizedLocale, PATH);
  const title = isZh ? "数独显性三数组图解：候选并集与排除规则" : "Naked Triple Sudoku: How to Find and Use It";
  const description = isZh
    ? "通过互动行、列、宫候选示例学习数独显性三数组：计算三格候选并集，识别反例，理解显性与隐藏三数组。"
    : "Learn naked triples in Sudoku with interactive row, column, and box examples. Calculate candidate unions, reject near misses, and compare naked and hidden triples.";

  return {
    title,
    description,
    keywords: isZh
      ? ["数独显性三数组", "数独裸三链", "数独候选三数组", "数独候选并集", "武士数独三数组"]
      : ["naked triple sudoku", "sudoku naked triple", "what is naked triple sudoku", "how to find naked triples in sudoku", "naked triples in sudoku"],
    alternates: { canonical, languages: buildLanguageAlternates(PATH) },
    openGraph: { title, description, url: canonical, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SudokuNakedTriplePage({ params }: PageProps) {
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
      headline: isZh ? "数独显性三数组图解" : "Naked Triple Sudoku Explained",
      description: isZh ? "通过候选并集验证显性三数组。" : "Validate naked triples through candidate unions.",
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
      name: isZh ? "如何找到数独显性三数组" : "How to find a naked triple in Sudoku",
      totalTime: "PT8M",
      step: localizedSteps.map((item, index) => ({ "@type": "HowToStep", position: index + 1, name: item.title, text: item.body })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: isZh ? "首页" : "Home", item: buildAbsoluteUrl(`/${normalizedLocale}`) },
        { "@type": "ListItem", position: 2, name: isZh ? "解题技巧" : "Solving techniques", item: buildAbsoluteUrl(`/${normalizedLocale}/games/samurai/strategy-guide`) },
        { "@type": "ListItem", position: 3, name: isZh ? "显性三数组" : "Naked triple", item: pageUrl },
      ],
    },
  ];

  return (
    <article className="pb-14">
      {schemas.map((schema, index) => (
        <Script key={index} id={`sudoku-naked-triple-jsonld-${index}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <div className="mx-auto max-w-5xl px-4 pt-8">
        <nav className="flex flex-wrap gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href={`/${normalizedLocale}`}>{isZh ? "首页" : "Home"}</Link><span>/</span>
          <Link href={`/${normalizedLocale}/games/samurai/strategy-guide`}>{isZh ? "解题技巧" : "Solving techniques"}</Link><span>/</span>
          <span className="text-foreground">{isZh ? "显性三数组" : "Naked triple"}</span>
        </nav>
        <header className="max-w-4xl py-9">
          <p className="text-sm font-semibold text-primary">{isZh ? "候选集合互动课" : "Interactive candidate-set lesson"}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{isZh ? "数独显性三数组图解" : "Naked Triple Sudoku Explained"}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            {isZh
              ? "显性三数组不要求三个格拥有完全相同的候选。关键是把三格候选合并后，整个并集只能有三个数字。互动示例会同时展示成立结构与常见反例。"
              : "A naked triple does not require three identical candidate lists. The decisive test is that the union across three cells contains exactly three digits. Use the interactive examples to compare valid triples with near misses."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href="#interactive-naked-triple" className="rounded-lg bg-primary px-5 py-3 text-center font-semibold text-primary-foreground">{isZh ? "计算候选并集" : "Calculate a candidate union"}</a>
            <TrackedLink href={`/${normalizedLocale}/games/samurai/difficulty/hard`} eventName="naked_triple_hard_practice_click" eventProperties={{ locale: normalizedLocale, page: PATH }} className="rounded-lg border px-5 py-3 text-center font-semibold hover:border-primary">
              {isZh ? "在困难题中练习" : "Practice on a Hard puzzle"}
            </TrackedLink>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">{isZh ? "发布并更新于 " : "Published and updated "}<time dateTime="2026-07-26">2026-07-26</time></p>
        </header>
      </div>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h2 className="text-lg font-semibold">{isZh ? "直接答案" : "Direct answer"}</h2>
          <p className="mt-2 max-w-4xl leading-7 text-muted-foreground">
            {isZh
              ? "数独显性三数组，是同一行、列或宫中的三个未解格，其候选数字并集正好只有三个数字。这三个数字必定占据这三个格，因此可以从同单位其他格中删除它们。"
              : "A naked triple is three unsolved cells in one row, column, or box whose combined candidate union contains exactly three digits. Those digits must occupy the three cells, so they can be removed from every other cell in that unit."}
          </p>
        </div>
      </section>

      <div id="interactive-naked-triple" className="scroll-mt-20"><NakedTripleTrainer locale={normalizedLocale} /></div>

      <div className="mx-auto max-w-5xl px-4">
        <section className="py-12">
          <h2 className="text-3xl font-semibold">{isZh ? "四步证明显性三数组" : "Prove a naked triple in four steps"}</h2>
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
          <h2 className="text-3xl font-semibold">{isZh ? "显性三数组与隐藏三数组" : "Naked triple vs hidden triple"}</h2>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            <div className="border-l-4 border-primary bg-muted/30 p-5">
              <h3 className="text-xl font-semibold">{isZh ? "显性三数组：看格子" : "Naked triple: start with cells"}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                {isZh ? "三个格的候选全部来自同三个数字。确认后，从单位内其他格删除这三个数字；成员格里不删除。" : "Three cells contain candidates drawn only from the same three digits. Remove those digits from other cells in the unit, not from the members."}
              </p>
            </div>
            <div className="border-l-4 border-amber-500 bg-muted/30 p-5">
              <h3 className="text-xl font-semibold">{isZh ? "隐藏三数组：看数字" : "Hidden triple: start with digits"}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                {isZh ? "三个数字在一个单位中只出现在三个格，但这些格可能还有其他候选。确认后，删除成员格里的额外候选，保留这三个隐藏数字。" : "Three digits appear only in three cells, although those cells may have extra notes. Remove the extras from the member cells and keep the hidden digits."}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-4xl leading-7 text-muted-foreground">
            {isZh
              ? "两种技巧最终都把三个数字锁定到三个格，但观察方向和删除位置相反。显性结构删除同单位其他格；隐藏结构删除三个成员格中的额外候选。"
              : "Both techniques lock three digits into three cells, but the search direction and eliminations are opposite. Naked triples clean peer cells; hidden triples clean extra notes from the three member cells."}
          </p>
        </section>

        <section className="py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div>
              <p className="text-sm font-semibold text-primary">{isZh ? "武士数独应用" : "Samurai Sudoku application"}</p>
              <h2 className="mt-2 text-3xl font-semibold">{isZh ? "共享宫中的删除会同时影响两个网格" : "An overlap-box elimination updates two grids"}</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                {isZh
                  ? "如果显性三数组位于普通宫，只需按所属 9×9 网格处理。若三数组位于重叠宫，三个物理格同时属于中央网格和一个角落网格。候选并集的证明仍来自一个明确单位，但删除后的候选状态必须同步给两个网格。"
                  : "In a non-overlap box, apply the triple within its 9×9 grid. In an overlap box, the physical cells belong to both the center and a corner grid. The proof still comes from one defined unit, but the resulting notes must be synchronized across both grids."}
              </p>
              <p className="mt-4 leading-7 text-muted-foreground">
                {isZh
                  ? "不要把来自两个网格、但彼此不共享同一行列宫的三个格组合起来。它们在页面上可能靠得很近，却没有同一个单位约束，因此不能构成三数组。"
                  : "Do not combine nearby cells from two grids unless they share one actual row, column, or box. Visual proximity on the 21×21 layout does not create a Sudoku unit."}
              </p>
            </div>
            <aside className="border-l-4 border-amber-500 bg-amber-50 p-5 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
              <h3 className="font-semibold">{isZh ? "成立条件" : "Validity checklist"}</h3>
              <ul className="mt-3 space-y-3 text-sm leading-6">
                <li>{isZh ? "三个格共享一个单位" : "Three cells share one unit"}</li>
                <li>{isZh ? "每格有 2–3 个候选" : "Each has 2–3 candidates"}</li>
                <li>{isZh ? "三格候选并集恰好为 3" : "Union size is exactly three"}</li>
                <li>{isZh ? "只删除同单位其他格" : "Eliminate only from peers"}</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="border-y py-12">
          <h2 className="text-3xl font-semibold">{isZh ? "四个常见错误" : "Four common mistakes"}</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {[
              { title: isZh ? "并集其实有四个数字" : "The union contains four digits", body: isZh ? "三个格各自候选很少，不代表一定是三数组。必须真正合并并去重，结果为四就不能删除。" : "Three short candidate lists are not enough. Merge and deduplicate them; a four-digit union invalidates the triple." },
              { title: isZh ? "三个格不在同一单位" : "The cells do not share one unit", body: isZh ? "三数组的占位证明依赖同一行、列或宫只能放置一次每个数字。跨单位组合没有这个约束。" : "The occupancy proof depends on one row, column, or box. Cells from unrelated units do not share that constraint." },
              { title: isZh ? "误删成员格候选" : "Deleting from the member cells", body: isZh ? "显性三数组保留成员格中的三个候选集合，只删除其他格。删除成员内部候选需要额外逻辑。" : "Keep the union candidates in the member cells. A naked triple only removes them from peers." },
              { title: isZh ? "跳过显性唯一" : "Ignoring a naked single", body: isZh ? "某格只剩一个候选时应先落子。更新候选后，原来的三数组可能消失，也可能变成更直接的候选对。" : "Place a single first. After updating notes, the apparent triple may disappear or simplify into a pair." },
            ].map((item) => (
              <section key={item.title} className="rounded-lg border p-5"><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{item.body}</p></section>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-3xl font-semibold">{isZh ? "常见问题" : "Frequently asked questions"}</h2>
          <div className="mt-6 divide-y border-y">
            {faqItems.map((item) => (
              <details key={item.question} className="py-5"><summary className="cursor-pointer font-semibold">{item.question}</summary><p className="mt-3 max-w-4xl leading-7 text-muted-foreground">{item.answer}</p></details>
            ))}
          </div>
        </section>

        <section className="border-t pt-12">
          <p className="text-sm font-semibold text-primary">{isZh ? "继续学习" : "Continue learning"}</p>
          <h2 className="mt-2 text-3xl font-semibold">{isZh ? "把候选集合接到完整解题链" : "Connect candidate sets to the solving chain"}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/games/samurai/candidate-notes", title: isZh ? "候选笔记" : "Candidate notes", body: isZh ? "先保持候选准确并及时更新。" : "Keep candidate lists accurate." },
              { href: "/sudoku-swordfish", title: isZh ? "剑鱼技巧" : "Swordfish", body: isZh ? "从格子集合进阶到行列集合。" : "Move from cell sets to line sets." },
              { href: "/sudoku-cross-hatching", title: isZh ? "交叉排除" : "Cross hatching", body: isZh ? "候选过多时回到基础扫描。" : "Return to visual scanning." },
              { href: "/blank-sudoku-grid-printable", title: isZh ? "空白候选网格" : "Blank candidate grid", body: isZh ? "打印网格练习候选标记。" : "Practice candidate notation on paper." },
              { href: "/killer-sudoku-cheat-sheet", title: isZh ? "杀手数独速查表" : "Killer Sudoku cheat sheet", body: isZh ? "在隔离的变体工具中查找笼和组合。" : "Find cage sums and combinations in the isolated variant tool." },
            ].map((item) => (
              <Link key={item.href} href={`/${normalizedLocale}${item.href}`} className="rounded-lg border p-5 hover:border-primary hover:bg-primary/5">
                <h3 className="font-semibold text-primary">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
