const PAYPAL_ID_PATTERN = /^[A-Z0-9]{10,32}$/;
const RECOVERY_KEY_PATTERN = /^[a-f0-9]{32}$/;
const INTERNAL_ORIGIN = "https://samuraisudoku.local";

export interface PayPalCreateResponse {
  orderID: string;
  recoveryKey: string;
}

export interface PayPalCaptureResponse {
  orderID: string;
  captureID: string;
  downloadUrl: string;
}

export function parsePayPalCreateResponse(value: unknown): PayPalCreateResponse {
  if (!value || typeof value !== "object") {
    throw new Error("PayPal order response is invalid.");
  }
  const response = value as Record<string, unknown>;
  if (
    typeof response.orderID !== "string" ||
    !PAYPAL_ID_PATTERN.test(response.orderID) ||
    typeof response.recoveryKey !== "string" ||
    !RECOVERY_KEY_PATTERN.test(response.recoveryKey)
  ) {
    throw new Error("PayPal order response is invalid.");
  }
  return { orderID: response.orderID, recoveryKey: response.recoveryKey };
}

export function parsePayPalCaptureResponse(value: unknown): PayPalCaptureResponse {
  if (!value || typeof value !== "object") {
    throw new Error("PayPal capture response is invalid.");
  }
  const response = value as Record<string, unknown>;
  if (
    typeof response.orderID !== "string" ||
    !PAYPAL_ID_PATTERN.test(response.orderID) ||
    typeof response.captureID !== "string" ||
    !PAYPAL_ID_PATTERN.test(response.captureID) ||
    typeof response.downloadUrl !== "string"
  ) {
    throw new Error("PayPal capture response is invalid.");
  }

  const downloadUrl = new URL(response.downloadUrl, INTERNAL_ORIGIN);
  if (
    downloadUrl.origin !== INTERNAL_ORIGIN ||
    downloadUrl.pathname !== "/api/download/pdf-pack" ||
    !downloadUrl.searchParams.get("token")
  ) {
    throw new Error("PayPal capture response contains an invalid download URL.");
  }

  return {
    orderID: response.orderID,
    captureID: response.captureID,
    downloadUrl: response.downloadUrl,
  };
}
