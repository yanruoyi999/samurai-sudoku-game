import type { Metadata } from "next";
import Link from "next/link";

import { SwordfishTrainer } from "@/components/sudoku/SwordfishTrainer";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { analyzeFishPattern, type FishExample } from "@/lib/sudoku/swordfish";
import { xWingLesson } from "@/lib/sudoku/x-wing-lesson";

interface PageProps { params: Promise<{ locale: string }> }
const PATH = "/sudoku-x-wing";
const SOURCE = "https://www.sudokuwiki.org/x_wing_strategy";

const faq = {
  en: [
    { question: "What is an X-Wing in Sudoku?", answer: "For one digit, two rows each have exactly two legal candidate positions in the same two columns. The digit can be removed from those columns outside the two base rows. Swap rows and columns for a column-based X-Wing." },
    { question: "Must each corner cell have only two candidates in total?", answer: "No. Count positions for one fixed digit along each base row, not the total number of pencil marks inside a cell. A corner can contain other candidate digits." },
    { question: "Does an X-Wing tell me which diagonal contains the digit?", answer: "No. Both diagonal placements remain possible. The conclusion removes the digit outside the base lines; it does not fill the four corners." },
    { question: "Can I ignore a third candidate in a base row?", answer: "No. A third position breaks the premise of this standard X-Wing. Recheck the complete base rows before making any elimination." },
  ],
  zh: [
    { question: "数独 X-Wing 是什么？", answer: "固定一个数字，两行中各自恰好只有两个合法候选位置，而且都落在同样两列，就能删除这两列在基准行之外的同数字候选。交换行列即可得到按列 X-Wing。" },
    { question: "四个角格都必须总共只有两个候选吗？", answer: "不需要。这里数的是固定数字在每条基准行里的位置数，不是一个格子里全部候选数字的个数。角格可以同时含有其他数字的候选。" },
    { question: "X-Wing 能确定哪条对角线填入该数字吗？", answer: "不能。两种对角线摆放都仍然可能。结论只删除基准线之外的候选，不能直接填定四个角格。" },
    { question: "能忽略基准行中的第三个候选吗？", answer: "不能。第三个位置破坏了这里标准 X-Wing 的前提。删除之前，必须完整检查两条基准行。" },
  ],
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const canonical = buildLocalizedUrl(isZh ? "zh" : "en", PATH);
  const title = isZh ? "数独 X-Wing 图解：两种摆放与候选排除" : "Sudoku X-Wing Explained: A Two-Case Proof";
  const description = isZh
    ? "从二乘二候选位置图学习 X-Wing：用两种摆放证明排除，交换行列，并识别多出第三候选的反例。附二阶互动练习。"
    : "Learn Sudoku X-Wing with an original 2×2 candidate sketch, a two-case proof, a column example, and a third-candidate counterexample. Practice with an interactive map.";
  return {
    title, description,
    alternates: { canonical, languages: buildLanguageAlternates(PATH) },
    openGraph: { title, description, url: canonical, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

function CandidateSketch({ example, isZh }: { example: FishExample; isZh: boolean }) {
  const analysis = analyzeFishPattern(example);
  const candidateKeys = new Set(example.candidates.map(({ row, column }) => `${row}-${column}`));
  const baseKeys = new Set(analysis.patternCandidates.map(({ row, column }) => `${row}-${column}`));
  const targetKeys = new Set(analysis.eliminations.map(({ row, column }) => `${row}-${column}`));
  return (
    <figure className="my-6 max-w-xl rounded-xl border bg-background p-3 sm:p-5">
      <table className="w-full table-fixed border-collapse text-center text-[10px] sm:text-sm">
        <caption className="mb-3 text-left text-sm font-semibold">
          {isZh ? "数字 7 的候选位置草图（不是完整题）" : "Candidate-position sketch for digit 7 (not a full puzzle)"}
        </caption>
        <thead><tr><th scope="col"><span className="sr-only">{isZh ? "行/列" : "Row/column"}</span></th>{Array.from({ length: 9 }, (_, col) => <th key={col} scope="col" className="py-2">c{col + 1}</th>)}</tr></thead>
        <tbody>{Array.from({ length: 9 }, (_, row) => (
          <tr key={row}>
            <th scope="row" className="py-2">r{row + 1}</th>
            {Array.from({ length: 9 }, (_, column) => {
              const key = `${row}-${column}`;
              const label = baseKeys.has(key) ? "B7" : targetKeys.has(key) ? "E7" : candidateKeys.has(key) ? "U7" : "·";
              return <td key={column} className={`border py-2 font-mono ${baseKeys.has(key) ? "bg-primary/10 font-bold" : targetKeys.has(key) ? "bg-amber-100 font-bold text-amber-950 dark:bg-amber-950 dark:text-amber-100" : "text-muted-foreground"}`}>{label}</td>;
            })}
          </tr>
        ))}</tbody>
      </table>
      <figcaption className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
        <p>{isZh ? "B7：基准线候选；E7：可排除候选；U7：此规则不能删除；·：未画出的位置。" : "B7: base candidate; E7: eliminable candidate; U7: unaffected by this rule; ·: position not drawn."}</p>
        <p>{isZh ? "已完整检查两条基准线，数字 7 仅有标出的两个位置。其他行列只画相关候选，省略不代表没有候选。" : "Both base lines have been checked in full: 7 has only the two marked positions on each. Other lines show relevant candidates only; omitted positions do not mean no candidates."}</p>
      </figcaption>
    </figure>
  );
}

export default async function SudokuXWingPage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const lang = isZh ? "zh" : "en";
  const title = isZh ? "数独 X-Wing：两种摆放证明排除" : "Sudoku X-Wing: A Two-Case Proof";
  const url = buildLocalizedUrl(lang, PATH);
  const faqItems = faq[lang];
  const schemas = [
    { "@context": "https://schema.org", "@type": "Article", headline: title, mainEntityOfPage: url, inLanguage: isZh ? "zh-CN" : "en-US", author: { "@type": "Organization", name: "Samurai Sudoku" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: isZh ? "首页" : "Home", item: buildLocalizedUrl(lang) },
      { "@type": "ListItem", position: 2, name: "X-Wing", item: url },
    ] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ];
  return (
    <article className="pb-14">
      {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <nav aria-label={isZh ? "面包屑" : "Breadcrumb"} className="flex gap-2 text-sm text-muted-foreground"><Link href={`/${lang}`}>{isZh ? "首页" : "Home"}</Link><span>/</span><span>X-Wing</span></nav>
        <header className="max-w-3xl py-9">
          <p className="text-sm font-semibold text-primary">{isZh ? "从零学习二阶鱼形" : "Your first order-2 fish pattern"}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{title}</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{isZh ? "固定一个数字。若两行中它各自只有两个合法候选位置，并且落在同样两列，就能删除这两列在其他行的同数字候选。关键是完整检查基准行，而不只是看见四个角。" : "Fix one digit. If two rows each have exactly two legal positions for it, in the same two columns, remove that digit from those columns in other rows. The key is checking the complete base rows, not just noticing four corners."}</p>
          <a href="#practice" className="mt-6 inline-block rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground">{isZh ? "练习识别 X-Wing" : "Practice identifying X-Wing"}</a>
        </header>
        <section className="border-t py-10">
          <h2 className="text-2xl font-semibold">{isZh ? "1. 在两行中找到同样两列" : "1. Match two positions in two rows"}</h2>
          <p className="mt-4 max-w-3xl leading-7">{isZh ? "只追踪数字 7。完整检查后，r2 的 7 只在 c3、c8；r7 的 7 也只在 c3、c8。r2、r7 是基准行，c3、c8 是覆盖列。角格还可以有其他数字候选，这不影响我们只数数字 7 的位置。" : "Track only digit 7. After checking every position, r2 permits 7 only in c3 and c8; r7 also permits 7 only in c3 and c8. Rows r2 and r7 are the bases; columns c3 and c8 are the covers. The corner cells may contain other candidate digits: we are counting positions for 7 only."}</p>
          <CandidateSketch example={xWingLesson.rowExample} isZh={isZh} />
          <p className="max-w-3xl leading-7">{isZh ? "因此可以删除 r1c3、r3c8 的 7。r9c5 不在覆盖列，必须保留；四个 B7 角格也不能由此删除或填定。" : "This lets us remove 7 from r1c3 and r3c8. Keep r9c5: it is outside the cover columns. The four B7 corners cannot be removed or filled by this conclusion."}</p>
        </section>
        <section className="border-t py-10">
          <h2 className="text-2xl font-semibold">{isZh ? "2. 为什么成立：只有两种摆放" : "2. Why it works: only two placements"}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">{xWingLesson.proofCases.map((pair, index) => (
            <div key={index} className="rounded-xl border p-5">
              <h3 className="font-semibold">{isZh ? `情况 ${index + 1}` : `Case ${index + 1}`}: {pair.map((cell) => `r${cell.row + 1}c${cell.column + 1}`).join(" + ")}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{index === 0
                ? isZh ? "若 r2c3=7，同一行的 r2c8 和同一列的 r7c3 都不能是 7。r7 的 7 只能落在 r7c8。" : "If r2c3=7, r2c8 is excluded by its row and r7c3 by its column. The 7 in r7 must therefore be at r7c8."
                : isZh ? "若 r2c8=7，同一行的 r2c3 和同一列的 r7c8 都不能是 7。r7 的 7 只能落在 r7c3。" : "If r2c8=7, r2c3 is excluded by its row and r7c8 by its column. The 7 in r7 must therefore be at r7c3."}</p>
            </div>
          ))}</div>
          <p className="mt-5 max-w-3xl leading-7">{isZh ? "r2 必须在这两个位置中放一个 7，所以上面两案穷尽可能。无论哪一案，c3、c8 都会被这两条基准行的 7 占据，其他行这两列的 7 因此不可能。我们仍不知道哪一案为真。" : "The 7 in r2 must use one of its two positions, so these cases exhaust the possibilities. In either case, the base rows supply a 7 to both c3 and c8. Those columns cannot contain 7 in another row. We still do not know which case is true."}</p>
        </section>
        <section className="border-t py-10">
          <h2 className="text-2xl font-semibold">{isZh ? "3. 交换行列，得到按列 X-Wing" : "3. Swap rows and columns"}</h2>
          <p className="mt-4 max-w-3xl leading-7">{isZh ? "把上图每个坐标的行列交换：r2c3 变为 r3c2。现在基准列是 c2、c7，每列的 7 只在 r3、r8。两案同理占据这两行，因此可删 r3c1、r8c3 的 7；r5c9 不受影响。" : "Transpose every coordinate in the first sketch: r2c3 becomes r3c2. The base columns are now c2 and c7, with 7 restricted to r3 and r8 in each. The same two-case logic occupies both cover rows, removing 7 from r3c1 and r8c3. Keep r5c9."}</p>
          <CandidateSketch example={xWingLesson.columnExample} isZh={isZh} />
        </section>
        <section className="border-t py-10">
          <h2 className="text-2xl font-semibold">{isZh ? "4. 第三个候选会破坏前提" : "4. A third candidate breaks the premise"}</h2>
          <p className="mt-4 max-w-3xl leading-7">{isZh ? "回到按行图，额外加入 r2c5 的 7。r2 现在有三个位置，不能只检查原来的四个角并继续称它为标准 X-Wing。" : "Return to the row sketch and add a candidate 7 at r2c5. Row r2 now has three positions. Checking only the original four corners no longer establishes a standard X-Wing."}</p>
          <p className="mt-4 max-w-3xl rounded-xl border-l-4 border-amber-500 bg-muted/30 p-5 leading-7">{isZh ? "局部反证：r2c5=7、r7c8=7、r1c3=7 可以同时满足这三个落子的行、列、宫互不冲突。因此 r1c3 并非必删。这只是局部逻辑见证，不宣称能延伸成完整可解或唯一解题。" : "Local counterexample: r2c5=7, r7c8=7 and r1c3=7 do not conflict with one another in a row, column or box. So r1c3 is not necessarily eliminable. This is a local logical witness, not a claim that it extends to a complete solvable or unique-solution puzzle."}</p>
        </section>
        <section id="practice" className="border-t py-10">
          <h2 className="text-2xl font-semibold">{isZh ? "练习：候选图，不是完整题求解器" : "Practice on candidate maps"}</h2>
          <p className="mt-4 max-w-3xl leading-7">{isZh ? "下方默认二阶 X-Wing。切换按行、按列，先判断再揭晓。这里的“反例”把一个角移到了错列（转置后为错行），与上文额外加入 r2c5 的第三候选反例不同。切换示例会重置揭晓。所有示意图均非完整题，也不证明唯一解。" : "The trainer starts at order 2, X-Wing. Try Rows and Columns, decide, then reveal. Its Near miss moves a corner into a mismatched column (a mismatched row after transposing); it is different from adding the third candidate r2c5 above. Changing the example resets the reveal. These are candidate sketches, not full puzzles or proofs of a unique solution."}</p>
        </section>
      </div>
      <SwordfishTrainer locale={lang} initialOrder={2} />
      <div className="mx-auto max-w-5xl px-4">
        <section className="py-10">
          <h2 className="text-2xl font-semibold">{isZh ? "用在武士数独时" : "Using X-Wing in Samurai Sudoku"}</h2>
          <p className="mt-4 max-w-3xl leading-7">{isZh ? "先选定一个 9×9 网格，所有行列坐标都属于这个网格。重叠格的候选必须同时满足相连两个网格。不要把五盘拼成一张 21×21 棋盘来凑基准行。先更新合法候选，再完整检查基准线。本课只讲标准行列 X-Wing，不涵盖 finned、sashimi 等变体。" : "Choose one 9×9 grid and keep every coordinate within it. Candidates in an overlap cell must satisfy both connected grids. Do not combine rows from the five grids as if they formed one 21×21 Sudoku. Refresh legal candidates, then check the complete base lines. This lesson covers classic row/column X-Wing, not finned, sashimi or other variants."}</p>
          <p className="mt-5 leading-7">{isZh ? "熟悉两条基准线后，再学习三条基准线的推广：" : "Once two base lines make sense, explore the three-line extension: "}<Link href={`/${lang}/sudoku-swordfish`} className="font-semibold text-primary underline underline-offset-4">{isZh ? "继续学习 Swordfish 剑鱼" : "Continue to Swordfish"}</Link></p>
        </section>
        <section className="border-t py-10">
          <h2 className="text-2xl font-semibold">{isZh ? "常见问题" : "Frequently asked questions"}</h2>
          <div className="mt-5 space-y-6">{faqItems.map(({ question, answer }) => <div key={question}><h3 className="font-semibold">{question}</h3><p className="mt-2 max-w-3xl leading-7 text-muted-foreground">{answer}</p></div>)}</div>
        </section>
        <section className="border-t pt-6 text-sm leading-6 text-muted-foreground">
          <h2 className="font-semibold text-foreground">{isZh ? "规则来源与示例边界" : "Rule source and example boundaries"}</h2>
          <p className="mt-2">{isZh ? "规则参考：" : "Rule reference: "}<a href={SOURCE} className="text-primary underline underline-offset-4">SudokuWiki — X-Wing Strategy</a>{isZh ? "。坐标草图、两案证明和第三候选反例为本页原创教学内容，未使用外部题目或图片。" : ". The coordinate sketches, two-case explanation and third-candidate counterexample are original teaching examples; no external puzzle or artwork is used."}</p>
        </section>
      </div>
    </article>
  );
}
