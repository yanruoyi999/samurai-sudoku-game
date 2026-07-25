import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { KidsSudoku4x4 } from "@/components/kids/KidsSudoku4x4";
import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PATH = "/sudoku-for-kids";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const canonical = buildLocalizedUrl(locale, PATH);
  const title = isZh
    ? "儿童数独：免费简单 4×4 在线题目与打印练习"
    : "Sudoku for Kids: Free Easy 4x4 Puzzle Online";
  const description = isZh
    ? "免费儿童数独入门页：在线完成简单 4×4 题目，学习行、列和 2×2 宫规则，支持检查答案、换题、重置和浏览器打印，无需注册。"
    : "Play free easy 4x4 Sudoku for kids online, check answers, switch puzzles, and print a worksheet. A no-registration guide for parents, teachers, and beginners.";

  return {
    title,
    description,
    keywords: isZh
      ? ["儿童数独", "4×4 儿童数独", "儿童数独打印", "简单儿童数独", "儿童逻辑游戏"]
      : [
          "sudoku for kids",
          "easy sudoku for kids",
          "4x4 sudoku for kids",
          "sudoku for kids printable",
          "free sudoku for kids",
        ],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(PATH),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SudokuForKidsPage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const normalizedLocale = isZh ? "zh" : "en";
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${PATH}`);

  const howToSteps = isZh
    ? [
        ["先找空格", "点击一个没有预填数字的空格。粗体数字是题目给出的线索，不能修改。"],
        ["检查行和列", "准备填写 1、2、3 或 4 时，先确认同行和同列里没有重复数字。"],
        ["检查 2×2 宫", "每个粗边框围成的 2×2 小宫也必须包含 1–4，不能重复。"],
        ["填完再检查", "完成 16 个格子后点击检查答案；出错时只修改可编辑格，不需要整题重来。"],
      ]
    : [
        ["Choose an empty cell", "Select a cell without a bold given number. Clues are fixed and cannot be changed."],
        ["Check the row and column", "Before entering 1, 2, 3, or 4, make sure the digit is not already in that row or column."],
        ["Check the 2×2 box", "Each thick-bordered 2×2 box must also contain 1–4 exactly once."],
        ["Finish, then check", "Complete all 16 cells and use Check puzzle. Incorrect editable cells are highlighted so the child can try again."],
      ];

  const faqItems = isZh
    ? [
        ["儿童几岁可以开始玩数独？", "很多孩子在 5–7 岁可以从 4×4 开始，但年龄不是硬性标准。只要孩子能识别 1–4、理解不重复规则，并愿意专注几分钟，就可以尝试。"],
        ["为什么先玩 4×4，而不是标准 9×9？", "4×4 只有 16 个格子和四个 2×2 宫，孩子更容易看完整个问题，也能在较短时间内获得一次完成体验。"],
        ["这张儿童数独可以打印吗？", "可以。点击题目上方的打印练习页，浏览器会隐藏数字按钮和操作控件，保留当前 4×4 题面。"],
        ["做错时应该直接告诉孩子答案吗？", "建议先让孩子检查重复数字，再问哪个数字还没有出现。使用问题提示比直接公布答案更能训练排除思维。"],
        ["什么时候可以升级到 9×9？", "当孩子能独立完成较少线索的 4×4，并愿意进行更长时间的推理时，可以先尝试 6×6，或直接从线索较多的简单 9×9 开始。"],
      ]
    : [
        ["What age can a child start Sudoku?", "Many children can try 4×4 Sudoku around ages 5–7, but readiness matters more than age. A child should recognize 1–4, understand the no-repeat rule, and enjoy a few minutes of focused problem solving."],
        ["Why start with 4×4 instead of regular 9×9 Sudoku?", "A 4×4 board has only 16 cells and four 2×2 boxes. Children can see the whole problem, practice the same core logic, and reach a successful finish sooner."],
        ["Can I print this Sudoku for kids?", "Yes. Use Print worksheet above the puzzle. The print layout hides the number pad and game controls while keeping the current 4×4 board."],
        ["Should I tell a child the answer after a mistake?", "Start with a question instead: Is a number repeated in this row, column, or box? Asking what is missing teaches elimination better than revealing the answer."],
        ["When should a child move to 9×9 Sudoku?", "Move on when the child can solve lower-clue 4×4 puzzles independently and enjoys longer challenges. A 6×6 bridge or an easy 9×9 with many clues are both reasonable next steps."],
      ];

  const breadcrumbJsonLd = {
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
        name: isZh ? "儿童数独" : "Sudoku for Kids",
        item: pageUrl,
      },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: isZh ? "儿童数独：免费 4×4 在线题目" : "Sudoku for Kids: Free Easy 4×4 Puzzle",
    url: pageUrl,
    inLanguage: isZh ? "zh-CN" : "en-US",
    isAccessibleForFree: true,
    audience: {
      "@type": "Audience",
      audienceType: isZh ? "家长、教师与儿童数独初学者" : "Parents, teachers, and beginner Sudoku learners",
    },
  };

  const learningResourceJsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: isZh ? "4×4 儿童数独互动练习" : "Interactive 4×4 Sudoku for Kids",
    url: pageUrl,
    learningResourceType: ["Interactive game", "Worksheet", "Logic puzzle"],
    educationalLevel: isZh ? "儿童入门" : "Beginner children",
    teaches: isZh
      ? ["行列排除", "2×2 宫规则", "数字不重复", "逻辑推理"]
      : ["row and column elimination", "2x2 box rules", "non-repetition", "logical reasoning"],
    isAccessibleForFree: true,
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: isZh ? "儿童如何完成 4×4 数独" : "How to solve a 4×4 Sudoku for kids",
    step: howToSteps.map(([name, text], index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name,
      text,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-background">
      {[breadcrumbJsonLd, webPageJsonLd, learningResourceJsonLd, howToJsonLd, faqJsonLd].map(
        (schema, index) => (
          <Script
            key={index}
            id={`sudoku-for-kids-jsonld-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ),
      )}

      <article className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href={`/${normalizedLocale}`} className="hover:text-foreground">
            {isZh ? "首页" : "Home"}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">{isZh ? "儿童数独" : "Sudoku for Kids"}</span>
        </nav>

        <header className="grid gap-8 rounded-3xl border bg-primary/5 p-6 md:p-9 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {isZh ? "家长与教师友好的逻辑练习" : "A parent- and teacher-friendly logic activity"}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-6xl">
              {isZh ? "儿童数独：免费简单 4×4 题目" : "Sudoku for Kids: Free Easy 4×4 Puzzle"}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {isZh
                ? "从只有 16 个格子的 4×4 数独开始，让孩子练习观察、排除和耐心。页面无需注册，不要求填写姓名或邮箱，可以在线玩、检查答案、换题，也可以直接打印当前练习页。"
                : "Start with a 16-cell 4×4 board so children can practice observation, elimination, and patience without the pressure of a full 9×9 puzzle. No registration, name, or email is required: play online, check the work, switch puzzles, or print the current worksheet."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a href="#play-kids-sudoku" className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
                {isZh ? "开始 4×4 题目" : "Play the 4×4 puzzle"}
              </a>
              <a href="#how-to-play-kids-sudoku" className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10">
                {isZh ? "先看简单规则" : "Learn the simple rules"}
              </a>
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-5">
            <h2 className="text-xl font-semibold">{isZh ? "4×4 规则只有三条" : "Only three rules for 4×4 Sudoku"}</h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li><strong className="text-foreground">1.</strong> {isZh ? "每一行都使用 1、2、3、4，各一次。" : "Each row uses 1, 2, 3, and 4 once."}</li>
              <li><strong className="text-foreground">2.</strong> {isZh ? "每一列都使用 1、2、3、4，各一次。" : "Each column uses 1, 2, 3, and 4 once."}</li>
              <li><strong className="text-foreground">3.</strong> {isZh ? "每个粗边框 2×2 宫也不能重复。" : "Each thick-bordered 2×2 box has no repeats."}</li>
            </ol>
          </div>
        </header>

        <section id="play-kids-sudoku" className="mt-10 scroll-mt-28">
          <KidsSudoku4x4 locale={normalizedLocale} />
        </section>

        <section id="how-to-play-kids-sudoku" className="mt-14 scroll-mt-28">
          <h2 className="text-3xl font-semibold tracking-tight">
            {isZh ? "儿童如何一步步完成 4×4 数独" : "How kids can solve a 4×4 Sudoku step by step"}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {howToSteps.map(([title, body], index) => (
              <section key={title} className="rounded-xl border bg-card p-5">
                <p className="text-sm font-semibold text-primary">{isZh ? `第 ${index + 1} 步` : `Step ${index + 1}`}</p>
                <h3 className="mt-1 text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h2 className="text-2xl font-semibold">{isZh ? "为什么 4×4 更适合第一次玩" : "Why 4×4 works well for a first Sudoku"}</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              {isZh
                ? "标准数独的规则并不复杂，但 81 个格子会让初学者感到信息太多。4×4 保留了数独真正的核心：观察已有数字、排除不可能位置、找到唯一答案。孩子可以在较短时间内完成一题，知道自己是在推理，而不是猜。"
                : "The rules of standard Sudoku are simple, but 81 cells can feel like too much information for a beginner. A 4×4 board keeps the real core of Sudoku: notice the givens, eliminate impossible positions, and find the one answer that fits. A child can finish sooner and understand that the solution came from reasoning rather than guessing."}
            </p>
            <p className="mt-4 leading-7 text-muted-foreground">
              {isZh
                ? "一开始不要追求速度。每次只问一个问题：这一行、这一列或这个 2×2 宫缺少哪个数字？孩子能说出理由，比快速填完更重要。"
                : "Do not make speed the goal at first. Ask one small question at a time: Which number is missing from this row, column, or 2×2 box? Explaining a reason matters more than finishing quickly."}
            </p>
          </div>

          <div className="rounded-2xl border bg-secondary/30 p-6">
            <h2 className="text-2xl font-semibold">{isZh ? "按准备程度逐步升级" : "Progress by readiness, not pressure"}</h2>
            <div className="mt-4 space-y-4">
              {(
                isZh
                  ? [
                      ["约 5–7 岁", "从线索较多的 4×4 开始，每次练习 5–10 分钟。"],
                      ["约 7–9 岁", "尝试线索更少的 4×4，并让孩子说出排除理由。"],
                      ["约 9 岁以上", "准备好后尝试 6×6 或线索较多的简单 9×9。"],
                    ]
                  : [
                      ["Around ages 5–7", "Start with higher-clue 4×4 boards and keep sessions near 5–10 minutes."],
                      ["Around ages 7–9", "Try lower-clue 4×4 puzzles and ask the child to explain each elimination."],
                      ["Around age 9+", "When ready, try a 6×6 bridge or an easy 9×9 puzzle with many givens."],
                    ]
              ).map(([age, guidance]) => (
                <section key={age} className="border-t pt-4 first:border-t-0 first:pt-0">
                  <h3 className="font-semibold">{age}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{guidance}</p>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14 rounded-2xl border p-6 md:p-8">
          <h2 className="text-3xl font-semibold">{isZh ? "给家长和教师的练习建议" : "Practice tips for parents and teachers"}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {(
              isZh
                ? [
                    ["先让孩子观察", "开始前先找已经出现三种数字的行、列或宫，这里最容易找到唯一缺少的数字。"],
                    ["用问题代替答案", "可以问“这个数字为什么不能放这里？”或“这一行还缺哪个数字？”，不要马上指出正确格子。"],
                    ["在成功时停止", "一次完成一到三题已经足够。保留下一次还想玩的感觉，比连续做很多题更容易形成习惯。"],
                  ]
                : [
                    ["Let the child scan first", "Begin with a row, column, or box that already shows three different digits. It usually has the clearest missing number."],
                    ["Ask questions instead of giving answers", "Try: Why can’t this number go here? or Which number is missing from this row? Avoid pointing to the correct cell immediately."],
                    ["Stop while the experience is positive", "One to three puzzles can be enough. Ending with confidence and curiosity is better than turning a logic activity into a long assignment."],
                  ]
            ).map(([title, body]) => (
              <section key={title}>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl border bg-primary/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">{isZh ? "准备好更大的挑战了吗？" : "Ready for a bigger challenge later?"}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            {isZh
              ? "武士数独由五个重叠的 9×9 网格组成，不适合作为儿童第一次接触数独的题型。等孩子已经熟悉普通数独后，可以把它当作家庭共同挑战。下面这些资源用于进阶，而不是替代本页的 4×4 入门。"
              : "Samurai Sudoku combines five overlapping 9×9 grids, so it is not the recommended first Sudoku for a young beginner. After a learner is comfortable with regular Sudoku, it can become a family or advanced challenge. These links are later steps, not replacements for the 4×4 introduction above."}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${normalizedLocale}/games/samurai/daily`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
              {isZh ? "每日武士数独" : "Daily Samurai Sudoku"}
            </Link>
            <Link href={`/${normalizedLocale}/games/samurai/how-to-play`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
              {isZh ? "了解武士数独规则" : "Learn Samurai Sudoku rules"}
            </Link>
            <Link href={`/${normalizedLocale}/printable-samurai-sudoku`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
              {isZh ? "进阶打印题包" : "Advanced printable puzzles"}
            </Link>
            <Link href={`/${normalizedLocale}/about/puzzle-methodology`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
              {isZh ? "题目如何验证" : "How puzzles are validated"}
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold">{isZh ? "儿童数独常见问题" : "Sudoku for Kids FAQ"}</h2>
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
