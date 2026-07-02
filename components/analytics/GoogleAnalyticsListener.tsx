"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { GA_TRACKING_ID, pageview } from "@/lib/gtag";

export function GoogleAnalyticsListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString();

  useEffect(() => {
    if (!GA_TRACKING_ID || !pathname) return;

    const url = search ? `${pathname}?${search}` : pathname;
    pageview(url);
  }, [pathname, search]);

  return null;
}
