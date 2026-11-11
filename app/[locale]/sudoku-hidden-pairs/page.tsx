import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface Props { params: Promise<{ locale: string }> }
const PATH = '/sudoku-hidden-pairs';
const cells = [
  ['r5c1', '{1,2,7}', '{2,7}'], ['r5c2', '{1,3,4}', '{1,3,4}'],
  ['r5c3', '{3,5}', '{3,5}'], ['r5c4', '{4,6}', '{4,6}'],
  ['r5c5', '{5,8}', '{5,8}'], ['r5c6', '{2,4,7,9}', '{2,7}'],
  ['r5c7', '{6,9}', '{6,9}'], ['r5c8', '{1,8,9}', '{1,8,9}'],
  ['r5c9', '{3,8,9}', '{3,8,9}'],
];
const faqs = {
  en: [
    ['What is a hidden pair in Sudoku?', 'Two unplaced digits are each confined to the same two unsolved cells in one row, column, or box. The cells may also contain other candidates.'],
    ['Does a hidden pair tell me which digit goes where?', 'No. The two digits occupy the cells in some order; another deduction is needed to determine that order.'],
    ['Can I remove the pair digits from other cells?', 'They already have no other candidate locations in that unit. The useful hidden-pair move removes other candidates inside the two member cells.'],
    ['What if a digit has a third location?', 'The pair test fails. Do not make its proposed eliminations unless another independent deduction supports them.'],
    ['Does this require a unique solution?', 'No. The argument follows from the unit constraints and complete current candidates, regardless of whether a whole puzzle has a unique solution.'],
  ],
  zh: [
    ['数独隐性对是什么？', '同一行、列或宫中，两个尚未填入的数字各自都只能出现在相同的两个未解格中。这两格还可以有其他候选。'],
    ['隐性对能确定两个数字的顺序吗？', '不能。两个数字以某种顺序占据两格，还需要其他推理才能确定各自位置。'],
    ['能从其他格删除这两个数字吗？', '在该单位内，它们本来就没有其他候选位置。隐性对的有效操作是删除两个成员格中的其他候选。'],
    ['一个数字有第三个位置怎么办？', '隐性对条件不成立。除非有其他独立推理支持，不能执行原先的删除。'],
    ['证明需要题目唯一解吗？', '不需要。证明只依赖单位规则和完整、及时更新的候选，不依赖整题是否有唯一解。'],
  ],
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang = locale === 'zh' ? 'zh' : 'en';
  const title = lang === 'zh' ? '数独隐性对：寻找位置与删除候选' : 'Sudoku Hidden Pair: Find and Eliminate Candidates';
  const description = lang === 'zh' ? '用完整行候选、反例和武士数独重叠宫说明隐性对，掌握寻找数字位置与删除额外候选的方法。' : 'Learn the Sudoku hidden pair with a complete row of candidates, a counterexample, and practical Samurai overlap guidance.';
  const canonical = buildLocalizedUrl(lang, PATH);
  return { title, description, alternates: { canonical, languages: buildLanguageAlternates(PATH) }, openGraph: { title, description, url: canonical, type: 'article' }, twitter: { card: 'summary_large_image', title, description } };
}

