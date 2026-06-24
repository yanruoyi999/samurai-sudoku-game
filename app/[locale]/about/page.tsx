import type { Metadata } from "next";
import Link from "next/link";

import { locales } from "@/i18n";
import { buildAbsoluteUrl } from "@/lib/site-url";

interface AboutPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: AboutPageProps): Metadata {
  const isZh = params.locale === "zh";

  return {
    title: isZh ? "关于武士数独" : "About Samurai Sudoku",
    description: isZh
      ? "了解武士数独的题目标准、本地优先设计和每日逻辑训练目标。"
      : "Learn about Samurai Sudoku's puzzle standards, local-first design, and daily logic-training mission.",
    alternates: {
      canonical: buildAbsoluteUrl(`/${params.locale}/about`),
      languages: Object.fromEntries(
        locales.map((locale) => [
          locale === "zh" ? "zh-CN" : "en-US",
          buildAbsoluteUrl(`/${locale}/about`),
        ]),
      ),
    },
  };
}

export default function AboutPage({ params }: AboutPageProps) {
  const isZh = params.locale === "zh";

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href={`/${params.locale}`} className="text-sm font-medium text-primary hover:text-primary/80">
        {isZh ? "返回首页" : "Back to home"}
      </Link>

      <h1 className="mt-6 text-4xl font-semibold tracking-tight">
        {isZh ? "关于武士数独" : "About Samurai Sudoku"}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {isZh
          ? "武士数独是一个专注于五宫重叠数独的免费在线站点。我们的目标是提供清晰、可靠、适合反复练习的每日逻辑谜题。"
          : "Samurai Sudoku is a free online site focused on five-grid overlapping Sudoku. Our goal is to provide clear, reliable daily logic puzzles worth returning to."}
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">{isZh ? "我们重视什么" : "What We Prioritize"}</h2>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            {isZh
              ? "题目可靠：发布前检查网格、答案和难度数据。"
              : "Reliable puzzles: grids, solutions, and difficulty data are checked before publication."}
          </li>
          <li>
            {isZh
              ? "专注解题：没有强制注册，核心体验直接可用。"
              : "Focused solving: no required account and immediate access to the core game."}
          </li>
          <li>
            {isZh
              ? "本地优先：进行中的棋局和设置主要保存在你的浏览器中。"
              : "Local-first progress: active games and settings are primarily stored in your browser."}
          </li>
          <li>
            {isZh
              ? "持续改进：根据实际错误报告和体验反馈修正题目与界面。"
              : "Continuous improvement: puzzle and interface issues are corrected from real reports and feedback."}
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">{isZh ? "武士数独是什么" : "What Is Samurai Sudoku?"}</h2>
        <p className="leading-relaxed text-muted-foreground">
          {isZh
            ? "武士数独由五个相互重叠的 9×9 数独组成。四个角落网格与中心网格共享区域，因此一个数字可能同时影响两个网格。"
            : "Samurai Sudoku combines five overlapping 9×9 Sudoku grids. Each corner grid shares cells with the center, so one number can affect two grids at once."}
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/${params.locale}/games/samurai`}
          className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {isZh ? "开始今日谜题" : "Play Today's Puzzle"}
        </Link>
        <Link
          href={`/${params.locale}/contact`}
          className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary hover:bg-primary/10"
        >
          {isZh ? "联系我们" : "Contact Us"}
        </Link>
      </div>
    </main>
  );
}
