import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import { PDF_PACK_PRODUCT_ID } from "@/lib/paypal-api";
import {
  PRINTABLE_STARTER_A4_PDF,
  PRINTABLE_STARTER_A4_TWO_UP_PDF,
  PRINTABLE_STARTER_ASSET_VERSION,
  PRINTABLE_STARTER_LETTER_PDF,
  PRINTABLE_STARTER_LETTER_TWO_UP_PDF,
} from "@/lib/printable-pack";

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
  freeAnswerCount: number;
  samplerAssetVersion: string;
  expertPreview: {
    id: string;
    paidSequence: number;
    guidedOpeningSteps: number;
  };
  artifacts: PdfPackArtifact[];
}

const expectedFreeArtifactPaths = [
  PRINTABLE_STARTER_A4_PDF,
  PRINTABLE_STARTER_LETTER_PDF,
  PRINTABLE_STARTER_A4_TWO_UP_PDF,
  PRINTABLE_STARTER_LETTER_TWO_UP_PDF,
].map((path) => `public${path}`).sort();

export async function validatePdfPackArtifacts(root = process.cwd()): Promise<PdfPackManifest> {
  const manifestPath = resolve(root, "private-assets", "pdf-pack-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as PdfPackManifest;

  if (manifest.productId !== PDF_PACK_PRODUCT_ID) {
    throw new Error(`PDF pack manifest product must be ${PDF_PACK_PRODUCT_ID}.`);
  }
  if (manifest.paidPuzzleCount !== 100 || manifest.freePuzzleCount !== 3) {
    throw new Error("PDF pack manifest must contain 100 paid and 3 free puzzles.");
  }
  if (
    manifest.freeAnswerCount !== 2 ||
    manifest.samplerAssetVersion !== PRINTABLE_STARTER_ASSET_VERSION
  ) {
    throw new Error("PDF pack manifest must contain two free answers and the current sampler asset version.");
  }
  if (
    manifest.expertPreview?.id !== "2026-07-22" ||
    manifest.expertPreview.paidSequence !== 76 ||
    manifest.expertPreview.guidedOpeningSteps !== 12
  ) {
    throw new Error("PDF pack manifest must include the verified Expert preview walkthrough.");
  }
  if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length < 5) {
    throw new Error("PDF pack manifest must list the paid archive and four free PDFs.");
  }
  const actualFreeArtifactPaths = manifest.artifacts
    .filter((artifact) => artifact.kind === "pdf")
    .map((artifact) => artifact.path)
    .sort();
  if (
    actualFreeArtifactPaths.length !== expectedFreeArtifactPaths.length ||
    actualFreeArtifactPaths.some(
      (path, index) => path !== expectedFreeArtifactPaths[index],
    )
  ) {
    throw new Error("PDF pack manifest must use the current versioned free sampler filenames.");
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
