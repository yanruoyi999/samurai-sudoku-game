import { describe, expect, it } from "vitest";

import { createDownloadToken, verifyDownloadToken } from "./download-token";

const secret = "test-download-secret-that-is-long-enough";
const payload = {
  orderId: "5O190127TN364715T",
  captureId: "3Y662965014333303",
  productId: "samurai-sudoku-100-pack-v1",
};

describe("paid pack download tokens", () => {
  it("round-trips a signed token before expiry", () => {
    const token = createDownloadToken(payload, secret, {
      nowSeconds: 1_000,
      ttlSeconds: 300,
    });

    expect(verifyDownloadToken(token, secret, { nowSeconds: 1_299 })).toEqual({
      ...payload,
      exp: 1_300,
    });
  });

  it("rejects tampered and expired tokens", () => {
    const token = createDownloadToken(payload, secret, {
      nowSeconds: 1_000,
      ttlSeconds: 300,
    });
    const [body, signature] = token.split(".");
    const tamperedBody = `${body.slice(0, -1)}${body.endsWith("A") ? "B" : "A"}`;

    expect(() => verifyDownloadToken(`${tamperedBody}.${signature}`, secret, { nowSeconds: 1_100 })).toThrow();
    expect(() => verifyDownloadToken(token, secret, { nowSeconds: 1_301 })).toThrow();
  });

  it("rejects weak signing secrets", () => {
    expect(() => createDownloadToken(payload, "short")).toThrow(/secret/i);
  });
});
