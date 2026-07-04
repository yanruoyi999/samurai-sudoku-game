"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { useEffect } from "react";

import {
  applyAnalyticsOptOutFromUrl,
  isAnalyticsOptedOut,
} from "@/lib/analytics/opt-out";

export function VercelAnalytics() {
  useEffect(() => {
    applyAnalyticsOptOutFromUrl();
  }, []);

  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) =>
        isAnalyticsOptedOut() ? null : event
      }
    />
  );
}
