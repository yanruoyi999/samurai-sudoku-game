import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface Props { params: Promise<{ locale: string }> }
const PATH = '/sudoku-pronunciation';
const REVIEWED = '2026-11-08';
const IPA = 'suˈdəʊkuː';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const zh = locale === 'zh';
  const title = zh ? 'Sudoku 怎么读：英语重音、拼写与词典试听入口' : 'Sudoku Pronunciation: Say It, Spell It, Then Play';
  const description = zh
    ? '学习 Sudoku 的英语读音、第二音节重音与 s-u-d-o-k-u 拼写，区分近似提示和音标，并前往出版方词典试听。'
    : 'Learn a dictionary-supported English pronunciation of sudoku, the stressed second syllable, the correct spelling and where to listen before trying a puzzle.';
  const canonical = buildLocalizedUrl(locale, PATH);
  return { title, description, alternates: { canonical, languages: buildLanguageAlternates(PATH) }, openGraph: { title, description, url: canonical, type: 'article' }, twitter: { card: 'summary', title, description } };
}

export default async function SudokuPronunciationPage({ params }: Props) {
  const { locale } = await params;
  const zh = locale === 'zh';
  const title = zh ? 'Sudoku 怎么读？先读对，再开始解题' : 'Sudoku Pronunciation: Say It, Spell It, Then Play';
  const faq = zh ? [
    { q: 'Sudoku 的重音在哪里？', a: '本页采用词典所列的英语读法，重读第二个音节。soo-DOH-koo 中的大写 DOH 是重音提示，不是正式音标。' },
    { q: 'Sudoku 还是 Suduko？', a: '英语词典的词头是 sudoku，字母顺序为 s-u-d-o-k-u；第四个字母是 o。不要把读音提示当成另一种拼写。' },
    { q: '可以在本页直接播放词典音频吗？', a: '不可以。本页没有内嵌或复制词典录音。请使用下方 Oxford 或 Collins 的外部词条入口，查看该出版方提供的试听选项。' },
    { q: '这个提示就是日语发音吗？', a: '不是。本页解释英语中的读法，不是日语长音或音高教学；也不声称所有英语口音的声音完全相同。' },
  ] : [
    { q: 'Which syllable is stressed in sudoku?', a: 'In the dictionary pronunciation used here, stress the second syllable. The capital DOH in soo-DOH-koo marks emphasis; it is a memory aid, not formal phonetic notation.' },
    { q: 'Is the spelling Sudoku or Suduko?', a: 'The English dictionary headword is sudoku: s-u-d-o-k-u. The fourth letter is o. Do not turn a pronunciation hint into a different spelling.' },
    { q: 'Can I play a dictionary recording on this page?', a: 'No. This page does not embed or copy dictionary recordings. Open the Oxford or Collins entry below to use the listening options offered by that publisher.' },
    { q: 'Is this a Japanese pronunciation lesson?', a: 'No. This guide covers an English dictionary pronunciation, not Japanese vowel length or pitch. It does not claim that all English accents sound identical.' },
  ];
  const article = { '@context': 'https://schema.org', '@type': 'Article', headline: title, mainEntityOfPage: buildAbsoluteUrl(`/${locale}${PATH}`), inLanguage: zh ? 'zh-CN' : 'en-US', dateModified: REVIEWED };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) };
  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-10 leading-relaxed">
      {[article, faqSchema].map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <nav className="flex flex-wrap gap-2 text-sm" aria-label={zh ? '面包屑导航' : 'Breadcrumb'}>
        <Link href={`/${locale}`} className="text-primary underline">{zh ? '首页' : 'Home'}</Link><span aria-hidden="true">/</span>
        <Link href={`/${locale}/games/samurai/how-to-play`} className="text-primary underline">{zh ? '玩法入门' : 'How to play'}</Link>
      </nav>
      <article className="mt-6 space-y-8">
        <header className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-lg text-muted-foreground">{zh ? '英语学习提示：分成三段，重读第二个音节，再把字母顺序和读法分开记。' : 'A useful English practice cue: use three syllables, emphasize the second syllable, and keep the spelling separate from the sound.'}</p>
          <div className="rounded-xl border bg-primary/5 p-5">
            <p className="text-2xl font-semibold" lang="en">soo-DOH-koo</p>
            <p className="mt-2" lang="en">/{IPA}/</p>
            <p className="mt-2 text-sm text-muted-foreground">{zh ? '大写表示重音。上行是近似记忆提示；下行采用 Oxford 词条所列的第一种英语音标。' : 'Capitals mark stress. The first line is an approximate memory cue; the second is the first English transcription listed in the linked Oxford entry.'}</p>
          </div>
          <p className="text-sm text-muted-foreground">{zh ? '出版方资料核对：' : 'Publisher references checked: '}<time dateTime={REVIEWED}>2026-11-08</time></p>
        </header>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">{zh ? '先听清三段，再连起来' : 'Hear the parts, then join them'}</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>{zh ? '先轻读 soo，避免把第一段读得比中间一段更重。' : 'Start with a light soo rather than putting the main stress at the beginning.'}</li>
            <li>{zh ? '把 DOH 作为最明显的一段，再接上较轻的 koo。' : 'Make DOH the strongest part, then finish with a lighter koo.'}</li>
            <li>{zh ? '慢读一次，再用正常速度说出整个词；不要在字母 k 前多加一个音节。' : 'Say the whole word slowly once, then at a normal pace. Avoid inserting an extra syllable before the k.'}</li>
          </ol>
          <p>{zh ? '这些练习是本页的原创提示，不是日语发音教学，也不是录音测评。英语口音会有差异；需要声音示范时，请前往下方词典，而不是仅凭文字猜声音。' : 'These are original practice cues, not a Japanese pronunciation lesson or a speech-scoring test. Accents vary. Use a publisher recording for an audible example instead of treating a text hint as a recording.'}</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">{zh ? '拼写检查：中间的 o 在哪里？' : 'Spelling check: where does the o go?'}</h2>
          <p className="rounded border p-4 text-xl tracking-wide" lang="en">s-u-d-o-k-u</p>
          <p>{zh ? '把单词分成 su · do · ku 观察字母顺序，第四个字母是 o。读音提示 soo-DOH-koo 不能拿来做正式拼写；中文页面中的“数独”则是中文名称，不是英语音标。' : 'Look at su · do · ku to keep the letters in order: o is fourth. Write sudoku, not the sound cue soo-DOH-koo. A pronunciation aid and a dictionary spelling have different jobs.'}</p>
          <p>{zh ? '练习方法：先看着拼写读一次，遮住提示后再写一次，最后核对第四个字母。这是在检查拼写，不是在给口音打分。' : 'Try this: read the spelling aloud, cover the cue, write the word once, then check the fourth letter. This checks spelling; it does not score your accent.'}</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">{zh ? '把单词放进一句话' : 'Put the word in a sentence'}</h2>
          <p lang="en" className="rounded border-l-4 border-primary bg-primary/5 p-4">I solve a sudoku puzzle during my break.</p>
          <p>{zh ? '先正常读这句原创例句，再单独读 sudoku，最后放回句子中。目标是连贯表达，不是夸张地拉长每个音。' : 'Read this original example naturally, say sudoku on its own, then put it back into the sentence. Aim for a smooth phrase rather than exaggerating every vowel.'}</p>
          <p>{zh ? '准备开始玩时，可以接着读玩法规则；这里不重复解释整套数独技巧。' : 'When you are ready to play, use the rules guide next. This page deliberately does not duplicate the full strategy tutorial.'}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/games/samurai/how-to-play`} className="rounded border px-4 py-2 text-primary underline">{zh ? '阅读武士数独规则' : 'Read Samurai Sudoku rules'}</Link>
            <Link href={`/${locale}/games/samurai/difficulty/easy`} className="rounded border px-4 py-2 text-primary underline">{zh ? '从简单题开始练习' : 'Start with an Easy puzzle'}</Link>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">{zh ? '词典入口：在出版方页面听声音' : 'Dictionary references and listening'}</h2>
          <p>{zh ? '本页不托管、复制或自动播放外部音频。下面的链接会打开出版方词条；可用的声音按钮和口音标记以对方当时页面为准。' : 'No external audio is hosted, copied or played automatically here. These links open the publishers’ entries; available recordings and accent labels depend on their current pages.'}</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><a className="text-primary underline" href="https://www.oxfordlearnersdictionaries.com/definition/english/sudoku" rel="noreferrer">Oxford Learner’s Dictionaries: sudoku</a></li>
            <li><a className="text-primary underline" href="https://www.collinsdictionary.com/dictionary/english-pronunciations/sudoku" rel="noreferrer">Collins: sudoku pronunciation</a></li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">{zh ? '常见问题' : 'Common questions'}</h2>
          {faq.map((item) => <details key={item.q} className="rounded-lg border p-4"><summary className="cursor-pointer font-semibold">{item.q}</summary><p className="mt-3 text-muted-foreground">{item.a}</p></details>)}
        </section>
      </article>
    </main>
  );
}
