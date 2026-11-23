'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { applyAnalyticsOptOutFromUrl } from '@/lib/analytics/opt-out';
import {
  canCountHere,
  hasPageCountPermission,
  reportPageCount,
  setPageCountPermission,
} from '@/lib/analytics/pvuv';

function PageCountListener() {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = useRef({ key: '', sent: false });
  useEffect(() => {
    if (!pathname) return;
    const countVisiblePage = () => {
      const { pathname: path, search, hash } = window.location;
      const key = path + (search || hash ? '?' : '');
      if (current.current.key !== key) current.current = { key, sent: false };
      if (
        search &&
        (params?.has('analytics') || params?.has('samurai_analytics'))
      )
        applyAnalyticsOptOutFromUrl();
      if (
        !current.current.sent &&
        !search &&
        !hash &&
        document.visibilityState === 'visible'
      ) {
        current.current.sent = reportPageCount(pathname);
      }
    };
    countVisiblePage();
    const navigation = (window as Window & { navigation?: EventTarget })
      .navigation;
    navigation?.addEventListener('currententrychange', countVisiblePage);
    window.addEventListener('hashchange', countVisiblePage);
    window.addEventListener('popstate', countVisiblePage);
    document.addEventListener('visibilitychange', countVisiblePage);
    return () => {
      navigation?.removeEventListener('currententrychange', countVisiblePage);
      window.removeEventListener('hashchange', countVisiblePage);
      window.removeEventListener('popstate', countVisiblePage);
      document.removeEventListener('visibilitychange', countVisiblePage);
    };
  }, [pathname, params]);
  return null;
}

export function PvuvPageCount() {
  return (
    <Suspense fallback={null}>
      <PageCountListener />
    </Suspense>
  );
}

export function PageCountPreference({ isZh }: { isZh: boolean }) {
  const [allowed, setAllowed] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const update = () => {
      setAllowed(hasPageCountPermission());
      setAvailable(canCountHere());
    };
    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);
  return (
    <div className="mt-3 space-y-2">
      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={allowed}
          disabled={!available && !allowed}
          onChange={(e) => {
            try {
              setPageCountPermission(e.target.checked);
              setAllowed(hasPageCountPermission());
              setError(false);
            } catch {
              setError(true);
            }
          }}
        />
        {isZh ? '允许 PVUV 页面访问统计' : 'Allow PVUV page counts'}
      </label>
      {available === false && (
        <p>
          {isZh
            ? '当前浏览环境已停用 PVUV 统计。'
            : 'PVUV counting is disabled in this browsing context.'}
        </p>
      )}
      {error && (
        <p role="status">
          {isZh
            ? '浏览器未能保存此设置。'
            : 'The browser could not save this setting.'}
        </p>
      )}
    </div>
  );
}
