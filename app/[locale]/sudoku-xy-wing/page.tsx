import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";

interface PageProps { params: Promise<{ locale: string }> }
const PATH = "/sudoku-xy-wing";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const lang = locale === "zh" ? "zh" : "en";
  const title = lang === "zh" ? "数独 XY-Wing 图解：两分支与候选排除" : "XY-Wing Sudoku: A Two-Branch Proof";
  const description = lang === "zh" ? "用原创候选草图学习 XY-Wing 的两分支证明、反例与武士数独适用范围。" : "Learn XY-Wing Sudoku with an original candidate sketch, a two-branch proof and a near miss.";
  const canonical = buildLocalizedUrl(lang, PATH);
  return { title, description, alternates: { canonical, languages: buildLanguageAlternates(PATH) }, openGraph: { title, description, url: canonical, type: "article" } };
}

export default async function XYWingPage({ params }: PageProps) {
  const { locale } = await params;
  const lang = locale === "zh" ? "zh" : "en";
  const zh = lang === "zh";
  const rows = zh ? [
    ["r2c2", "枢纽 P", "{2, 7}", "同行看见 A，同列看见 B"],
    ["r2c8", "翼 A", "{2, 9}", "第 2 行看见 P；第 8 列看见正例"],
    ["r8c2", "翼 B", "{7, 9}", "第 2 列看见 P；第 8 行看见两个目标"],
    ["r8c8", "正例目标 T", "含 9", "同时看见 A 和 B：删 9"],
    ["r8c5", "反例目标 N", "含 9", "只看见 B：本结构不能删 9"],
  ] : [
    ["r2c2", "Pivot P", "{2, 7}", "Sees A in its row and B in its column"],
    ["r2c8", "Wing A", "{2, 9}", "Sees P in row 2 and T in column 8"],
    ["r8c2", "Wing B", "{7, 9}", "Sees P in column 2 and both targets in row 8"],
    ["r8c8", "Positive target T", "Contains 9", "Sees both A and B: remove 9"],
    ["r8c5", "Negative target N", "Contains 9", "Sees B only: keep 9 from this pattern"],
  ];
  const faq = zh ? [
    ["Y-Wing 与 XY-Wing 相同吗？", "是的，Y-Wing 是这个技巧的另一名称，使用同一套条件。"],
    ["目标必须看见枢纽吗？", "XY-Wing 的目标必须同时看见两翼，不必看见枢纽。本例 r8c8 就不看见枢纽。"],
    ["与 X-Wing、XYZ-Wing 有何区别？", "X-Wing 是单一数字在两条基准行或列上的鱼形结构。XYZ-Wing 的枢纽有三个候选，目标还必须看见枢纽。"],
  ] : [
    ["Is Y-Wing the same as XY-Wing?", "Yes. Y-Wing is another name for the same technique and conditions."],
    ["Must the target see the pivot?", "An XY-Wing target must see both wings, but need not see the pivot. In this example r8c8 does not see the pivot."],
    ["How does this differ from X-Wing and XYZ-Wing?", "X-Wing is a single-digit fish using two base rows or columns. XYZ-Wing has a three-candidate pivot and the target must also see the pivot."],
  ];
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: zh ? "数独 XY-Wing：两分支证明" : "XY-Wing Sudoku: a two-branch proof",
    description: zh ? "用候选草图和反例解释 XY-Wing 排除规则。" : "An explanation of XY-Wing elimination with a candidate sketch and a near miss.",
    mainEntityOfPage: buildLocalizedUrl(lang, PATH),
    inLanguage: zh ? "zh-CN" : "en-US",
    author: { "@type": "Organization", name: "Samurai Sudoku" },
    publisher: { "@type": "Organization", name: "Samurai Sudoku" },
  };
  return <article className="mx-auto max-w-5xl px-4 pb-14 pt-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="flex flex-wrap gap-2 text-sm text-muted-foreground">
      <Link href={`/${lang}`}>{zh ? "首页" : "Home"}</Link><span>/</span><Link href={`/${lang}/games/samurai/strategy-guide`}>{zh ? "解题技巧" : "Solving techniques"}</Link><span>/</span><span>XY-Wing</span>
    </nav>
    <header className="py-10"><h1 className="font-display text-4xl font-semibold md:text-5xl">{zh ? "数独 XY-Wing：两分支证明" : "XY-Wing Sudoku: a two-branch proof"}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{zh ? "三个双候选格连接成一组：枢纽为 {X,Y}，两翼分别为 {X,Z} 和 {Y,Z}，X、Y、Z 互异。两翼各看见枢纽；同时看见两翼的其他格可删除 Z。" : "Three bivalue cells form a pattern: a pivot {X,Y} and wings {X,Z} and {Y,Z}, with X, Y and Z distinct. Each wing sees the pivot. Another cell that sees both wings can eliminate Z."}</p>
    </header>
    <section className="border-y py-8"><h2 className="text-2xl font-semibold">{zh ? "原创候选草图" : "Original candidate sketch"}</h2>
      <p className="mt-3 leading-7">{zh ? "这是局部候选草图，不是完整谜题或唯一解证明。r 表示行，c 表示列；同一 9×9 内同行、同列或同一个 3×3 宫的格子互相看见。两翼互不看见。" : "This is a local candidate sketch, not a complete puzzle or a uniqueness proof. r means row and c means column. Within one 9×9, cells see each other when they share a row, column or 3×3 box. The wings do not see each other."}</p>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[36rem] border-collapse text-left text-sm leading-6"><caption className="pb-3 text-left font-semibold">{zh ? "坐标、角色、候选与关系" : "Coordinates, roles, candidates and relationships"}</caption><thead><tr>{(zh ? ["坐标", "角色", "候选", "关系与操作"] : ["Coordinate", "Role", "Candidates", "Relationship and action"]).map(h => <th className="border p-3" scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, i) => i === 0 ? <th scope="row" className="border p-3" key={i}>{cell}</th> : <td className="border p-3" key={i}>{cell}</td>)}</tr>)}</tbody></table></div>
    </section>
    <section className="py-10"><h2 className="text-2xl font-semibold">{zh ? "为什么正例可以删除 9？" : "Why can the positive target lose 9?"}</h2><ol className="mt-4 list-decimal space-y-3 pl-6 leading-7">
      <li>{zh ? "若 P=2，同行的 A 不能是 2，因此 A=9；T 与 A 同列，T 不能是 9。" : "If P=2, A cannot be 2 in the same row, so A=9. T shares A's column and cannot be 9."}</li>
      <li>{zh ? "若 P=7，同列的 B 不能是 7，因此 B=9；T 与 B 同行，T 不能是 9。" : "If P=7, B cannot be 7 in the same column, so B=9. T shares B's row and cannot be 9."}</li>
    </ol><p className="mt-4 leading-7">{zh ? "P 只有这两种候选，因此至少一翼为 9，T 可以删 9。这并不确定 P 或两翼各自的值。" : "P has only those two candidates, so at least one wing is 9 and T can remove 9. This does not determine the individual values of P or the wings."}</p>
    <h3 className="mt-8 text-xl font-semibold">{zh ? "反例：只看见一翼" : "Near miss: seeing only one wing"}</h3><p className="mt-3 leading-7">{zh ? "N r8c5 只看见 B，不看见 A。局部赋值 P=2、A=9、B=7、N=9 不违反这些格之间的行列宫关系，所以仅凭本结构不能删 N 的 9。它不是全盘完成解；其他独立技巧仍可能删除该候选。" : "N r8c5 sees B but not A. The local assignment P=2, A=9, B=7, N=9 respects the row, column and box relationships among these cells, so this pattern alone cannot remove N's 9. This is not a completed grid; another independent technique might still remove it."}</p></section>
    <section className="border-t py-10"><h2 className="text-2xl font-semibold">{zh ? "在实际候选中寻找 XY-Wing" : "Finding XY-Wing in your own candidates"}</h2>
      <div className="mt-4 space-y-4 leading-7">
        <p>{zh ? "先检查候选是否已经根据所有已填数字更新。选一个恰有两个候选的未解格作为枢纽，记作 X 和 Y。接着在枢纽看得见的格子中，寻找恰好含 X 与第三个数字 Z 的双候选格。这个格子是第一翼；它不能只是包含 X、Z 和其他数字，否则 X 被排除后不一定只剩 Z。" : "First update candidates against the placed digits. Choose an unsolved bivalue pivot {X,Y}, then look among its peers for a bivalue wing {X,Z}. A cell with additional candidates is not a substitute: removing X would not necessarily leave Z."}</p>
        <p>{zh ? "再在枢纽的同行、同列或同宫中寻找第二翼 {Y,Z}。两翼与枢纽各共享一个候选，而它们共同的另一个候选必须是同一个 Z；X、Y、Z 也必须互不相同。找到第二翼后，分别核实它与枢纽的可见关系，不能只因格子在图上靠近就认为它们互相看见。" : "Find a second pivot peer {Y,Z}. Each wing shares one pivot candidate and both share the same third digit Z; X, Y and Z must be distinct. Check each actual row, column or box relationship rather than relying on visual proximity."}</p>
        <p>{zh ? "最后查找同时看见两翼、并且当前含 Z 的其他未解格。共同可见格可能不止一个，也可能一个都没有：没有目标时，这组结构不会产生本次删除。对每个目标分别确认它与第一翼、第二翼各自共享的行、列或宫，再只删除候选 Z；不要删除目标的其他候选。" : "Finally find other unsolved cells containing Z that see both wings. There may be several or none; without a target this pattern yields no elimination. For each target verify its unit with each wing and remove only Z, leaving its other candidates alone."}</p>
        <p>{zh ? "用本例练习时，可以把 r2c2 当作起点，沿第 2 行找到 A，再沿第 2 列找到 B。接下来从 A 的第 8 列与 B 的第 8 行寻找交点，得到 T r8c8。注意这只是寻找共同可见格的一种方式：若一翼通过宫看见目标，也应按实际共享的宫检查，而不能要求所有目标都位于行列交点。核实候选 9 确实存在后才执行删除；如果目标没有 9，就没有这一步可做。" : "In this example, start at r2c2, find A along row 2 and B along column 2, then intersect A's column 8 with B's row 8 to locate T r8c8. That is only one way to find a shared peer: a wing may also see a target through a box. Confirm the target actually contains 9 before removing it; otherwise there is no elimination to make there."}</p>
        <p>{zh ? "检查反例时，分别写出目标与两翼的关系比观察形状更可靠。N r8c5 与 B 同在第 8 行，但它和 A 不同行、不列，也不在同一 3×3 宫。即使某个分支能排除 N 的 9，另一个分支仍允许它，因而不能把单一分支的结果当作必然结论。" : "For a near miss, write down each target-to-wing relationship instead of judging the shape. N r8c5 shares row 8 with B, but shares no row, column or box with A. One branch excludes 9 from N while the other still permits it, so a conclusion from just one branch is insufficient."}</p>
        <p>{zh ? "删除后更新候选并继续解题。如果某格变成唯一候选，可以按普通规则落子；但 XY-Wing 的两分支结论本身只保证至少一翼为 Z，并不告诉你究竟是哪一翼。也不要把反例目标中的 9 一概保留到解题结束：其他独立证据可能在后续证明它不能取 9。" : "Update notes after the elimination. A resulting single can then be placed by the usual rule, but the two branches themselves only guarantee at least one wing is Z; they do not identify which. A near miss may still lose Z through different, independent reasoning later."}</p>
      </div>
    </section>
    <section className="border-y py-10"><h2 className="text-2xl font-semibold">{zh ? "在武士数独中使用" : "Using it in Samurai Sudoku"}</h2><p className="mt-4 leading-7">{zh ? "在选定的一个 9×9 网格内检查行、列和宫。重叠格的候选仍须满足所有实际相连网格的约束；不能把整个 21×21 排列当作一个标准网格，或仅凭视觉位置推断跨网格的可见关系。" : "Check rows, columns and boxes within one selected 9×9 grid. Candidates in overlap cells must still satisfy the constraints of every connected grid. Do not treat the 21×21 layout as one standard grid or infer cross-grid visibility from visual position alone."}</p></section>
    <section className="py-10"><h2 className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2><div className="mt-4 divide-y border-y">{faq.map(([q,a]) => <details className="py-4" key={q}><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-3 leading-7">{a}</p></details>)}</div></section>
    <section className="border-t pt-8"><h2 className="text-xl font-semibold">{zh ? "规则参考与继续学习" : "References and further reading"}</h2><ul className="mt-4 list-disc space-y-2 pl-6"><li><a className="text-primary underline" href="https://hodoku.sourceforge.net/en/tech_wings.php#xy">HoDoKu: XY-Wing</a></li><li><a className="text-primary underline" href="https://sudoku.ie/learn/xy-wing">Sudoku.ie: XY-Wing</a></li><li><Link className="text-primary underline" href={`/${lang}/sudoku-x-wing`}>X-Wing</Link></li></ul></section>
  </article>;
}
