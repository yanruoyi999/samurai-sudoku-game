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
      ? "了解武士数独如何处理本地进度、反馈数据、网站分析和广告相关数据。"
      : "Learn how Samurai Sudoku handles local progress, feedback data, site analytics, and advertising-related data.",
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
        {isZh ? "最后更新：2026年7月13日" : "Last updated: July 13, 2026"}
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
            <strong className="text-foreground">Google AdSense / Google Ads</strong>:{" "}
            {isZh
              ? "如果本站启用 Google 广告，Google 及其合作伙伴可能会使用 Cookie 根据你访问本站或其他网站的情况投放广告。你可以在 Google 广告设置中关闭个性化广告。"
              : "If Google ads are enabled on this site, Google and its partners may use cookies to serve ads based on your visits to this site and/or other sites. You can opt out of personalized advertising in Google Ads Settings."}{" "}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              {isZh ? "Google 广告设置" : "Google Ads Settings"}
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
              ? "用于收集题目反馈、功能建议、问题报告和订阅候补名单。你只有在点击反馈或支持入口时才会打开 Typeform。"
              : "Used to collect puzzle feedback, feature requests, issue reports, and supporter waitlist responses. Typeform opens only when you click a feedback or support entry."}{" "}
            <a
              href="https://www.typeform.com/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              {isZh ? "Typeform 隐私政策" : "Typeform Privacy Policy"}
            </a>
          </li>
          <li>
            <strong className="text-foreground">PayPal</strong>:{" "}
            {isZh
              ? "用于处理可打印 PDF 题包的一次性付款。付款批准和支付信息由 PayPal 处理；本站服务器仅核验订单号、商品、金额、币种和完成状态，并生成限时下载链接。本站不接收或保存完整银行卡信息。"
              : "Used to process one-time purchases of printable PDF packs. PayPal handles payment approval and payment details; our server verifies only the order ID, product, amount, currency, and completion status before issuing a time-limited download link. We do not receive or store full card details."}{" "}
            <a
              href="https://www.paypal.com/us/legalhub/paypal/privacy-full"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              {isZh ? "PayPal 隐私声明" : "PayPal Privacy Statement"}
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">{isZh ? "数字购买与下载" : "Digital Purchases and Downloads"}</h2>
        <p className="text-muted-foreground">
          {isZh
            ? "自动交付启用后，浏览器会在本地保存订单号和随机恢复密钥，以便刷新页面后重新核验已完成订单。恢复密钥不会发送给 PayPal；下载令牌有有效期，且下载响应不会被浏览器或搜索引擎缓存。人工 PayPal.Me 回退仅在自动结账不可用时使用，并需要你主动提交付款收据以完成交付。"
            : "When automatic delivery is enabled, your browser stores the order ID and a random recovery key locally so a completed order can be verified again after a refresh. The recovery key is not sent to PayPal; download tokens expire, and download responses are not cached or indexed. The manual PayPal.Me fallback is used only when automatic checkout is unavailable and requires you to submit a receipt for delivery."}
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">{isZh ? "Cookie、广告和分析" : "Cookies, Ads, and Analytics"}</h2>
        <p className="text-muted-foreground">
          {isZh
            ? "Google Analytics 和 Clarity 只用于产品分析。若启用 Google 广告，第三方供应商（包括 Google）可能会使用广告 Cookie 投放、衡量和限制广告。Clarity 默认不使用广告存储，并以受限分析模式帮助我们发现棋盘点击、滚动和加载问题。你可以通过浏览器隐私设置、清除本网站数据或 Google 广告设置来管理相关数据使用。"
            : "Google Analytics and Clarity are used for product analytics. If Google ads are enabled, third-party vendors including Google may use advertising cookies to serve, measure, and limit ads. Clarity keeps ad storage disabled by default and uses limited analytics mode to help us find board-click, scroll, and loading issues. You can use browser privacy controls, clear this site's data, or use Google Ads Settings to manage related data use."}
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

      <nav
        className="mt-10 border-t pt-6"
        aria-label={isZh ? "隐私政策相关页面" : "Privacy policy related pages"}
      >
        <p className="text-sm text-muted-foreground">
          {isZh
            ? "需要进一步了解本站、联系团队，或继续解题？"
            : "Learn more about the site, contact the team, or continue solving."}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
          <Link href={`/${locale}/contact`} className="text-primary hover:text-primary/80">
            {isZh ? "联系与反馈" : "Contact and feedback"}
          </Link>
          <Link href={`/${locale}/about`} className="text-primary hover:text-primary/80">
            {isZh ? "关于武士数独" : "About Samurai Sudoku"}
          </Link>
          <Link href={`/${locale}/terms`} className="text-primary hover:text-primary/80">
            {isZh ? "使用与购买条款" : "Terms of Use and Purchase"}
          </Link>
          <Link href={`/${locale}/games/samurai`} className="text-primary hover:text-primary/80">
            {isZh ? "继续今日谜题" : "Continue today's puzzle"}
          </Link>
        </div>
      </nav>
    </main>
  );
}
