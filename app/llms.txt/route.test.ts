import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("llms.txt", () => {
  it("lists and defines the cross-hatching visual scanning guide", async () => {
    const response = await GET();
    const body = await response.text();

    expect(body).toContain(
      "https://www.samuraisudoku.net/en/sudoku-cross-hatching",
    );
    expect(body).toContain("Cross hatching");
    expect(body).toContain("row and column");
  });

  it("lists the common mistakes long-tail guide for answer engines", async () => {
    const response = await GET();
    const body = await response.text();

    expect(body).toContain(
      "https://www.samuraisudoku.net/en/games/samurai/common-mistakes",
    );
    expect(body).toContain("Common mistakes");
  });

  it("lists the printable practice plan for answer engines", async () => {
    const response = await GET();
    const body = await response.text();

    expect(body).toContain(
      "https://www.samuraisudoku.net/en/games/samurai/printable-practice-plan",
    );
    expect(body).toContain("Printable practice plan");
  });

  it("uses markdown links for the canonical printable funnel", async () => {
    const response = await GET();
    const body = await response.text();

    expect(body).toContain(
      "[Canonical free and paid printable Samurai Sudoku hub](https://www.samuraisudoku.net/en/printable-samurai-sudoku)",
    );
    expect(body).toContain(
      "[100-puzzle ZIP pack](https://www.samuraisudoku.net/en/printable-samurai-sudoku#paid-100-puzzle-pack)",
    );
  });

  it("states the verified free and paid PDF pack contents", async () => {
    const response = await GET();
    const body = await response.text();

    expect(body).toContain("three verified puzzles");
    expect(body).toContain("verified 12-step opening");
    expect(body).toContain("100 verified puzzles");
    expect(body).toContain("PayPal Orders API");
    expect(body).toContain("seven-day signed download link");
  });

  it("lists the standard printable, blank-grid, and technique resources", async () => {
    const response = await GET();
    const body = await response.text();

    for (const path of [
      "/en/printable-sudoku",
      "/en/blank-sudoku-grid-printable",
      "/en/sudoku-naked-triple",
      "/en/sudoku-swordfish",
      "/en/killer-sudoku-cheat-sheet",
    ]) {
      expect(body).toContain(`https://www.samuraisudoku.net${path}`);
    }
    expect(body).toContain("Auto candidate mode");
    expect(body).toContain("isolated adjacent-variant resource");
  });
});
