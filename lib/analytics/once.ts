import { trackInteraction } from "@/lib/analytics/events";

type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue | null | undefined>;

const trackedKeys = new Set<string>();
const STORAGE_PREFIX = "samurai-analytics-once";

function buildOnceKey(eventName: string, puzzleId: string) {
  return `${STORAGE_PREFIX}:${eventName}:${puzzleId}`;
}

function hasSessionKey(key: string) {
  if (trackedKeys.has(key)) return true;

  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function rememberSessionKey(key: string) {
  trackedKeys.add(key);

  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    // In-memory tracking still prevents duplicate events in this runtime.
  }
}

export function trackInteractionOncePerPuzzle(
  eventName: string,
  puzzleId: string | null | undefined,
  properties?: AnalyticsProperties,
) {
  if (!puzzleId) return false;

  const key = buildOnceKey(eventName, puzzleId);
  if (hasSessionKey(key)) return false;

  rememberSessionKey(key);
  trackInteraction(eventName, {
    ...properties,
    puzzle_id: puzzleId,
  });
  return true;
}
