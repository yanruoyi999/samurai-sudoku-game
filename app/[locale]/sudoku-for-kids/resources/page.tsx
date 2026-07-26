import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = '/sudoku-for-kids/resources';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? '如何教儿童数独：家长与教师 10 分钟活动资源'
    : 'How to Teach Sudoku to Kids: Parent and Teacher Resources';
  const description = isZh
    ? '面向家长和教师的儿童数独资源：10 分钟课堂流程、提问话术、分层教学、4×4 到 6×6 进阶、打印练习与隐私边界。'
    : 'Practical parent and teacher resources for Kids Sudoku: a 10-minute lesson, parent prompts, classroom differentiation, progression from 4x4 to 6x6, worksheets, and privacy guidance.';

  return {
    title,
    description,
    keywords: isZh
      ? ['如何教儿童数独', '儿童数独课堂活动', '数独教学方法', '儿童逻辑练习', '家长数独引导']
      : ['how to teach sudoku to kids', 'sudoku classroom activity', 'parent sudoku prompts', 'kids sudoku lesson plan', 'sudoku differentiation'],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: { title, description, url: canonical, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function KidsSudokuResourcesPage({ params }: PageProps) {
  const { locale } = await params;
  const normalizedLocale = locale === 'zh' ? 'zh' : 'en';
  const isZh = normalizedLocale === 'zh';
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);

  const faqItems = isZh
    ? [
        ['第一次教儿童数独应该讲多久？', '规则说明控制在两分钟内，然后立刻用一行或一个 2×2 宫演示“缺少哪个数字”。孩子在操作中更容易理解。'],
        ['孩子卡住时家长应该怎么提示？', '不要指向正确格子。可以问：这一行已经有哪些数字？还缺哪个？这个数字为什么不能放在这里？'],
        ['同一个班级能力差异很大怎么办？', '让初学者做简单 4×4，中等学生做较少线索的 4×4，已经熟练的学生做 6×6；所有学生最后都解释一个推理步骤。'],
        ['数独活动需要记录学生个人数据吗？', '不需要。本站工具不要求姓名、邮箱或账户；教师可以直接打印通用练习纸，不必上传班级名单或成绩。'],
      ]
    : [
        ['How long should the first Kids Sudoku lesson be?', 'Keep rule explanation under two minutes, then demonstrate one missing number in a row or 2×2 box. Children often understand faster while doing the puzzle.'],
        ['What parent prompts help when a child is stuck?', 'Do not point to the answer. Ask: Which numbers are already in this row? What is missing? Why can’t this number go here?'],
        ['How can a teacher differentiate one Sudoku activity?', 'Give beginners Easy 4×4, developing learners lower-clue 4×4, and confident learners 6×6. Everyone can finish by explaining one reasoning step.'],
        ['Does a Sudoku classroom activity need student personal data?', 'No. These tools need no name, email, or account. Teachers can print general worksheets without uploading class lists or scores.'],
      ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isZh ? '首页' : 'Home', item: buildAbsoluteUrl(`/${normalizedLocale}`) },
      { '@type': 'ListItem', position: 2, name: isZh ? '儿童数独' : 'Sudoku for Kids', item: buildAbsoluteUrl(`/${normalizedLocale}/sudoku-for-kids`) },
      { '@type': 'ListItem', position: 3, name: isZh ? '家长与教师资源' : 'Parent and teacher resources', item: pageUrl },
    ],
  };

  const learningResourceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: isZh ? '儿童数独家长与教师资源' : 'Kids Sudoku Parent and Teacher Resources',
    url: pageUrl,
    learningResourceType: ['Lesson plan', 'Parent guide', 'Teacher resource'],
    educationalUse: ['Classroom instruction', 'Home learning', 'Differentiation'],
    isAccessibleForFree: true,
  };

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: isZh ? '10 分钟儿童数独活动' : 'A 10-minute Kids Sudoku lesson',
    step: (isZh
      ? [
          ['讲三条规则', '用两分钟说明行、列和宫都不能重复。'],
          ['一起找一个缺数', '用两分钟示范一行、列或宫缺少哪个数字。'],
          ['独立或结对解题', '用四分钟完成一到两道适合当前水平的题。'],
          ['解释一个推理步骤', '用两分钟请孩子说明某个数字为什么只能放在一个位置。'],
        ]
      : [
          ['Teach three rules', 'Use two minutes to explain no repeats in rows, columns, and boxes.'],
          ['Find one missing number together', 'Use two minutes to model a nearly complete row, column, or box.'],
          ['Solve independently or in pairs', 'Use four minutes for one or two level-appropriate puzzles.'],
          ['Explain one reasoning step', 'Use two minutes for a learner to explain why one digit has only one position.'],
        ]).map(([name, text], index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name,
      text,
    })),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return (
    <main className="min-h-screen bg-background">
      {[breadcrumbJsonLd, learningResourceJsonLd, howToJsonLd, faqJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`kids-resources-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href={`/${normalizedLocale}`} className="hover:text-foreground">{isZh ? '首页' : 'Home'}</Link>
          <span aria-hidden>/</span>
          <Link href={`/${normalizedLocale}/sudoku-for-kids`} className="hover:text-foreground">{isZh ? '儿童数独' : 'Sudoku for Kids'}</Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">{isZh ? '家长与教师资源' : 'Resources'}</span>
        </nav>

        <header className="rounded-3xl border bg-primary/5 p-6 md:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {isZh ? '可直接使用的活动方案' : 'Practical activities, not generic benefits'}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-6xl">
            {isZh ? '如何教儿童数独：家长与教师资源' : 'How to Teach Sudoku to Kids'}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {isZh
              ? '用短规则、问题式提示和分层题目，让孩子练习观察与排除。这里提供 10 分钟活动、家长提问、课堂分层、4×4 到 6×6 的进阶路线，以及不收集儿童个人数据的隐私边界。'
              : 'Use short rules, parent prompts, classroom differentiation, and level-appropriate puzzles to teach observation and elimination. This resource includes a 10-minute lesson, progression from 4×4 to 6×6, and a clear privacy boundary.'}
          </p>
        </header>

        <section className="mt-12 rounded-2xl border p-6 md:p-8">
          <h2 className="text-3xl font-semibold">{isZh ? '10 分钟儿童数独活动' : 'A 10-minute Kids Sudoku lesson'}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(isZh
              ? [
                  ['0–2 分钟', '讲三条规则：行、列和宫都不能重复。'],
                  ['2–4 分钟', '一起找一个已经出现三个数字的区域。'],
                  ['4–8 分钟', '独立或结对完成一到两道题。'],
                  ['8–10 分钟', '请孩子解释一个数字为什么只能放在那里。'],
                ]
              : [
                  ['Minutes 0–2', 'Teach three rules: no repeats in rows, columns, or boxes.'],
                  ['Minutes 2–4', 'Find one area that already shows three different digits.'],
                  ['Minutes 4–8', 'Solve one or two puzzles independently or in pairs.'],
                  ['Minutes 8–10', 'Ask a learner to explain why one digit has only one position.'],
                ]).map(([time, activity]) => (
              <section key={time} className="rounded-xl bg-secondary/30 p-5">
                <h3 className="font-semibold text-primary">{time}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{activity}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h2 className="text-2xl font-semibold">{isZh ? '家长提问方式' : 'Parent prompts that preserve the thinking'}</h2>
            <ul className="mt-4 space-y-3 leading-7 text-muted-foreground">
              <li>• {isZh ? '这一行已经有哪些数字？' : 'Which numbers are already in this row?'}</li>
              <li>• {isZh ? '还缺哪个数字？' : 'Which number is missing?'}</li>
              <li>• {isZh ? '为什么这个数字不能放在这里？' : 'Why can’t this number go here?'}</li>
              <li>• {isZh ? '哪一个行、列或宫的信息最完整？' : 'Which row, column, or box has the most information?'}</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-secondary/30 p-6">
            <h2 className="text-2xl font-semibold">{isZh ? '课堂分层教学' : 'Classroom differentiation'}</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
              <p><strong className="text-foreground">{isZh ? '需要支持：' : 'Needs support: '}</strong>{isZh ? '简单 4×4、结对完成、允许口头说出缺数。' : 'Easy 4×4, paired work, and verbal missing-number reasoning.'}</p>
              <p><strong className="text-foreground">{isZh ? '正在发展：' : 'Developing: '}</strong>{isZh ? '中等 4×4、独立完成、标出一个排除理由。' : 'Medium 4×4, independent work, and one written elimination.'}</p>
              <p><strong className="text-foreground">{isZh ? '已经熟练：' : 'Confident: '}</strong>{isZh ? '挑战 4×4 或 6×6，并向同伴解释完整步骤。' : 'Challenge 4×4 or 6×6 with a complete peer explanation.'}</p>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-2xl border p-6 md:p-8">
          <h2 className="text-3xl font-semibold">{isZh ? '从 4×4 到 9×9 的进阶路线' : 'Progression from 4×4 toward 9×9'}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {(isZh
              ? [
                  ['阶段 1：4×4', '理解不重复、找缺数、完成简单到挑战三个层级。'],
                  ['阶段 2：6×6', '扩展到数字 1–6，学习 2×3 宫和更多候选位置。'],
                  ['阶段 3：简单 9×9', '从线索较多的标准数独开始，再考虑武士数独等高级题型。'],
                ]
              : [
                  ['Stage 1: 4×4', 'Learn no-repeat rules, missing numbers, and all three levels.'],
                  ['Stage 2: 6×6', 'Expand to digits 1–6, 2×3 boxes, and more candidate positions.'],
                  ['Stage 3: easy 9×9', 'Start with many givens before advanced formats such as Samurai Sudoku.'],
                ]).map(([title, body]) => (
              <section key={title} className="rounded-xl border p-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border bg-primary/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">{isZh ? '隐私边界' : 'Privacy boundary for child-facing activities'}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            {isZh
              ? '在线练习只在当前浏览器保存题目进度和已完成题号，并在 30 天后过期。打印和生成器不要求姓名、邮箱、学校、班级或成绩。教师无需上传学生名单。'
              : 'Online practice stores only puzzle progress and completed puzzle IDs in the current browser, expiring after 30 days. Worksheets and the generator request no name, email, school, class, or score, and teachers do not upload student lists.'}
          </p>
          <Link href={`/${normalizedLocale}/privacy`} className="mt-4 inline-flex font-semibold text-primary hover:underline">
            {isZh ? '查看网站隐私说明' : 'Read the site privacy policy'} →
          </Link>
        </section>

        <section className="mt-12 grid gap-3 rounded-2xl border bg-secondary/30 p-6 sm:grid-cols-2 lg:grid-cols-5">
          <Link href={`/${normalizedLocale}/sudoku-for-kids/printable`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '打印练习' : 'Printable worksheets'}
          </Link>
          <Link href={`/${normalizedLocale}/sudoku-for-kids/answers`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '答案页' : 'Answer keys'}
          </Link>
          <Link href={`/${normalizedLocale}/sudoku-for-kids/6x6`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '在线 6×6' : 'Play 6×6'}
          </Link>
          <Link href={`/${normalizedLocale}/sudoku-for-kids/worksheet-generator`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '练习纸生成器' : 'Worksheet generator'}
          </Link>
          <Link href={`/${normalizedLocale}/sudoku-for-kids`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
            {isZh ? '儿童数独首页' : 'Kids Sudoku hub'}
          </Link>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold">{isZh ? '家长与教师常见问题' : 'Parent and teacher FAQ'}</h2>
          <div className="mt-5 space-y-4">
            {faqItems.map(([question, answer]) => (
              <details key={question} className="rounded-xl border bg-card p-5">
                <summary className="cursor-pointer font-semibold">{question}</summary>
                <p className="mt-3 leading-7 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
