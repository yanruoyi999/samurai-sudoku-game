const DEFAULT_PDF_PACK_PRICE = "$4.95";
const DEFAULT_PDF_PACK_PRODUCT_NAME = "100 Samurai Sudoku Printable Puzzles";

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

function extractUsdAmount(price: string) {
  const match = price.match(/\d+(?:\.\d{1,2})?/);
  return match?.[0] ?? "";
}
