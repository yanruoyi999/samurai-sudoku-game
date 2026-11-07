import { createRequire } from 'node:module';
import { expect, it } from 'vitest';
const local = createRequire(import.meta.url);
it('keeps the content release on patched Next 15 and its image dependency', () => {
  const next = local('next/package.json');
  const fromNext = createRequire(local.resolve('next/package.json'));
  const sharpVersion: string = fromNext('sharp').versions.sharp;
  const version = (value: string) => value.split('.').map(Number);
  const [major,minor,patch] = version(next.version);
  expect(major).toBe(15); expect(minor).toBeGreaterThanOrEqual(5);
  if (minor === 5) expect(patch).toBeGreaterThanOrEqual(28);
  const [sMajor,sMinor,sPatch] = version(sharpVersion);
  expect(sMajor > 0 || sMinor > 35 || (sMinor === 35 && sPatch >= 5)).toBe(true);
});
