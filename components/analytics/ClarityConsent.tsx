"use client";

import { useEffect, useState } from "react";

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
const clarityProjectId =
  process.env.NEXT_PUBLIC_SUDOKU_CLARITY_PROJECT_ID ||
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ||
  "";

function loadClarity(projectId: string) {
  if (!projectId || window.clarity) return;

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

  const clarity = window.clarity as ClarityFunction | undefined;
  if (typeof clarity === "function") {
    clarity("consent");
  }
}

interface ClarityConsentProps {
  locale: string;
}

export function ClarityConsent({ locale }: ClarityConsentProps) {
  const [choice, setChoice] = useState<string | null>(null);
  const isZh = locale === "zh";

  useEffect(() => {
    if (!clarityProjectId) return;
    const saved = window.localStorage.getItem(storageKey);
    setChoice(saved);
    if (saved === "granted") {
      loadClarity(clarityProjectId);
    }
  }, []);

  if (!clarityProjectId || choice) return null;

  const accept = () => {
    window.localStorage.setItem(storageKey, "granted");
    setChoice("granted");
    loadClarity(clarityProjectId);
  };

  const decline = () => {
    window.localStorage.setItem(storageKey, "denied");
    setChoice("denied");
  };

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-lg border border-border bg-background/95 p-4 text-sm text-foreground shadow-lg backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="leading-relaxed text-muted-foreground">
          {isZh
            ? "我们使用 Microsoft Clarity 分析数独棋盘点击、滚动和加载问题，只在你同意后启用。"
            : "We use Microsoft Clarity to analyze board clicks, scrolls, and loading issues. It only runs after your consent."}{" "}
          <a href={`/${locale}/privacy`} className="font-medium text-primary hover:text-primary/80">
            {isZh ? "隐私政策" : "Privacy policy"}
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={decline}
            className="rounded-md border border-input px-3 py-2 font-medium text-foreground transition hover:bg-accent"
          >
            {isZh ? "暂不" : "Not now"}
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            {isZh ? "同意" : "Allow"}
          </button>
        </div>
      </div>
    </div>
  );
}
