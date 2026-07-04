import { afterEach, describe, expect, it, vi } from "vitest";

function createWindow(search = "") {
  const store = new Map<string, string>();

  return {
    location: { search },
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    },
  } as unknown as Window;
}

describe("gtag analytics helpers", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    delete (globalThis as { window?: unknown }).window;
  });

  it("queues a page view when the GA script is not ready yet", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_GA_ID", "G-TEST");
    (globalThis as { window?: Window }).window = createWindow();

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

  it("does not queue page views after analytics opt-out", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_GA_ID", "G-TEST");
    (globalThis as { window?: Window }).window = createWindow("?analytics=off");

    const { pageview } = await import("./gtag");

    pageview("/en/games/samurai");

    expect(window.dataLayer).toBeUndefined();
    expect((window as unknown as Record<string, boolean>)["ga-disable-G-TEST"]).toBe(true);
  });
});
