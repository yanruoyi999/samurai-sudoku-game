import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.join(__dirname, "page.tsx"), "utf8");
const componentSource = fs.readFileSync(
  path.join(process.cwd(), "components/sudoku/KillerSudokuCheatSheet.tsx"),
  "utf8",
);

describe("Killer Sudoku cheat sheet page contract", () => {
  it("publishes one localized canonical resource with structured data", () => {
    expect(source).toContain('const PATH = "/killer-sudoku-cheat-sheet"');
    expect(source).toContain("buildLanguageAlternates(PATH)");
    expect(source).toContain('"@type": "TechArticle"');
    expect(source).toContain('"@type": "HowTo"');
    expect(source).toContain('"@type": "FAQPage"');
    expect(source).toContain("killer sudoku cheat sheet");
  });

  it("provides a calculator, printable reference, tracking, and internal links", () => {
    expect(componentSource).toContain("findKillerSudokuCombinations");
    expect(componentSource).toContain("buildKillerCheatSheet");
    expect(componentSource).toContain("killer_sudoku_combination_calculate");
    expect(componentSource).toContain("killer_sudoku_cheat_sheet_print");
    expect(source).toContain("/printable-sudoku");
    expect(source).toContain("/sudoku-naked-triple");
    expect(source).toContain("/games/samurai/candidate-notes");
    expect(source).toContain("/games/samurai");
  });
});
