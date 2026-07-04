import { Suspense } from "react";
import Script from "next/script";
import { GA_READY_EVENT, GA_TRACKING_ID } from "@/lib/gtag";
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
          window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);}
          window.gtag('js', new Date());
          window.gtag('config', '${GA_TRACKING_ID}', { send_page_view: false });
          window.__samuraiGaReady = true;
          window.dispatchEvent(new Event('${GA_READY_EVENT}'));
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsListener />
      </Suspense>
    </>
  );
}
