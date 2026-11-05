import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("XY-Wing discovery", () => {
  it("is discoverable from the sitemap and two existing tutorial pages", () => {
    for (const file of ["app/sitemap.ts", "app/[locale]/games/samurai/strategy-guide/page.tsx", "app/[locale]/sudoku-naked-triple/page.tsx"]) {
      expect(readFileSync(file, "utf8"), file).toContain("/sudoku-xy-wing");
    }
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import XYWingPage, { generateMetadata } from "./page";

const sees = (a: [number, number], b: [number, number]) =>
  a[0] === b[0] || a[1] === b[1] || (Math.floor((a[0] - 1) / 3) === Math.floor((b[0] - 1) / 3) && Math.floor((a[1] - 1) / 3) === Math.floor((b[1] - 1) / 3));

describe("rendered XY-Wing sketch", () => {
  it("displays a valid two-branch elimination and a one-wing counterexample", async () => {
    const html = renderToStaticMarkup(await XYWingPage({ params: Promise.resolve({ locale: "en" }) }));
    const body = html.match(/<tbody>(.*?)<\/tbody>/)?.[1] ?? "";
    const rows = [...body.matchAll(/<tr>(.*?)<\/tr>/g)].map(m => [...m[1].matchAll(/<(?:th|td)[^>]*>(.*?)<\/(?:th|td)>/g)].map(x => x[1]));
    expect(rows).toHaveLength(5);
    const coords = rows.map(row => { const m = row[0].match(/^r(\d)c(\d)$/); expect(m).not.toBeNull(); return [Number(m![1]), Number(m![2])] as [number, number]; });
    const pairs = rows.slice(0, 3).map(row => [...row[2].matchAll(/\d/g)].map(m => Number(m[0])));
    expect(pairs).toEqual([[2, 7], [2, 9], [7, 9]]);
    const [p, a, b, t, n] = coords;
    expect([sees(p, a), sees(p, b), sees(a, b), sees(t, a), sees(t, b), sees(n, a), sees(n, b)]).toEqual([true, true, false, true, true, false, true]);
    expect(rows[3][2]).toContain("9");
    expect(rows[4][2]).toContain("9");
    const assignments = pairs[0].flatMap(pv => pairs[1].flatMap(av => pairs[2].map(bv => [pv, av, bv]))).filter(([pv,av,bv]) => pv !== av && pv !== bv);
    expect(assignments).toEqual([[2, 9, 7], [2, 9, 9], [7, 2, 9], [7, 9, 9]]);
    expect(assignments.every(([,av,bv]) => av === 9 || bv === 9)).toBe(true);
    expect(assignments.some(([pv,av,bv]) => pv === 2 && av === 9 && bv === 7)).toBe(true);
  });
  it("renders both languages with localized canonical and alternates", async () => {
    for (const locale of ["en", "zh"]) {
      const props = { params: Promise.resolve({ locale }) };
      const html = renderToStaticMarkup(await XYWingPage(props));
      const metadata = await generateMetadata(props);
      expect(html).toContain("r8c8");
      expect(html).toContain("r8c5");
      expect(String(metadata.alternates?.canonical)).toContain(`/${locale}/sudoku-xy-wing`);
      expect(metadata.alternates?.languages).toHaveProperty("en");
      expect(metadata.alternates?.languages).toHaveProperty("zh");
    }
  });
});

it("renders valid localized article structured data that the quality audit recognizes", async () => {
  const { scoreHtmlPage } = await import("@/scripts/page-quality-audit");
  for (const locale of ["en", "zh"]) {
    const html = renderToStaticMarkup(await XYWingPage({ params: Promise.resolve({ locale }) }));
    const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)];
    expect(scripts.length).toBeGreaterThan(0);
    const schemas = scripts.map(match => JSON.parse(match[1]));
    const article = schemas.find(schema => schema["@type"] === "TechArticle");
    expect(article?.mainEntityOfPage).toMatch(new RegExp(`/${locale}/sudoku-xy-wing$`));
    expect(article?.inLanguage).toBe(locale === "zh" ? "zh-CN" : "en-US");
    expect(scoreHtmlPage(new URL(`https://example.com/${locale}/sudoku-xy-wing`), html).issues).not.toContain("missing structured data");
  }
});
