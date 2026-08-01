import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Hsl = [number, number, number];

const css = readFileSync('app/globals.css', 'utf8');

function readVariables(selector: ':root' | '.dark') {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`));
  expect(block).not.toBeNull();
  const variables = new Map<string, Hsl>();
  for (const match of block![1].matchAll(/--([\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*;/g)) {
    variables.set(match[1], [Number(match[2]), Number(match[3]), Number(match[4])]);
  }
  return variables;
}

function hslToRgb([hue, saturation, lightness]: Hsl) {
  const h = (((hue % 360) + 360) % 360) / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  if (s === 0) return [l, l, l] as const;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (offset: number) => {
    let t = offset;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [channel(h + 1 / 3), channel(h), channel(h - 1 / 3)] as const;
}

function luminance(hsl: Hsl) {
  const linear = hslToRgb(hsl).map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrastRatio(foreground: Hsl, background: Hsl) {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

describe('Sudoku text contrast', () => {
  it.each([
    [':root', 'cell-entered', 'cell-selected'],
    [':root', 'candidate-color', 'cell-bg'],
    ['.dark', 'cell-entered', 'cell-selected'],
    ['.dark', 'candidate-color', 'cell-bg'],
  ] as const)('%s %s remains at least 4.5:1 against %s', (selector, foreground, background) => {
    const variables = readVariables(selector);
    expect(contrastRatio(variables.get(foreground)!, variables.get(background)!)).toBeGreaterThanOrEqual(4.5);
  });
});
