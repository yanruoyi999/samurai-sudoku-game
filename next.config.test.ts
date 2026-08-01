import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import puzzleCachePolicy from "./lib/pwa/puzzle-cache-policy.json";

const source = readFileSync("next.config.js", "utf8");

describe("PWA puzzle data caching", () => {
  it("keeps the mutable index separate and refreshes dated puzzle data", () => {
    expect(source).toContain("urlPattern: /\\/puzzles\\/index\\.json$/i");
    expect(source).toMatch(
      /urlPattern: \/\\\/puzzles\\\/index\\\.json\$\/i,[\s\S]*?handler: 'NetworkFirst'/,
    );
    expect(source).toMatch(
      /urlPattern: \/\\\/puzzles\\\/\\d\{4\}\\\/\\d\{4\}-\\d\{2\}-\\d\{2\}\\\.json\$\/i,[\s\S]*?handler: puzzleCachePolicy\.runtimeHandler/,
    );
    expect(puzzleCachePolicy.runtimeHandler).toBe("StaleWhileRevalidate");
    expect(source).not.toContain("urlPattern: /\\/puzzles\\/.*/i");
  });

  it("requires browser revalidation for corrected dated puzzles", () => {
    expect(source).toContain("value: puzzleCachePolicy.httpCacheControl");
    expect(puzzleCachePolicy.httpCacheControl).toContain("max-age=0");
    expect(puzzleCachePolicy.httpCacheControl).not.toContain("immutable");
  });

  it("never caches PayPal or paid download API responses", () => {
    const protectedApiRule = "urlPattern: /\\/api\\/(?:paypal|download)\\/.*/i";
    expect(source).toContain(protectedApiRule);
    const protectedApiIndex = source.indexOf(protectedApiRule);
    const genericApiIndex = source.indexOf("cacheName: 'apis'");
    expect(source.slice(protectedApiIndex)).toMatch(/handler: 'NetworkOnly'/);
    expect(protectedApiIndex).toBeLessThan(genericApiIndex);

    const legacyDownloadRule =
      "urlPattern: /\\/samuraisudoku\\.zip(?:\\?.*)?$/i";
    expect(source).toContain(legacyDownloadRule);
    const legacyDownloadIndex = source.indexOf(legacyDownloadRule);
    const catchAllIndex = source.indexOf("urlPattern: /.*/i");
    expect(source.slice(legacyDownloadIndex)).toMatch(
      /handler: 'NetworkOnly'/,
    );
    expect(legacyDownloadIndex).toBeLessThan(catchAllIndex);
  });

  it("keeps public PDFs out of the service worker and uses versioned immutable URLs", () => {
    expect(source).toContain(
      "publicExcludes: ['!puzzles/**/*.json', '!downloads/**/*.pdf']",
    );
    const publicPdfRule =
      "urlPattern: /\\/downloads\\/.*\\.pdf(?:\\?.*)?$/i";
    expect(source).toContain(publicPdfRule);
    const publicPdfIndex = source.indexOf(publicPdfRule);
    const catchAllIndex = source.indexOf("urlPattern: /.*/i");
    expect(source.slice(publicPdfIndex)).toMatch(
      /handler: 'NetworkOnly'/,
    );
    expect(publicPdfIndex).toBeLessThan(catchAllIndex);
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
