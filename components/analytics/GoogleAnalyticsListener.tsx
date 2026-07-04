"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  GA_READY_EVENT,
  GA_TRACKING_ID,
  isGoogleAnalyticsReady,
  pageview,
} from "@/lib/gtag";

export function GoogleAnalyticsListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString();

  useEffect(() => {
    if (!GA_TRACKING_ID || !pathname) return;

    const url = search ? `${pathname}?${search}` : pathname;

    const sendPageview = () => pageview(url);

    if (isGoogleAnalyticsReady()) {
      sendPageview();
      return;
    }

    window.addEventListener(GA_READY_EVENT, sendPageview, { once: true });
    return () => {
      window.removeEventListener(GA_READY_EVENT, sendPageview);
    };
  }, [pathname, search]);

  return null;
}
