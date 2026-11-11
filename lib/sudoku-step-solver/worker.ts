import { solveSudoku } from './solve';

self.addEventListener('message', (event: MessageEvent<number[]>) => {
  self.postMessage(solveSudoku(event.data));
});
