import { createHash } from "node:crypto";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { validatePdfPackArtifacts } from "./validate-pdf-packs";

let root = "";

const freeArtifactPaths = {
  a4: "public/downloads/samurai-sudoku-free-3-puzzle-sampler-a4-v20260724.pdf",
  letter: "public/downloads/samurai-sudoku-free-3-puzzle-sampler-letter-v20260724.pdf",
  a4TwoUp: "public/downloads/samurai-sudoku-free-3-puzzle-sampler-a4-2-per-page-v20260724.pdf",
  letterTwoUp: "public/downloads/samurai-sudoku-free-3-puzzle-sampler-letter-2-per-page-v20260724.pdf",
} as const;

afterEach(async () => {
  if (root) await rm(root, { recursive: true, force: true });
  root = "";
});

describe("validatePdfPackArtifacts", () => {
  it("accepts generated files whose size and checksum match the manifest", async () => {
    root = await mkdtemp(join(tmpdir(), "samurai-pdf-pack-"));
    await mkdir(join(root, "private-assets"), { recursive: true });
    await mkdir(join(root, "public", "downloads"), { recursive: true });

    const paid = Buffer.from("PK paid zip artifact");
    const freeA4 = Buffer.from("%PDF free A4 artifact");
    const freeLetter = Buffer.from("%PDF free letter artifact");
    const freeA4TwoUp = Buffer.from("%PDF free A4 two-up artifact");
    const freeLetterTwoUp = Buffer.from("%PDF free letter two-up artifact");
    await writeFile(join(root, "private-assets", "paid.zip"), paid);
    await writeFile(join(root, freeArtifactPaths.a4), freeA4);
    await writeFile(join(root, freeArtifactPaths.letter), freeLetter);
    await writeFile(join(root, freeArtifactPaths.a4TwoUp), freeA4TwoUp);
    await writeFile(join(root, freeArtifactPaths.letterTwoUp), freeLetterTwoUp);

    const artifacts = [
      ["private-assets/paid.zip", paid, "zip"],
      [freeArtifactPaths.a4, freeA4, "pdf"],
      [freeArtifactPaths.letter, freeLetter, "pdf"],
      [freeArtifactPaths.a4TwoUp, freeA4TwoUp, "pdf"],
      [freeArtifactPaths.letterTwoUp, freeLetterTwoUp, "pdf"],
    ].map(([path, content, kind]) => ({
      path,
      kind,
      bytes: (content as Buffer).byteLength,
      sha256: createHash("sha256").update(content as Buffer).digest("hex"),
    }));
    await writeFile(
      join(root, "private-assets", "pdf-pack-manifest.json"),
      JSON.stringify({
        productId: "samurai-sudoku-100-pack-v1",
        paidPuzzleCount: 100,
        freePuzzleCount: 3,
        freeAnswerCount: 2,
        samplerAssetVersion: "20260724",
        expertPreview: {
          id: "2026-07-22",
          paidSequence: 76,
          guidedOpeningSteps: 12,
        },
        artifacts,
      }),
    );

    await expect(validatePdfPackArtifacts(root)).resolves.toMatchObject({
      paidPuzzleCount: 100,
      freePuzzleCount: 3,
    });
  });

  it("rejects a file changed after the manifest was generated", async () => {
    root = await mkdtemp(join(tmpdir(), "samurai-pdf-pack-"));
    await mkdir(join(root, "private-assets"), { recursive: true });
    await mkdir(join(root, "public", "downloads"), { recursive: true });
    const artifactPath = join(root, "private-assets", "paid.zip");
    const freeA4Path = join(root, freeArtifactPaths.a4);
    const freeLetterPath = join(root, freeArtifactPaths.letter);
    const freeA4TwoUpPath = join(root, freeArtifactPaths.a4TwoUp);
    const freeLetterTwoUpPath = join(root, freeArtifactPaths.letterTwoUp);
    await writeFile(artifactPath, "PK original");
    await writeFile(freeA4Path, "%PDF free A4");
    await writeFile(freeLetterPath, "%PDF free letter");
    await writeFile(freeA4TwoUpPath, "%PDF free A4 two-up");
    await writeFile(freeLetterTwoUpPath, "%PDF free letter two-up");
    await writeFile(
      join(root, "private-assets", "pdf-pack-manifest.json"),
      JSON.stringify({
        productId: "samurai-sudoku-100-pack-v1",
        paidPuzzleCount: 100,
        freePuzzleCount: 3,
        freeAnswerCount: 2,
        samplerAssetVersion: "20260724",
        expertPreview: {
          id: "2026-07-22",
          paidSequence: 76,
          guidedOpeningSteps: 12,
        },
        artifacts: [
          {
            path: "private-assets/paid.zip",
            kind: "zip",
            bytes: 11,
            sha256: createHash("sha256").update("PK original").digest("hex"),
          },
          {
            path: freeArtifactPaths.a4,
            kind: "pdf",
            bytes: Buffer.byteLength("%PDF free A4"),
            sha256: createHash("sha256").update("%PDF free A4").digest("hex"),
          },
          {
            path: freeArtifactPaths.letter,
            kind: "pdf",
            bytes: Buffer.byteLength("%PDF free letter"),
            sha256: createHash("sha256").update("%PDF free letter").digest("hex"),
          },
          {
            path: freeArtifactPaths.a4TwoUp,
            kind: "pdf",
            bytes: Buffer.byteLength("%PDF free A4 two-up"),
            sha256: createHash("sha256").update("%PDF free A4 two-up").digest("hex"),
          },
          {
            path: freeArtifactPaths.letterTwoUp,
            kind: "pdf",
            bytes: Buffer.byteLength("%PDF free letter two-up"),
            sha256: createHash("sha256").update("%PDF free letter two-up").digest("hex"),
          },
        ],
      }),
    );
    await writeFile(artifactPath, "PK tampered");

    await expect(validatePdfPackArtifacts(root)).rejects.toThrow(/checksum|size/i);
  });
});
