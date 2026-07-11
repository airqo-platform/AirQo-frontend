export const areArraysEqual = <T>(
  left: readonly T[] = [],
  right: readonly T[] = []
): boolean => {
  if (left === right) {
    return true;
  }

  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => Object.is(value, right[index]));
};
