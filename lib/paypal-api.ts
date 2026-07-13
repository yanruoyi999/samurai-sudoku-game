import { randomBytes, randomUUID } from "node:crypto";

import { isStrongDownloadTokenSecret } from "@/lib/download-token";
import { getPdfPackPriceAmount, getPdfPackProductName } from "@/lib/paypal";

export const PDF_PACK_PRODUCT_ID = "samurai-sudoku-100-pack-v1";
export const PDF_PACK_DOWNLOAD_FILENAME = "samurai-sudoku-100-puzzle-pack.zip";

const PAYPAL_ORDER_ID_PATTERN = /^[A-Z0-9]{10,32}$/;
const RECOVERY_KEY_PATTERN = /^[a-f0-9]{32}$/;

interface PayPalAmount {
  currency_code: string;
  value: string;
}

interface PayPalCapture {
  id?: string;
  status?: string;
  amount?: PayPalAmount;
}

interface PayPalPurchaseUnit {
  reference_id?: string;
  custom_id?: string;
  invoice_id?: string;
  amount?: PayPalAmount;
  payments?: { captures?: PayPalCapture[] };
}

interface PayPalOrder {
  id?: string;
  status?: string;
  purchase_units?: PayPalPurchaseUnit[];
}

export interface CompletedPayPalOrder {
  orderId: string;
  captureId: string;
  amount: string;
  currency: "USD";
}

type Fetcher = typeof fetch;

export class PayPalApiError extends Error {
  constructor(
    message: string,
    readonly status = 502,
  ) {
    super(message);
    this.name = "PayPalApiError";
  }
}

export function createPayPalRecoveryKey(): string {
  return randomBytes(16).toString("hex");
}

export function isValidPayPalOrderId(orderId: string): boolean {
  return PAYPAL_ORDER_ID_PATTERN.test(orderId);
}

export function isValidRecoveryKey(recoveryKey: string): boolean {
  return RECOVERY_KEY_PATTERN.test(recoveryKey);
}

export function buildPayPalOrderPayload(recoveryKey: string) {
  if (!recoveryKey) throw new Error("A recovery key is required.");

  const price = normalizeUsdAmount(getPdfPackPriceAmount());
  const productName = getPdfPackProductName();

  return {
    intent: "CAPTURE" as const,
    purchase_units: [
      {
        reference_id: PDF_PACK_PRODUCT_ID,
        custom_id: PDF_PACK_PRODUCT_ID,
        invoice_id: recoveryKey,
        description: productName,
        amount: {
          currency_code: "USD" as const,
          value: price,
          breakdown: {
            item_total: { currency_code: "USD" as const, value: price },
          },
        },
        items: [
          {
            name: productName,
            description: "100 printable Samurai Sudoku puzzles with A4 and US Letter PDFs and answer keys.",
            unit_amount: { currency_code: "USD" as const, value: price },
            quantity: "1",
            category: "DIGITAL_GOODS" as const,
          },
        ],
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: "Samurai Sudoku",
          shipping_preference: "NO_SHIPPING" as const,
          user_action: "PAY_NOW" as const,
        },
      },
    },
  };
}

export function parseCompletedPayPalOrder(
  value: unknown,
  recoveryKey: string,
): CompletedPayPalOrder {
  const order = value as PayPalOrder;
  const unit = order?.purchase_units?.[0];
  const capture = unit?.payments?.captures?.find((item) => item.status === "COMPLETED");
  const expectedAmount = normalizeUsdAmount(getPdfPackPriceAmount());

  if (!order?.id || order.status !== "COMPLETED") {
    throw new Error("PayPal order is not completed.");
  }
  if (
    unit?.reference_id !== PDF_PACK_PRODUCT_ID ||
    unit.custom_id !== PDF_PACK_PRODUCT_ID ||
    unit.invoice_id !== recoveryKey
  ) {
    throw new Error("PayPal order does not match this product or recovery key.");
  }
  if (
    unit.amount?.currency_code !== "USD" ||
    normalizeUsdAmount(unit.amount.value) !== expectedAmount ||
    capture?.amount?.currency_code !== "USD" ||
    normalizeUsdAmount(capture.amount.value) !== expectedAmount
  ) {
    throw new Error("PayPal order amount does not match this product.");
  }
  if (!capture.id) {
    throw new Error("PayPal capture is missing.");
  }

  return {
    orderId: order.id,
    captureId: capture.id,
    amount: expectedAmount,
    currency: "USD",
  };
}

