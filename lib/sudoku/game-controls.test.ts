import { describe, expect, it } from 'vitest';
import { canInteractWithPuzzle } from './game-controls';

describe('canInteractWithPuzzle', () => {
  it('allows interaction only while actively playing', () => {
    expect(canInteractWithPuzzle('playing', false)).toBe(true);
    expect(canInteractWithPuzzle('playing', true)).toBe(false);
    expect(canInteractWithPuzzle('paused', true)).toBe(false);
    expect(canInteractWithPuzzle('completed', false)).toBe(false);
    expect(canInteractWithPuzzle('abandoned', false)).toBe(false);
  });
});
