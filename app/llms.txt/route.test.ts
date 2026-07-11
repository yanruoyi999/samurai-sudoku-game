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
});
