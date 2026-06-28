import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Fraunces } from "next/font/google";
import { headers } from "next/headers";
import { locales } from "@/i18n";
import { getSiteBaseUrl } from "@/lib/site-url";
import { ClarityConsent } from "@/components/analytics/ClarityConsent";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

const siteBaseUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  applicationName: "Samurai Sudoku",
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    siteName: "Samurai Sudoku",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Samurai Sudoku online puzzle board",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestedLocale = (await headers()).get("x-next-intl-locale");
  const htmlLang = locales.find((locale) => locale === requestedLocale) ?? "en";

  return (
    <html lang={htmlLang} className={fraunces.variable} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f0eadf" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="武士数独" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="font-sans">
        {children}
        <ClarityConsent locale={htmlLang} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