export function getPayPalApiBaseUrl(): string {
  return process.env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function isPayPalOrdersConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() &&
      process.env.PAYPAL_CLIENT_SECRET?.trim() &&
      isStrongDownloadTokenSecret(process.env.PDF_DOWNLOAD_TOKEN_SECRET),
  );
}

export function getPayPalClientId(): string {
  return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ?? "";
}

export function createPayPalRequestId(): string {
  return randomUUID();
}

export async function createPayPalOrder(
  recoveryKey: string,
  fetcher: Fetcher = fetch,
): Promise<{ orderId: string }> {
  const accessToken = await getPayPalAccessToken(fetcher);
  const response = await fetcher(`${getPayPalApiBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": createPayPalRequestId(),
    },
    body: JSON.stringify(buildPayPalOrderPayload(recoveryKey)),
  });
  const order = await readPayPalJson(response, "create order");
  const orderId = (order as { id?: unknown }).id;
  if (typeof orderId !== "string" || !isValidPayPalOrderId(orderId)) {
    throw new PayPalApiError("PayPal returned an invalid order ID.");
  }

  return { orderId };
}

export async function capturePayPalOrder(
  orderId: string,
  recoveryKey: string,
  fetcher: Fetcher = fetch,
): Promise<CompletedPayPalOrder> {
  if (!isValidPayPalOrderId(orderId)) {
    throw new PayPalApiError("Invalid PayPal order ID.", 400);
  }
  if (!recoveryKey) {
    throw new PayPalApiError("Invalid PayPal recovery key.", 400);
  }

  const accessToken = await getPayPalAccessToken(fetcher);
  const orderUrl = `${getPayPalApiBaseUrl()}/v2/checkout/orders/${orderId}`;
  const existingResponse = await fetcher(orderUrl, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const existingOrder = await readPayPalJson(existingResponse, "read order");

  if ((existingOrder as PayPalOrder).status === "COMPLETED") {
    return parseCompletedPayPalOrder(existingOrder, recoveryKey);
  }
  if ((existingOrder as PayPalOrder).status !== "APPROVED") {
    throw new PayPalApiError("PayPal order has not been approved.", 409);
  }

  const captureResponse = await fetcher(`${orderUrl}/capture`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": createPayPalRequestId(),
    },
    body: "{}",
  });
  const capturedOrder = await readPayPalJson(captureResponse, "capture order");
  return parseCompletedPayPalOrder(capturedOrder, recoveryKey);
}

async function getPayPalAccessToken(fetcher: Fetcher): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new PayPalApiError("PayPal Orders API is not configured.", 503);
  }

  const response = await fetcher(`${getPayPalApiBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const tokenResponse = await readPayPalJson(response, "authenticate");
  const accessToken = (tokenResponse as { access_token?: unknown }).access_token;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new PayPalApiError("PayPal did not return an access token.");
  }
  return accessToken;
}

async function readPayPalJson(response: Response, action: string): Promise<unknown> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // A generic message prevents upstream HTML or account details from leaking to callers.
  }

  if (!response.ok) {
    const issue = getPayPalIssue(body);
    throw new PayPalApiError(
      issue ? `PayPal could not ${action}: ${issue}.` : `PayPal could not ${action}.`,
      response.status >= 400 && response.status < 500 ? 409 : 502,
    );
  }
  return body;
}

function getPayPalIssue(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const record = body as Record<string, unknown>;
  if (Array.isArray(record.details)) {
    const first = record.details[0] as { issue?: unknown } | undefined;
    if (typeof first?.issue === "string") return first.issue;
  }
  return typeof record.name === "string" ? record.name : "";
}

function normalizeUsdAmount(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("PDF pack price must be a positive USD amount.");
  }
  return amount.toFixed(2);
}
