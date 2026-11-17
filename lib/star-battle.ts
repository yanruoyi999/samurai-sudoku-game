export const side = 5;

export const starBattleBoards = [
  [...'BBAAA' + 'BBAAA' + 'DBBCA' + 'DBEEA' + 'BBEEA'],
  [...'AAABB' + 'ABBBB' + 'CDDBB' + 'CDDDB' + 'DDDDE'],
] as const;

export function canPlaceStar(board: readonly string[], stars: readonly number[], cell: number) {
  if (!Number.isInteger(cell) || cell < 0 || cell >= board.length) return false;
  const row = Math.floor(cell / side);
  const col = cell % side;
  return stars.every(other => {
    const rowsApart = Math.abs(row - Math.floor(other / side));
    const colsApart = Math.abs(col - other % side);
    return rowsApart > 0 && colsApart > 0 &&
      (rowsApart > 1 || colsApart > 1) && board[cell] !== board[other];
  });
}

export function isSolved(board: readonly string[], stars: readonly number[]) {
  return stars.length === side &&
    stars.every((cell, index) => canPlaceStar(board, stars.slice(0, index), cell));
}

export function isForcedFirstSquare(board: readonly string[], cell: number) {
  const region = board[cell];
  return region !== undefined && board.filter(other => other === region).length === 1;
}
