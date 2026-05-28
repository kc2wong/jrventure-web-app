import { getLetterById, updateLetterById } from '@openapi/sdk.gen';
import { atom } from 'jotai';

import type { LetterEditAction, LetterEditState } from './letter-types';

const initialState: LetterEditState = {
  status: 'idle',
  data: null,
};

export const letterEditStateAtom = atom<LetterEditState>(initialState);

export const letterEditActionAtom = atom(
  null,
  async (get, set, action: LetterEditAction) => {
    if (action.type === 'GET') {
      set(letterEditStateAtom, { status: 'loading', data: null });
      const { data, error } = await getLetterById({ path: { id: action.id } });
      if (error) {
        set(letterEditStateAtom, { status: 'error', data: null, error });
        return;
      }
      set(letterEditStateAtom, { status: 'success', data: data ?? null });
    } else if (action.type === 'ACKNOWLEDGE') {
      const state = get(letterEditStateAtom);
      set(letterEditStateAtom, { ...state, status: 'loading' });
      const { data, error } = await updateLetterById({ path: { id: action.id }, body: { version: action.version, status: 'ACKNOWLEDGED' } });
      if (error) {
        set(letterEditStateAtom, { ...state, status: 'error', error });
        return;
      }
      set(letterEditStateAtom, { status: 'success', data: data ?? null });
    } else if (action.type === 'RESET') {
      set(letterEditStateAtom, initialState);
    }
  },
);
