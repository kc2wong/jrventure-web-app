export const formatParticpantGrade = (numbers: number[]): string => {
  if (numbers.length === 0) {
    return '';
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const result: string[] = [];

  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];

    if (current === end + 1) {
      // Still consecutive
      end = current;
    } else {
      // Break in the sequence
      result.push(start === end ? `${start}` : `${start} to ${end}`);
      start = current;
      end = current;
    }
  }

  // Push the final range
  result.push(start === end ? `P${start}` : `P${start}-P${end}`);

  return result.join(', ');
};
