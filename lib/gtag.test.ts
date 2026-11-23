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

  it("queues a solver event when the GA script has not loaded", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_GA_ID", "G-TEST");
    (globalThis as { window?: Window }).window = createWindow();

    const { trackEvent } = await import("./gtag");

    trackEvent("sudoku_solver_start", { locale: "en" });

    expect(window.dataLayer).toEqual([
      ["event", "sudoku_solver_start", { locale: "en" }],
    ]);
    expect(typeof window.gtag).toBe("function");
  });

  it("does not queue solver events after analytics opt-out", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_GA_ID", "G-TEST");
    (globalThis as { window?: Window }).window = createWindow("?analytics=off");

    const { trackEvent } = await import("./gtag");

    trackEvent("sudoku_solver_finish", { locale: "en", outcome: "solved" });

    expect(window.dataLayer).toBeUndefined();
    expect((window as unknown as Record<string, boolean>)["ga-disable-G-TEST"]).toBe(true);
  });
});
