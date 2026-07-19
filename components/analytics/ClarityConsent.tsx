"use client";

import { useEffect } from "react";

import {
  applyAnalyticsOptOutFromUrl,
  isAnalyticsOptedOut,
} from "@/lib/analytics/opt-out";
import {
  getClarityAnalyticsStorage,
  shouldLoadClarity,
  type ClarityAnalyticsStorage,
} from "@/lib/analytics/clarity-consent";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

interface QueuedClarityFunction {
  (...args: unknown[]): void;
  q?: unknown[][];
}

const clarityProjectId =
  process.env.NEXT_PUBLIC_SUDOKU_CLARITY_PROJECT_ID ||
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ||
  "";

function setClarityConsent(analyticsStorage: ClarityAnalyticsStorage) {
  const clarity = window.clarity;

  if (typeof clarity === "function") {
    clarity("consentv2", {
      ad_Storage: "denied",
      analytics_Storage: analyticsStorage,
    });
  }
}

function loadClarity(projectId: string, analyticsStorage: ClarityAnalyticsStorage) {
  if (!projectId) return;

  if (!window.clarity) {
    (function initClarity(c: Window, l: Document, r: string, i: string) {
      const queuedClarity = c.clarity as QueuedClarityFunction | undefined;
      c.clarity =
        queuedClarity ||
        function clarityQueue(...args: unknown[]) {
          const clarity = c.clarity as QueuedClarityFunction;
          (clarity.q = clarity.q || []).push(args);
        };
      const script = l.createElement(r) as HTMLScriptElement;
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${i}`;
      const firstScript = l.getElementsByTagName(r)[0];
      firstScript.parentNode?.insertBefore(script, firstScript);
    })(window, document, "script", projectId);
  }

  setClarityConsent(analyticsStorage);
}

export function ClarityConsent() {
  useEffect(() => {
    if (!clarityProjectId) return;
    const optedOut = applyAnalyticsOptOutFromUrl() || isAnalyticsOptedOut();
    const analyticsStorage = getClarityAnalyticsStorage(optedOut);

    if (!shouldLoadClarity(clarityProjectId, optedOut)) {
      setClarityConsent(analyticsStorage);
      return;
    }

    loadClarity(clarityProjectId, analyticsStorage);
  }, []);

  return null;
}
