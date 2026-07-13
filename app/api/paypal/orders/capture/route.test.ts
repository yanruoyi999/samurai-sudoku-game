import { afterEach, describe, expect, it, vi } from "vitest";

import { verifyDownloadToken } from "@/lib/download-token";
import { PDF_PACK_PRODUCT_ID } from "@/lib/paypal-api";
import { POST } from "./route";

const recoveryKey = "0123456789abcdef0123456789abcdef";
const tokenSecret = "test-download-secret-that-is-long-enough";

function request(body: unknown) {
  return new Request("http://localhost/api/paypal/orders/capture", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function completedOrder() {
  return {
    id: "5O190127TN364715T",
    status: "COMPLETED",
    purchase_units: [
      {
        reference_id: PDF_PACK_PRODUCT_ID,
        custom_id: PDF_PACK_PRODUCT_ID,
        invoice_id: recoveryKey,
        amount: { currency_code: "USD", value: "4.95" },
        payments: {
          captures: [
            {
              id: "3Y662965014333303",
              status: "COMPLETED",
              amount: { currency_code: "USD", value: "4.95" },
            },
          ],
        },
      },
    ],
  };
}

describe("POST /api/paypal/orders/capture", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rejects malformed order recovery input without calling PayPal", async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetcher);

    const response = await POST(request({ orderID: "bad", recoveryKey: "bad" }));

    expect(response.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("returns a signed download URL for a completed matching order", async () => {
    vi.stubEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID", "client-id");
    vi.stubEnv("PAYPAL_CLIENT_SECRET", "client-secret");
    vi.stubEnv("PDF_DOWNLOAD_TOKEN_SECRET", tokenSecret);
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(completedOrder()), { status: 200 }),
        ),
    );

    const response = await POST(
      request({ orderID: "5O190127TN364715T", recoveryKey }),
    );
    const body = await response.json();
    const token = new URL(body.downloadUrl, "http://localhost").searchParams.get("token");

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(token).toBeTruthy();
    if (!token) throw new Error("capture response must include a download token");
    expect(verifyDownloadToken(token, tokenSecret)).toMatchObject({
      orderId: "5O190127TN364715T",
      captureId: "3Y662965014333303",
      productId: PDF_PACK_PRODUCT_ID,
    });
  });
});
