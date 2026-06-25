import type { Metadata } from "next";
import Link from "next/link";

import { locales } from "@/i18n";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh ? "联系我们 - 武士数独" : "Contact Samurai Sudoku",
    description: isZh
      ? "报告武士数独题目问题、体验故障或隐私疑问。"
      : "Report a Samurai Sudoku puzzle issue, experience problem, or privacy question.",
    alternates: {
      canonical: buildAbsoluteUrl(`/${locale}/contact`),
      languages: {
        ...Object.fromEntries(
          locales.map((locale) => [
            locale === "zh" ? "zh-CN" : "en-US",
            buildAbsoluteUrl(`/${locale}/contact`),
          ]),
        ),
        "x-default": buildAbsoluteUrl("/en/contact"),
      },
    },
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: isZh ? "联系武士数独" : "Contact Samurai Sudoku",
    url: buildAbsoluteUrl(`/${locale}/contact`),
    inLanguage: isZh ? "zh-CN" : "en-US",
    mainEntity: {
      "@type": "Organization",
      name: "Samurai Sudoku",
      url: buildAbsoluteUrl(`/${locale}`),
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "feedback@samuraisudoku.net",
        },
        {
          "@type": "ContactPoint",
          contactType: "privacy",
          email: "privacy@samuraisudoku.net",
        },
      ],
    },
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <Link href={`/${locale}`} className="text-sm font-medium text-primary hover:text-primary/80">
        {isZh ? "返回首页" : "Back to home"}
      </Link>

      <h1 className="mt-6 text-4xl font-semibold tracking-tight">
        {isZh ? "联系我们" : "Contact Samurai Sudoku"}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {isZh
          ? "如果你发现题目、答案、计时、进度保存或页面显示问题，请告诉我们具体页面和发生步骤。"
          : "If you find a problem with a puzzle, solution, timer, saved progress, or page display, tell us the page and the steps that caused it."}
      </p>

      <section className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-lg border bg-background p-5">
          <h2 className="text-xl font-semibold">{isZh ? "题目与产品反馈" : "Puzzle and Product Feedback"}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh
              ? "请附上题目日期、难度、设备和浏览器信息，方便复现。"
              : "Include the puzzle date, difficulty, device, and browser so the issue can be reproduced."}
          </p>
          <a
            href="mailto:feedback@samuraisudoku.net"
            className="mt-4 inline-flex font-medium text-primary hover:text-primary/80"
          >
            feedback@samuraisudoku.net
          </a>
        </div>

        <div className="rounded-lg border bg-background p-5">
          <h2 className="text-xl font-semibold">{isZh ? "隐私与数据" : "Privacy and Data"}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isZh
              ? "咨询本地进度、分析同意或数据处理相关问题。"
              : "Ask about local progress, analytics consent, or data handling."}
          </p>
          <a
            href="mailto:privacy@samuraisudoku.net"
            className="mt-4 inline-flex font-medium text-primary hover:text-primary/80"
          >
            privacy@samuraisudoku.net
          </a>
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">{isZh ? "报告问题时请提供" : "What to Include in a Report"}</h2>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>{isZh ? "出现问题的页面网址或题目日期。" : "The page URL or puzzle date."}</li>
          <li>{isZh ? "你执行的步骤和实际看到的结果。" : "The steps you took and what happened."}</li>
          <li>{isZh ? "设备、操作系统和浏览器版本。" : "Your device, operating system, and browser version."}</li>
          <li>{isZh ? "不包含私人信息的截图（如有）。" : "A screenshot without private information, when useful."}</li>
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href={`/${locale}/privacy`} className="font-medium text-primary hover:text-primary/80">
          {isZh ? "查看隐私政策" : "Read the Privacy Policy"}
        </Link>
        <Link href={`/${locale}/about`} className="font-medium text-primary hover:text-primary/80">
          {isZh ? "了解本站" : "About This Site"}
        </Link>
      </div>
    </main>
  );
}
