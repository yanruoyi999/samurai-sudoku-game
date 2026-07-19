import { describe, expect, it } from "vitest";

import {
  getClarityAnalyticsStorage,
  shouldLoadClarity,
} from "./clarity-consent";

describe("getClarityAnalyticsStorage", () => {
  it("grants analytics storage by default when analytics is not opted out", () => {
    expect(getClarityAnalyticsStorage(false)).toBe("granted");
  });

  it("denies analytics storage when analytics is opted out", () => {
    expect(getClarityAnalyticsStorage(true)).toBe("denied");
  });
});

describe("shouldLoadClarity", () => {
  it("does not load the recorder when analytics is opted out", () => {
    expect(shouldLoadClarity("project-id", true)).toBe(false);
  });

  it("loads only when a project id exists and analytics is enabled", () => {
    expect(shouldLoadClarity("project-id", false)).toBe(true);
    expect(shouldLoadClarity("", false)).toBe(false);
  });
});
