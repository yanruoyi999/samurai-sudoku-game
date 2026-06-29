"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    clarity?: ClarityFunction;
  }
}

interface ClarityFunction {
  (...args: unknown[]): void;
  q?: unknown[][];
}

const storageKey = "samurai_sudoku_clarity_consent";
type AnalyticsConsent = "granted" | "denied";
const clarityProjectId =
  process.env.NEXT_PUBLIC_SUDOKU_CLARITY_PROJECT_ID ||
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ||
  "";

function setClarityConsent(analyticsStorage: AnalyticsConsent) {
  const clarity = window.clarity;

  if (typeof clarity === "function") {
    clarity("consentv2", {
      ad_Storage: "denied",
      analytics_Storage: analyticsStorage,
    });
  }
}

function loadClarity(projectId: string, analyticsStorage: AnalyticsConsent) {
  if (!projectId) return;

  if (!window.clarity) {
    (function initClarity(c: Window, l: Document, r: string, i: string) {
      c.clarity =
        c.clarity ||
        function clarityQueue(...args: unknown[]) {
          (c.clarity!.q = c.clarity!.q || []).push(args);
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
    const saved = window.localStorage.getItem(storageKey);
    loadClarity(clarityProjectId, saved === "granted" ? "granted" : "denied");
  }, []);

  return null;
}
