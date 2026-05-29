import { getStudent } from '@openapi/student';
import { toApiError } from '@store/api-error';
import { atom } from 'jotai';

import type { ClassEditAction, ClassEditState } from './class-types';

const initialState: ClassEditState = {
  status: 'idle',
  data: null,
};

export const classEditStateAtom = atom<ClassEditState>(initialState);

export const classEditActionAtom = atom(
  null,
  async (_, set, action: ClassEditAction) => {
    if (action.type === 'GET') {
      set(classEditStateAtom, (prev) => ({ ...prev, status: 'loading', data: null }));
      try {
        const data = await getStudent().getClassById(action.id);
        set(classEditStateAtom, (prev) => ({ ...prev, status: 'success', data }));
      } catch (err) {
        set(classEditStateAtom, (prev) => ({ ...prev, status: 'error', error: toApiError(err) }));
      }
    } else if (action.type === 'RESET') {
      set(classEditStateAtom, initialState);
    }
  },
);
