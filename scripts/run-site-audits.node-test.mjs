import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const runnerUrl = new URL('./run-site-audits.sh', import.meta.url);

test('site audit runner starts Next, waits for sitemap, runs audits, and cleans up', async () => {
  const script = await readFile(runnerUrl, 'utf8');

  assert.match(script, /set -euo pipefail/);
  assert.match(script, /trap .*EXIT/);
  assert.match(script, /pnpm start/);
  assert.match(script, /SITEMAP_URL="\$\{BASE_URL\}\/sitemap\.xml"/);
  assert.match(script, /curl .*"\$\{SITEMAP_URL\}"/);
  assert.match(script, /audit:internal-links/);
  assert.match(script, /audit:page-quality/);
  assert.match(script, /kill .*SERVER_PID/);
});
