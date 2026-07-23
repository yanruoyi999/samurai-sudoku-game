import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/analytics/events", () => ({
  trackInteraction: vi.fn(),
}));

import { PrintableFreeDownloadLink, PrintablePackOffer } from "./PrintablePackOffer";

describe("PrintablePackOffer", () => {
  it("compares the free and complete packs in one decision frame", () => {
    const html = renderToStaticMarkup(
      <PrintablePackOffer
        checkoutAvailable
        experimentId="printable_hub_test"
        freePdfHref="/downloads/free-pack.pdf"
        locale="en"
        price="$9.90"
      />,
    );

    expect(html).toContain("Free starter pack");
    expect(html).toContain("Complete training library");
    expect(html).toContain("100 puzzles");
    expect(html).toContain("30</strong> daily challenges");
    expect(html).toContain("Buy the complete library ($9.90)");
    expect(html).toContain("3 curated puzzles");
    expect(html).toContain("verified 12-step opening + full answer");
    expect(html).toContain("Download Free Pack (Expert Preview Included)");
    expect(html).toContain("$0.33 a day");
    expect(html).toContain('href="/downloads/free-pack.pdf"');
    expect(html).toContain('href="#paid-100-puzzle-pack"');
    expect(html).not.toContain('role="dialog"');
  });

  it("keeps free downloads as native downloadable links", () => {
    const html = renderToStaticMarkup(
      <PrintableFreeDownloadLink
        href="/downloads/free-pack.pdf"
        eventProperties={{ locale: "en", location: "test" }}
      >
        Download
      </PrintableFreeDownloadLink>,
    );

    expect(html).toContain('href="/downloads/free-pack.pdf"');
    expect(html).toContain('download=""');
  });
});