export default async function HiddenPairsPage({ params }: Props) {
  const { locale } = await params;
  const lang = locale === 'zh' ? 'zh' : 'en';
  const zh = lang === 'zh';
  const url = buildAbsoluteUrl(`/${lang}${PATH}`);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'TechArticle', headline: zh ? '数独隐性对：寻找位置与删除候选' : 'Sudoku Hidden Pair: Find and Eliminate Candidates', description: zh ? '用行候选和反例解释隐性对。' : 'A row sketch and counterexample explain hidden pairs.', mainEntityOfPage: url, inLanguage: zh ? 'zh-CN' : 'en-US', author: { '@type': 'Organization', name: 'Samurai Sudoku' }, publisher: { '@type': 'Organization', name: 'Samurai Sudoku' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs[lang].map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: zh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${lang}`) }, { '@type': 'ListItem', position: 2, name: zh ? '解题技巧' : 'Solving techniques', item: buildAbsoluteUrl(`/${lang}/games/samurai/strategy-guide`) }, { '@type': 'ListItem', position: 3, name: zh ? '隐性对' : 'Hidden pair', item: url }] },
  ];
  return <article className="mx-auto max-w-5xl px-4 pb-16 pt-8">
    {schemas.map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />)}
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link href={`/${lang}`}>{zh ? '首页' : 'Home'}</Link> / <Link href={`/${lang}/games/samurai/strategy-guide`}>{zh ? '解题技巧' : 'Solving techniques'}</Link> / {zh ? '隐性对' : 'Hidden pair'}</nav>
    <header className="py-10"><p className="font-semibold text-primary">{zh ? '候选位置教学' : 'Candidate location lesson'}</p><h1 className="mt-3 text-4xl font-semibold">{zh ? '数独隐性对：从数字位置找到删除' : 'Sudoku Hidden Pair: Find the Locations, Remove the Extras'}</h1><p className="mt-5 text-lg leading-8">{zh ? '隐性对藏在两个数字的位置里，而不是两个格相同的候选列表里。先检查整个单位，再清理成员格中的其他候选。下面的完整行示例展示每一步以及一个容易误判的反例。' : 'A hidden pair is found by tracking where two digits can go, even when their cells contain extra notes. Scan the entire unit first, then clean the two member cells. The complete row sketch below shows the proof and a near miss.'}</p></header>
    <section className="border-y py-8"><h2 className="text-2xl font-semibold">{zh ? '成立条件与证明' : 'Conditions and proof'}</h2><p className="mt-4 leading-7">{zh ? '在同一个真实的九格行、列或 3×3 宫内，两个数字都尚未填入，并且每个数字都只能出现在相同的两个未解格。候选必须完整且反映当前所有限制：漏记一个合法候选可能制造假的隐性对。仅仅看到两格都写有相同的两个数字并不足够。' : 'In one real nine-cell row, column, or 3×3 box, neither digit is already placed, and each digit occurs as a candidate in exactly the same two unsolved cells. Notes must be complete and current: omitting a legal candidate can create a false pair. Two cells merely sharing two notes are not enough.'}</p><p className="mt-4 leading-7">{zh ? '该单位必须各放一个这两个数字，而它们都没有其他位置，因此两格必定分别容纳这两个数字。删去这两格内其他候选；证明并未决定两个数字的先后顺序，也不依赖完整题目的唯一解。' : 'The unit needs one of each digit and neither can go elsewhere. The two cells must therefore hold the digits in some order. Remove the other candidates inside those cells. This proof does not decide the order and does not depend on uniqueness of a full puzzle.'}</p></section>
    <section className="py-10"><h2 className="text-2xl font-semibold">{zh ? '完整的第 5 行候选示例' : 'A complete row 5 candidate sketch'}</h2><p className="mt-4 leading-7">{zh ? '这是一个 9×9 网格第 5 行的原创候选草图，不是完整数独题目。坐标属于该网格，九格均未填入；这里只检查行内限制，不声称列、宫或整盘存在解。' : 'An original candidate sketch for row 5 of one 9×9 grid; not a complete Sudoku puzzle. Coordinates are local to that grid and all nine cells are unsolved. This checks row constraints only; it claims no column or box compatibility or full-grid solution.'}</p>
      <div className="mt-5 overflow-x-auto"><table className="w-full text-left"><thead><tr><th>{zh ? '格' : 'Cell'}</th><th>{zh ? '检查前' : 'Before'}</th><th>{zh ? '检查后' : 'After'}</th></tr></thead><tbody>{cells.map(row => <tr key={row[0]}>{row.map((cell, i) => <td className="border-b px-3 py-2" key={i}>{cell}</td>)}</tr>)}</tbody></table></div>
      <h3 className="mt-7 text-xl font-semibold">{zh ? '数字位置表' : 'Digit locations'}</h3><table className="mt-3"><thead><tr><th>{zh ? '数字' : 'Digit'}</th><th>{zh ? '候选位置' : 'Candidate locations'}</th></tr></thead><tbody><tr><td>2</td><td>c1, c6</td></tr><tr><td>7</td><td>c1, c6</td></tr></tbody></table><p className="mt-4 leading-7">{zh ? '检查整行：2 和 7 都只在 c1、c6。删去 r5c1 的 1，以及 r5c6 的 4 和 9，保留两个格的 2、7。其他七格不变。' : 'Scan the whole row: 2 and 7 each occur only in c1 and c6. Remove 1 from r5c1 and 4 and 9 from r5c6; retain 2 and 7 in both cells. The other seven cells remain unchanged.'}</p>
      <h3 className="mt-7 text-xl font-semibold">{zh ? '两种行内摆放' : 'Two valid row assignments'}</h3><p className="mt-3 leading-7">{zh ? '按 c1 到 c9 的顺序，下面两种摆放各含 1–9 一次，且每个数字都属于前后候选。它们说明隐性对本身不能决定顺序；仅证明这行草图一致，不证明整盘可完成。' : 'In c1 to c9 order, each assignment uses 1–9 once and selects a candidate allowed before and after. Both orders remain possible from the pair rule alone. These witnesses establish consistency of this row sketch only, not a full-grid completion.'}</p><ul className="mt-3 list-disc pl-6"><li>2,1,3,4,5,7,6,8,9</li><li>7,1,3,4,5,2,6,8,9</li></ul>
    </section>
    <section className="border-y py-10"><h2 className="text-2xl font-semibold">{zh ? '反例：第三个位置' : 'Near miss: a third location'}</h2><p className="mt-4 leading-7">{zh ? '保持其余八格不变，只在 r5c2 加入 7，使它变成 {1,3,4,7}。现在 2 的位置仍是 c1、c6，而 7 可以在 c1、c2、c6。虽然 c1 和 c6 都仍含 2、7，却不再构成这个隐性对，不能按原证明执行三项删除。' : 'Keep the other eight cells unchanged and add 7 to r5c2, making it {1,3,4,7}. Now 2 occurs in c1 and c6, but 7 occurs in c1, c2 and c6. Both selected cells still contain 2 and 7, yet the proposed pair fails. Do not apply the earlier three eliminations from this pattern.'}</p><p className="mt-4 leading-7">{zh ? '反例摆放（c1 至 c9）为 1,7,3,4,5,2,6,8,9：各数字不同且都属于修改后的候选。7 可以放在 c2，c1 可以保留 1，因此行内信息不足以删除 c1 的 1。这不代表其他独立推理不能删除其他候选。' : 'The row assignment 1,7,3,4,5,2,6,8,9 uses distinct digits, each allowed by the modified candidates. It puts 7 in c2 and retains 1 in c1, so the row information cannot justify removing 1 from c1. Other independent deductions may still eliminate candidates.'}</p></section>
    <section className="py-10"><h2 className="text-2xl font-semibold">{zh ? '隐性对与显性对：删除方向' : 'Hidden pair versus naked pair'}</h2><p className="mt-4 leading-7">{zh ? '隐性对从两个数字的位置出发，删除成员格内的其他候选。显性对从两个候选恰好相同且只有这两个数字的格出发，删除同单位其他格中的这两个数字。两者都锁定两格，但寻找方法与删除方向不同。' : 'A hidden pair starts with two digits restricted to two cells and removes extra notes inside those cells. A naked pair starts with two cells whose candidate sets are already exactly the same two digits, then removes those digits from other cells in the shared unit. The starting observation and elimination direction differ.'}</p></section>
    <section className="border-y py-10"><h2 className="text-2xl font-semibold">{zh ? '在武士数独中使用' : 'Use the rule in Samurai Sudoku'}</h2><p className="mt-4 leading-7">{zh ? '选择五个组成网格中的一个 9×9 网格，检查其中真实的一行、一列或一宫。不能把 21×21 布局中看似对齐、却不共享同一九格单位的格子拼成候选对。共享宫的物理格同时受相连网格的限制；候选应反映所有适用限制，删除后重新检查受影响的真实单位。' : 'Choose one of the five component 9×9 grids and check one of its actual rows, columns, or boxes. A long visual line across the 21×21 layout is not automatically a unit. Overlap cells are shared physical cells subject to all connected constraints. Keep notes consistent with those constraints and rescan affected real units after a valid deletion.'}</p><p className="mt-4 leading-7">{zh ? '实战时先更新近期落子影响的候选，再逐个数字扫描一个单位。找到疑似结构后检查所有九格，记录删除位置，再查看是否产生新的唯一候选。若出现第三个位置，就暂时放弃该隐性对。' : 'In practice, update notes after recent placements, then scan one unit digit by digit. Check all nine cells before recording a pair and its eliminations. Look for new singles after updating the notes. If a digit has a third location, set that proposed pair aside.'}</p></section>
    <section className="py-10"><h2 className="text-2xl font-semibold">{zh ? '常见问题' : 'Frequently asked questions'}</h2>{faqs[lang].map(([q,a]) => <details className="border-b py-4" key={q}><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-3 leading-7">{a}</p></details>)}</section>
    <section className="border-t py-10"><h2 className="text-2xl font-semibold">{zh ? '继续学习与参考资料' : 'Continue learning and references'}</h2><p className="mt-4 leading-7">{zh ? '先复习候选笔记，再比较其他候选集合技巧。以下参考资料解释一般规则；本页示例与文字为原创。' : 'Review candidate notes and compare other candidate-set techniques. The references explain the general rule; this page’s example and explanations are original.'}</p><ul className="mt-4 list-disc space-y-2 pl-6"><li><Link href={`/${lang}/games/samurai/candidate-notes`}>{zh ? '候选笔记' : 'Candidate notes'}</Link></li><li><Link href={`/${lang}/sudoku-naked-triple`}>{zh ? '显性三数组' : 'Naked triples'}</Link></li><li><Link href={`/${lang}/games/samurai/overlap-boxes`}>{zh ? '重叠宫' : 'Overlap boxes'}</Link></li><li><a href="https://hodoku.sourceforge.net/en/tech_hidden.php">HoDoKu: Hidden Subsets</a></li><li><a href="https://sudoku.com/sudoku-rules/hidden-pairs/">Sudoku.com: Hidden pairs technique</a></li></ul></section>
  </article>;
}
