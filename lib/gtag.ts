export const GA_TRACKING_ID =
  process.env.NEXT_PUBLIC_SUDOKU_GA_ID ||
  process.env.NEXT_PUBLIC_SUDOKU_GA4_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ||
  "";

type GtagParams = {
  page_path: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export const pageview = (url: string) => {
  if (!GA_TRACKING_ID || typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  } satisfies GtagParams);
};

export const trackEvent = (action: string, params: EventParams = {}) => {
  if (!GA_TRACKING_ID || typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", action, params);
};
