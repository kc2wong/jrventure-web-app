import { getActivityParticipation } from '@openapi/activity-participation';
import { toApiError } from '@store/api-error';
import { atom } from 'jotai';

import type { ParticipationEditAction, ParticipationEditState } from './participation-types';

const initialState: ParticipationEditState = {
  status: 'idle',
  data: null,
};

export const participationEditStateAtom = atom<ParticipationEditState>(initialState);

export const participationEditActionAtom = atom(
  null,
  async (get, set, action: ParticipationEditAction) => {
    if (action.type === 'GET') {
      set(participationEditStateAtom, { status: 'loading', data: null });
      try {
        const data = await getActivityParticipation().findParticipation({
          activityIds: [action.activityId],
          studentIds: [action.studentId],
        });
        set(participationEditStateAtom, { status: 'success', data: data.items?.[0] ?? null });
      } catch (err) {
        set(participationEditStateAtom, { status: 'error', data: null, error: toApiError(err) });
      }
    } else if (action.type === 'ENROLL') {
      set(participationEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      try {
        const data = await getActivityParticipation().createActivityParticipation({
          activityId: action.activityId,
          studentId: action.studentId,
        });
        set(participationEditStateAtom, { status: 'success', data });
      } catch (err) {
        set(participationEditStateAtom, (prev) => ({ ...prev, status: 'error', error: toApiError(err) }));
      }
    } else if (action.type === 'WITHDRAW') {
      const state = get(participationEditStateAtom);
      if (!state.data) {
        return;
      }
      set(participationEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      try {
        await getActivityParticipation().deleteParticipationById(state.data.id, { version: state.data.version });
        set(participationEditStateAtom, { status: 'success', data: null });
      } catch (err) {
        set(participationEditStateAtom, (prev) => ({ ...prev, status: 'error', error: toApiError(err) }));
      }
    } else if (action.type === 'CHECK_IN') {
      const state = get(participationEditStateAtom);
      if (!state.data) {
        return;
      }
      set(participationEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      try {
        const data = await getActivityParticipation().updateParticipationById(state.data.id, {
          attendedAt: new Date().toISOString(),
          status: 'ATTENDED',
          version: state.data.version,
        });
        set(participationEditStateAtom, { status: 'success', data });
      } catch (err) {
        set(participationEditStateAtom, (prev) => ({ ...prev, status: 'error', error: toApiError(err) }));
      }
    } else if (action.type === 'RESET') {
      set(participationEditStateAtom, initialState);
    }
  },
);
