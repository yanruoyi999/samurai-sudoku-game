import { afterEach, describe, expect, it } from "vitest";

function createWindow(search = "", hostname = "www.samuraisudoku.net") {
  const store = new Map<string, string>();

  return {
    location: { hostname, search },
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    },
  } as unknown as Window;
}

describe("analytics opt-out", () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it("persists opt-out from the analytics URL parameter", async () => {
    (globalThis as { window?: Window }).window = createWindow("?analytics=off");
    const { ANALYTICS_OPT_OUT_KEY, applyAnalyticsOptOutFromUrl } = await import("./opt-out");

    expect(applyAnalyticsOptOutFromUrl()).toBe(true);
    expect(window.localStorage.getItem(ANALYTICS_OPT_OUT_KEY)).toBe("1");
    expect(window.__samuraiAnalyticsOptOut).toBe(true);
  });

  it("clears opt-out from the analytics URL parameter", async () => {
    const win = createWindow("?analytics=off");
    (globalThis as { window?: Window }).window = win;

    const { ANALYTICS_OPT_OUT_KEY, applyAnalyticsOptOutFromUrl } = await import("./opt-out");
    applyAnalyticsOptOutFromUrl();

    Object.defineProperty(win, "location", {
      value: { search: "?analytics=on" },
    });

    expect(applyAnalyticsOptOutFromUrl()).toBe(false);
    expect(window.localStorage.getItem(ANALYTICS_OPT_OUT_KEY)).toBeNull();
    expect(window.__samuraiAnalyticsOptOut).toBe(false);
  });

  it.each(["localhost", "127.0.0.1", "::1", "samurai.localhost"])(
    "opts out analytics by default on local host %s",
    async (hostname) => {
      (globalThis as { window?: Window }).window = createWindow("", hostname);
      const { applyAnalyticsOptOutFromUrl } = await import("./opt-out");

      expect(applyAnalyticsOptOutFromUrl()).toBe(true);
      expect(window.__samuraiAnalyticsOptOut).toBe(true);
    },
  );

  it("allows an explicit local analytics opt-in for pipeline diagnostics", async () => {
    (globalThis as { window?: Window }).window = createWindow("?analytics=on", "localhost");
    const { applyAnalyticsOptOutFromUrl } = await import("./opt-out");

    expect(applyAnalyticsOptOutFromUrl()).toBe(false);
    expect(window.__samuraiAnalyticsOptOut).toBe(false);
  });

  it("keeps production analytics enabled without an explicit opt-out", async () => {
    (globalThis as { window?: Window }).window = createWindow();
    const { applyAnalyticsOptOutFromUrl } = await import("./opt-out");

    expect(applyAnalyticsOptOutFromUrl()).toBe(false);
  });
});
