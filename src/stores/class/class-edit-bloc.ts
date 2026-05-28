import { getClassById } from '@openapi/index';
import { atom } from 'jotai';

import { mockCreate, mockUpdate } from './class-mock';
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
      const { data, error } = await getClassById({ path: { id: action.id } });
      if (error) {
        set(classEditStateAtom, (prev) => ({ ...prev, status: 'error', error }));
        return;
      }
      set(classEditStateAtom, (prev) => ({ ...prev, status: 'success', data: data ?? null }));
    } else if (action.type === 'CREATE') {
      set(classEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const created = mockCreate(action.payload);
      set(classEditStateAtom, (prev) => ({ ...prev, status: 'success', data: created }));
    } else if (action.type === 'UPDATE') {
      set(classEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const updated = mockUpdate(action.payload);
      set(classEditStateAtom, (prev) => ({ ...prev, status: 'success', data: updated }));
    } else if (action.type === 'RESET') {
      set(classEditStateAtom, initialState);
    }
  },
);
