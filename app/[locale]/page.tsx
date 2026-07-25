import Link from 'next/link';
import Script from 'next/script';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';

import { DifficultySection } from '@/components/home/DifficultySection';
import { HomeFaqSection } from '@/components/home/HomeFaqSection';
import { HomeHero } from '@/components/home/HomeHero';
import { LearningPathSection } from '@/components/home/LearningPathSection';
import { LogicGameSection } from '@/components/home/LogicGameSection';
import { QuickStartSection } from '@/components/home/QuickStartSection';
import { SiteFooter } from '@/components/home/SiteFooter';
import type {
  HomeFaqItem,
  HomeFeatureItem,
  HomeLinkItem,
  HomeLogicGameLink,
} from '@/components/home/home-types';
import { getSamuraiLearningPath } from '@/lib/samurai/guides';

interface HomeMessages {
  seoSection?: {
    pointHeading?: string;
    points?: unknown;
  };
  faq?: {
    items?: unknown;
  };
}

const LEARNING_PATH_KEYS = new Set([
  'beginners',
  'first-move',
  'choose-difficulty',
  'solving-tips',
  'strategy-guide',
  'solver',
]);

export default async function HomePage() {
  const locale = await getLocale();
  const isZh = locale === 'zh';
  const t = await getTranslations('home');
  const messages = await getMessages({ locale });
  const homeMessages = (messages as { home?: HomeMessages }).home ?? {};
  const seoSection = homeMessages.seoSection ?? {};
  const faqSection = homeMessages.faq ?? {};

  const seoPoints: string[] = Array.isArray(seoSection.points) ? seoSection.points : [];
  const faqItems: HomeFaqItem[] = Array.isArray(faqSection.items) ? faqSection.items : [];
  const seoPointHeading = typeof seoSection.pointHeading === 'string'
    ? seoSection.pointHeading
    : t('seoSection.title');

  const guideLinks = getSamuraiLearningPath(locale)
    .filter((guide) => LEARNING_PATH_KEYS.has(guide.key))
    .map<HomeLinkItem>((guide) => ({
      href: guide.href,
      title: guide.title,
      body: guide.description,
    }));

  const learningLinks: HomeLinkItem[] = [
    {
      href: `/${locale}/games/samurai/daily`,
      title: isZh ? '每日练习' : 'Daily practice',
      body: isZh
        ? '把今日题作为固定入口，先完成一题，再进入历史题库补练。'
        : 'Use the daily puzzle as the main habit loop before browsing older boards.',
    },
    ...guideLinks,
    {
      href: `/${locale}/games/samurai/common-mistakes`,
      title: isZh ? '常见错误排查' : 'Common mistakes',
      body: isZh
        ? '针对频繁切难度、开新局、填了又清、两三个区域后卡住的恢复流程。'
        : 'Recover from difficulty switching, restarts, cleared entries, and mid-puzzle stalls.',
    },
    {
      href: `/${locale}/games/samurai/paper-practice`,
      title: isZh ? '纸笔练习' : 'Paper practice',
      body: isZh
        ? '学习如何用纸笔式流程标候选、记录推理并复盘。'
        : 'Practice slower solving with candidate notes, overlap marks, and review habits.',
    },
    {
      href: `/${locale}/games/samurai/printable-practice-plan`,
      title: isZh ? '打印练习计划' : 'Printable practice plan',
      body: isZh
        ? '用 3 题精选样包验证纸笔流程，再按 30 天训练库系统练习。'
        : 'Test the paper workflow with the 3-puzzle sampler, then follow the complete 30-day library.',
    },
    {
      href: `/${locale}/printable-samurai-sudoku#free-3-puzzle-pack`,
      title: isZh ? '可打印题目' : 'Printable puzzles',
      body: isZh
        ? '下载 3 道难度渐进精选题，包含前 2 题答案、Expert 预览、A4 和 US Letter。'
        : 'Download 3 progressive puzzles with two answers and an Expert preview in A4 or US Letter.',
    },
    {
      href: `/${locale}/printable-samurai-sudoku#paid-100-puzzle-pack`,
      title: isZh ? 'PDF 打印包' : 'PDF pack',
      body: isZh
        ? '30 天每日数独训练：100 题、完整答案与一页 2 题随身版。'
        : 'A 30-day routine with 100 puzzles, every answer, and portable two-per-page editions.',
    },
  ];

  const guideMap = new Map(getSamuraiLearningPath(locale).map((guide) => [guide.key, guide]));
  const definitionGuide = guideMap.get('what-is');
  const firstMoveGuide = guideMap.get('first-move');

  const quickStartLinks: HomeLinkItem[] = [
    ...(definitionGuide ? [{
      href: definitionGuide.href,
      title: isZh ? '先看规则图解' : 'Learn the layout first',
      body: definitionGuide.description,
    }] : []),
    ...(firstMoveGuide ? [{
      href: firstMoveGuide.href,
      title: isZh ? '不知道第一步？' : 'Need the first move?',
      body: firstMoveGuide.description,
    }] : []),
    {
      href: `/${locale}/games/samurai`,
      title: isZh ? '直接开始今日谜题' : "Play today's puzzle",
      body: isZh ? '已经知道规则？从今日挑战开始。' : 'Already know the rules? Start the daily challenge.',
    },
    {
      href: `/${locale}/games/samurai/difficulty/easy`,
      title: isZh ? '从简单题开始' : 'Start with Easy',
      body: isZh
        ? '第一次玩武士数独，建议先用简单题练重叠区。'
        : 'New to Samurai Sudoku? Practice overlap logic on easier boards.',
    },
  ];

  const logicGameLinks: HomeLogicGameLink[] = [
    {
      href: `/${locale}/games/samurai`,
      title: 'Samurai Sudoku',
      body: isZh
        ? '站点主入口：每日五宫格重叠数独、题库、难度页和纸笔打印。'
        : 'The main game hub: daily five-grid Sudoku, archive, difficulty pages, and printable practice.',
      game: 'samurai_sudoku',
    },
    {
      href: `/${locale}/games/minesweeper`,
      title: isZh ? '在线扫雷' : 'Minesweeper Online',
      body: isZh
        ? '高频、低门槛的逻辑游戏：三种经典难度、计时、旗帜模式和第一步安全。'
        : 'A lower-friction logic game with classic boards, timer, flag mode, and a safe first click.',
      game: 'minesweeper',
    },
  ];

  const features: HomeFeatureItem[] = [
    { icon: '📱', title: t('features.offline'), description: t('features.offlineDesc') },
    { icon: '💡', title: t('features.intelligent'), description: t('features.intelligentDesc') },
    { icon: '📊', title: t('features.progress'), description: t('features.progressDesc') },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <main className="min-h-screen flex flex-col">
        <section className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <HomeHero
              browseArchiveLabel={t('browseArchive')}
              description={t('description')}
              features={features}
              locale={locale}
              playNowLabel={t('playNow')}
            />

            <QuickStartSection links={quickStartLinks} locale={locale} />
            <LogicGameSection links={logicGameLinks} locale={locale} />
            <DifficultySection locale={locale} />
            <LearningPathSection links={learningLinks} locale={locale} />

            <section className="mt-20 space-y-6 text-left">
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center">
                {t('seoSection.title')}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto text-center">
                {t('seoSection.description')}
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {seoPoints.map((point, index) => (
                  <div key={point} className="p-5 rounded-lg border bg-background/80 shadow-sm">
                    <h3 className="text-lg font-medium text-primary mb-2">
                      {`${seoPointHeading} ${index + 1}`}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{point}</p>
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

            <HomeFaqSection items={faqItems} title={t('faq.title')} />

            <section className="mt-12 rounded-2xl border bg-primary/5 p-6 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold">
                {isZh ? '读完规则，下一步开始一局。' : 'Ready after reading? Start a puzzle next.'}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                {isZh
                  ? '第一次玩先从简单题开始；已经了解规则时，可以直接进入今日谜题。'
                  : "Start with Easy the first time. If you already know the rules, jump into today's puzzle."}
              </p>
              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href={`/${locale}/games/samurai/difficulty/easy`} className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary/10">
                  {isZh ? '先做简单题' : 'Start with Easy'}
                </Link>
                <Link href={`/${locale}/games/samurai`} className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
                  {isZh ? '开始今日谜题' : "Play today's puzzle"}
                </Link>
              </div>
            </section>
          </div>
        </section>

        <SiteFooter
          aboutLabel={t('about')}
          contactLabel={t('contact')}
          footerText={t('footer')}
          locale={locale}
          privacyLabel={t('privacy')}
        />
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
