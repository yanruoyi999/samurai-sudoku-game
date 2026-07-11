export function getVisibleMoveCount(historyLength: number, historyIndex: number) {
  if (historyLength <= 0 || historyIndex < 0) return 0;

  return Math.min(historyLength, historyIndex + 1);
}
