import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import { PDF_PACK_PRODUCT_ID } from "@/lib/paypal-api";

interface PdfPackArtifact {
  path: string;
  kind: "pdf" | "zip";
  bytes: number;
  sha256: string;
}

interface PdfPackManifest {
  productId: string;
  paidPuzzleCount: number;
  freePuzzleCount: number;
  artifacts: PdfPackArtifact[];
}

export async function validatePdfPackArtifacts(root = process.cwd()): Promise<PdfPackManifest> {
  const manifestPath = resolve(root, "private-assets", "pdf-pack-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as PdfPackManifest;

  if (manifest.productId !== PDF_PACK_PRODUCT_ID) {
    throw new Error(`PDF pack manifest product must be ${PDF_PACK_PRODUCT_ID}.`);
  }
  if (manifest.paidPuzzleCount !== 100 || manifest.freePuzzleCount !== 20) {
    throw new Error("PDF pack manifest must contain 100 paid and 20 free puzzles.");
  }
  if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length < 5) {
    throw new Error("PDF pack manifest must list the paid archive and four free PDFs.");
  }

  const normalizedRoot = `${resolve(root)}${sep}`;
  for (const artifact of manifest.artifacts) {
    const artifactPath = resolve(root, artifact.path);
    if (!artifactPath.startsWith(normalizedRoot)) {
      throw new Error(`PDF pack artifact path escapes the project root: ${artifact.path}`);
    }

    const fileStat = await stat(artifactPath);
    if (!fileStat.isFile() || fileStat.size !== artifact.bytes) {
      throw new Error(`PDF pack artifact size mismatch: ${artifact.path}`);
    }

    const content = await readFile(artifactPath);
    const expectedMagic = artifact.kind === "pdf" ? "%PDF" : "PK";
    if (!content.subarray(0, expectedMagic.length).equals(Buffer.from(expectedMagic))) {
      throw new Error(`PDF pack artifact has an invalid ${artifact.kind} header: ${artifact.path}`);
    }

    const checksum = createHash("sha256").update(content).digest("hex");
    if (checksum !== artifact.sha256) {
      throw new Error(`PDF pack artifact checksum mismatch: ${artifact.path}`);
    }
  }

  return manifest;
}

async function main() {
  const manifest = await validatePdfPackArtifacts();
  console.log(
    `Validated ${manifest.artifacts.length} PDF pack artifacts (${manifest.freePuzzleCount} free, ${manifest.paidPuzzleCount} paid puzzles).`,
  );
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(resolve(process.argv[1])).href
  : false;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
