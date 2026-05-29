import { getActivity } from '@openapi/activity';
import { toApiError } from '@store/api-error';
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
      try {
        const data = await getActivity().getActivityById(action.id);
        set(activityEditStateAtom, { status: 'success', data });
      } catch (err) {
        set(activityEditStateAtom, { status: 'error', data: null, error: toApiError(err) });
      }
    } else if (action.type === 'CREATE') {
      set(activityEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      try {
        const data = await getActivity().createActivity(action.payload);
        set(activityEditStateAtom, { status: 'success', data });
      } catch (err) {
        set(activityEditStateAtom, (prev) => ({ ...prev, status: 'error', error: toApiError(err) }));
      }
    } else if (action.type === 'UPDATE') {
      set(activityEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { id, version, ...payload } = action.payload;
      try {
        const data = await getActivity().updateActivityById(id, { version, ...payload });
        set(activityEditStateAtom, { status: 'success', data });
      } catch (err) {
        set(activityEditStateAtom, (prev) => ({ ...prev, status: 'error', error: toApiError(err) }));
      }
    } else if (action.type === 'RESET') {
      set(activityEditStateAtom, initialState);
    }
  },
);
