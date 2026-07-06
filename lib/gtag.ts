import {
  applyAnalyticsOptOutFromUrl,
  isAnalyticsOptedOut,
  setGoogleAnalyticsDisabled,
} from "@/lib/analytics/opt-out";
export { GA_READY_EVENT, GA_TRACKING_ID } from "@/lib/gtag-config";
import { GA_TRACKING_ID } from "@/lib/gtag-config";

type GtagParams = {
  page_path: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __samuraiGaReady?: boolean;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

function ensureGtagQueue() {
  if (!GA_TRACKING_ID || typeof window === "undefined") return;
  const optedOut = applyAnalyticsOptOutFromUrl();
  setGoogleAnalyticsDisabled(GA_TRACKING_ID, optedOut);
  if (optedOut) return;

  window.dataLayer = window.dataLayer || [];

  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  }
}

export const isGoogleAnalyticsReady = () =>
  typeof window !== "undefined" && window.__samuraiGaReady === true;

export const pageview = (url: string) => {
  ensureGtagQueue();
  if (
    !GA_TRACKING_ID ||
    typeof window === "undefined" ||
    typeof window.gtag !== "function" ||
    isAnalyticsOptedOut()
  ) return;

  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  } satisfies GtagParams);
};

export const trackEvent = (action: string, params: EventParams = {}) => {
  ensureGtagQueue();
  if (
    !GA_TRACKING_ID ||
    typeof window === "undefined" ||
    typeof window.gtag !== "function" ||
    isAnalyticsOptedOut()
  ) return;

  window.gtag("event", action, params);
};
