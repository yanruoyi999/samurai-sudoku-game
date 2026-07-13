import { afterEach, describe, expect, it, vi } from "vitest";

import { createDownloadToken } from "@/lib/download-token";
import { PDF_PACK_PRODUCT_ID } from "@/lib/paypal-api";
import { GET } from "./route";

const secret = "test-download-secret-that-is-long-enough";

describe("GET /api/download/pdf-pack", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("serves the private paid pack for a valid signed token", async () => {
    vi.stubEnv("PDF_DOWNLOAD_TOKEN_SECRET", secret);
    const token = createDownloadToken(
      {
        orderId: "5O190127TN364715T",
        captureId: "3Y662965014333303",
        productId: PDF_PACK_PRODUCT_ID,
      },
      secret,
    );
    const response = await GET(
      new Request(`http://localhost/api/download/pdf-pack?token=${encodeURIComponent(token)}`),
    );
    const bytes = new Uint8Array(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/zip");
    expect(response.headers.get("content-disposition")).toContain("samurai-sudoku-100-puzzle-pack.zip");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(String.fromCharCode(...bytes.slice(0, 2))).toBe("PK");
  });

  it("rejects invalid tokens without exposing the file", async () => {
    vi.stubEnv("PDF_DOWNLOAD_TOKEN_SECRET", secret);
    const response = await GET(
      new Request("http://localhost/api/download/pdf-pack?token=invalid"),
    );

    expect(response.status).toBe(403);
  });

  it("treats a weak signing secret as unconfigured", async () => {
    vi.stubEnv("PDF_DOWNLOAD_TOKEN_SECRET", "too-short");
    const response = await GET(
      new Request("http://localhost/api/download/pdf-pack?token=invalid"),
    );

    expect(response.status).toBe(503);
  });
});
