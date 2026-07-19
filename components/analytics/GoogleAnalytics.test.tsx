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

  it("does not initialize GA collection on localhost by default", async () => {
    const { getGoogleAnalyticsInitScript } = await import("./GoogleAnalytics");
    const html = getGoogleAnalyticsInitScript("G-TEST");
    const dataLayer: unknown[] = [];
    const fakeWindow = {
      location: { hostname: "localhost", search: "" },
      localStorage: {
        getItem: () => null,
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      dataLayer,
      dispatchEvent: vi.fn(),
    } as unknown as Window;

    new Function("window", "Event", html)(fakeWindow, Event);

    expect(fakeWindow.__samuraiAnalyticsOptOut).toBe(true);
    expect((fakeWindow as unknown as Record<string, unknown>)["ga-disable-G-TEST"]).toBe(true);
    expect(dataLayer).toEqual([]);
  });

  it("sends the initial page view from the Google tag bootstrap", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUDOKU_GA_ID", "G-TEST");
    const { getGoogleAnalyticsInitScript } = await import("./GoogleAnalytics");

    const html = getGoogleAnalyticsInitScript();

    expect(html).toContain("send_page_view: true");
    expect(html).not.toContain("send_page_view: false");
  });

  it("queues one page-view-enabled config call on the production host", async () => {
    const { getGoogleAnalyticsInitScript } = await import("./GoogleAnalytics");
    const html = getGoogleAnalyticsInitScript("G-TEST");
    const dataLayer: unknown[] = [];
    const fakeWindow = {
      location: { hostname: "www.samuraisudoku.net", search: "" },
      localStorage: {
        getItem: () => null,
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      dataLayer,
      dispatchEvent: vi.fn(),
    } as unknown as Window;

    new Function("window", "Event", html)(fakeWindow, Event);

    const queuedCalls = dataLayer.map((entry) => Array.from(entry as ArrayLike<unknown>));
    expect(queuedCalls).toHaveLength(2);
    expect(queuedCalls[0]?.[0]).toBe("js");
    expect(queuedCalls[1]).toEqual(["config", "G-TEST", { send_page_view: true }]);
  });
});
