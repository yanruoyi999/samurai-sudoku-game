export function GET() {
  return new Response('# Add publisher seller line here after the account is approved.\n', {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
