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

import { PrintableSamuraiBoard } from "./PrintableSamuraiBoard";

const emptyBoard = Array.from({ length: 21 }, () => Array<number>(21).fill(0));

describe("PrintableSamuraiBoard", () => {
  it("turns a puzzle preview into a tracked online-play link when requested", () => {
    const html = renderToStaticMarkup(
      <PrintableSamuraiBoard
        board={emptyBoard}
        title="Puzzle"
        playHref="/en/games/samurai/2026-07-10"
        playLabel="Play this puzzle online"
        trackingProperties={{ locale: "en", puzzle_id: "2026-07-10" }}
      />,
    );

    expect(html).toContain('href="/en/games/samurai/2026-07-10"');
    expect(html).toContain('aria-label="Play this puzzle online"');
    expect(html).toContain("Play this puzzle online");
  });

  it("keeps answer boards static", () => {
    const html = renderToStaticMarkup(
      <PrintableSamuraiBoard board={emptyBoard} title="Answer key" isAnswer />,
    );

    expect(html).not.toContain("<a");
  });
});
