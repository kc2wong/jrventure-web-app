import { createUser, getUserById, updateUserById } from '@openapi/sdk.gen';
import { atom } from 'jotai';

import type { UserEditAction, UserEditState } from './user-types';

const initialState: UserEditState = {
  status: 'idle',
  data: null,
};

export const userEditStateAtom = atom<UserEditState>(initialState);

export const userEditActionAtom = atom(
  null,
  async (_, set, action: UserEditAction) => {
    if (action.type === 'GET') {
      set(userEditStateAtom, { status: 'loading', data: null });
      const { data, error } = await getUserById({ path: { id: action.id } });
      if (error) {
        set(userEditStateAtom, (prev) => ({ ...prev, status: 'error', error: error }));
        return;
      }
      set(userEditStateAtom, { status: 'success', data: data ?? null });
    } else if (action.type === 'CREATE') {
      set(userEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { data, error } = await createUser({ body: action.payload });
      if (error) {
        set(userEditStateAtom, (prev) => ({ ...prev, status: 'error', error: error }));
        return;
      }
      set(userEditStateAtom, (prev) => ({ ...prev, status: 'success', data: data ?? null }));
    } else if (action.type === 'UPDATE') {
      set(userEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { id, ...rest } = action.payload;
      const { data, error } = await updateUserById({ path: { id }, body: rest });
      if (error) {
        set(userEditStateAtom, (prev) => ({ ...prev, status: 'error', error: error }));
        return;
      }
      set(userEditStateAtom, (prev) => ({ ...prev, status: 'success', data: data ?? null }));
    } else if (action.type === 'RESET') {
      set(userEditStateAtom, initialState);
    }
  },
);
