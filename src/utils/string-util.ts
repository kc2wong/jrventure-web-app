/**
 * Convert input string to title case
 *
 * @param input
 * @returns
 */
const toTitleCase = (input: string): string => {
  return input
    .toLowerCase()
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

export { toTitleCase };
