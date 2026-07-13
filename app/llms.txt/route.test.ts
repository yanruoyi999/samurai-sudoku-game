import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("llms.txt", () => {
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

  it("states the verified free and paid PDF pack contents", async () => {
    const response = await GET();
    const body = await response.text();

    expect(body).toContain("20 verified puzzles");
    expect(body).toContain("100 verified puzzles");
    expect(body).toContain("PayPal Orders API");
    expect(body).toContain("seven-day signed download link");
  });
});
