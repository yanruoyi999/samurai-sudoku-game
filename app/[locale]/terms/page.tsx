import type { Metadata } from "next";
import Link from "next/link";

import { buildLanguageAlternates, buildLocalizedUrl } from "@/lib/seo";

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

const PATH = "/terms";

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh ? "使用与购买条款 - 武士数独" : "Terms of Use and Purchase - Samurai Sudoku",
    description: isZh
      ? "了解武士数独在线游戏、可打印 PDF 题包、数字交付、许可和退款处理规则。"
      : "Read the terms for Samurai Sudoku online play, printable PDF packs, digital delivery, licensing, and refund handling.",
    alternates: {
      canonical: buildLocalizedUrl(locale, PATH),
      languages: buildLanguageAlternates(PATH),
    },
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";

  const sections = isZh
    ? [
        ["在线服务", "在线谜题、提示、计时、候选数字和本地进度按现状提供。我们会尽力保持题目有效和服务可用，但不承诺网站永不中断或每种设备都完全兼容。"],
        ["一次性数字购买", "100题可打印 PDF 包是一次性购买，不是订阅，不会自动续费。结账页显示的美元价格和实际包含文件构成购买承诺；服务器端价格为最终验单依据。"],
        ["交付", "自动结账可用时，PayPal 确认订单已完成后立即提供有效期7天的下载链接。自动结账不可用时，可使用标明为人工交付的 PayPal.Me 回退，并在联系页提交订单号或收据；通常会在24小时内处理。"],
        ["许可", "购买者可为个人、家庭或自己直接授课的单个班级打印和使用题包。不得转售、公开上传、共享原始 PDF 或 ZIP、建立镜像下载，或把题目重新包装成其他付费产品。"],
        ["退款与问题处理", "数字文件一经成功下载通常不退款。若发生重复扣款、文件损坏、无法下载、商品与描述不符，或在人工交付后24小时仍未收到文件，请在购买后14天内联系我们。经核验后，我们会优先补发、修复或对符合条件的订单退款。法定消费者权利不受本条款限制。"],
        ["合理使用", "不得自动化滥用下载接口、绕过付款验证、攻击服务、抓取并重新发布题库，或干扰其他玩家。违反这些规则的访问可能被限制。"],
        ["变更与联系", "我们可能更新服务和条款，页面顶部日期会同步更新。付款、下载或许可问题请联系 feedback@samuraisudoku.net，并提供 PayPal 订单号，但不要发送密码或完整银行卡信息。"],
      ]
    : [
        ["Online service", "Online puzzles, hints, timers, candidates, and locally saved progress are provided as available. We work to keep puzzles valid and the service usable, but cannot promise uninterrupted access or perfect compatibility with every device."],
        ["One-time digital purchase", "The 100-puzzle printable PDF pack is a one-time purchase, not a subscription, and does not renew. The USD price and included files shown at checkout form the purchase description; the server-owned price is authoritative for payment verification."],
        ["Delivery", "When automatic checkout is available, a seven-day download link appears after PayPal confirms the order is completed. When it is unavailable, the clearly labeled PayPal.Me manual fallback requires an order ID or receipt through the contact page and is normally handled within 24 hours."],
        ["License", "A purchaser may print and use the pack personally, within their household, or for one class they directly teach. You may not resell, publicly upload, share the original PDF or ZIP, mirror the download, or repackage the puzzles in another paid product."],
        ["Refunds and delivery problems", "Successfully downloaded digital files are normally non-refundable. Contact us within 14 days for duplicate charges, corrupt files, failed downloads, a product that does not match its description, or manual delivery that has not arrived after 24 hours. After verification, we will prioritize replacement, repair, or an eligible refund. Nothing here limits mandatory consumer rights."],
        ["Acceptable use", "Do not automate abuse of download endpoints, bypass payment verification, attack the service, scrape and republish the puzzle library, or interfere with other players. Access that violates these rules may be restricted."],
        ["Changes and contact", "We may update the service and these terms, with the date on this page updated accordingly. For payment, download, or license questions, email feedback@samuraisudoku.net with the PayPal order ID, but never send a password or full card details."],
      ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href={`/${locale}`} className="text-sm font-medium text-primary hover:text-primary/80">
        {isZh ? "返回首页" : "Back to home"}
      </Link>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight">
        {isZh ? "使用与购买条款" : "Terms of Use and Purchase"}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {isZh ? "最后更新：2026年7月13日" : "Last updated: July 13, 2026"}
      </p>

      <div className="mt-8 space-y-8">
        {sections.map(([title, body]) => (
          <section key={title} className="space-y-3">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="leading-relaxed text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>

      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t pt-6 text-sm font-medium">
        <Link href={`/${locale}/games/samurai/pdf`} className="text-primary hover:text-primary/80">
          {isZh ? "查看 PDF 题包" : "View the PDF pack"}
        </Link>
        <Link href={`/${locale}/privacy`} className="text-primary hover:text-primary/80">
          {isZh ? "隐私政策" : "Privacy Policy"}
        </Link>
        <Link href={`/${locale}/contact`} className="text-primary hover:text-primary/80">
          {isZh ? "付款与下载支持" : "Payment and download support"}
        </Link>
      </nav>
    </main>
  );
}
