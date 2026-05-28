import { createActivity, getActivityById, updateActivityById } from '@openapi/sdk.gen';
import { atom } from 'jotai';

import type { ActivityEditAction, ActivityEditState } from './activity-types';

const initialState: ActivityEditState = {
  status: 'idle',
  data: null,
};

export const activityEditStateAtom = atom<ActivityEditState>(initialState);

export const activityEditActionAtom = atom(
  null,
  async (_get, set, action: ActivityEditAction) => {
    if (action.type === 'GET') {
      set(activityEditStateAtom, { status: 'loading', data: null });
      const { data, error } = await getActivityById({ path: { id: action.id } });
      if (error) {
        set(activityEditStateAtom, { status: 'error', data: null, error });
        return;
      }
      set(activityEditStateAtom, { status: 'success', data: data ?? null });
    } else if (action.type === 'CREATE') {
      set(activityEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { data, error } = await createActivity({ body: action.payload });
      if (error) {
        set(activityEditStateAtom, (prev) => ({ ...prev, status: 'error', error }));
        return;
      }
      set(activityEditStateAtom, { status: 'success', data: data ?? null });
    } else if (action.type === 'UPDATE') {
      set(activityEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { id, version, ...payload } = action.payload;
      const { data, error } = await updateActivityById({ path: { id }, body: { version, ...payload } });
      if (error) {
        set(activityEditStateAtom, (prev) => ({ ...prev, status: 'error', error }));
        return;
      }
      set(activityEditStateAtom, { status: 'success', data: data ?? null });
    } else if (action.type === 'RESET') {
      set(activityEditStateAtom, initialState);
    }
  },
);
