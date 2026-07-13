import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

describe("POST /api/paypal/orders", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("creates an order and returns a private recovery key", async () => {
    vi.stubEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID", "client-id");
    vi.stubEnv("PAYPAL_CLIENT_SECRET", "client-secret");
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ id: "5O190127TN364715T" }), { status: 201 }),
        ),
    );

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(body.orderID).toBe("5O190127TN364715T");
    expect(body.recoveryKey).toMatch(/^[a-f0-9]{32}$/);
  });
});
