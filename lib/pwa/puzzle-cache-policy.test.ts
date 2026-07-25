import { describe, expect, it } from 'vitest';

import policy from './puzzle-cache-policy.json';

describe('puzzle cache policy', () => {
  it('revalidates dated puzzle JSON instead of treating it as immutable', () => {
    expect(policy.runtimeHandler).toBe('StaleWhileRevalidate');
    expect(policy.httpCacheControl).not.toContain('immutable');
    expect(policy.httpCacheControl).toContain('max-age=0');
    expect(policy.httpCacheControl).toContain('stale-while-revalidate');
  });

  it('keeps a bounded offline fallback', () => {
    expect(policy.runtimeMaxEntries).toBe(200);
    expect(policy.runtimeMaxAgeSeconds).toBe(30 * 24 * 60 * 60);
  });
});
