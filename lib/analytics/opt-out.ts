"use client";

export const ANALYTICS_OPT_OUT_KEY = "samurai_sudoku_analytics_opt_out";
export const ANALYTICS_OPT_OUT_VALUE = "1";

declare global {
  interface Window {
    __samuraiAnalyticsOptOut?: boolean;
  }
}

const OPT_OUT_VALUES = new Set(["0", "false", "no", "off", "optout"]);
const OPT_IN_VALUES = new Set(["1", "on", "yes", "optin"]);

function readAnalyticsParam(search: string): boolean | null {
  const params = new URLSearchParams(search);
  const value = params.get("analytics") ?? params.get("samurai_analytics");
  if (!value) return null;

  const normalized = value.trim().toLowerCase();
  if (OPT_OUT_VALUES.has(normalized)) return true;
  if (OPT_IN_VALUES.has(normalized)) return false;

  return null;
}

function readStoredOptOut(): boolean {
  try {
    return window.localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === ANALYTICS_OPT_OUT_VALUE;
  } catch {
    return false;
  }
}

function writeStoredOptOut(optedOut: boolean) {
  try {
    if (optedOut) {
      window.localStorage.setItem(ANALYTICS_OPT_OUT_KEY, ANALYTICS_OPT_OUT_VALUE);
    } else {
      window.localStorage.removeItem(ANALYTICS_OPT_OUT_KEY);
    }
  } catch {
    // Ignore storage failures; the in-memory flag below still protects this page load.
  }
}

export function applyAnalyticsOptOutFromUrl(): boolean {
  if (typeof window === "undefined") return false;

  const paramOptOut = readAnalyticsParam(window.location.search);
  if (paramOptOut !== null) {
    writeStoredOptOut(paramOptOut);
    window.__samuraiAnalyticsOptOut = paramOptOut;
    return paramOptOut;
  }

  const storedOptOut = readStoredOptOut();
  window.__samuraiAnalyticsOptOut = storedOptOut;
  return storedOptOut;
}

export function isAnalyticsOptedOut(): boolean {
  if (typeof window === "undefined") return false;

  if (typeof window.__samuraiAnalyticsOptOut === "boolean") {
    return window.__samuraiAnalyticsOptOut;
  }

  return applyAnalyticsOptOutFromUrl();
}

export function setGoogleAnalyticsDisabled(measurementId: string, disabled: boolean) {
  if (typeof window === "undefined" || !measurementId) return;
  (window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] = disabled;
}
