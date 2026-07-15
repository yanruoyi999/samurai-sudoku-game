import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
      createElement("a", { ...props, "data-next-link": "true" }, children),
  };
});

vi.mock("@/lib/analytics/events", () => ({
  trackInteraction: vi.fn(),
}));

vi.stubGlobal("React", React);

import { TrackedLink } from "./TrackedLink";

describe("TrackedLink", () => {
  it("renders downloads as native anchors so Next.js does not prefetch them as routes", () => {
    const html = renderToStaticMarkup(
      <TrackedLink href="/downloads/starter.pdf" eventName="download_free_pdf" download>
        Download PDF
      </TrackedLink>,
    );

    expect(html).toContain('href="/downloads/starter.pdf"');
    expect(html).toContain('download=""');
    expect(html).not.toContain("data-next-link");
  });

  it("keeps internal page navigation on Next.js Link", () => {
    const html = renderToStaticMarkup(
      <TrackedLink href="/en/games/samurai" eventName="play_online_click">
        Play online
      </TrackedLink>,
    );

    expect(html).toContain('data-next-link="true"');
  });
});
