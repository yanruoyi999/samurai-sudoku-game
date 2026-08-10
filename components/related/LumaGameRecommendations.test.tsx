import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/analytics/events", () => ({
  trackInteraction: vi.fn(),
}));

vi.stubGlobal("React", React);

import { LumaGameRecommendations } from "./LumaGameRecommendations";

describe("LumaGameRecommendations", () => {
  it("links once to each approved Luma destination without nofollow", () => {
    const html = renderToStaticMarkup(
      <LumaGameRecommendations locale="en" placement="advanced_strategy" />,
    );

    expect(html.match(/https:\/\/www\.lumagamehub\.com\/en\/guides\/google-snake-mods/g)).toHaveLength(1);
    expect(html.match(/https:\/\/www\.lumagamehub\.com\/en\/games\/spend-bill-gates-money/g)).toHaveLength(1);
    expect(html).toContain("sister site, Luma Game Hub");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener"');
    expect(html).not.toContain("nofollow");
    expect(html).not.toContain("sponsored");
  });

  it("provides concise Chinese disclosure while retaining the canonical English targets", () => {
    const html = renderToStaticMarkup(
      <LumaGameRecommendations locale="zh" placement="advanced_strategy" />,
    );

    expect(html).toContain("姊妹站 Luma Game Hub");
    expect(html).toContain("Google Snake Mods");
    expect(html).toContain("花光1000亿美元");
    expect(html).toContain("/en/guides/google-snake-mods");
    expect(html).toContain("/en/games/spend-bill-gates-money");
  });
});
