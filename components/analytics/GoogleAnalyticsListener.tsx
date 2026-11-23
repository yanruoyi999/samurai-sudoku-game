"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  applyAnalyticsOptOutFromUrl,
  setGoogleAnalyticsDisabled,
} from "@/lib/analytics/opt-out";
import { GA_TRACKING_ID } from "@/lib/gtag-config";

export function GoogleAnalyticsListener() {
  const search = useSearchParams()?.toString();

  useEffect(() => {
    if (!GA_TRACKING_ID) return;
    setGoogleAnalyticsDisabled(GA_TRACKING_ID, applyAnalyticsOptOutFromUrl());
  }, [search]);

  return null;
}
