import Script from "next/script";
import { ANALYTICS_OPT_OUT_KEY } from "@/lib/analytics/config";
import { GA_READY_EVENT, GA_TRACKING_ID } from "@/lib/gtag-config";

export function getGoogleAnalyticsInitScript(
  trackingId = GA_TRACKING_ID,
  readyEvent = GA_READY_EVENT,
  optOutKey = ANALYTICS_OPT_OUT_KEY,
) {
  const serializedTrackingId = JSON.stringify(trackingId);
  const serializedReadyEvent = JSON.stringify(readyEvent);
  const serializedOptOutKey = JSON.stringify(optOutKey);

  return `
          var trackingId = ${serializedTrackingId};
          var readyEvent = ${serializedReadyEvent};
          var optOutKey = ${serializedOptOutKey};
          var analyticsParams = new URLSearchParams(window.location.search);
          var analyticsValue = analyticsParams.get('analytics') || analyticsParams.get('samurai_analytics');
          var analyticsParamOptOut = null;
          if (analyticsValue) {
            var normalizedAnalyticsValue = analyticsValue.trim().toLowerCase();
            if (['0', 'false', 'no', 'off', 'optout'].indexOf(normalizedAnalyticsValue) >= 0) {
              analyticsParamOptOut = true;
              try { window.localStorage.setItem(optOutKey, '1'); } catch (error) {}
            } else if (['1', 'on', 'yes', 'optin'].indexOf(normalizedAnalyticsValue) >= 0) {
              analyticsParamOptOut = false;
              try { window.localStorage.removeItem(optOutKey); } catch (error) {}
            }
          }
          var analyticsHostname = (window.location.hostname || '').trim().toLowerCase();
          var analyticsLocalHost = analyticsHostname === 'localhost' ||
            analyticsHostname === '127.0.0.1' ||
            analyticsHostname === '::1' ||
            analyticsHostname === '[::1]' ||
            analyticsHostname.endsWith('.localhost');
          var analyticsStoredOptOut = false;
          try { analyticsStoredOptOut = window.localStorage.getItem(optOutKey) === '1'; } catch (error) {}
          var analyticsOptedOut = analyticsParamOptOut === null
            ? analyticsLocalHost || analyticsStoredOptOut
            : analyticsParamOptOut;
          window.__samuraiAnalyticsOptOut = analyticsOptedOut;
          window['ga-disable-' + trackingId] = analyticsOptedOut;
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);}
          if (!analyticsOptedOut) {
            window.gtag('js', new Date());
            window.gtag('config', trackingId, { send_page_view: true });
          }
          window.__samuraiGaReady = true;
          window.dispatchEvent(new Event(readyEvent));
        `;
}

export function GoogleAnalytics() {
  if (!GA_TRACKING_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {getGoogleAnalyticsInitScript()}
      </Script>
    </>
  );
}
