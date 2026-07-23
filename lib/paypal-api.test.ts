import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PDF_PACK_PRODUCT_ID,
  buildPayPalOrderPayload,
  capturePayPalOrder,
  createPayPalOrder,
  isPayPalOrdersConfigured,
  parseCompletedPayPalOrder,
} from "./paypal-api";

function completedOrder(overrides: Record<string, unknown> = {}, amount = "9.90") {
  return {
    id: "5O190127TN364715T",
    status: "COMPLETED",
    purchase_units: [
      {
        reference_id: PDF_PACK_PRODUCT_ID,
        custom_id: PDF_PACK_PRODUCT_ID,
        invoice_id: "recovery-key",
        amount: { currency_code: "USD", value: amount },
        payments: {
          captures: [
            {
              id: "3Y662965014333303",
              status: "COMPLETED",
              amount: { currency_code: "USD", value: amount },
            },
          ],
        },
      },
    ],
    ...overrides,
  };
}

describe("PayPal PDF pack orders", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds the server-owned digital product payload", () => {
    const payload = buildPayPalOrderPayload("recovery-key");

    expect(payload.intent).toBe("CAPTURE");
    expect(payload.purchase_units[0]).toMatchObject({
      reference_id: PDF_PACK_PRODUCT_ID,
      custom_id: PDF_PACK_PRODUCT_ID,
      invoice_id: "recovery-key",
      amount: { currency_code: "USD", value: "9.90" },
    });
    expect(payload.purchase_units[0].items?.[0]).toMatchObject({
      category: "DIGITAL_GOODS",
      quantity: "1",
      unit_amount: { currency_code: "USD", value: "9.90" },
    });
    expect(payload).not.toHaveProperty("application_context");
    expect(payload.payment_source.paypal.experience_context).toEqual({
      brand_name: "Samurai Sudoku",
      shipping_preference: "NO_SHIPPING",
      user_action: "PAY_NOW",
    });
  });

  it("enables automatic delivery only with a strong signing secret", () => {
    vi.stubEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID", "client-id");
    vi.stubEnv("PAYPAL_CLIENT_SECRET", "client-secret");
    vi.stubEnv("PDF_DOWNLOAD_TOKEN_SECRET", "too-short");
    expect(isPayPalOrdersConfigured()).toBe(false);

    vi.stubEnv("PDF_DOWNLOAD_TOKEN_SECRET", "a-strong-download-secret-with-32-chars");
    expect(isPayPalOrdersConfigured()).toBe(true);
  });

  it("accepts only a completed matching capture", () => {
    expect(parseCompletedPayPalOrder(completedOrder(), "recovery-key")).toEqual({
      orderId: "5O190127TN364715T",
      captureId: "3Y662965014333303",
      amount: "9.90",
      currency: "USD",
    });
  });

  it("honors a completed order created at the previous price", () => {
    expect(parseCompletedPayPalOrder(completedOrder({}, "4.95"), "recovery-key")).toMatchObject({
      amount: "4.95",
    });
  });

  it.each([
    ["wrong recovery key", completedOrder(), "different-key"],
    [
      "wrong amount",
      completedOrder({
        purchase_units: [
          {
            reference_id: PDF_PACK_PRODUCT_ID,
            custom_id: PDF_PACK_PRODUCT_ID,
            invoice_id: "recovery-key",
            amount: { currency_code: "USD", value: "1.00" },
            payments: {
              captures: [
                {
                  id: "3Y662965014333303",
                  status: "COMPLETED",
                  amount: { currency_code: "USD", value: "1.00" },
                },
              ],
            },
          },
        ],
      }),
      "recovery-key",
    ],
    ["incomplete order", completedOrder({ status: "APPROVED" }), "recovery-key"],
  ])("rejects %s", (_label, order, recoveryKey) => {
    expect(() => parseCompletedPayPalOrder(order, recoveryKey)).toThrow();
  });

  it("creates a PayPal order using server credentials and server pricing", async () => {
    vi.stubEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID", "client-id");
    vi.stubEnv("PAYPAL_CLIENT_SECRET", "client-secret");
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "access-token" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "5O190127TN364715T", status: "CREATED" }), {
          status: 201,
          headers: { "content-type": "application/json" },
        }),
      );

    await expect(createPayPalOrder("recovery-key", fetcher)).resolves.toEqual({
      orderId: "5O190127TN364715T",
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[0][0]).toBe("https://api-m.sandbox.paypal.com/v1/oauth2/token");
    expect(fetcher.mock.calls[1][0]).toBe("https://api-m.sandbox.paypal.com/v2/checkout/orders");
    const orderRequest = fetcher.mock.calls[1][1];
    expect(orderRequest?.method).toBe("POST");
    expect(JSON.parse(String(orderRequest?.body))).toMatchObject(
      buildPayPalOrderPayload("recovery-key"),
    );
  });

  it("recovers an already completed order without capturing twice", async () => {
    vi.stubEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID", "client-id");
    vi.stubEnv("PAYPAL_CLIENT_SECRET", "client-secret");
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(completedOrder()), { status: 200 }),
      );

    await expect(
      capturePayPalOrder("5O190127TN364715T", "recovery-key", fetcher),
    ).resolves.toMatchObject({ captureId: "3Y662965014333303" });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1][1]?.method).toBe("GET");
  });
});
