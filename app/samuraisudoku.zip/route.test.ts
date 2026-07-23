import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /samuraisudoku.zip", () => {
  it("sends legacy download visits to the paid pack recovery section", async () => {
    const response = await GET(
      new Request("https://www.samuraisudoku.net/samuraisudoku.zip"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://www.samuraisudoku.net/en/printable-samurai-sudoku#paid-100-puzzle-pack",
    );
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
  });

  it("uses the Chinese recovery section when Chinese is preferred", async () => {
    const response = await GET(
      new Request("https://www.samuraisudoku.net/samuraisudoku.zip", {
        headers: { "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8" },
      }),
    );

    expect(response.headers.get("location")).toBe(
      "https://www.samuraisudoku.net/zh/printable-samurai-sudoku#paid-100-puzzle-pack",
    );
  });

  it("forwards legacy signed links to the protected download route", async () => {
    const response = await GET(
      new Request(
        "https://www.samuraisudoku.net/samuraisudoku.zip?token=signed.value",
      ),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://www.samuraisudoku.net/api/download/pdf-pack?token=signed.value",
    );
  });
});
