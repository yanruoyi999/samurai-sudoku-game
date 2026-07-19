import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  PRINTABLE_PUZZLE_OPEN_EVENT,
  PRINT_PUZZLE_EVENT,
} from "./event-names";

const NAVIGATION_FILES = [
  "app/[locale]/printable-samurai-sudoku/page.tsx",
  "app/[locale]/games/samurai/daily/page.tsx",
  "app/[locale]/games/samurai/[id]/page.tsx",
  "app/[locale]/games/samurai/archive/page.tsx",
];

describe("print analytics event contract", () => {
  it("keeps printable-page navigation separate from a real browser print", () => {
    expect(PRINTABLE_PUZZLE_OPEN_EVENT).toBe("printable_puzzle_open_click");
    expect(PRINT_PUZZLE_EVENT).toBe("print_puzzle");
    expect(PRINTABLE_PUZZLE_OPEN_EVENT).not.toBe(PRINT_PUZZLE_EVENT);
  });

  it("uses the navigation event for links that only open printable pages", () => {
    for (const file of NAVIGATION_FILES) {
      const source = readFileSync(resolve(process.cwd(), file), "utf8");

      expect(source).toContain("PRINTABLE_PUZZLE_OPEN_EVENT");
      expect(source).not.toContain('eventName="print_puzzle"');
    }
  });

  it("reserves print_puzzle for the handler that invokes window.print", () => {
    const source = readFileSync(
      resolve(process.cwd(), "components/printable/PrintButton.tsx"),
      "utf8",
    );

    expect(source).toContain("trackInteraction(PRINT_PUZZLE_EVENT");
    expect(source).toContain("window.print()");
  });
});
