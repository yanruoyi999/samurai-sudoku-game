import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadPackFile, trackPackOutcome } from "./pack-download";
import { trackInteraction } from "./analytics/events";

vi.mock("./analytics/events", () => ({ trackInteraction: vi.fn() }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("pack outcomes", () => {
  it.each([
    ["live", "www.samuraisudoku.net", "", false, "paid_pack_purchase"],
    ["live", "www.samuraisudoku.net", "?qa=1", false, "qa_paid_pack_purchase"],
    ["sandbox", "www.samuraisudoku.net", "", false, "qa_paid_pack_purchase"],
    ["live", "preview.vercel.app", "", false, "qa_paid_pack_purchase"],
    ["live", "www.samuraisudoku.net", "", true, "qa_paid_pack_purchase"],
  ] as const)("separates %s checkout at %s%s (automated = %s)", (environment, hostname, search, webdriver, expected) => {
    vi.stubGlobal("window", { location: { hostname, search } });
    vi.stubGlobal("navigator", { webdriver });
    trackPackOutcome("paid_pack_purchase", { locale: "en" }, environment);
    expect(trackInteraction).toHaveBeenCalledTimes(1);
    expect(trackInteraction).toHaveBeenCalledWith(expected, { locale: "en", payment_environment: environment });
  });

  it.each([
    [403, "application/json", "2"],
    [200, "text/html", "2"],
    [206, "application/zip", "2"],
    [200, "application/zip", "3"],
  ] as const)("rejects an incomplete or unauthorized download (%d, %s, %s)", async (status, type, length) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("PK", {
      status, headers: { "Content-Type": type, "Content-Length": length },
    })));
    await expect(downloadPackFile("/file", "application/zip", "practice.zip")).rejects.toThrow(/File/);
    expect(trackInteraction).not.toHaveBeenCalled();
  });
});
