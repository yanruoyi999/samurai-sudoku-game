import { describe, expect, it } from "vitest";

import * as printablePuzzlePage from "./page";

describe("legacy printable puzzle route", () => {
  it("keeps the redirect dynamic instead of prebuilding dated pages", () => {
    expect(Reflect.has(printablePuzzlePage, "generateStaticParams")).toBe(false);
    expect(printablePuzzlePage.default).toBeTypeOf("function");
  });
});
