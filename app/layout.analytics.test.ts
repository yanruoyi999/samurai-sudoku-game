import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('app/layout.tsx', 'utf8');

describe('root analytics wiring', () => {
  it('mounts the route page-view listener inside Suspense', () => {
    expect(source).toContain('GoogleAnalyticsListener');
    expect(source).toMatch(/<Suspense[^>]*>[\s\S]*?<GoogleAnalyticsListener \/>[\s\S]*?<\/Suspense>/);
  });
});
