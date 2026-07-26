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
    ? "免费儿童数独入门页：在线完成 24 道简单到挑战级 4×4 题目，保存本地进度，并进入打印练习、答案、6×6 和教师练习纸生成器。"
    : "Play 24 free easy-to-challenge 4x4 Sudoku for kids puzzles, save local progress, and open printable worksheets, answers, 6x6 practice, and a teacher generator.";

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
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
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
        ["儿童几岁可以开始玩数独？", "很多孩子在 5–7 岁可以从 4×4 开始，但年龄不是硬性标准。只要能识别 1–4、理解不重复规则，并愿意专注几分钟，就可以尝试。"],
        ["5 岁孩子适合玩数独吗？", "可以先用线索较多的 4×4，每次 5 分钟左右。重点是找缺少的数字并说出理由，不要求速度。"],
        ["幼儿园孩子可以玩数独吗？", "可以。教师或家长可以先一起完成一行，使用“这一行还缺哪个数字”之类的问题引导。"],
        ["为什么先玩 4×4，而不是标准 9×9？", "4×4 只有 16 个格子和四个 2×2 宫，孩子更容易看完整个问题，也能在较短时间内获得完成体验。"],
        ["在哪里可以找到儿童数独练习纸？", "打印练习页提供 6 道现成题；教师练习纸生成器可以选择 4×4 或 6×6、难度、数量和是否附答案。"],
        ["教师如何在课堂使用儿童数独？", "可以安排 10 分钟活动：2 分钟讲规则、5 分钟独立或结对解题、3 分钟让学生解释一个排除步骤。"],
        ["这张儿童数独可以打印吗？", "可以。当前题可直接浏览器打印，也可以进入打印练习页一次打印 6 道分级题。"],
        ["做错时应该直接告诉孩子答案吗？", "建议先让孩子检查重复数字，再问哪个数字还没有出现。使用问题提示比直接公布答案更能训练排除思维。"],
        ["什么时候可以升级到 9×9？", "当孩子能独立完成较少线索的 4×4，并愿意进行更长时间的推理时，可以先尝试 6×6，或从线索较多的简单 9×9 开始。"],
      ]
    : [
        ["What age can a child start Sudoku?", "Many children can try 4×4 Sudoku around ages 5–7, but readiness matters more than age. A learner should recognize 1–4, understand the no-repeat rule, and enjoy a few minutes of focused problem solving."],
        ["Is Sudoku for 5 year olds a good activity?", "Yes. Start with a higher-clue 4×4 puzzle and a session near five minutes. Asking the child to explain one missing number matters more than speed."],
        ["Can kindergarten children play Sudoku?", "Yes. A parent or teacher can complete the first row together and use prompts such as: Which number is missing from this row?"],
        ["Why start with 4×4 instead of regular 9×9 Sudoku?", "A 4×4 board has only 16 cells and four 2×2 boxes. Children can see the whole problem, practice the same core logic, and reach a successful finish sooner."],
        ["Where can I find Sudoku worksheets for kids?", "The printable page has six ready-made worksheets. The teacher generator can choose 4×4 or 6×6, a level, a puzzle count, and optional answers."],
        ["How can teachers use Sudoku in a classroom?", "Use a ten-minute routine: two minutes for rules, five minutes for independent or paired solving, and three minutes for learners to explain one elimination."],
        ["Can I print this Sudoku for kids?", "Yes. Print the current board or open the printable worksheet page for six graded puzzles with separate answers."],
        ["Should I tell a child the answer after a mistake?", "Start with a question instead: Is a number repeated in this row, column, or box? Asking what is missing teaches elimination better than revealing the answer."],
        ["When should a child move to 9×9 Sudoku?", "Move on when the child can solve lower-clue 4×4 puzzles independently and enjoys longer challenges. A 6×6 bridge or an easy 9×9 with many clues are both reasonable next steps."],
      ];

  const productLinks = [
    {
      href: `/${normalizedLocale}/sudoku-for-kids/printable`,
      title: isZh ? "打印练习纸" : "Printable worksheets",
      body: isZh ? "6 道分级 4×4 练习，答案单独放置。" : "Six graded 4×4 worksheets with separate answers.",
    },
    {
      href: `/${normalizedLocale}/sudoku-for-kids/answers`,
      title: isZh ? "答案页" : "Answer keys",
      body: isZh ? "按题号核对打印练习，完成后再打开。" : "Numbered solutions that match the printable set.",
    },
    {
      href: `/${normalizedLocale}/sudoku-for-kids/6x6`,
      title: isZh ? "6×6 进阶" : "6×6 progression",
      body: isZh ? "用 2×3 宫从 4×4 过渡到标准数独。" : "Move from 4×4 toward regular Sudoku with 2×3 boxes.",
    },
    {
      href: `/${normalizedLocale}/sudoku-for-kids/worksheet-generator`,
      title: isZh ? "教师练习纸生成器" : "Teacher worksheet generator",
      body: isZh ? "选择尺寸、难度、题数和是否附答案。" : "Choose size, level, puzzle count, and answer keys.",
    },
    {
      href: `/${normalizedLocale}/sudoku-for-kids/resources`,
      title: isZh ? "家长与教师资源" : "Parent and teacher resources",
      body: isZh ? "10 分钟课堂流程、提问方法和分层建议。" : "Ten-minute lessons, prompts, and differentiation ideas.",
    },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isZh ? "首页" : "Home", item: buildAbsoluteUrl(`/${normalizedLocale}`) },
      { "@type": "ListItem", position: 2, name: isZh ? "儿童数独" : "Sudoku for Kids", item: pageUrl },
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
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <main className="min-h-screen bg-background">
      {[breadcrumbJsonLd, webPageJsonLd, learningResourceJsonLd, howToJsonLd, faqJsonLd].map((schema, index) => (
        <Script
          key={index}
          id={`sudoku-for-kids-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href={`/${normalizedLocale}`} className="hover:text-foreground">{isZh ? "首页" : "Home"}</Link>
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
                ? "从 24 道唯一解 4×4 数独开始，让孩子练习观察、排除和耐心。页面无需注册，可以选择三个难度、保存 30 天本地进度、检查答案、打印或继续到 6×6。"
                : "Start with 24 unique-solution 4×4 puzzles so children can practice observation, elimination, and patience. Choose three levels, keep 30-day local progress, check answers, print, or move to 6×6—without registration."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a href="#play-kids-sudoku" className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
                {isZh ? "开始 4×4 题目" : "Play the 4×4 puzzle"}
              </a>
              <Link href={`/${normalizedLocale}/sudoku-for-kids/printable`} className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10">
                {isZh ? "打印练习纸" : "Print worksheets"}
              </Link>
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

        <section className="mt-10">
          <h2 className="text-3xl font-semibold">{isZh ? "选择一种练习方式" : "Choose a Kids Sudoku resource"}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {productLinks.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl border bg-card p-5 hover:border-primary hover:bg-primary/5">
                <h3 className="font-semibold text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </Link>
            ))}
          </div>
        </section>

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
                ? "标准数独有 81 个格子，初学者容易信息过载。4×4 保留数独真正的核心：观察已有数字、排除不可能位置、找到唯一答案。"
                : "A standard Sudoku has 81 cells, which can overload a beginner. A 4×4 board keeps the real core: notice givens, eliminate impossible positions, and find the one answer that fits."}
            </p>
          </div>
          <div className="rounded-2xl border bg-secondary/30 p-6">
            <h2 className="text-2xl font-semibold">{isZh ? "按准备程度逐步升级" : "Progress by readiness, not pressure"}</h2>
            <div className="mt-4 space-y-4">
              {(isZh
                ? [
                    ["约 5–7 岁", "从简单级 4×4 开始，每次练习 5–10 分钟。"],
                    ["约 7–9 岁", "尝试中等和挑战级，并让孩子解释排除理由。"],
                    ["约 9 岁以上", "准备好后尝试 6×6 或线索较多的简单 9×9。"],
                  ]
                : [
                    ["Around ages 5–7", "Start with Easy 4×4 and keep sessions near 5–10 minutes."],
                    ["Around ages 7–9", "Try Medium and Challenge puzzles and ask for an elimination reason."],
                    ["Around age 9+", "When ready, try 6×6 or an easy 9×9 with many givens."],
                  ]).map(([age, guidance]) => (
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
            {(isZh
              ? [
                  ["先让孩子观察", "先找已经出现三种数字的行、列或宫，这里最容易找到唯一缺少的数字。"],
                  ["用问题代替答案", "问“为什么不能放这里？”或“这一行还缺哪个数字？”，不要马上指出正确格子。"],
                  ["在成功时停止", "一次完成一到三题已经足够。保留下一次还想玩的感觉。"],
                ]
              : [
                  ["Let the child scan first", "Begin with a row, column, or box that already shows three different digits."],
                  ["Ask questions instead of giving answers", "Try: Why can’t this number go here? or Which number is missing?"],
                  ["Stop while the experience is positive", "One to three puzzles can be enough. End with confidence and curiosity."],
                ]).map(([title, body]) => (
              <section key={title}>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl border bg-secondary/30 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">{isZh ? "隐私与本地进度" : "Privacy and local progress"}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            {isZh
              ? "无需姓名、邮箱或儿童档案。当前题目和已完成题号只保存在这个浏览器中，30 天后自动过期；页面不要求儿童创建账户。"
              : "No name, email, or child profile is collected. The current puzzle and completed puzzle IDs stay only in this browser and expire after 30 days; no child account is required."}
          </p>
          <Link href={`/${normalizedLocale}/privacy`} className="mt-4 inline-flex font-semibold text-primary hover:underline">
            {isZh ? "阅读隐私说明" : "Read privacy details"} →
          </Link>
        </section>

        <section className="mt-14 rounded-2xl border bg-primary/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">{isZh ? "准备好更大的挑战了吗？" : "Ready for a bigger challenge later?"}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            {isZh
              ? "武士数独由五个重叠的 9×9 网格组成，不适合作为第一次接触数独的题型。先完成 4×4 和 6×6，再把武士数独当作家庭共同挑战。"
              : "Samurai Sudoku combines five overlapping 9×9 grids, so it is not a first Sudoku for a young beginner. Complete 4×4 and 6×6 first, then treat Samurai Sudoku as a family challenge."}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${normalizedLocale}/sudoku-for-kids/6x6`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
              {isZh ? "下一步：6×6" : "Next: 6×6 Sudoku"}
            </Link>
            <Link href={`/${normalizedLocale}/games/samurai/daily`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
              {isZh ? "每日武士数独" : "Daily Samurai Sudoku"}
            </Link>
            <Link href={`/${normalizedLocale}/games/samurai/how-to-play`} className="rounded-lg border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5">
              {isZh ? "武士数独规则" : "Samurai Sudoku rules"}
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
