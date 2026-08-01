import { NextResponse } from "next/server";

import { isTrustedSameOriginRequest } from "@/lib/request-origin";
import {
  PayPalApiError,
  createPayPalOrder,
  createPayPalRecoveryKey,
} from "@/lib/paypal-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isTrustedSameOriginRequest(request)) {
    return noStoreJson({ error: "Cross-origin PayPal requests are not allowed." }, 403);
  }

  try {
    const recoveryKey = createPayPalRecoveryKey();
    const { orderId } = await createPayPalOrder(recoveryKey);
    return noStoreJson({ orderID: orderId, recoveryKey }, 201);
  } catch (error) {
    return payPalErrorResponse(error);
  }
}

function payPalErrorResponse(error: unknown) {
  if (error instanceof PayPalApiError) {
    return noStoreJson({ error: error.message }, error.status);
  }
  console.error("Unexpected PayPal order creation error.", error);
  return noStoreJson({ error: "Unable to create the PayPal order." }, 500);
}

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
