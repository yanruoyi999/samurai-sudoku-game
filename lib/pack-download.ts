"use client";

import { trackInteraction } from "@/lib/analytics/events";

export type PayPalEnvironment = "sandbox" | "live";

export function trackPackOutcome(
  event: string,
  properties: Record<string, string | number | boolean | null | undefined>,
  environment?: PayPalEnvironment,
) {
  const qa = environment === "sandbox" || window.location.hostname !== "www.samuraisudoku.net" ||
    navigator.webdriver || new URLSearchParams(window.location.search).get("qa") === "1";

  try {
    trackInteraction(qa ? `qa_${event}` : event, {
      ...properties,
      payment_environment: environment,
    });
  } catch {
    // Measurement must never interrupt a download or a PayPal callback.
  }
}

export async function downloadPackFile(url: string, type: "application/pdf" | "application/zip", filename: string) {
  const response = await fetch(url, { credentials: "same-origin", redirect: "error", cache: "no-store" });
  if (response.status !== 200 || response.headers.get("content-type")?.split(";")[0] !== type) {
    throw new Error("File unavailable.");
  }
  const file = await response.blob();
  const length = response.headers.get("content-length");
  if (!file.size || (length && !response.headers.get("content-encoding") && file.size !== Number(length))) {
    throw new Error("File incomplete.");
  }

  const href = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 60_000);
  }
}
