import { NextResponse } from "next/server";

import { createDownloadToken, isStrongDownloadTokenSecret } from "@/lib/download-token";
import {
  PDF_PACK_PRODUCT_ID,
  PayPalApiError,
  capturePayPalOrder,
  isValidPayPalOrderId,
  isValidRecoveryKey,
} from "@/lib/paypal-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CaptureRequestBody {
  orderID?: unknown;
  recoveryKey?: unknown;
}

export async function POST(request: Request) {
  let body: CaptureRequestBody;
  try {
    body = (await request.json()) as CaptureRequestBody;
  } catch {
    return noStoreJson({ error: "Invalid JSON request." }, 400);
  }

  const orderID = typeof body.orderID === "string" ? body.orderID : "";
  const recoveryKey = typeof body.recoveryKey === "string" ? body.recoveryKey : "";
  if (!isValidPayPalOrderId(orderID) || !isValidRecoveryKey(recoveryKey)) {
    return noStoreJson({ error: "Invalid PayPal order recovery details." }, 400);
  }

  const tokenSecret = process.env.PDF_DOWNLOAD_TOKEN_SECRET?.trim() ?? "";
  if (!isStrongDownloadTokenSecret(tokenSecret)) {
    return noStoreJson({ error: "Automatic download delivery is not configured." }, 503);
  }

  try {
    const completedOrder = await capturePayPalOrder(orderID, recoveryKey);
    const token = createDownloadToken(
      {
        orderId: completedOrder.orderId,
        captureId: completedOrder.captureId,
        productId: PDF_PACK_PRODUCT_ID,
      },
      tokenSecret,
    );

    return noStoreJson(
      {
        orderID: completedOrder.orderId,
        captureID: completedOrder.captureId,
        downloadUrl: `/api/download/pdf-pack?token=${encodeURIComponent(token)}`,
      },
      200,
    );
  } catch (error) {
    if (error instanceof PayPalApiError) {
      return noStoreJson({ error: error.message }, error.status);
    }
    console.error("Unexpected PayPal capture error.", error);
    return noStoreJson({ error: "Unable to verify or capture the PayPal order." }, 500);
  }
}

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
