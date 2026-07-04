import { afterEach, describe, expect, it, vi } from "vitest";

describe("gtag analytics helpers", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    delete (globalThis as { window?: unknown }).window;
  });

  it("queues a page view when the GA script is not ready yet", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_GA_ID", "G-TEST");
    (globalThis as { window?: Window }).window = {} as Window;

    const { pageview } = await import("./gtag");

    pageview("/en/games/samurai");

    expect(window.dataLayer).toEqual([
      ["config", "G-TEST", { page_path: "/en/games/samurai" }],
    ]);
    expect(typeof window.gtag).toBe("function");
  });

  it("detects the GA init readiness flag", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_GA_ID", "G-TEST");
    (globalThis as { window?: Window }).window = {
      __samuraiGaReady: true,
    } as Window;

    const { isGoogleAnalyticsReady } = await import("./gtag");

    expect(isGoogleAnalyticsReady()).toBe(true);
  });
});
