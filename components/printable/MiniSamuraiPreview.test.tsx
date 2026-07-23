import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
      createElement("a", props, children),
  };
});

vi.mock("@/lib/analytics/events", () => ({
  trackInteraction: vi.fn(),
}));

vi.stubGlobal("React", React);

import { MiniSamuraiPreview } from "./MiniSamuraiPreview";

describe("MiniSamuraiPreview", () => {
  it("turns an interactive-looking preview into a tracked destination", () => {
    const html = renderToStaticMarkup(
      <MiniSamuraiPreview
        puzzle={null}
        ariaLabel="Puzzle preview"
        action={{
          href: "/en/printable-samurai-sudoku#free-3-puzzle-pack",
          label: "Open the 3-puzzle sampler",
          eventName: "printable_sampler_details_click",
          eventProperties: { location: "hero_preview" },
        }}
      />,
    );

    expect(html).toContain('href="/en/printable-samurai-sudoku#free-3-puzzle-pack"');
    expect(html).toContain('aria-label="Open the 3-puzzle sampler"');
    expect(html).toContain('aria-label="Puzzle preview"');
  });

  it("remains static when no action is supplied", () => {
    const html = renderToStaticMarkup(
      <MiniSamuraiPreview puzzle={null} ariaLabel="Puzzle preview" />,
    );

    expect(html).not.toContain("<a");
  });
});
