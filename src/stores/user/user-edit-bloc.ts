import { getUserMaintenance } from '@openapi/user-maintenance';
import { toApiError } from '@store/api-error';
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
      try {
        const data = await getUserMaintenance().getUserById(action.id);
        set(userEditStateAtom, { status: 'success', data });
      } catch (err) {
        set(userEditStateAtom, (prev) => ({ ...prev, status: 'error', error: toApiError(err) }));
      }
    } else if (action.type === 'CREATE') {
      set(userEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      try {
        const data = await getUserMaintenance().createUser(action.payload);
        set(userEditStateAtom, (prev) => ({ ...prev, status: 'success', data }));
      } catch (err) {
        set(userEditStateAtom, (prev) => ({ ...prev, status: 'error', error: toApiError(err) }));
      }
    } else if (action.type === 'UPDATE') {
      set(userEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { id, ...rest } = action.payload;
      try {
        const data = await getUserMaintenance().updateUserById(id, rest);
        set(userEditStateAtom, (prev) => ({ ...prev, status: 'success', data }));
      } catch (err) {
        set(userEditStateAtom, (prev) => ({ ...prev, status: 'error', error: toApiError(err) }));
      }
    } else if (action.type === 'RESET') {
      set(userEditStateAtom, initialState);
    }
  },
);
