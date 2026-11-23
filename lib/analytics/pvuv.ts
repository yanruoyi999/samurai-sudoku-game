import {
  isAnalyticsOptedOut,
  ANALYTICS_OPT_OUT_KEY,
  ANALYTICS_OPT_OUT_VALUE,
} from '@/lib/analytics/opt-out';
// PVUV's documented browser protocol: github.com/qiayue/pvuv.ai/blob/main/PROJECT_PLAN.md#5-ingest-endpoint-in
const endpoint = 'https://in.pvuv.ai/in';
const preference = 'pvuv-permission-v1';
const visitorKey = 'pvuv-visitor-v1';
const sessionKey = 'pvuv-session-v1';
const publicPages = new Set([
  '/',
  '/16x16-sudoku',
  '/diagonal-sudoku',
  '/games/minesweeper',
  '/games/samurai',
  '/games/samurai/archive',
  '/games/samurai/beginners',
  '/games/samurai/candidate-notes',
  '/games/samurai/choose-difficulty',
  '/games/samurai/common-mistakes',
  '/games/samurai/daily',
  '/games/samurai/difficulty-guide',
  '/games/samurai/evil-solving-path',
  '/games/samurai/evil-stuck-after-two-grids',
  '/games/samurai/first-move-strategy',
  '/games/samurai/how-to-play',
  '/games/samurai/overlap-boxes',
  '/games/samurai/paper-practice',
  '/games/samurai/solving-tips',
  '/games/samurai/strategy-guide',
  '/games/samurai/what-is-samurai-sudoku',
  '/jigsaw-sudoku',
  '/killer-sudoku',
  '/killer-sudoku-cheat-sheet',
  '/meowdoku-rules',
  '/star-battle-puzzle',
  '/sudoku-cross-hatching',
  '/sudoku-generator',
  '/sudoku-hidden-pairs',
  '/sudoku-naked-triple',
  '/sudoku-pronunciation',
  '/sudoku-skyscraper',
  '/sudoku-swordfish',
  '/sudoku-x-wing',
  '/sudoku-xy-wing',
  '/suguru-puzzle',
  '/train-tracks-puzzle',
]);

export function hasPageCountPermission(): boolean {
  try {
    return localStorage.getItem(preference) === 'yes';
  } catch {
    return false;
  }
}

export function setPageCountPermission(allowed: boolean) {
  if (allowed) {
    localStorage.setItem(preference, 'yes');
  } else {
    localStorage.removeItem(preference);
    localStorage.removeItem(visitorKey);
    localStorage.removeItem(sessionKey);
  }
}

export function canCountHere() {
  if (
    window.top !== window.self ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
  )
    return false;
  if (
    process.env.NODE_ENV !== 'production' ||
    window.location.origin !== 'https://www.samuraisudoku.net' ||
    isAnalyticsOptedOut()
  )
    return false;
  try {
    if (localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === ANALYTICS_OPT_OUT_VALUE)
      return false;
  } catch {
    return false;
  }
  const nav = navigator as Navigator & {
    globalPrivacyControl?: boolean;
    msDoNotTrack?: string;
  };
  return (
    !nav.webdriver &&
    !nav.globalPrivacyControl &&
    ![
      nav.doNotTrack,
      nav.msDoNotTrack,
      (window as Window & { doNotTrack?: string }).doNotTrack,
    ].some((v) => v === '1' || v === 'yes')
  );
}

function publicPath(pathname: string) {
  const match = /^\/(?:en|zh)(\/.*)?$/.exec(pathname);
  return Boolean(match && publicPages.has(match[1] || '/'));
}

// Only locally minted UUIDs may enter an event, even when existing storage is malformed.
function readOrCreateId(key: string, lifetime: number, refresh: boolean) {
  const now = Date.now();
  const [storedId, expiry] = (localStorage.getItem(key) || '').split('|');
  const valid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      storedId,
    ) &&
    Number(expiry) > now &&
    Number(expiry) <= now + lifetime;
  const id = valid ? storedId : crypto.randomUUID();
  if (!valid || refresh) localStorage.setItem(key, id + '|' + (now + lifetime));
  return id;
}

export function reportPageCount(routerPath: string) {
  const { pathname, origin, search, hash } = window.location;
  if (
    routerPath !== pathname ||
    search ||
    hash ||
    !canCountHere() ||
    !hasPageCountPermission() ||
    !publicPath(pathname)
  )
    return false;
  try {
    const vid = readOrCreateId(visitorKey, 30 * 24 * 60 * 60 * 1000, false);
    const sid = readOrCreateId(sessionKey, 30 * 60 * 1000, true);
    void fetch(endpoint, {
      method: 'POST',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
      headers: { 'Content-Type': 'text/plain' },
      keepalive: true,
      body: JSON.stringify({
        s: '2NFAnFtq',
        e: 'pageview',
        u: origin + pathname,
        vid,
        sid,
      }),
    }).catch(() => {});
    return true;
  } catch {
    // Storage restrictions also disable collection.
    return false;
  }
}
