export type ClarityAnalyticsStorage = "granted" | "denied";

export function getClarityAnalyticsStorage(
  analyticsOptedOut: boolean,
): ClarityAnalyticsStorage {
  return analyticsOptedOut ? "denied" : "granted";
}

export function shouldLoadClarity(
  projectId: string,
  analyticsOptedOut: boolean,
): boolean {
  return Boolean(projectId) && !analyticsOptedOut;
}
