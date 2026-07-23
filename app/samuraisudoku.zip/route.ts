const PAID_PACK_SECTION = "/printable-samurai-sudoku#paid-100-puzzle-pack";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token")?.trim();

  if (token) {
    return noStoreRedirect(
      new URL(
        `/api/download/pdf-pack?token=${encodeURIComponent(token)}`,
        requestUrl.origin,
      ),
    );
  }

  const locale = prefersChinese(request.headers.get("accept-language"))
    ? "zh"
    : "en";
  return noStoreRedirect(
    new URL(`/${locale}${PAID_PACK_SECTION}`, requestUrl.origin),
  );
}

function prefersChinese(acceptLanguage: string | null): boolean {
  return acceptLanguage?.trim().toLowerCase().startsWith("zh") ?? false;
}

function noStoreRedirect(target: URL) {
  return new Response(null, {
    status: 307,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Location: target.toString(),
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
