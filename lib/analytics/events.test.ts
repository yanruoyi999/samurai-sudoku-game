import { beforeEach, describe, expect, it, vi } from "vitest";

const { googleTrack, isOptedOut, vercelTrack } = vi.hoisted(() => ({
  googleTrack: vi.fn(),
  isOptedOut: vi.fn(() => false),
  vercelTrack: vi.fn(),
}));

vi.mock("@vercel/analytics", () => ({ track: vercelTrack }));
vi.mock("@/lib/analytics/opt-out", () => ({
  isAnalyticsOptedOut: isOptedOut,
}));
vi.mock("@/lib/gtag", () => ({ trackEvent: googleTrack }));

import { trackInteraction } from "./events";

describe("trackInteraction", () => {
  beforeEach(() => {
    googleTrack.mockClear();
    isOptedOut.mockReturnValue(false);
    vercelTrack.mockClear();
  });

  it("keeps source for Vercel and renames it before sending to GA4", () => {
    trackInteraction("sudoku_puzzle_open", {
      puzzle_id: "2026-07-20",
      source: "daily",
    });

    expect(vercelTrack).toHaveBeenCalledOnce();
    expect(vercelTrack).toHaveBeenCalledWith("sudoku_puzzle_open", {
      puzzle_id: "2026-07-20",
      source: "daily",
    });
    expect(googleTrack).toHaveBeenCalledOnce();
    expect(googleTrack).toHaveBeenCalledWith("sudoku_puzzle_open", {
      interaction_source: "daily",
      puzzle_id: "2026-07-20",
    });
    expect(googleTrack.mock.calls[0]?.[1]).not.toHaveProperty("source");
  });

  it("preserves an explicit interaction_source and removes source from GA4", () => {
    trackInteraction("feedback_open", {
      interaction_source: "feedback_button",
      source: "typeform",
    });

    expect(googleTrack).toHaveBeenCalledWith("feedback_open", {
      interaction_source: "feedback_button",
    });
  });
});
