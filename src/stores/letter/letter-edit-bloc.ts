import { getLetter } from '@openapi/letter';
import { toApiError } from '@store/api-error';
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
      try {
        const data = await getLetter().getLetterById(action.id);
        set(letterEditStateAtom, { status: 'success', data });
      } catch (err) {
        set(letterEditStateAtom, { status: 'error', data: null, error: toApiError(err) });
      }
    } else if (action.type === 'ACKNOWLEDGE') {
      const state = get(letterEditStateAtom);
      set(letterEditStateAtom, { ...state, status: 'loading' });
      try {
        const data = await getLetter().updateLetterById(action.id, { version: action.version, status: 'ACKNOWLEDGED' });
        set(letterEditStateAtom, { status: 'success', data });
      } catch (err) {
        set(letterEditStateAtom, { ...state, status: 'error', error: toApiError(err) });
      }
    } else if (action.type === 'RESET') {
      set(letterEditStateAtom, initialState);
    }
  },
);
