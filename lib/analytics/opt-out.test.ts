import { afterEach, describe, expect, it } from "vitest";

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
});
