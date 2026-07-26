import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pagePath = "app/[locale]/sudoku-naked-triple/page.tsx";
const trainerPath = "components/sudoku/NakedTripleTrainer.tsx";

describe("Sudoku naked-triple page contract", () => {
  it("owns the complete naked-triple keyword cluster on one canonical page", () => {
    expect(existsSync(pagePath)).toBe(true);
    const source = readFileSync(pagePath, "utf8");

    expect(source).toContain('const PATH = "/sudoku-naked-triple"');
    expect(source).toContain("naked triple sudoku");
    expect(source).toContain("how to find naked triples in sudoku");
    expect(source).toContain("buildLanguageAlternates(PATH)");
  });

  it("uses an interactive union trainer and explains technique boundaries", () => {
    const source = readFileSync(pagePath, "utf8");
    const trainer = readFileSync(trainerPath, "utf8");

    expect(source).toContain("NakedTripleTrainer");
    expect(source).toContain('"@type": "HowTo"');
    expect(source).toContain('"@type": "FAQPage"');
    expect(source).toContain("/sudoku-swordfish");
    expect(source).toContain("/blank-sudoku-grid-printable");
    expect(trainer).toContain("naked_triple_reveal");
    expect(trainer).toContain("candidate union");
  });
});
