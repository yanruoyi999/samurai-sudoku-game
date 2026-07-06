import { afterEach, describe, expect, it, vi } from "vitest";

describe("GoogleAnalytics", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("renders a literal opt-out storage key in the GA init script", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_GA_ID", "G-TEST");
    const { getGoogleAnalyticsInitScript } = await import("./GoogleAnalytics");

    const html = getGoogleAnalyticsInitScript();

    expect(html).toContain("samurai_sudoku_analytics_opt_out");
    expect(html).toContain('var trackingId = "G-TEST"');
    expect(html).toContain("window['ga-disable-' + trackingId]");
    expect(html).not.toContain("Attempted to call");
  });

  it("serializes injected GA script values safely", async () => {
    const { getGoogleAnalyticsInitScript } = await import("./GoogleAnalytics");

    const html = getGoogleAnalyticsInitScript('G-"TEST', "ready'event", "opt'out");

    expect(html).toContain('var trackingId = "G-\\"TEST"');
    expect(html).toContain('var readyEvent = "ready\'event"');
    expect(html).toContain('var optOutKey = "opt\'out"');
  });
});
