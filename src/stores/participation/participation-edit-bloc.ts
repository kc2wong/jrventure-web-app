import {
  createActivityParticipation,
  deleteParticipationById,
  findParticipation,
  updateParticipationById,
} from '@openapi/sdk.gen';
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
      const { data, error } = await findParticipation({
        query: {
          activityIds: [action.activityId],
          studentIds: [action.studentId],
        },
      });
      if (error) {
        set(participationEditStateAtom, { status: 'error', data: null, error });
        return;
      }
      set(participationEditStateAtom, { status: 'success', data: data?.items?.[0] ?? null });
    } else if (action.type === 'ENROLL') {
      set(participationEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { data, error } = await createActivityParticipation({
        body: { activityId: action.activityId, studentId: action.studentId },
      });
      if (error) {
        set(participationEditStateAtom, (prev) => ({ ...prev, status: 'error', error }));
        return;
      }
      set(participationEditStateAtom, { status: 'success', data: data ?? null });
    } else if (action.type === 'WITHDRAW') {
      const state = get(participationEditStateAtom);
      if (!state.data) {
        return;
      }
      set(participationEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { error } = await deleteParticipationById({
        body: { version: state.data.version },
        path: { id: state.data.id },
      });
      if (error) {
        set(participationEditStateAtom, (prev) => ({ ...prev, status: 'error', error }));
        return;
      }
      set(participationEditStateAtom, { status: 'success', data: null });
    } else if (action.type === 'CHECK_IN') {
      const state = get(participationEditStateAtom);
      if (!state.data) {
        return;
      }
      set(participationEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { data, error } = await updateParticipationById({
        body: {
          attendedAt: new Date().toISOString(),
          status: 'ATTENDED',
          version: state.data.version,
        },
        path: { id: state.data.id },
      });
      if (error) {
        set(participationEditStateAtom, (prev) => ({ ...prev, status: 'error', error }));
        return;
      }
      set(participationEditStateAtom, { status: 'success', data: data ?? null });
    } else if (action.type === 'RESET') {
      set(participationEditStateAtom, initialState);
    }
  },
);
