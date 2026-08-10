"use client";

import { TrackedLink } from "@/components/analytics/TrackedLink";

const GOOGLE_SNAKE_MODS_URL = "https://www.lumagamehub.com/en/guides/google-snake-mods";
const SPEND_BILL_GATES_MONEY_URL = "https://www.lumagamehub.com/en/games/spend-bill-gates-money";

interface LumaGameRecommendationsProps {
  locale: string;
  placement: string;
}

export function LumaGameRecommendations({
  locale,
  placement,
}: LumaGameRecommendationsProps) {
  const isZh = locale === "zh";

  return (
    <aside className="mt-12 border-y py-7" aria-labelledby="luma-game-recommendations-title">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {isZh ? "站外游戏推荐" : "More logic-friendly games"}
      </p>
      <h2 id="luma-game-recommendations-title" className="mt-2 text-2xl font-semibold">
        {isZh ? "换一种节奏继续动脑" : "Take a shorter puzzle break"}
      </h2>
      <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
        {isZh
          ? "以下两个资源来自我们的姊妹站 Luma Game Hub，适合在长局武士数独之间换一种节奏。"
          : "These two resources are published on our sister site, Luma Game Hub, for a change of pace between longer Samurai Sudoku sessions."}
      </p>

      <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <TrackedLink
          href={GOOGLE_SNAKE_MODS_URL}
          eventName="sister_site_game_click"
          eventProperties={{
            destination: "google_snake_mods",
            locale,
            placement,
          }}
          target="_blank"
          rel="noopener"
          className="group border-l-2 border-primary/40 pl-4 hover:border-primary"
        >
          <span className="block font-semibold text-primary group-hover:underline">
            Google Snake Mods
          </span>
          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
            {isZh
              ? "了解 Mod Menu、常见版本与安全使用方式。"
              : "Compare mod-menu options, common versions, and safer ways to use them."}
          </span>
        </TrackedLink>

        <TrackedLink
          href={SPEND_BILL_GATES_MONEY_URL}
          eventName="sister_site_game_click"
          eventProperties={{
            destination: "spend_bill_gates_money",
            locale,
            placement,
          }}
          target="_blank"
          rel="noopener"
          className="group border-l-2 border-primary/40 pl-4 hover:border-primary"
        >
          <span className="block font-semibold text-primary group-hover:underline">
            {isZh ? "花光1000亿美元" : "Spend Bill Gates' Money"}
          </span>
          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
            {isZh
              ? "用一个轻量预算游戏测试你的数量直觉。"
              : "Test your sense of scale with a quick interactive budgeting game."}
          </span>
        </TrackedLink>
      </div>
    </aside>
  );
}
