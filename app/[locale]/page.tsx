import Link from "next/link";
import Script from "next/script";
import { getLocale, getTranslations, getMessages } from 'next-intl/server';

import { TrackedLink } from "@/components/analytics/TrackedLink";

interface HomeMessages {
  seoSection?: {
    pointHeading?: string;
    points?: unknown;
  };
  faq?: {
    items?: unknown;
  };
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getTranslations('home');

  const messages = await getMessages({ locale });
  const homeMessages = (messages as { home?: HomeMessages }).home ?? {};
  const seoSection = homeMessages.seoSection ?? {};
  const faqSection = homeMessages.faq ?? {};

  const seoPoints: string[] = Array.isArray(seoSection.points)
    ? seoSection.points
    : [];
  const faqItems: { question: string; answer: string }[] = Array.isArray(
    faqSection.items
  )
    ? faqSection.items
    : [];
  const seoPointHeading: string =
    typeof seoSection.pointHeading === 'string'
      ? seoSection.pointHeading
      : t('seoSection.title');

  const learningLinks = [
    {
      href: `/${locale}/games/samurai/daily`,
      title: locale === 'zh' ? '每日练习' : 'Daily practice',
      body: locale === 'zh'
        ? '把今日题作为固定入口，先完成一题，再进入历史题库补练。'
        : 'Use the daily puzzle as the main habit loop before browsing older boards.',
    },
    {
      href: `/${locale}/games/samurai/beginners`,
      title: locale === 'zh' ? '新手入门' : 'Beginner guide',
      body: locale === 'zh'
        ? '先理解五个网格、重叠区和从简单题开始练习的顺序。'
        : 'Learn the five-grid layout, overlap boxes, and a safe first practice path.',
    },
    {
      href: `/${locale}/games/samurai/first-move-strategy`,
      title: locale === 'zh' ? '第一步攻略' : 'First move guide',
      body: locale === 'zh'
        ? '不知道先点哪里？先选空格，再点数字，从重叠区开始。'
        : 'Not sure where to begin? Select a cell first, then scan overlap boxes.',
    },
    {
      href: `/${locale}/games/samurai/choose-difficulty`,
      title: locale === 'zh' ? '难度选择' : 'Choose difficulty',
      body: locale === 'zh'
        ? '分清简单、中等、困难、Evil、新游戏和全部题库该怎么用。'
        : 'Learn when to use Easy, Medium, Hard, Evil, New Game, and All Puzzles.',
    },
    {
      href: `/${locale}/games/samurai/solving-tips`,
      title: locale === 'zh' ? '通关技巧' : 'Solving tips',
      body: locale === 'zh'
        ? '从开局、重叠宫、候选数到卡题复查，建立完整通关流程。'
        : 'Follow a complete path from first move to overlap scans, notes, and final review.',
    },
    {
      href: `/${locale}/games/samurai/strategy-guide`,
      title: locale === 'zh' ? '解题策略' : 'Strategy guide',
      body: locale === 'zh'
        ? '用候选数、唯一位置和跨网格联动推进中高难度题。'
        : 'Use candidates, hidden singles, and cross-grid logic for harder puzzles.',
    },
    {
      href: `/${locale}/games/samurai/solver`,
      title: locale === 'zh' ? '提示与求解' : 'Solver-style hints',
      body: locale === 'zh'
        ? '用候选数、重叠区检查和提示功能理解下一步，而不是直接看答案。'
        : 'Use candidates, overlap checks, and hints to understand the next logical step.',
    },
    {
      href: `/${locale}/games/samurai/paper-practice`,
      title: locale === 'zh' ? '纸笔练习' : 'Paper practice',
      body: locale === 'zh'
        ? '学习如何用纸笔式流程标候选、记录推理并复盘。'
        : 'Practice slower solving with candidate notes, overlap marks, and review habits.',
    },
    {
      href: `/${locale}/games/samurai/printable`,
      title: locale === 'zh' ? '可打印题目' : 'Printable puzzles',
      body: locale === 'zh'
        ? '按难度选择日期题，打印后纸笔推理，再回到线上检查。'
        : 'Choose dated puzzles by difficulty, print for paper solving, then check online.',
    },
    {
      href: `/${locale}/games/samurai/pdf`,
      title: locale === 'zh' ? 'PDF 打印包' : 'PDF pack',
      body: locale === 'zh'
        ? '批量保存题面和答案，验证纸笔练习的付费需求。'
        : 'Save bundled puzzle sheets and answer keys for offline practice.',
    },
  ];

