import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildIndexNowPayload,
  normalizeIndexNowUrls,
} from './submit-indexnow.mjs';

test('normalizes, deduplicates, and removes fragments from same-site URLs', () => {
  assert.deepEqual(
    normalizeIndexNowUrls(
      ['/guide#intro', 'https://example.com/guide', '/other'],
      'https://example.com',
    ),
    ['https://example.com/guide', 'https://example.com/other'],
  );
});

test('rejects a submission that contains no same-site URL', () => {
  assert.throws(
    () => normalizeIndexNowUrls(['https://other.example/page'], 'https://example.com'),
    /no valid same-site URLs/i,
  );
});

test('builds a payload with a root key location', () => {
  const payload = buildIndexNowPayload(['/new-page'], {
    siteUrl: 'https://example.com',
    key: '1234567890abcdef',
  });

  assert.equal(payload.host, 'example.com');
  assert.equal(payload.key, '1234567890abcdef');
  assert.equal(payload.keyLocation, 'https://example.com/1234567890abcdef.txt');
  assert.deepEqual(payload.urlList, ['https://example.com/new-page']);
});
