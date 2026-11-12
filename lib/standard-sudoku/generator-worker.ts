import { generateStandardSudoku } from './generate';

self.addEventListener('message', (event: MessageEvent<string>) => {
  self.postMessage(generateStandardSudoku({ previous: event.data }));
});
