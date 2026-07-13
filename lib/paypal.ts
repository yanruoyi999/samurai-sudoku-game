const DEFAULT_PDF_PACK_PRICE = "$4.95";
const DEFAULT_PDF_PACK_PRODUCT_NAME = "100 Samurai Sudoku Printable Puzzles";
const DEFAULT_PAYPAL_ME_USERNAME = "yanruoyi";
const FALLBACK_LOCALE = "en";

function getEnvValue(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

export function getPdfPackProductName() {
  return (
    getEnvValue("NEXT_PUBLIC_SUDOKU_PDF_PACK_PRODUCT_NAME") ||
    DEFAULT_PDF_PACK_PRODUCT_NAME
  );
}

export function getPdfPackPrice() {
  const price = getEnvValue(
    "NEXT_PUBLIC_SUDOKU_PDF_PACK_PRICE",
    "NEXT_PUBLIC_SUDOKU_PRINTABLE_PACK_PRICE",
  );
  return price && extractUsdAmount(price) ? price : DEFAULT_PDF_PACK_PRICE;
}

export function getPdfPackPriceAmount() {
  return extractUsdAmount(getPdfPackPrice()) || extractUsdAmount(DEFAULT_PDF_PACK_PRICE) || "4.95";
}

export function getPaypalMeUsername() {
  return (
    getEnvValue("NEXT_PUBLIC_SUDOKU_PAYPAL_ME_USERNAME") ||
    DEFAULT_PAYPAL_ME_USERNAME
  );
}

export function buildPdfPackCheckoutHref(locale = FALLBACK_LOCALE, medium = "pdf-pack-page") {
  const explicitCheckoutUrl = getEnvValue(
    "NEXT_PUBLIC_SUDOKU_PDF_PACK_URL",
    "NEXT_PUBLIC_SUDOKU_PRINTABLE_PACK_URL",
  );

  if (explicitCheckoutUrl) {
    return withTrackingParams(explicitCheckoutUrl, locale, medium) || `/${locale}/support`;
  }

  const username = getPaypalMeUsername();
  if (!username) {
    return `/${locale}/support`;
  }

  const amount = getPdfPackPriceAmount();
  return withTrackingParams(
    `https://paypal.me/${encodeURIComponent(username)}/${amount}USD`,
    locale,
    medium,
  ) || `/${locale}/support`;
}

export function isCheckoutHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function isPaypalCheckoutHref(href: string) {
  try {
    const hostname = new URL(href).hostname.toLowerCase();
    return hostname === "paypal.me" || hostname.endsWith(".paypal.com");
  } catch {
    return false;
  }
}

function withTrackingParams(rawUrl: string, locale: string, medium: string) {
  try {
    const url = new URL(rawUrl);
    url.searchParams.set("utm_source", "samurai-sudoku");
    url.searchParams.set("utm_medium", medium);
    url.searchParams.set("utm_campaign", "printable-pack");
    url.searchParams.set("locale", locale);
    return url.toString();
  } catch {
    return "";
  }
}

function extractUsdAmount(price: string) {
  const match = price.match(/\d+(?:\.\d{1,2})?/);
  return match?.[0] ?? "";
}
