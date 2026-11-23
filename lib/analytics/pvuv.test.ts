import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hasPageCountPermission,
  reportPageCount,
  setPageCountPermission,
} from './pvuv';

const host = 'www.samuraisudoku.net';
const path = '/en/games/samurai';
const store = new Map<string, string>();
const request = vi.fn().mockResolvedValue({});
function visit(url: string) {
  Object.assign(window, { location: new URL(url) });
}
function count() {
  return reportPageCount(window.location.pathname);
}

describe('opt-in page counts', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubGlobal('window', {});
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('document', { querySelector: () => null });
    vi.stubGlobal('fetch', request);
    store.clear();
    request.mockClear();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    };
    vi.stubGlobal('localStorage', storage);
    Object.assign(window, { localStorage: storage });
    visit('https://' + host + path);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });
  it('sends a real public page with only five documented fields after explicit consent', () => {
    expect(count()).toBe(false);
    expect(store.size).toBe(0);
    setPageCountPermission(true);
    expect(count()).toBe(true);
    expect(request).toHaveBeenCalledOnce();
    const [url, options] = request.mock.calls[0];
    expect(url).toBe('https://in.pvuv.ai/in');
    expect(options).toMatchObject({
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
    });
    const data = JSON.parse(options.body);
    expect(data).toEqual({
      s: '2NFAnFtq',
      e: 'pageview',
      u: 'https://' + host + path,
      vid: expect.any(String),
      sid: expect.any(String),
    });
    expect(data.vid).not.toEqual(data.sid);
    setPageCountPermission(false);
    expect(store.size).toBe(0);
    expect(count()).toBe(false);
  });
  it.each(['?token=secret', '#secret', '?qa=1', '?q=private'])(
    'skips query and fragment URLs %s',
    (suffix) => {
      setPageCountPermission(true);
      visit('https://' + host + path + suffix);
      expect(count()).toBe(false);
      expect(request).not.toHaveBeenCalled();
    },
  );
  it.each([
    '/admin',
    '/en/search',
    '/en/unknown-token',
    '/api/download/secret',
    '/en/support',
    '/en/games/samurai/pdf',
    '/en/games/saved',
  ])('never sends %s', (pathname) => {
    setPageCountPermission(true);
    visit('https://' + host + pathname);
    expect(count()).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });
  it.each([
    { doNotTrack: '1' },
    { globalPrivacyControl: true },
    { webdriver: true },
  ])('honours browser or QA suppression %o', (flags) => {
    setPageCountPermission(true);
    vi.stubGlobal('navigator', flags);
    expect(count()).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });
  it('fails closed on preview hosts, preview builds, and blocked storage', () => {
    setPageCountPermission(true);
    visit('https://preview.vercel.app' + path);
    expect(count()).toBe(false);
    visit('https://' + host + path);
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');
    expect(count()).toBe(false);
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('denied');
      },
    });
    expect(hasPageCountPermission()).toBe(false);
    expect(count()).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });
  it('reuses real IDs, rotates visits after 30 minutes and visitors after 30 days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-01T00:00:00Z'));
    setPageCountPermission(true);
    function ids() {
      expect(count()).toBe(true);
      const data = JSON.parse(request.mock.lastCall![1].body);
      return [data.vid, data.sid];
    }
    const first = ids();
    expect(ids()).toEqual(first);
    vi.advanceTimersByTime(31 * 60000);
    const later = ids();
    expect(later[0]).toBe(first[0]);
    expect(later[1]).not.toBe(first[1]);
    vi.advanceTimersByTime(30 * 86400000);
    expect(ids()[0]).not.toBe(first[0]);
  });
  it('respects the existing Samurai analytics opt-out across tabs and in memory', () => {
    setPageCountPermission(true);
    window.__samuraiAnalyticsOptOut = true;
    expect(count()).toBe(false);
    window.__samuraiAnalyticsOptOut = false;
    localStorage.setItem('samurai_sudoku_analytics_opt_out', '1');
    expect(count()).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });
});
