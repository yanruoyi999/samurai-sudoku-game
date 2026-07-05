import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/analytics/events", () => ({
  trackInteraction: vi.fn(),
}));

function createWindow() {
  const store = new Map<string, string>();

  return {
    sessionStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
  } as unknown as Window;
}

describe("trackInteractionOncePerPuzzle", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete (globalThis as { window?: unknown }).window;
  });

  it("tracks only once for the same event and puzzle", async () => {
    (globalThis as { window?: Window }).window = createWindow();
    const { trackInteraction } = await import("@/lib/analytics/events");
    const { trackInteractionOncePerPuzzle } = await import("./once");

    expect(
      trackInteractionOncePerPuzzle("sudoku_first_number_input", "2026-07-05", {
        source: "keyboard",
      }),
    ).toBe(true);
    expect(
      trackInteractionOncePerPuzzle("sudoku_first_number_input", "2026-07-05", {
        source: "number_pad",
      }),
    ).toBe(false);

    expect(trackInteraction).toHaveBeenCalledTimes(1);
    expect(trackInteraction).toHaveBeenCalledWith("sudoku_first_number_input", {
      puzzle_id: "2026-07-05",
      source: "keyboard",
    });
  });
});
