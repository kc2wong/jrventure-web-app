import type { Class } from '@store/class/class-types';

// Shared mutable storage so search and edit see the same data
const grades = Array.from({ length: 6 }, (_, i) => i + 1); // 1 → 6
const classLetters = Array.from(
  { length: 6 },
  (_, i) => String.fromCharCode(65 + i), // 'A' → 'F'
);

let classes: Class[] = grades.flatMap((grade) =>
  classLetters.map((classNumber) => ({
    id: `${String(grade).padStart(2, '0')}${classNumber}`,
    grade,
    classNumber,
  })),
);
export const mockGetAll = () => classes;

export const mockGetById = (id: string): Class | null =>
  classes.find((c) => c.id === id) ?? null;

export const mockCreate = (payload: Omit<Class, 'id'>): Class => {
  const created: Class = { id: Date.now().toString(), ...payload };
  classes = [...classes, created];
  return created;
};

export const mockUpdate = (payload: Class): Class => {
  classes = classes.map((c) => (c.id === payload.id ? payload : c));
  return payload;
};
