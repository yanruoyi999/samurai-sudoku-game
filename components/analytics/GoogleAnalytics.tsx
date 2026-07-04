import { Suspense } from "react";
import Script from "next/script";
import { ANALYTICS_OPT_OUT_KEY } from "@/lib/analytics/opt-out";
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
          var analyticsParams = new URLSearchParams(window.location.search);
          var analyticsValue = analyticsParams.get('analytics') || analyticsParams.get('samurai_analytics');
          if (analyticsValue) {
            var normalizedAnalyticsValue = analyticsValue.trim().toLowerCase();
            if (['0', 'false', 'no', 'off', 'optout'].indexOf(normalizedAnalyticsValue) >= 0) {
              window.localStorage.setItem('${ANALYTICS_OPT_OUT_KEY}', '1');
            } else if (['1', 'on', 'yes', 'optin'].indexOf(normalizedAnalyticsValue) >= 0) {
              window.localStorage.removeItem('${ANALYTICS_OPT_OUT_KEY}');
            }
          }
          var analyticsOptedOut = window.localStorage.getItem('${ANALYTICS_OPT_OUT_KEY}') === '1';
          window.__samuraiAnalyticsOptOut = analyticsOptedOut;
          window['ga-disable-${GA_TRACKING_ID}'] = analyticsOptedOut;
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);}
          if (!analyticsOptedOut) {
            window.gtag('js', new Date());
            window.gtag('config', '${GA_TRACKING_ID}', { send_page_view: false });
          }
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
