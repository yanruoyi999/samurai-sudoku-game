const publisherId =
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUBLISHER_ID ||
  process.env.GOOGLE_ADSENSE_PUBLISHER_ID ||
  '';

export function GET() {
  const content = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : '# Add Google AdSense publisher seller line here after the account is approved.\n';

  return new Response(content, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
