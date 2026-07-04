"use client";

import { track } from "@vercel/analytics";
import { isAnalyticsOptedOut } from "@/lib/analytics/opt-out";
import { trackEvent as trackGoogleEvent } from "@/lib/gtag";

type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue | null | undefined>;
type WindowWithClarity = Window & {
  clarity?: (...args: unknown[]) => void;
};

function cleanProperties(properties?: AnalyticsProperties): Record<string, AnalyticsValue> {
  if (!properties) return {};

  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== null && value !== undefined),
  ) as Record<string, AnalyticsValue>;
}

export function trackInteraction(eventName: string, properties?: AnalyticsProperties) {
  if (isAnalyticsOptedOut()) return;

  const cleanedProperties = cleanProperties(properties);

  track(eventName, cleanedProperties);
  trackGoogleEvent(eventName, cleanedProperties);

  if (typeof window !== "undefined") {
    const clarity = (window as WindowWithClarity).clarity;
    if (typeof clarity === "function") {
      clarity("event", eventName);
    }
  }
}
