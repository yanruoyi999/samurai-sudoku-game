import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const FUNNEL_FILES = [
  "app/[locale]/printable-samurai-sudoku/page.tsx",
  "app/[locale]/games/samurai/daily/page.tsx",
  "app/[locale]/games/samurai/[id]/page.tsx",
  "app/[locale]/games/samurai/archive/page.tsx",
];

describe("print funnel contract", () => {
  it("routes visible paper-solving actions through the three-puzzle sampler", () => {
    for (const file of FUNNEL_FILES) {
      const source = readFileSync(resolve(process.cwd(), file), "utf8");

      expect(source).toContain("PrintableFreeDownloadLink");
      expect(source).toContain("curated_sampler_3");
      expect(source).not.toContain("/games/samurai/printable/${");
      expect(source).not.toContain("window.print()");
    }
  });

  it("redirects legacy single-puzzle print URLs to the canonical sampler", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "app/[locale]/games/samurai/printable/[id]/page.tsx",
      ),
      "utf8",
    );

    expect(source).toContain("permanentRedirect");
    expect(source).toContain("#free-3-puzzle-pack");
  });

  it("does not ship one-click browser print button components", () => {
    expect(
      existsSync(resolve(process.cwd(), "components/printable/PrintButton.tsx")),
    ).toBe(false);
    expect(
      existsSync(resolve(process.cwd(), "components/printable/PrintPackButton.tsx")),
    ).toBe(false);
  });

  it("attributes Expert-preview PDF returns to the paid offer", () => {
    const offerSource = readFileSync(
      resolve(process.cwd(), "components/printable/PrintablePackOffer.tsx"),
      "utf8",
    );
    const generatorSource = readFileSync(
      resolve(process.cwd(), "scripts/generate-pdf-packs.py"),
      "utf8",
    );

    expect(generatorSource).toContain("utm_source=free_pdf");
    expect(generatorSource).toContain("utm_campaign=expert_preview");
    expect(generatorSource).toContain("utm_content=puzzle_3_lock");
    expect(generatorSource).toContain("#paid-100-puzzle-pack");
    expect(offerSource).toContain('query.get("utm_source") !== "free_pdf"');
    expect(offerSource).toContain('"pdf_expert_preview_arrival"');
    expect(offerSource).toContain('location: "expert_preview_pdf"');
    expect(offerSource).toContain("PAID_PACK_ACTIVATION_EVENT");
  });
});
