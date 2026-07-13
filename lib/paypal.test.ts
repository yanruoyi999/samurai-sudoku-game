import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildPdfPackCheckoutHref,
  getPdfPackPrice,
  getPdfPackProductName,
  isPaypalCheckoutHref,
} from "./paypal";

describe("PDF pack PayPal checkout", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PDF_PACK_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PRINTABLE_PACK_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PDF_PACK_PRICE", "");
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PRINTABLE_PACK_PRICE", "");
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PAYPAL_ME_USERNAME", "");
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PDF_PACK_PRODUCT_NAME", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds a default PayPal.Me checkout link with the configured price", () => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PAYPAL_ME_USERNAME", "yanruoyi");
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PDF_PACK_PRICE", "$4.95");

    const href = buildPdfPackCheckoutHref("en", "pdf-pack-page");

    expect(href).toBe(
      "https://paypal.me/yanruoyi/4.95USD?utm_source=samurai-sudoku&utm_medium=pdf-pack-page&utm_campaign=printable-pack&locale=en",
    );
    expect(isPaypalCheckoutHref(href)).toBe(true);
  });

  it("keeps an explicit checkout URL but adds campaign and locale parameters", () => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PDF_PACK_URL", "https://www.paypal.com/ncp/payment/ABC123?custom=pack");

    const href = buildPdfPackCheckoutHref("zh", "printable-page");
    const url = new URL(href);

    expect(url.origin + url.pathname).toBe("https://www.paypal.com/ncp/payment/ABC123");
    expect(url.searchParams.get("custom")).toBe("pack");
    expect(url.searchParams.get("utm_source")).toBe("samurai-sudoku");
    expect(url.searchParams.get("utm_medium")).toBe("printable-page");
    expect(url.searchParams.get("utm_campaign")).toBe("printable-pack");
    expect(url.searchParams.get("locale")).toBe("zh");
  });

  it("falls back to the default product and price when env values are absent or malformed", () => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PDF_PACK_PRICE", "pay what you want");

    expect(getPdfPackProductName()).toBe("100 Samurai Sudoku Printable Puzzles");
    expect(getPdfPackPrice()).toBe("$4.95");
    expect(buildPdfPackCheckoutHref("en")).toContain("https://paypal.me/yanruoyi/4.95USD");
  });
});
