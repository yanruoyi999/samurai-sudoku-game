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
          href: "/en/games/samurai/printable/2026-07-22?paper=a4",
          label: "Open this printable puzzle",
          eventName: "printable_puzzle_open_click",
          eventProperties: { location: "hero_preview" },
        }}
      />,
    );

    expect(html).toContain('href="/en/games/samurai/printable/2026-07-22?paper=a4"');
    expect(html).toContain('aria-label="Open this printable puzzle"');
    expect(html).toContain('aria-label="Puzzle preview"');
  });

  it("remains static when no action is supplied", () => {
    const html = renderToStaticMarkup(
      <MiniSamuraiPreview puzzle={null} ariaLabel="Puzzle preview" />,
    );

    expect(html).not.toContain("<a");
  });
});
