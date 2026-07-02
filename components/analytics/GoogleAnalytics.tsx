import { Suspense } from "react";
import Script from "next/script";
import { GA_TRACKING_ID } from "@/lib/gtag";
import { GoogleAnalyticsListener } from "@/components/analytics/GoogleAnalyticsListener";

export function GoogleAnalytics() {
  if (!GA_TRACKING_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', { page_path: window.location.pathname });
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsListener />
      </Suspense>
    </>
  );
}
