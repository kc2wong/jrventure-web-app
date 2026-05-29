import { getStudent } from '@openapi/student';
import { atom } from 'jotai';

import type { StudentEditAction, StudentEditState } from './student-types';

const initialState: StudentEditState = {
  status: 'idle',
  data: null,
};

export const studentEditStateAtom = atom<StudentEditState>(initialState);

export const studentEditActionAtom = atom(
  null,
  async (_, set, action: StudentEditAction) => {
    if (action.type === 'GET') {
      set(studentEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const data = await getStudent().findStudent({
        id: [action.id],
        limit: 1,
        skip: 0,
      });
      set(studentEditStateAtom, {
        status: 'success',
        data: data.items?.[0]!,
      });
    } else if (action.type === 'CREATE') {
      set(studentEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
    } else if (action.type === 'UPDATE') {
      set(studentEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
    } else if (action.type === 'RESET') {
      set(studentEditStateAtom, initialState);
    }
  },
);
