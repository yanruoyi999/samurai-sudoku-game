import { describe, expect, it } from 'vitest';
import {
  CANONICAL_HOST,
  getCanonicalRedirectUrl
} from './lib/canonical-host';

const PRINTABLE_PATH = '/en/printable-samurai-sudoku?source=legacy';

describe('canonical host middleware', () => {
  it.each(['samuraisudoku.net', 'samurai-sudoku-game.vercel.app'])(
    'redirects %s to the canonical host',
    (hostname) => {
      const redirectUrl = getCanonicalRedirectUrl(
        new URL(`https://${hostname}${PRINTABLE_PATH}`),
        hostname
      );

      expect(redirectUrl?.toString()).toBe(
        `https://${CANONICAL_HOST}${PRINTABLE_PATH}`
      );
    }
  );

  it('normalizes http and an explicit port on the canonical host', () => {
    const redirectUrl = getCanonicalRedirectUrl(
      new URL(`http://${CANONICAL_HOST}:8080${PRINTABLE_PATH}`),
      `${CANONICAL_HOST}:8080`
    );

    expect(redirectUrl?.toString()).toBe(
      `https://${CANONICAL_HOST}${PRINTABLE_PATH}`
    );
  });

  it.each([
    ['localhost:3000', 'http://localhost:3000'],
    ['samurai-sudoku-git-fix-example.vercel.app', 'https://samurai-sudoku-git-fix-example.vercel.app'],
  ])('does not canonicalize development or preview host %s', (hostHeader, origin) => {
    const redirectUrl = getCanonicalRedirectUrl(
      new URL(`${origin}${PRINTABLE_PATH}`),
      hostHeader
    );

    expect(redirectUrl).toBeNull();
  });

  it('does not redirect an already canonical https request', () => {
    const redirectUrl = getCanonicalRedirectUrl(
      new URL(`https://${CANONICAL_HOST}${PRINTABLE_PATH}`),
      CANONICAL_HOST
    );

    expect(redirectUrl).toBeNull();
  });
});
