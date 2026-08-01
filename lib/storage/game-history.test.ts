import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getInProgressGames,
  saveInProgressGame,
  SUDOKU_STORAGE_EVENT,
  type InProgressGame,
} from './game-history';
import { SAMPLE_PUZZLE } from '@/lib/sudoku/sample-puzzle';

const IN_PROGRESS_HISTORY_KEY = 'sudoku-in-progress-history';

function installBrowserStorage() {
  const store = new Map<string, string>();
  const dispatchEvent = vi.fn(() => true);
  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
  const win = { localStorage, dispatchEvent } as unknown as Window;

  (globalThis as { window?: Window }).window = win;
  (globalThis as { localStorage?: unknown }).localStorage = localStorage;

  return { localStorage, dispatchEvent };
}

function inProgressGame(): InProgressGame {
  return {
    puzzle: SAMPLE_PUZZLE,
    currentTime: 42,
    hintsUsed: 0,
    lastPlayed: '2026-07-29T00:00:00.000Z',
    difficulty: SAMPLE_PUZZLE.difficulty,
  };
}

afterEach(() => {
  delete (globalThis as { window?: Window }).window;
  delete (globalThis as { localStorage?: unknown }).localStorage;
});

describe('in-progress localStorage recovery', () => {
  it.each(['{broken-json', JSON.stringify({ unexpected: true })])(
    'replaces invalid stored history before saving: %s',
    (storedValue) => {
      const { localStorage, dispatchEvent } = installBrowserStorage();
      localStorage.setItem(IN_PROGRESS_HISTORY_KEY, storedValue);

      saveInProgressGame(inProgressGame());

      expect(getInProgressGames()).toEqual([inProgressGame()]);
      expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
        type: SUDOKU_STORAGE_EVENT,
      }));
    },
  );
});
