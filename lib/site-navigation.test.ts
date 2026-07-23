import { describe, expect, it } from "vitest";

import { buildSiteNavigation } from "./site-navigation";

describe("buildSiteNavigation", () => {
  it("keeps the canonical printable page featured in English navigation", () => {
    const navigation = buildSiteNavigation("en", "$9.90");

    expect(navigation.homeHref).toBe("/en");
    expect(navigation.offer.href).toBe(
      "/en/printable-samurai-sudoku#free-3-puzzle-pack",
    );
    expect(navigation.offer.label).toContain("3 curated puzzles");
    expect(navigation.offer.label).toContain("Expert preview");

    const printable = navigation.items.find((item) => item.id === "printable");
    expect(printable).toMatchObject({
      href: "/en/printable-samurai-sudoku#free-3-puzzle-pack",
      label: "Free 3-Puzzle PDF",
      featured: true,
    });

    expect(navigation.items.map((item) => item.id)).toEqual([
      "today",
      "printable",
      "archive",
      "guides",
      "pdf-pack",
    ]);
    expect(navigation.items.at(-1)?.label).toBe("PDF Pack · $9.90");
    expect(navigation.items.at(-1)?.href).toBe(
      "/en/printable-samurai-sudoku#paid-100-puzzle-pack",
    );
  });

  it("localizes labels and destinations for Chinese pages", () => {
    const navigation = buildSiteNavigation("zh", "$3.99");

    expect(navigation.homeLabel).toBe("武士数独首页");
    expect(navigation.offer.label).toContain("3 道精选试玩题");
    expect(navigation.items).toContainEqual(
      expect.objectContaining({
        id: "guides",
        href: "/zh/games/samurai/how-to-play",
        label: "玩法攻略",
      }),
    );
    expect(navigation.items.at(-1)?.label).toBe("PDF 题包 · $3.99");
    expect(navigation.items.at(-1)?.href).toBe(
      "/zh/printable-samurai-sudoku#paid-100-puzzle-pack",
    );
  });
});
