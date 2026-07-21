import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.stubGlobal("React", React);

import { Cell } from "./Cell";

describe("Cell", () => {
  it("keeps a given clue selectable instead of disabling the button", () => {
    const html = renderToStaticMarkup(
      <Cell
        position={{ row: 0, col: 0 }}
        value={7}
        isInitial
        isSelected
        isHighlighted={false}
        hasConflict={false}
        onClick={() => undefined}
      />,
    );

    expect(html).toContain('aria-label="Row 1, column 1, value 7, given"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toContain("disabled");
  });
});
