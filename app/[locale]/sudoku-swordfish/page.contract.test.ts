import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pagePath = "app/[locale]/sudoku-swordfish/page.tsx";
const trainerPath = "components/sudoku/SwordfishTrainer.tsx";

describe("Sudoku Swordfish page contract", () => {
  it("owns the Swordfish keyword cluster on one canonical page", () => {
    expect(existsSync(pagePath)).toBe(true);
    const source = readFileSync(pagePath, "utf8");

    expect(source).toContain('const PATH = "/sudoku-swordfish"');
    expect(source).toContain("sudoku swordfish");
    expect(source).toContain("how to identify swordfish pattern in sudoku");
    expect(source).toContain("buildLanguageAlternates(PATH)");
  });

  it("contains interactive validation, structured answers, and relevant links", () => {
    const source = readFileSync(pagePath, "utf8");
    const trainer = readFileSync(trainerPath, "utf8");

    expect(source).toContain("SwordfishTrainer");
    expect(source).toContain('"@type": "HowTo"');
    expect(source).toContain('"@type": "FAQPage"');
    expect(source).toContain("/sudoku-cross-hatching");
    expect(source).toContain("/sudoku-naked-triple");
    expect(trainer).toContain("sudoku_fish_reveal");
    expect(trainer).toContain("Near miss");
  });
});
