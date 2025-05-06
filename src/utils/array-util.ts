export const asArray = <T>(val: T | T[] | undefined): T[] | undefined => {
  if (val === undefined) {
    return undefined;
  }
  return Array.isArray(val) ? val : [val];
};
