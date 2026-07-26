export interface KillerCombinationQuery {
  cageSize: number;
  targetSum: number;
}

export interface KillerCombinationResult extends KillerCombinationQuery {
  combinations: number[][];
  minimumSum: number;
  maximumSum: number;
  isValid: boolean;
}

const MIN_DIGIT = 1;
const MAX_DIGIT = 9;

export function getKillerSumRange(cageSize: number) {
  if (!Number.isInteger(cageSize) || cageSize < 1 || cageSize > MAX_DIGIT) {
    return null;
  }

  let minimumSum = 0;
  let maximumSum = 0;

  for (let index = 0; index < cageSize; index += 1) {
    minimumSum += MIN_DIGIT + index;
    maximumSum += MAX_DIGIT - index;
  }

  return { minimumSum, maximumSum };
}

export function findKillerSudokuCombinations({
  cageSize,
  targetSum,
}: KillerCombinationQuery): KillerCombinationResult {
  const range = getKillerSumRange(cageSize);
  const validTarget = Number.isInteger(targetSum);

  if (!range || !validTarget) {
    return {
      cageSize,
      targetSum,
      combinations: [],
      minimumSum: range?.minimumSum ?? 0,
      maximumSum: range?.maximumSum ?? 0,
      isValid: false,
    };
  }

  const { minimumSum, maximumSum } = range;
  if (targetSum < minimumSum || targetSum > maximumSum) {
    return {
      cageSize,
      targetSum,
      combinations: [],
      minimumSum,
      maximumSum,
      isValid: false,
    };
  }

  const combinations: number[][] = [];

  function search(nextDigit: number, digits: number[], remainingSum: number) {
    const remainingSlots = cageSize - digits.length;

    if (remainingSlots === 0) {
      if (remainingSum === 0) {
        combinations.push(digits);
      }
      return;
    }

    const largestStart = MAX_DIGIT - remainingSlots + 1;
    for (let digit = nextDigit; digit <= largestStart; digit += 1) {
      if (digit > remainingSum) {
        break;
      }

      let minimumTail = 0;
      let maximumTail = 0;
      for (let offset = 1; offset < remainingSlots; offset += 1) {
        minimumTail += digit + offset;
        maximumTail += MAX_DIGIT - (offset - 1);
      }

      const nextRemainingSum = remainingSum - digit;
      if (nextRemainingSum < minimumTail || nextRemainingSum > maximumTail) {
        continue;
      }

      search(digit + 1, [...digits, digit], nextRemainingSum);
    }
  }

  search(MIN_DIGIT, [], targetSum);

  return {
    cageSize,
    targetSum,
    combinations,
    minimumSum,
    maximumSum,
    isValid: combinations.length > 0,
  };
}

export interface KillerCheatSheetRow {
  cageSize: number;
  targetSum: number;
  combinations: number[][];
}

export function buildKillerCheatSheet(
  cageSizes: readonly number[] = [2, 3, 4],
): KillerCheatSheetRow[] {
  const rows: KillerCheatSheetRow[] = [];

  for (const cageSize of cageSizes) {
    const range = getKillerSumRange(cageSize);
    if (!range) {
      continue;
    }

    for (
      let targetSum = range.minimumSum;
      targetSum <= range.maximumSum;
      targetSum += 1
    ) {
      const result = findKillerSudokuCombinations({ cageSize, targetSum });
      if (result.combinations.length > 0) {
        rows.push({
          cageSize,
          targetSum,
          combinations: result.combinations,
        });
      }
    }
  }

  return rows;
}
