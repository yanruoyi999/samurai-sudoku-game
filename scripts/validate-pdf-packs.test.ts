import { createHash } from "node:crypto";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { validatePdfPackArtifacts } from "./validate-pdf-packs";

let root = "";

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
    await writeFile(join(root, "public", "downloads", "free-a4.pdf"), freeA4);
    await writeFile(join(root, "public", "downloads", "free-letter.pdf"), freeLetter);
    await writeFile(join(root, "public", "downloads", "free-a4-two-up.pdf"), freeA4TwoUp);
    await writeFile(join(root, "public", "downloads", "free-letter-two-up.pdf"), freeLetterTwoUp);

    const artifacts = [
      ["private-assets/paid.zip", paid, "zip"],
      ["public/downloads/free-a4.pdf", freeA4, "pdf"],
      ["public/downloads/free-letter.pdf", freeLetter, "pdf"],
      ["public/downloads/free-a4-two-up.pdf", freeA4TwoUp, "pdf"],
      ["public/downloads/free-letter-two-up.pdf", freeLetterTwoUp, "pdf"],
    ].map(([path, content, kind]) => ({
      path,
      kind,
      bytes: (content as Buffer).byteLength,
      sha256: createHash("sha256").update(content as Buffer).digest("hex"),
    }));
    await writeFile(
      join(root, "private-assets", "pdf-pack-manifest.json"),
      JSON.stringify({ productId: "samurai-sudoku-100-pack-v1", paidPuzzleCount: 100, freePuzzleCount: 20, artifacts }),
    );

    await expect(validatePdfPackArtifacts(root)).resolves.toMatchObject({
      paidPuzzleCount: 100,
      freePuzzleCount: 20,
    });
  });

  it("rejects a file changed after the manifest was generated", async () => {
    root = await mkdtemp(join(tmpdir(), "samurai-pdf-pack-"));
    await mkdir(join(root, "private-assets"), { recursive: true });
    await mkdir(join(root, "public", "downloads"), { recursive: true });
    const artifactPath = join(root, "private-assets", "paid.zip");
    const freeA4Path = join(root, "public", "downloads", "free-a4.pdf");
    const freeLetterPath = join(root, "public", "downloads", "free-letter.pdf");
    const freeA4TwoUpPath = join(root, "public", "downloads", "free-a4-two-up.pdf");
    const freeLetterTwoUpPath = join(root, "public", "downloads", "free-letter-two-up.pdf");
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
        freePuzzleCount: 20,
        artifacts: [
          {
            path: "private-assets/paid.zip",
            kind: "zip",
            bytes: 11,
            sha256: createHash("sha256").update("PK original").digest("hex"),
          },
          {
            path: "public/downloads/free-a4.pdf",
            kind: "pdf",
            bytes: Buffer.byteLength("%PDF free A4"),
            sha256: createHash("sha256").update("%PDF free A4").digest("hex"),
          },
          {
            path: "public/downloads/free-letter.pdf",
            kind: "pdf",
            bytes: Buffer.byteLength("%PDF free letter"),
            sha256: createHash("sha256").update("%PDF free letter").digest("hex"),
          },
          {
            path: "public/downloads/free-a4-two-up.pdf",
            kind: "pdf",
            bytes: Buffer.byteLength("%PDF free A4 two-up"),
            sha256: createHash("sha256").update("%PDF free A4 two-up").digest("hex"),
          },
          {
            path: "public/downloads/free-letter-two-up.pdf",
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