  const quickStartLinks = [
    {
      href: `/${locale}/games/samurai/what-is-samurai-sudoku`,
      title: locale === 'zh' ? '先看规则图解' : 'Learn the rules first',
      body: locale === 'zh'
        ? '用 30 秒看懂五个 9×9 网格和重叠区。'
        : 'Understand the five 9×9 grids and overlap zones in 30 seconds.',
    },
    {
      href: `/${locale}/games/samurai/first-move-strategy`,
      title: locale === 'zh' ? '不知道第一步？' : 'Need the first move?',
      body: locale === 'zh'
        ? '先选空格，再点数字；开局从重叠区附近开始。'
        : 'Select a cell before tapping numbers, then start near overlap boxes.',
    },
    {
      href: `/${locale}/games/samurai`,
      title: locale === 'zh' ? '直接开始今日谜题' : "Play today's puzzle",
      body: locale === 'zh'
        ? '已经知道规则？从今日挑战开始。'
        : 'Already know the rules? Start the daily challenge.',
    },
    {
      href: `/${locale}/games/samurai/difficulty/easy`,
      title: locale === 'zh' ? '从简单题开始' : 'Start with Easy',
      body: locale === 'zh'
        ? '第一次玩武士数独，建议先用简单题练重叠区。'
        : 'New to Samurai Sudoku? Practice overlap logic on easier boards.',
    },
  ];

