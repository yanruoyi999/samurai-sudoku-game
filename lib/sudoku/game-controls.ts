import type { GameStatus } from './types';

export const canInteractWithPuzzle = (status: GameStatus, isPaused: boolean) =>
  status === 'playing' && !isPaused;
