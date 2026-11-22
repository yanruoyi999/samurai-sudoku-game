import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SwordfishTrainer } from "./SwordfishTrainer";

vi.stubGlobal("React", React);

describe("SwordfishTrainer", () => {
  it("renders the example with all controls disabled before hydration", () => {
    const html = renderToStaticMarkup(<SwordfishTrainer locale="en" />);
    const buttons = html.match(/<button\b[^>]*>/g) ?? [];

    expect(html).toContain("Decide whether the fish is valid");
    expect(buttons).toHaveLength(8);
    expect(buttons.every((button) => /\sdisabled=""/.test(button))).toBe(true);
  });
});
