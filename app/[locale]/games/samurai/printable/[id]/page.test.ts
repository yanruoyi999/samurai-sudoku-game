import { describe, expect, it } from "vitest";

import * as printablePuzzlePage from "./page";

describe("printable puzzle page prerendering", () => {
  it("does not prebuild every noindex dated printable page", () => {
    expect(Reflect.has(printablePuzzlePage, "generateStaticParams")).toBe(false);
    expect(printablePuzzlePage.dynamicParams).toBe(true);
    expect(printablePuzzlePage.revalidate).toBe(86_400);
  });
});
