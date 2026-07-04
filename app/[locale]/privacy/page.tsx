import type { Metadata } from "next";
import Link from "next/link";

import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const canonical = buildLocalizedUrl(locale, "/privacy");

  return {
    title: isZh ? "隐私政策 - 武士数独" : "Privacy Policy - Samurai Sudoku",
    description: isZh
      ? "了解武士数独如何处理本地进度、反馈数据和网站分析。"
      : "Learn how Samurai Sudoku handles local progress, feedback data, and site analytics.",
    alternates: {
      canonical,
      languages: buildLanguageAlternates("/privacy"),
    },
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href={`/${locale}`} className="text-sm font-medium text-primary hover:text-primary/80">
        {isZh ? "返回首页" : "Back to home"}
      </Link>

      <h1 className="mt-6 text-4xl font-semibold tracking-tight">
        {isZh ? "隐私政策" : "Privacy Policy"}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {isZh ? "最后更新：2026年7月3日" : "Last updated: July 3, 2026"}
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">{isZh ? "我们收集什么" : "What We Collect"}</h2>
        <p className="text-muted-foreground">
          {isZh
            ? "武士数独主要在你的浏览器本地保存游戏进度、计时、候选数字和设置。我们不会要求你注册账户。"
            : "Samurai Sudoku primarily stores puzzle progress, timers, candidates, and settings locally in your browser. We do not require account registration."}
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">{isZh ? "第三方服务" : "Third-Party Services"}</h2>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">Google Analytics</strong>:{" "}
            {isZh
              ? "用于统计页面访问、来源、设备和基本站内行为，帮助我们判断哪些谜题、语言和入口最有用。只有配置站点专属 Measurement ID 时才会加载。"
              : "Used to measure page views, acquisition sources, devices, and basic site behavior so we can understand which puzzles, languages, and entry paths are useful. It loads only when a site-specific Measurement ID is configured."}{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              {isZh ? "Google 隐私权政策" : "Google Privacy Policy"}
            </a>
          </li>
          <li>
            <strong className="text-foreground">Microsoft Clarity</strong>:{" "}
            {isZh
              ? "用于热图、会话回放和体验问题分析。默认不使用广告存储，并以受限分析模式运行，避免弹窗打断用户。"
              : "Used for heatmaps, session recordings, and experience diagnostics. It runs by default with ad storage disabled and limited analytics mode, without interrupting visitors with a banner."}{" "}
            <a
              href="https://privacy.microsoft.com/privacystatement"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              {isZh ? "Microsoft 隐私声明" : "Microsoft Privacy Statement"}
            </a>
          </li>
          <li>
            <strong className="text-foreground">Typeform</strong>:{" "}
            {isZh
              ? "用于收集题目反馈、功能建议和问题报告。你只有在点击反馈入口时才会打开 Typeform。"
              : "Used to collect puzzle feedback, feature requests, and issue reports. Typeform opens only when you click the feedback entry."}{" "}
            <a
              href="https://www.typeform.com/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              {isZh ? "Typeform 隐私政策" : "Typeform Privacy Policy"}
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">{isZh ? "Cookie 和分析" : "Cookies and Analytics"}</h2>
        <p className="text-muted-foreground">
          {isZh
            ? "Google Analytics 和 Clarity 只用于产品分析，不用于在本站投放个性化广告。Clarity 默认不使用广告存储，并以受限分析模式帮助我们发现棋盘点击、滚动和加载问题。你可以通过浏览器隐私设置或清除本网站数据来控制本地存储。"
            : "Google Analytics and Clarity are used for product analytics, not for serving personalized ads on this site. Clarity keeps ad storage disabled by default and uses limited analytics mode to help us find board-click, scroll, and loading issues. You can use browser privacy controls or clear this site's data to manage local storage."}
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">{isZh ? "联系我们" : "Contact"}</h2>
        <p className="text-muted-foreground">
          {isZh
            ? "隐私或数据相关问题可以发送邮件至 "
            : "For privacy or data questions, email "}
          <a href="mailto:privacy@samuraisudoku.net" className="text-primary hover:text-primary/80">
            privacy@samuraisudoku.net
          </a>
          {isZh ? "。" : "."}
        </p>
      </section>
    </main>
  );
}
