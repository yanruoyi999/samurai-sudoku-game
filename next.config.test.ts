import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("next.config.js", "utf8");

describe("PWA puzzle data caching", () => {
  it("does not cache the mutable puzzle index with the dated puzzle CacheFirst rule", () => {
    expect(source).toContain("urlPattern: /\\/puzzles\\/index\\.json$/i");
    expect(source).toMatch(
      /urlPattern: \/\\\/puzzles\\\/index\\\.json\$\/i,[\s\S]*?handler: 'NetworkFirst'/,
    );
    expect(source).toMatch(
      /urlPattern: \/\\\/puzzles\\\/\\d\{4\}\\\/\\d\{4\}-\\d\{2\}-\\d\{2\}\\\.json\$\/i,[\s\S]*?handler: 'CacheFirst'/,
    );
    expect(source).not.toContain("urlPattern: /\\/puzzles\\/.*/i");
  });

  it("never caches PayPal or paid download API responses", () => {
    const protectedApiRule = "urlPattern: /\\/api\\/(?:paypal|download)\\/.*/i";
    expect(source).toContain(protectedApiRule);
    expect(source.slice(source.indexOf(protectedApiRule))).toMatch(/handler: 'NetworkOnly'/);

    const legacyDownloadRule =
      "urlPattern: /\\/samuraisudoku\\.zip(?:\\?.*)?$/i";
    expect(source).toContain(legacyDownloadRule);
    expect(source.slice(source.indexOf(legacyDownloadRule))).toMatch(
      /handler: 'NetworkOnly'/,
    );
  });

  it("keeps public PDFs out of the service worker and uses versioned immutable URLs", () => {
    expect(source).toContain(
      "publicExcludes: ['!puzzles/**/*.json', '!downloads/**/*.pdf']",
    );
    const publicPdfRule =
      "urlPattern: /\\/downloads\\/.*\\.pdf(?:\\?.*)?$/i";
    expect(source).toContain(publicPdfRule);
    expect(source.slice(source.indexOf(publicPdfRule))).toMatch(
      /handler: 'NetworkOnly'/,
    );
    expect(source).toContain("source: '/downloads/:file*.pdf'");
    expect(source).toContain(
      "public, max-age=31536000, immutable",
    );
    expect(source).not.toContain("source: '/api/download/:path*'");
  });

  it("redirects every legacy starter-pack filename to the versioned three-puzzle sampler", () => {
    expect(source).toContain(
      "source: '/downloads/samurai-sudoku-starter-pack-with-solutions-a4.pdf'",
    );
    expect(source).toContain(
      "source: '/downloads/samurai-sudoku-starter-pack-with-solutions-letter.pdf'",
    );
    expect(source).toContain(
      "source: '/downloads/samurai-sudoku-starter-pack-with-solutions-a4-2-per-page.pdf'",
    );
    expect(source).toContain(
      "source: '/downloads/samurai-sudoku-starter-pack-with-solutions-letter-2-per-page.pdf'",
    );
    expect(source).toContain(
      "samurai-sudoku-free-3-puzzle-sampler-a4-v${printableSamplerAssetVersion}.pdf",
    );
    expect(source).toContain(
      "samurai-sudoku-free-3-puzzle-sampler-letter-v${printableSamplerAssetVersion}.pdf",
    );
  });
});
