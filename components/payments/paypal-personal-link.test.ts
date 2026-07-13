import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const customerFacingFiles = [
  "components/payments/PayPalCheckout.tsx",
  "app/[locale]/games/samurai/pdf/page.tsx",
  "app/[locale]/privacy/page.tsx",
  "app/[locale]/terms/page.tsx",
  "app/llms.txt/route.ts",
];

describe("PayPal customer privacy", () => {
  it.each(customerFacingFiles)("does not expose a PayPal.Me path in %s", (file) => {
    const source = readFileSync(resolve(process.cwd(), file), "utf8");

    expect(source).not.toMatch(/paypal\.me/i);
  });
});
