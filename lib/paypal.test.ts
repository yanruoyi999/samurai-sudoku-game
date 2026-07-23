import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getPdfPackPrice,
  getPdfPackPriceAmount,
  getPdfPackProductName,
} from "./paypal";

describe("PDF pack PayPal checkout", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PDF_PACK_PRICE", "");
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PRINTABLE_PACK_PRICE", "");
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PDF_PACK_PRODUCT_NAME", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("normalizes the configured display price for server verification", () => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PDF_PACK_PRICE", "$12.50");

    expect(getPdfPackPrice()).toBe("$12.50");
    expect(getPdfPackPriceAmount()).toBe("12.50");
  });

  it("falls back to the default product and price when env values are absent or malformed", () => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_PDF_PACK_PRICE", "pay what you want");

    expect(getPdfPackProductName()).toBe("100 Samurai Sudoku Printable Puzzles");
    expect(getPdfPackPrice()).toBe("$9.90");
    expect(getPdfPackPriceAmount()).toBe("9.90");
  });
});
