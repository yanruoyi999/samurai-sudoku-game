import { readFileSync } from 'node:fs';
import vm from 'node:vm';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import captured from './fixtures/internal-links-2026-11-03.json';

// Execute the real audit, with only its CLI error handler replaced by an awaitable result.
// Every fetch is an in-memory fixture; this test never crawls a site.
const source = readFileSync(new URL('./audit-internal-links.ts', import.meta.url), 'utf8');
const entry = source.indexOf('\nvoid main().catch');
if (entry < 0) throw new Error('Could not isolate the audit CLI entry point');
const executable = ts.transpileModule(
  source.slice(0, entry) + '\nglobalThis.finished = main().then(() => undefined, error => error.message);',
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } },
).outputText;
const ORIGIN = 'https://fixture.test';

async function auditFixture(paths: string[], extraLinks: string[] = []) {
  const uniquePaths = [...new Set(paths.map((path) => new URL(path, ORIGIN).pathname))];
  const positions = new Map(uniquePaths.map((path, index) => [path, index]));
  const htmlRequests: string[] = [];
  const logs: string[] = [];
  const processFixture = { argv: ['node', 'audit', ORIGIN], env: {}, exitCode: 0 };
  const sandbox = {
    URL,
    process: processFixture,
    console: { log: (message: string) => logs.push(message), error: (message: string) => logs.push(message) },
    fetch: async (value: string | URL) => {
      const url = new URL(value);
      const sitemap = url.pathname === '/sitemap.xml';
      if (!sitemap) htmlRequests.push(url.pathname);
      const index = positions.get(url.pathname) ?? -1;
      // A ring gives every sitemap page two independent inbound sources/outbound targets.
      const links = [uniquePaths[(index + 1) % uniquePaths.length], uniquePaths[(index + 2) % uniquePaths.length]];
      if (url.pathname === uniquePaths[0]) links.push(...extraLinks);
      const html = links.map((path) => `<a href="${path.replaceAll('&', '&amp;')}">Fixture link</a>`).join('');
      return {
        ok: true, status: 200, url: url.href,
        headers: { get: () => sitemap ? 'application/xml' : 'text/html' },
        text: async () => sitemap
          ? `<urlset>${paths.map((path) => `<url><loc>${ORIGIN}${path}</loc></url>`).join('')}</urlset>`
          : html,
      };
    },
    finished: undefined as unknown as Promise<string | undefined>,
  };
  vm.createContext(sandbox);
  vm.runInContext(executable, sandbox);
  const error = await sandbox.finished;
  return { error, exitCode: processFixture.exitCode, htmlRequests, logs };
}
const pages = (count: number) => Array.from({ length: count }, (_, index) => `/en/p${index}`);

function expectCompleted(result: Awaited<ReturnType<typeof auditFixture>>, count: number) {
  expect(result.error).toBeUndefined();
  expect(result.exitCode).toBe(0);
  expect(result.htmlRequests).toHaveLength(count);
  expect(new Set(result.htmlRequests).size).toBe(count);
  expect(result.logs).toContain('All pages passed. Lowest outbound count: 2.');
  expect(result.logs).toContain('All sitemap pages passed. Lowest inbound count: 2.');
}

describe('internal-link audit total capacity', () => {
  it('fully audits the captured 700 sitemap paths plus 614 dated printables', async () => {
    expectCompleted(await auditFixture(captured.paths), 1314);
  });

  it('fully audits the same captured route set without the new bilingual guide', async () => {
    const withoutGuide = captured.paths.filter((path) => !/^\/(en|zh)\/sudoku-x-wing$/.test(path));
    expectCompleted(await auditFixture(withoutGuide), 1312);
  });

  it('accepts exactly 2000 seeded pages without truncation', async () => {
    expectCompleted(await auditFixture(pages(2000)), 2000);
  });

  it('rejects 2001 expanded initial pages before any HTML request', async () => {
    const dated = Array.from({ length: 1000 }, (_, index) =>
      `/en/games/samurai/${new Date(Date.UTC(2020, 0, index + 1)).toISOString().slice(0, 10)}`,
    );
    // 1001 sitemap paths fit alone; the 1000 derived printables take the total to 2001.
    const result = await auditFixture([...dated, '/en/guide']);
    expect(result.error).toBe('Internal-link discovery exceeded the 2000-page safety limit.');
    expect(result.htmlRequests).toEqual([]);
  });

  it('accepts discovery that fills the total capacity to exactly 2000', async () => {
    expectCompleted(await auditFixture(pages(1990), pages(2000).slice(1990)), 2000);
  });

  it('refuses a discovered 2001st page before scheduling it', async () => {
    const result = await auditFixture(pages(1990), pages(2001).slice(1990));
    expect(result.error).toBe('Internal-link discovery exceeded the 2000-page safety limit.');
    expect(result.htmlRequests).toHaveLength(16);
    expect(result.htmlRequests).not.toContain('/en/p2000');
  });

  it('does not charge duplicate query, fragment, relative or repeated paths', async () => {
    const result = await auditFixture([...pages(2000), '/en/p0?mode=one#proof', '/en/p0#practice'], [
      '/en/p1?mode=one#proof', '/en/p1?mode=two', '/en/p1#practice', './p1', '/en/p1',
    ]);
    expectCompleted(result, 2000);
  });

  it('does not add a second copy of an already seeded printable', async () => {
    expectCompleted(await auditFixture([
      '/en/games/samurai/2026-11-03', '/en/games/samurai/printable/2026-11-03', '/en/guide',
    ]), 3);
  });
});
