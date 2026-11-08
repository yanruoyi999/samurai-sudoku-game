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
          <h2 className="text-2xl font-semibold">{zh ? '读音与拼写自查表' : 'Pronunciation and spelling self-check'}</h2>
          <p>{zh ? '给同伴介绍一道题，或在课堂上读出游戏名称时，可以一次只检查一件事。下面是本页设计的自查活动，不是考试，也不根据某种口音给学习者打分。先选定一个出版方示范，再把它用于你要说的完整句子，避免来回混用不同提示。' : 'When introducing a puzzle to a friend or a class, check one thing at a time. This original activity is not an accent test. Choose one publisher example and use it in the sentence you intend to say rather than switching between different memory cues.'}</p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <caption className="p-3 text-left font-medium">{zh ? '把拼写、重音、句子和试听分开检查' : 'Check spelling, stress, context and listening separately'}</caption>
              <thead><tr><th scope="col" className="p-3">{zh ? '检查什么' : 'Check'}</th><th scope="col" className="p-3">{zh ? '可以这样做' : 'Try this'}</th></tr></thead>
              <tbody>
                <tr className="border-t"><th scope="row" className="p-3">{zh ? '字母顺序' : 'Letter order'}</th><td className="p-3">{zh ? '遮住提示写出 sudoku，再按 s-u-d-o-k-u 逐字对照。如果写成 suduko，先纠正第四个字母的位置；不需要因此改变整个句子的读法。' : 'Cover the cue, write sudoku, then compare s-u-d-o-k-u letter by letter. Correct a swapped o and u as a spelling issue, not as an instruction to change every sound.'}</td></tr>
                <tr className="border-t"><th scope="row" className="p-3">{zh ? '中间重音' : 'Middle stress'}</th><td className="p-3">{zh ? '用轻、重、轻的节奏慢读记忆提示，再恢复自然速度。DOH 的大写只提醒突出中间一段，不表示要喊出来，也不能代替词典中的音标和声音示范。' : 'Try the light–strong–light cue slowly, then return to a natural pace. Capital DOH indicates emphasis, not shouting or an exact substitute for a dictionary recording.'}</td></tr>
                <tr className="border-t"><th scope="row" className="p-3">{zh ? '放回语境' : 'Use a sentence'}</th><td className="p-3">{zh ? '先读本页的完整原创例句，再换成你真正要表达的句子。暂停在单词前帮助记忆即可；练熟后不必把三个音节彼此割开，也不需要把每个字母分别念出。' : 'Read the example sentence, then use your own sentence about a puzzle. A pause can help you remember the word; you need not separate every syllable or name every letter in conversation.'}</td></tr>
                <tr className="border-t"><th scope="row" className="p-3">{zh ? '需要声音时' : 'Need an audible model?'}</th><td className="p-3">{zh ? '打开下方出版方词条，查看其口音标记和可用试听按钮。若当前设备无法播放，不把文字提示当成已听过的录音；本页也不会要求录音、上传语音或开启麦克风。' : 'Open a publisher entry and check its accent label and available play button. When playback is unavailable, do not treat written guidance as audio you have heard. This page asks for no recording, voice upload or microphone permission.'}</td></tr>
              </tbody>
            </table>
          </div>
        </section>
        <section className="space-y-3" data-practice="word-check">
          <h2 className="text-2xl font-semibold">{zh ? '一分钟同伴练习' : 'A one-minute partner check'}</h2>
          <p>{zh ? '两人轮流用英语邀请对方解题。先不展开答案，也不需要计时器或录音设备：这是一项帮助记忆的原创练习，不是发音准确度测评。一个人读提示，另一个人只核对下面三件事，再交换角色。独自练习时，也可以先写下判断，然后自己展开核对结果。' : 'Take turns inviting a partner to solve a puzzle. Keep the answer closed at first. You need no timer or recording device: this original memory activity does not measure pronunciation accuracy. One person reads the cue and the other checks the three points below, then swap roles. On your own, write your choices before revealing the check.'}</p>
          <p lang="en" className="rounded border p-4">Bring a sudoku puzzle tomorrow.</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>{zh ? '先从 sudoku 和 suduko 两种写法中选一个填入邀请句。不要根据近似读音重新拼词，而是对照上方的六个字母；暂时记不住时，可以用手遮住其中一个写法再判断。' : 'Choose sudoku or suduko for the invitation. Use the six-letter spelling above rather than inventing a spelling from the sound cue.'}</li>
            <li>{zh ? '只看 soo-DOH-koo 这条记忆提示，指出哪一段要更突出。这里问的是本页提示中的重音位置，不是在比较两个人的口音，也不要求把声音提高到不自然的程度。' : 'Point to the emphasized part of soo-DOH-koo. This asks about the stress shown in our cue, not which person has the better accent.'}</li>
            <li>{zh ? '最后回答：这张网页是否已经让你听到了出版方录音？如果没有点开词典并实际播放，就应回答没有。文字和音标可以帮助准备，但不能冒充一次已经完成的试听。' : 'Decide whether this page has already played a publisher recording. Reading a cue or transcription does not count as listening to audio.'}</li>
          </ol>
          <details className="rounded-lg border p-4"><summary className="cursor-pointer font-semibold">{zh ? '查看练习核对结果' : 'Reveal the practice check'}</summary><p className="mt-3">{zh ? '拼写选 sudoku；重音提示是中间的 DOH；本页没有播放录音。三项分别检查字母顺序、提示理解和证据来源，不合成为发音分数。确认后自然地读完整句子，想听声音时再进入下方出版方词条。' : 'Choose sudoku; emphasize the middle DOH in the cue; this page has not played a recording. These check spelling, the written cue and the source of evidence separately—not a pronunciation score. Read the whole invitation naturally, then open a publisher entry when you need an audible model.'}</p></details>
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
