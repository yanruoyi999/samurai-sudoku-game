export type ClarityAnalyticsStorage = "granted" | "denied";

export function getClarityAnalyticsStorage(
  analyticsOptedOut: boolean,
): ClarityAnalyticsStorage {
  return analyticsOptedOut ? "denied" : "granted";
}
