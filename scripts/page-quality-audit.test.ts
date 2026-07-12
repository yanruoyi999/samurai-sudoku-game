import { describe, expect, it } from "vitest";

import { normalizeSitemapLocations, scoreHtmlPage } from "./page-quality-audit";

const highQualityGuide = `
<!doctype html>
<html>
  <head>
    <title>Samurai Sudoku Printable Practice Plan</title>
    <meta name="description" content="A printable Samurai Sudoku practice plan with PDF puzzles, answer keys, and weekly paper solving steps." />
    <link rel="canonical" href="https://www.samuraisudoku.net/en/games/samurai/printable-practice-plan" />
    <script type="application/ld+json">{"@type":"Article"}</script>
    <script type="application/ld+json">{"@type":"FAQPage"}</script>
  </head>
  <body>
    <h1>Samurai Sudoku printable practice plan</h1>
    <article>
      <p>${"Printable practice with answer keys and overlap boxes. ".repeat(90)}</p>
      <a href="/en/games/samurai/printable">Printable puzzles</a>
      <a href="/en/games/samurai/pdf/sample">PDF sample</a>
      <a href="/en/games/samurai/archive">Archive</a>
      <button>Print</button>
    </article>
  </body>
</html>`;

describe("page quality scoring", () => {
  it("scores a high-quality long-tail printable guide above the publishing threshold", () => {
    const result = scoreHtmlPage(
      new URL("https://www.samuraisudoku.net/en/games/samurai/printable-practice-plan"),
      highQualityGuide,
    );

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.category).toBe("samurai-printable");
  });

  it("scores thin pages without metadata and internal links below the publishing threshold", () => {
    const result = scoreHtmlPage(
      new URL("https://www.samuraisudoku.net/en/games/samurai/thin-page"),
      "<html><body><h1>Thin</h1><p>Short page.</p></body></html>",
    );

    expect(result.score).toBeLessThan(80);
    expect(result.issues).toContain("missing title");
    expect(result.issues).toContain("too few internal links");
  });

  it("rewards high-demand playable categories", () => {
    const printable = scoreHtmlPage(
      new URL("https://www.samuraisudoku.net/en/games/samurai/printable"),
      highQualityGuide,
    );
    const minesweeper = scoreHtmlPage(
      new URL("https://www.samuraisudoku.net/en/games/minesweeper"),
      highQualityGuide,
    );

    expect(printable.breakdown.demand).toBeGreaterThanOrEqual(16);
    expect(minesweeper.breakdown.demand).toBeGreaterThanOrEqual(16);
  });

  it("accepts concise Chinese metadata as valid", () => {
    const result = scoreHtmlPage(
      new URL("https://www.samuraisudoku.net/zh/games/samurai/daily"),
      `
        <html>
          <head>
            <title>每日武士数独</title>
            <meta name="description" content="在线挑战每日武士数独，保存本地进度；想继续练习时可进入日期归档题库。" />
            <link rel="canonical" href="https://www.samuraisudoku.net/zh/games/samurai/daily" />
            <script type="application/ld+json">{"@type":"Article"}</script>
          </head>
          <body>
            <h1>每日武士数独</h1>
            <p>${"每日题、重叠宫、候选数和归档练习。".repeat(90)}</p>
            <a href="/zh/games/samurai">游戏</a>
            <a href="/zh/games/samurai/archive">归档</a>
          </body>
        </html>
      `,
    );

    expect(result.issues).not.toContain("missing title");
    expect(result.issues).not.toContain("missing description");
  });

  it("uses CJK-aware content length for Chinese pages", () => {
    const result = scoreHtmlPage(
      new URL("https://www.samuraisudoku.net/zh/games/samurai/candidate-notes"),
      `
        <html>
          <head>
            <title>武士数独候选数</title>
            <meta name="description" content="学习武士数独候选数记录、重叠宫同步和卡关复盘，适合困难和极难题。" />
            <link rel="canonical" href="https://www.samuraisudoku.net/zh/games/samurai/candidate-notes" />
            <script type="application/ld+json">{"@type":"Article"}</script>
          </head>
          <body>
            <h1>武士数独候选数</h1>
            <p>${"重叠宫候选数同步、中心网格复查、角落网格传导、卡关恢复。".repeat(42)}</p>
            <a href="/zh/games/samurai">在线武士数独</a>
            <a href="/zh/games/samurai/overlap-boxes">重叠宫</a>
          </body>
        </html>
      `,
    );

    expect(result.breakdown.content).toBeGreaterThanOrEqual(18);
    expect(result.issues).not.toContain("thin content");
  });

  it("maps production sitemap URLs to localhost during local audits", () => {
    const locations = normalizeSitemapLocations(
      [
        "https://www.samuraisudoku.net/en/games/samurai",
        "https://www.samuraisudoku.net/zh/games/samurai?x=1",
      ],
      new URL("http://localhost:3001"),
    );

    expect(locations.map((url) => url.toString())).toEqual([
      "http://localhost:3001/en/games/samurai",
      "http://localhost:3001/zh/games/samurai?x=1",
    ]);
  });
});
