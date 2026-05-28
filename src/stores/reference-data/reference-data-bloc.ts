import { findClass } from '@openapi/sdk.gen';
import { atom } from 'jotai';

import type {
  ReferenceDataAction,
  ReferenceDataState,
} from './reference-data-types';

const initialState: ReferenceDataState = {
  classes: [],
  status: 'idle',
};

export const referenceDataStateAtom = atom<ReferenceDataState>(initialState);

export const referenceDataActionAtom = atom(
  null,
  async (get, set, action: ReferenceDataAction) => {
    const state = get(referenceDataStateAtom);

    if (action.type === 'FETCH') {
      if (state.status === 'loading') {
        return;
      }

      set(referenceDataStateAtom, { ...state, status: 'loading' });

      try {
        const { data } = await findClass({ throwOnError: true });
        set(referenceDataStateAtom, {
          status: 'success',
          classes: data ?? [],
        });
      } catch (_error) {
        set(referenceDataStateAtom, { ...state, status: 'error' });
      }
    } else if (action.type === 'RESET') {
      set(referenceDataStateAtom, initialState);
    }
  },
);
