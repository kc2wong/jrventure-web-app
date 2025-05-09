export const asArray = <T>(val: T | T[] | undefined): T[] | undefined => {
  if (val === undefined) {
    return undefined;
  }
  return Array.isArray(val) ? val : [val];
};

// export function asArray<T>(val: T[]): T[];
// export function asArray<T>(val: T): T[];
// export function asArray<_T>(val: undefined): undefined;
// export function asArray<T>(val: T | T[] | undefined): T[] | undefined {
//   if (val === undefined) {
//     return undefined;
//   }
//   return Array.isArray(val) ? val : [val];
// }