export const GA_TRACKING_ID =
  process.env.NEXT_PUBLIC_SUDOKU_GA_ID ||
  process.env.NEXT_PUBLIC_SUDOKU_GA4_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ||
  "";

export const GA_READY_EVENT = "samurai-ga-ready";

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
  if (!GA_TRACKING_ID || typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  } satisfies GtagParams);
};

export const trackEvent = (action: string, params: EventParams = {}) => {
  ensureGtagQueue();
  if (!GA_TRACKING_ID || typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", action, params);
};
