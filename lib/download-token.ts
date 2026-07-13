import { createHmac, timingSafeEqual } from "node:crypto";

export const MIN_DOWNLOAD_TOKEN_SECRET_LENGTH = 32;

export interface DownloadTokenPayload {
  orderId: string;
  captureId: string;
  productId: string;
  exp: number;
}

interface DownloadTokenOptions {
  nowSeconds?: number;
  ttlSeconds?: number;
}

interface VerifyDownloadTokenOptions {
  nowSeconds?: number;
}

export function createDownloadToken(
  payload: Omit<DownloadTokenPayload, "exp">,
  secret: string,
  options: DownloadTokenOptions = {},
): string {
  assertStrongSecret(secret);

  const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const ttlSeconds = options.ttlSeconds ?? 7 * 24 * 60 * 60;
  if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
    throw new Error("Download token TTL must be a positive integer.");
  }

  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: nowSeconds + ttlSeconds }),
    "utf8",
  ).toString("base64url");
  const signature = sign(body, secret);
  return `${body}.${signature}`;
}

export function verifyDownloadToken(
  token: string,
  secret: string,
  options: VerifyDownloadTokenOptions = {},
): DownloadTokenPayload {
  assertStrongSecret(secret);

  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra) {
    throw new Error("Invalid download token format.");
  }

  const expectedSignature = sign(body, secret);
  const receivedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid download token signature.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    throw new Error("Invalid download token payload.");
  }

  if (!isDownloadTokenPayload(payload)) {
    throw new Error("Invalid download token payload.");
  }

  const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (payload.exp < nowSeconds) {
    throw new Error("Download token has expired.");
  }

  return payload;
}

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

function assertStrongSecret(secret: string): void {
  if (!isStrongDownloadTokenSecret(secret)) {
    throw new Error(`Download token secret must contain at least ${MIN_DOWNLOAD_TOKEN_SECRET_LENGTH} characters.`);
  }
}

export function isStrongDownloadTokenSecret(secret: string | undefined): boolean {
  return Boolean(secret && secret.trim().length >= MIN_DOWNLOAD_TOKEN_SECRET_LENGTH);
}

function isDownloadTokenPayload(value: unknown): value is DownloadTokenPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.orderId === "string" &&
    payload.orderId.length > 0 &&
    typeof payload.captureId === "string" &&
    payload.captureId.length > 0 &&
    typeof payload.productId === "string" &&
    payload.productId.length > 0 &&
    typeof payload.exp === "number" &&
    Number.isInteger(payload.exp)
  );
}