  const logicGameLinks = [
    {
      href: `/${locale}/games/samurai`,
      title: 'Samurai Sudoku',
      body: locale === 'zh'
        ? '站点主入口：每日五宫格重叠数独、题库、难度页和纸笔打印。'
        : 'The main game hub: daily five-grid Sudoku, archive, difficulty pages, and printable practice.',
      game: 'samurai_sudoku',
    },
    {
      href: `/${locale}/games/minesweeper`,
      title: locale === 'zh' ? '在线扫雷' : 'Minesweeper Online',
      body: locale === 'zh'
        ? '新增高频逻辑游戏实验：三种经典难度、计时、旗帜模式和第一步安全。'
        : 'A new high-frequency logic game test with classic boards, timer, flag mode, and a safe first click.',
      game: 'minesweeper',
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Link
            href={`/${locale}/games/samurai`}
            className="group inline-block rounded-2xl px-3 py-2 transition hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label={locale === 'zh' ? '打开今日武士数独谜题' : "Open today's Samurai Sudoku puzzle"}
          >
            <p className="text-sm md:text-base font-medium tracking-[0.25em] uppercase text-primary">
              {locale === 'zh' ? '每日逻辑挑战' : 'Daily logic challenge'}
            </p>
            <h1 className="mt-3 font-display text-6xl md:text-8xl font-semibold tracking-tight leading-[0.95] group-hover:text-primary transition-colors">
              Samurai Sudoku
            </h1>
            <p className="mt-5 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {t('description')}
            </p>
            <span className="mt-4 inline-flex text-sm font-medium text-primary opacity-80 group-hover:opacity-100">
              {locale === 'zh' ? '点击标题即可开始今日谜题 →' : "Tap the title to start today's puzzle →"}
            </span>
          </Link>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href={`/${locale}/games/samurai`}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
            >
              {t('playNow')}
            </Link>

            <Link
              href={`/${locale}/games/samurai/archive`}
              className="px-8 py-4 border-2 border-primary text-primary rounded-lg font-semibold text-lg hover:bg-primary/10 transition-colors"
            >
              {t('browseArchive')}
            </Link>
          </div>

          <section className="pt-8 text-left" aria-labelledby="quick-start-heading">
            <h2 id="quick-start-heading" className="text-2xl md:text-3xl font-semibold text-center">
              {locale === 'zh' ? '你想先做什么？' : 'What would you like to do first?'}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quickStartLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl border bg-background/90 p-5 shadow-sm transition hover:border-primary hover:bg-primary/5"
                >
                  <h3 className="text-lg font-semibold text-primary">{link.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{link.body}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <FeatureCard
              icon="📱"
              title={t('features.offline')}
              description={t('features.offlineDesc')}
            />
            <FeatureCard
              icon="💡"
              title={t('features.intelligent')}
              description={t('features.intelligentDesc')}
            />
            <FeatureCard
              icon="📊"
              title={t('features.progress')}
              description={t('features.progressDesc')}
            />
          </div>

          <section className="mt-20 space-y-6 text-left">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center">
              {locale === 'zh' ? '更多高频逻辑游戏' : 'More high-frequency logic games'}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto text-center">
              {locale === 'zh'
                ? '保留武士数独作为核心，同时测试扫雷这类更高频、低门槛的益智游戏入口。'
                : 'Samurai Sudoku remains the core game while Minesweeper tests a lower-friction repeat-play entry point.'}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {logicGameLinks.map((link) => (
                <TrackedLink
                  key={link.href}
                  href={link.href}
                  eventName="home_logic_game_click"
                  eventProperties={{ game: link.game, locale }}
                  className="rounded-lg border bg-background/80 p-5 text-left shadow-sm transition hover:border-primary hover:bg-primary/5"
                >
                  <h3 className="text-lg font-medium text-primary mb-2">{link.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{link.body}</p>
                </TrackedLink>
              ))}
            </div>
          </section>

          {/* Browse by difficulty — internal links to difficulty hubs */}
          <section className="mt-20 space-y-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
              {locale === 'zh' ? '按难度选择' : 'Choose your difficulty'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {([
                ['easy', locale === 'zh' ? '简单' : 'Easy', locale === 'zh' ? '轻松入门' : 'Gentle start'],
                ['medium', locale === 'zh' ? '中等' : 'Medium', locale === 'zh' ? '稳步推理' : 'Steady logic'],
                ['hard', locale === 'zh' ? '困难' : 'Hard', locale === 'zh' ? '深度推理' : 'Deep deduction'],
                ['evil', locale === 'zh' ? 'Evil 极难' : 'Evil', locale === 'zh' ? '终极挑战' : 'Ultimate test'],
              ] as const).map(([d, label, sub]) => (
                <Link
                  key={d}
                  href={`/${locale}/games/samurai/difficulty/${d}`}
                  className="rounded-lg border bg-secondary/40 p-5 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="text-lg font-semibold">{label}</div>
                  <div className="text-sm text-muted-foreground mt-1">{sub}</div>
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-center">
              <Link
                href={`/${locale}/games/samurai/what-is-samurai-sudoku`}
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                {locale === 'zh' ? '什么是武士数独？' : 'What is Samurai Sudoku?'}
                <span aria-hidden>→</span>
              </Link>
              <Link
                href={`/${locale}/games/samurai/choose-difficulty`}
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                {locale === 'zh' ? '难度怎么选？' : 'How to choose difficulty?'}
                <span aria-hidden>→</span>
              </Link>
              <Link
                href={`/${locale}/games/samurai/how-to-play`}
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                {locale === 'zh' ? '不会玩？看武士数独规则与技巧' : 'New here? Learn the rules & strategy'}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </section>

          <section className="mt-20 space-y-6 text-left">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center">
              {locale === 'zh' ? '学习路径' : 'Learning path'}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto text-center">
              {locale === 'zh'
                ? '如果你想提升解题能力，按每日练习、新手、第一步、难度选择、通关技巧、提示、纸笔练习的顺序阅读这些原创指南。'
                : 'If you want to improve, read these original guides in order: daily practice, beginner basics, first move, difficulty choice, solving tips, hints, then paper-style practice.'}
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {learningLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border bg-background/80 p-5 text-left shadow-sm transition hover:border-primary hover:bg-primary/5"
                >
                  <h3 className="text-lg font-medium text-primary mb-2">{link.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{link.body}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-20 space-y-6 text-left">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center">
              {t('seoSection.title')}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto text-center">
              {t('seoSection.description')}
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {seoPoints.map((point, index) => (
                <div
                  key={index}
                  className="p-5 rounded-lg border bg-background/80 shadow-sm"
                >
                  <h3 className="text-lg font-medium text-primary mb-2">
                    {`${seoPointHeading} ${index + 1}`}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-2">
              <Link
                href={`/${locale}/games/samurai/archive`}
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
              >
                {t('seoSection.cta')}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </section>

          <section className="mt-16 space-y-6 text-left">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center">
              {t('faq.title')}
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqItems.map((item, index) => (
                <details
                  key={index}
                  className="group border rounded-lg bg-background/80 p-4 transition-all"
                >
                  <summary className="cursor-pointer text-lg font-medium text-foreground flex items-center justify-between">
                    <span>{item.question}</span>
                    <span className="text-primary group-open:rotate-90 transition-transform" aria-hidden>
                      ➤
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border bg-primary/5 p-6 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold">
              {locale === 'zh' ? '读完规则，下一步开始一局。' : 'Ready after reading? Start a puzzle next.'}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              {locale === 'zh'
                ? '如果是第一次玩，建议先点简单题；如果已经了解规则，可以直接进入今日谜题。'
                : 'If this is your first time, start with Easy. If you already know the rules, jump into today’s puzzle.'}
            </p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={`/${locale}/games/samurai/difficulty/easy`} className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary/10">
                {locale === 'zh' ? '先做简单题' : 'Start with Easy'}
              </Link>
              <Link href={`/${locale}/games/samurai`} className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
                {locale === 'zh' ? '开始今日谜题' : "Play today's puzzle"}
              </Link>
            </div>
          </section>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <p>{t('footer')}</p>
        <nav
          aria-label={locale === 'zh' ? '网站信息' : 'Site information'}
          className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2"
        >
          <Link href={`/${locale}/about`} className="text-primary hover:text-primary/80">
            {t('about')}
          </Link>
          <Link href={`/${locale}/contact`} className="text-primary hover:text-primary/80">
            {t('contact')}
          </Link>
          <Link href={`/${locale}/privacy`} className="text-primary hover:text-primary/80">
            {t('privacy')}
          </Link>
          <Link href={`/${locale}/support`} className="text-primary hover:text-primary/80">
            {locale === 'zh' ? '支持与订阅' : 'Support / Subscribe'}
          </Link>
          <Link href={`/${locale}/games/samurai/what-is-samurai-sudoku`} className="text-primary hover:text-primary/80">
            {locale === 'zh' ? '武士数独介绍' : 'What is Samurai Sudoku?'}
          </Link>
          <Link href={`/${locale}/games/samurai/strategy-guide`} className="text-primary hover:text-primary/80">
            {locale === 'zh' ? '解题策略' : 'Strategy guide'}
          </Link>
          <Link href={`/${locale}/games/samurai/solver`} className="text-primary hover:text-primary/80">
            {locale === 'zh' ? '提示与求解' : 'Solver hints'}
          </Link>
          <Link href={`/${locale}/games/samurai/printable`} className="text-primary hover:text-primary/80">
            {locale === 'zh' ? '可打印题目' : 'Printable puzzles'}
          </Link>
          <Link href={`/${locale}/games/samurai/pdf`} className="text-primary hover:text-primary/80">
            {locale === 'zh' ? 'PDF 打印包' : 'PDF pack'}
          </Link>
          <Link href={`/${locale}/games/minesweeper`} className="text-primary hover:text-primary/80">
            {locale === 'zh' ? '在线扫雷' : 'Minesweeper'}
          </Link>
        </nav>
      </footer>
    </main>

    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      strategy="afterInteractive"
    />
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg border bg-secondary/40 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
