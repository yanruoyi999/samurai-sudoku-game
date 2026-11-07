import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

type Props = { params: Promise<{ locale: string }> };
const PATH = '/sudoku-skyscraper';
const REVIEWED = '2026-11-06';
const text = {
  en: {
    title: 'Sudoku Skyscraper: Two Strong Links, One Safe Elimination',
    description: 'Learn the Sudoku Skyscraper technique with an original digit-6 candidate sketch, two-case proof, shared-peer checks and a broken-link counterexample.',
    intro: 'This is the Skyscraper technique for ordinary Sudoku, not the separate puzzle with building-height clues around its edges. Work with one digit and two strong links; a shape that merely looks like two towers is not enough.',
    quick: 'Find two columns with exactly two candidates for the same digit. One endpoint in each column shares a row. Their other endpoints are the roofs. At least one roof must be true, so a candidate that sees both roofs can be removed.',
    mapTitle: 'An original candidate sketch for digit 6',
    mapNote: 'Local 9×9 coordinates: r1c2 means row 1, column 2. This is not a complete Sudoku puzzle and makes no uniqueness claim. Only the candidate locations in columns 2 and 8 are complete; ? marks unspecified cells in the other columns.',
    caption: 'Digit 6 only. A/C are roofs, B/D are aligned bases, X is an elimination target, — means no 6 in the two complete columns, and ? is unspecified.',
    proofTitle: 'Why the two targets lose 6',
    proof: [
      'Column 2 contains 6 only at A=r1c2 and B=r6c2; column 8 contains 6 only at C=r3c8 and D=r6c8. Each is a strong pair: if one endpoint is false, the other must be true.',
      'B and D share row 6, so they cannot both be 6. Suppose A is false: B must then be true, which makes D false and therefore C true. Thus A or C is true; the argument does not determine which one.',
      'The target r1c7 sees A through row 1 and C through the top-right box. The target r3c1 sees A through the top-left box and C through row 3. Both targets conflict with whichever roof is true, so remove 6 from those two cells only.',
      'A cell such as r2c5 does not see both roofs. Do not remove 6 there merely because it sits between the towers. Other deletions require their own common-peer check.',
    ],
    checkTitle: 'Check the links before copying the picture',
    checklist: [
      'Select one digit; do not combine a strong pair of 6s with a pair of another digit.',
      'Verify all nine cells in each chosen column. Exactly two remaining locations is a premise, not a visual shortcut.',
      'Confirm the bases share a real row in this 9×9 grid, and identify the two other endpoints explicitly.',
      'For each proposed deletion, name the row, column or box connecting it to each roof.',
      'Delete candidates, then recheck singles. The deduction need not immediately fill a cell.',
    ],
    counterTitle: 'Near miss: a third candidate breaks the proof',
    counter: 'Add a third possible 6 at r9c2. Now A=false no longer forces B=true: the 6 could be at r9c2 instead. For example, r9c2 and D=r6c8 may be true while both roofs are false. In that case r1c7 is not excluded by this chain. Do not use the two-location Skyscraper proof when the column actually has three candidates.',
    witness: 'One-digit consistency witness for that near miss: the following columns for rows 1–9 place a single 6 in every row, column and box, including r1c7, r6c8 and r9c2. It is not a completed nine-digit puzzle or a puzzle-generation claim.',
    samuraiTitle: 'Using it inside Samurai Sudoku',
    samurai: 'Use rows, columns and boxes belonging to one component 9×9 grid. A long visual line across the entire Samurai board is not one Sudoku unit. A shared cell must still satisfy both grids; after an elimination there, refresh the connected grid’s notes without inventing a cross-grid strong link.',
    practiceTitle: 'A deliberate practice check',
    practice: 'Before looking for a Skyscraper in your game, write four coordinates on paper and label the two complete units. Explain the contradiction with both roofs false, then identify one target that sees both. If you cannot name all of these pieces, keep the candidate and return to your notes. This static example does not add a Skyscraper detector or promise that the current game contains one.',
    faqTitle: 'Common questions',
    faqs: [
      { q: 'Is a Skyscraper the same as X-Wing?', a: 'No. This example has one aligned endpoint pair and offset roofs. The useful conclusion is that at least one roof is true, followed by a common-peer elimination.' },
      { q: 'Must the cells have only one candidate each?', a: 'No. Each selected digit must have exactly two possible cells in each chosen unit. Those cells may also contain other digits.' },
      { q: 'Can I delete from every cell between the towers?', a: 'No. A target must see both roof endpoints by actual Sudoku constraints. Being visually between them is irrelevant.' },
      { q: 'Does the picture establish a uniquely solvable puzzle?', a: 'No. It is an explicitly partial candidate diagram that demonstrates a local inference.' },
    ],
  },
  zh: {
    title: '数独 Skyscraper 摩天楼：两条强链与安全删候选',
    description: '用原创数字6候选图学习Skyscraper摩天楼技巧：两分支证明、共同可见格、第三候选反例，以及武士数独的单网格边界。',
    intro: '这里讲的是普通数独中的Skyscraper摩天楼技巧，不是四周带楼高提示的另一种谜题。只研究一个数字和两条强链；形状像两座塔，并不足以证明能删候选。',
    quick: '找两列，每列对同一个数字恰好只剩两个位置。一对端点位于同一行，另外两个端点称为屋顶。至少一个屋顶成立，因此同时看见两个屋顶的候选格可以删去这个数字。',
    mapTitle: '原创数字6候选示意图',
    mapNote: '坐标属于一个9×9网格：r1c2表示第1行第2列。这不是完整数独题，也不声称唯一解。只有第2列和第8列的数字6位置列举完整，其他列的问号表示未给出的候选信息。',
    caption: '只看数字6：A/C为屋顶，B/D为同一行的底座，X为待删候选；—表示两条完整列里没有6，?表示其他位置未说明。',
    proofTitle: '为什么这两个目标格可以删除6',
    proof: [
      '第2列的6只在A=r1c2和B=r6c2，第8列只在C=r3c8和D=r6c8。每列构成强对：其中一个位置不成立，另一个就必须成立。',
      'B和D同属第6行，不能同时为6。假设A不成立，则B成立；B让D不成立，于是C成立。因此A、C至少一个成立，但这一步不确定究竟是哪一个。',
      'r1c7通过第1行看见A，又通过右上宫看见C；r3c1通过左上宫看见A，又通过第3行看见C。无论哪个屋顶成立，两个目标都会冲突，所以这两个格都能删6。',
      'r2c5并不同时看见两个屋顶，不能因为它位于两座塔之间就删除6。其他删除也必须分别证明共同可见关系。',
    ],
    checkTitle: '套图之前先检查前提',
    checklist: [
      '只选择一个数字，不能混合6的强对和其他数字的强对。',
      '检查选中列的全部九格，确认这个数字确实只剩两个位置。',
      '底座必须属于这个9×9网格的同一行，并明确写出另外两个屋顶坐标。',
      '逐个说明目标通过哪条行、列或宫看见每个屋顶。',
      '这是删除候选，不一定立即填数；删完再复查唯一候选。',
    ],
    counterTitle: '反例：第三个候选会打断证明',
    counter: '若第2列还有r9c2可以放6，A不成立就不再强迫B成立，6可以位于r9c2。此时r9c2与D=r6c8可同时成立，两个屋顶都不成立，原来的链就不能排除r1c7的6。因此不能只挑看起来顺眼的两个位置，忽略第三个候选。',
    witness: '以下给出这个反例的一种单数字一致性见证：按第1至第9行列出数字6所在列，每行、列、宫均只有一个6，包含r1c7、r6c8及r9c2。这不是九个数字都填完的解，也不构成生成完整题目的声明。',
    samuraiTitle: '在武士数独里怎样使用',
    samurai: '只能使用同一个组成9×9网格内真实的行、列和宫；整个武士棋盘上一条很长的视觉横线，并不是一个数独单位。共享格仍必须同时满足两个网格，删除共享格候选后要同步复查另一网格，但不能臆造跨网格强链。',
    practiceTitle: '一个可执行的练习检查',
    practice: '在实际题中先写出四个端点坐标，并圈出两个已完整检查的单位。试着解释两个屋顶同时不成立会导致什么矛盾，再指出一个同时看见它们的目标。说不清其中任一环节，就保留候选并回到笔记检查。本静态示例没有给游戏增加摩天楼检测器，也不保证当前题里一定有这种结构。',
    faqTitle: '常见问题',
    faqs: [
      { q: '摩天楼和X-Wing相同吗？', a: '不同。本示例只有一对端点对齐，屋顶错开；结论是至少一个屋顶成立，再删除共同可见位置的候选。' },
      { q: '四个格必须都只有一个候选吗？', a: '不需要。要求是选中的数字在每个选定单位中恰好只有两个可放位置，这些格仍可含有其他数字。' },
      { q: '两座塔之间的格子都能删吗？', a: '不能。目标必须通过真实数独约束同时看见两个屋顶，仅仅视觉位置在中间没有意义。' },
      { q: '这张图证明了一道唯一解题目吗？', a: '没有。这是明确标注为局部的候选示意图，只用于说明推理。' },
    ],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params; const lang = locale === 'zh' ? 'zh' : 'en'; const c = text[lang];
  return { title: c.title, description: c.description, alternates: { canonical: buildLocalizedUrl(lang, PATH), languages: buildLanguageAlternates(PATH) }, openGraph: { title: c.title, description: c.description, url: buildLocalizedUrl(lang, PATH), type: 'article' }, twitter: { card: 'summary_large_image', title: c.title, description: c.description } };
}

export default async function SkyscraperPage({ params }: Props) {
  const { locale } = await params; const lang = locale === 'zh' ? 'zh' : 'en'; const c = text[lang]; const zh = lang === 'zh'; const url = buildLocalizedUrl(lang, PATH);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'TechArticle', headline: c.title, description: c.description, mainEntityOfPage: url, inLanguage: lang, dateModified: REVIEWED },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: c.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: zh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${lang}`) }, { '@type': 'ListItem', position: 2, name: c.title, item: url } ] },
  ];
  const marks: Record<string,string> = { '1,2': 'A6', '6,2': 'B6', '3,8': 'C6', '6,8': 'D6', '1,7': 'X6', '3,1': 'X6' };
  const section = 'mt-10 space-y-4'; const link = 'font-medium text-primary underline underline-offset-4';
  return <article className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10 leading-7">
    {schemas.map((schema,i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g,'\u003c') }} />)}
    <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm"><Link className={link} href={`/${lang}`}>{zh ? '首页' : 'Home'}</Link><span>/</span><Link className={link} href={`/${lang}/games/samurai/strategy-guide`}>{zh ? '解题策略' : 'Solving strategy'}</Link></nav>
    <header className="mt-6"><h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{c.title}</h1><p className="mt-5 text-lg text-muted-foreground">{c.intro}</p><p className="mt-3 text-sm">{zh ? '核对日期' : 'Reviewed'} <time dateTime={REVIEWED}>{REVIEWED}</time></p><p className="mt-5 rounded-xl border bg-primary/5 p-5">{c.quick}</p></header>
    <section className={section}><h2 className="text-2xl font-semibold">{c.mapTitle}</h2><p>{c.mapNote}</p>
      <table className="w-full max-w-xl table-fixed border-collapse text-center text-xs sm:text-sm" data-skyscraper-diagram="digit6"><caption className="mb-4 text-left text-sm">{c.caption}</caption><thead><tr><th scope="col" className="p-1">r/c</th>{Array.from({length:9},(_,i)=><th key={i} scope="col">{i+1}</th>)}</tr></thead><tbody>{Array.from({length:9},(_,ri)=><tr key={ri}><th scope="row">{ri+1}</th>{Array.from({length:9},(_,ci)=>{const row=ri+1,col=ci+1;const label=marks[`${row},${col}`] ?? ([2,8].includes(col)?'—':'?');return <td key={ci} data-cell={`r${row}c${col}`} className={`h-9 border border-border p-1 ${row%3===0?'border-b-2':''} ${col%3===0?'border-r-2':''} ${label.startsWith('X')?'bg-amber-100 font-bold text-amber-950':/[ABCD]/.test(label)?'bg-blue-100 font-bold text-blue-950':''}`}>{label}</td>})}</tr>)}</tbody></table>
      <dl className="grid gap-3 sm:grid-cols-2" data-strong-pairs><div className="rounded-lg border p-4"><dt className="font-semibold">{zh?'第2列：恰好两个位置':'Column 2: exactly two locations'}</dt><dd data-column="2" data-rows="1,6">A=r1c2 · B=r6c2</dd></div><div className="rounded-lg border p-4"><dt className="font-semibold">{zh?'第8列：恰好两个位置':'Column 8: exactly two locations'}</dt><dd data-column="8" data-rows="3,6">C=r3c8 · D=r6c8</dd></div></dl>
    </section>
    <section className={section}><h2 className="text-2xl font-semibold">{c.proofTitle}</h2><ol className="list-decimal space-y-4 pl-6">{c.proof.map(p=><li key={p}>{p}</li>)}</ol></section>
    <section className={section}><h2 className="text-2xl font-semibold">{c.checkTitle}</h2><ul className="list-disc space-y-3 pl-6">{c.checklist.map(p=><li key={p}>{p}</li>)}</ul></section>
    <section className={section}><h2 className="text-2xl font-semibold">{c.counterTitle}</h2><p>{c.counter}</p><p>{c.witness}</p><p className="overflow-x-auto rounded-lg border p-4 font-mono text-sm" data-near-miss-witness="7,1,4,3,5,8,6,9,2">r1–r9: c7, c1, c4, c3, c5, c8, c6, c9, c2</p></section>
    <section className={section}><h2 className="text-2xl font-semibold">{c.samuraiTitle}</h2><p>{c.samurai}</p><p><Link className={link} href={`/${lang}/games/samurai/overlap-boxes`}>{zh?'复查共享宫边界':'Review shared-box boundaries'}</Link> · <Link className={link} href={`/${lang}/games/samurai/candidate-notes`}>{zh?'刷新候选笔记':'Refresh candidate notes'}</Link></p></section>
    <section className={section}><h2 className="text-2xl font-semibold">{c.practiceTitle}</h2><p>{c.practice}</p><p><Link className={link} href={`/${lang}/games/samurai`}>{zh?'打开武士数独练习':'Open Samurai Sudoku practice'}</Link> · <Link className={link} href={`/${lang}/sudoku-x-wing`}>{zh?'比较X-Wing':'Compare X-Wing'}</Link></p></section>
    <section className={section}><h2 className="text-2xl font-semibold">{c.faqTitle}</h2><dl className="space-y-5">{c.faqs.map(f=><div key={f.q}><dt className="font-semibold">{f.q}</dt><dd className="mt-2 text-muted-foreground">{f.a}</dd></div>)}</dl></section>
    <section className={section}><h2 className="text-2xl font-semibold">{zh?'来源与原创范围':'Sources and original work'}</h2><p>{zh?'技巧与强链定义参照下列作者文档；本页坐标图、反例与说明独立编写，没有复制来源题图。':'The technique and strong-link definitions are documented by the authors below. The coordinate sketch, near miss and explanations here are original; no source puzzle images are reproduced.'}</p><ul className="list-disc pl-6"><li><a className={link} href="https://hodoku.sourceforge.net/en/tech_sdp.php#sk">HoDoKu: Skyscraper</a></li><li><a className={link} href="https://www.sudokuwiki.org/Weak_and_Strong_Links">SudokuWiki: Weak and Strong Links</a></li></ul></section>
  </article>;
}
