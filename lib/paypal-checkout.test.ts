import { describe, expect, it } from "vitest";

import { parsePayPalCaptureResponse, parsePayPalCreateResponse } from "./paypal-checkout";

describe("PayPal checkout client response parsing", () => {
  it("accepts a valid order creation response", () => {
    expect(
      parsePayPalCreateResponse({
        orderID: "5O190127TN364715T",
        recoveryKey: "0123456789abcdef0123456789abcdef",
      }),
    ).toEqual({
      orderID: "5O190127TN364715T",
      recoveryKey: "0123456789abcdef0123456789abcdef",
    });
  });

  it("rejects malformed order creation responses", () => {
    expect(() => parsePayPalCreateResponse({ orderID: "bad" })).toThrow();
  });

  it("accepts only the internal paid pack download route", () => {
    expect(
      parsePayPalCaptureResponse({
        orderID: "5O190127TN364715T",
        captureID: "3Y662965014333303",
        downloadUrl: "/api/download/pdf-pack?token=signed-token",
      }),
    ).toEqual({
      orderID: "5O190127TN364715T",
      captureID: "3Y662965014333303",
      downloadUrl: "/api/download/pdf-pack?token=signed-token",
    });

    expect(() =>
      parsePayPalCaptureResponse({
        orderID: "5O190127TN364715T",
        captureID: "3Y662965014333303",
        downloadUrl: "https://example.com/malicious.zip",
      }),
    ).toThrow();
  });
});
