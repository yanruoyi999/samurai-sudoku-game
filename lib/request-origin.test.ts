import { describe, expect, it } from 'vitest';

import { isTrustedSameOriginRequest } from './request-origin';

describe('same-origin request validation', () => {
  it('accepts same-origin browser requests and requests without an Origin header', () => {
    expect(isTrustedSameOriginRequest(new Request('https://www.samuraisudoku.net/api/paypal/orders', {
      method: 'POST',
      headers: { Origin: 'https://www.samuraisudoku.net', 'Sec-Fetch-Site': 'same-origin' },
    }))).toBe(true);
    expect(isTrustedSameOriginRequest(new Request('https://www.samuraisudoku.net/api/paypal/orders', {
      method: 'POST',
    }))).toBe(true);
  });

  it('rejects cross-site, mismatched, null, and malformed origins', () => {
    for (const headers of [
      { Origin: 'https://attacker.example', 'Sec-Fetch-Site': 'cross-site' },
      { Origin: 'https://attacker.example' },
      { Origin: 'null' },
      { Origin: 'not a url' },
    ]) {
      expect(isTrustedSameOriginRequest(new Request('https://www.samuraisudoku.net/api/paypal/orders', {
        method: 'POST',
        headers,
      }))).toBe(false);
    }
  });
});
