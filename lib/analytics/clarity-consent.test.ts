import { describe, expect, it } from "vitest";

import { getClarityAnalyticsStorage } from "./clarity-consent";

describe("getClarityAnalyticsStorage", () => {
  it("grants analytics storage by default when analytics is not opted out", () => {
    expect(getClarityAnalyticsStorage(false)).toBe("granted");
  });

  it("denies analytics storage when analytics is opted out", () => {
    expect(getClarityAnalyticsStorage(true)).toBe("denied");
  });
});
