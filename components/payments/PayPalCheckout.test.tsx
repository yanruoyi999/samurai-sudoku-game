import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/script", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ src }: { src: string }) => createElement("script", { src }),
  };
});

vi.mock("@/components/analytics/TrackedLink", async () => {
  const { createElement } = await import("react");
  return {
    TrackedLink: ({
      children,
      href,
    }: {
      children: React.ReactNode;
      href: string;
    }) => createElement("a", { href }, children),
  };
});

import { PayPalCheckout } from "./PayPalCheckout";

describe("PayPalCheckout fallback", () => {
  it("routes unavailable checkout to support without exposing PayPal.Me", () => {
    const html = renderToStaticMarkup(
      <PayPalCheckout
        autoDeliveryEnabled={false}
        clientId=""
        locale="en"
        price="$4.95"
        supportHref="/en/contact"
      />,
    );

    expect(html).toContain('href="/en/contact"');
    expect(html).toContain("Checkout temporarily unavailable");
    expect(html.toLowerCase()).not.toContain("paypal.me");
    expect(html).not.toContain("Buy with PayPal");
  });

  it("loads the branded PayPal SDK when automatic checkout is enabled", () => {
    const html = renderToStaticMarkup(
      <PayPalCheckout
        autoDeliveryEnabled
        clientId="test-client-id"
        locale="en"
        price="$4.95"
        supportHref="/en/contact"
      />,
    );

    expect(html).toContain("https://www.paypal.com/sdk/js?client-id=test-client-id");
    expect(html).toContain('aria-label="Secure PayPal checkout"');
    expect(html.toLowerCase()).not.toContain("paypal.me");
    expect(html).not.toContain("Checkout temporarily unavailable");
  });
});
