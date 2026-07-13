import { describe, expect, it } from "vitest";

import { buildSiteNavigation } from "./site-navigation";

describe("buildSiteNavigation", () => {
  it("keeps the canonical printable page featured in English navigation", () => {
    const navigation = buildSiteNavigation("en", "$4.95");

    expect(navigation.homeHref).toBe("/en");
    expect(navigation.offer.href).toBe("/en/printable-samurai-sudoku");
    expect(navigation.offer.label).toContain("20 free printable puzzles");

    const printable = navigation.items.find((item) => item.id === "printable");
    expect(printable).toMatchObject({
      href: "/en/printable-samurai-sudoku",
      label: "Free Printables",
      featured: true,
    });

    expect(navigation.items.map((item) => item.id)).toEqual([
      "today",
      "printable",
      "archive",
      "guides",
      "pdf-pack",
    ]);
    expect(navigation.items.at(-1)?.label).toBe("PDF Pack · $4.95");
  });

  it("localizes labels and destinations for Chinese pages", () => {
    const navigation = buildSiteNavigation("zh", "$3.99");

    expect(navigation.homeLabel).toBe("武士数独首页");
    expect(navigation.offer.label).toContain("20 道免费打印题");
    expect(navigation.items).toContainEqual(
      expect.objectContaining({
        id: "guides",
        href: "/zh/games/samurai/how-to-play",
        label: "玩法攻略",
      }),
    );
    expect(navigation.items.at(-1)?.label).toBe("PDF 题包 · $3.99");
  });
});
