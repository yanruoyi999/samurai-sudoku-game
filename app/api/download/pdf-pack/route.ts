import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { isStrongDownloadTokenSecret, verifyDownloadToken } from "@/lib/download-token";
import {
  PDF_PACK_DOWNLOAD_FILENAME,
  PDF_PACK_PRODUCT_ID,
} from "@/lib/paypal-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const tokenSecret = process.env.PDF_DOWNLOAD_TOKEN_SECRET?.trim() ?? "";
  if (!isStrongDownloadTokenSecret(tokenSecret)) {
    return errorResponse("Automatic download delivery is not configured.", 503);
  }

  const token = new URL(request.url).searchParams.get("token") ?? "";
  try {
    const payload = verifyDownloadToken(token, tokenSecret);
    if (payload.productId !== PDF_PACK_PRODUCT_ID) {
      return errorResponse("This download token is not valid for the requested product.", 403);
    }
  } catch {
    return errorResponse("This download link is invalid or has expired.", 403);
  }

  try {
    const file = await readFile(
      resolve(process.cwd(), "private-assets", PDF_PACK_DOWNLOAD_FILENAME),
    );
    return new Response(new Uint8Array(file), {
      status: 200,
      headers: {
        "Accept-Ranges": "none",
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": `attachment; filename="${PDF_PACK_DOWNLOAD_FILENAME}"`,
        "Content-Length": String(file.byteLength),
        "Content-Type": "application/zip",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch (error) {
    console.error("Paid PDF pack artifact could not be read.", error);
    return errorResponse("The PDF pack is temporarily unavailable.", 503);
  }
}

function errorResponse(message: string, status: number) {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );
}
