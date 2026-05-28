import { createNotice, distributeNotice, getNoticeById, recallNotice, updateNoticeById } from '@openapi/sdk.gen';
import { atom } from 'jotai';

import type { NoticeEditAction, NoticeEditState } from './notice-types';

const initialState: NoticeEditState = {
  status: 'idle',
  data: null,
};

export const noticeEditStateAtom = atom<NoticeEditState>(initialState);

export const noticeEditActionAtom = atom(
  null,
  async (_get, set, action: NoticeEditAction) => {
    if (action.type === 'GET') {
      set(noticeEditStateAtom, { status: 'loading', data: null });
      const { data, error } = await getNoticeById({ path: { id: action.id } });
      if (error) {
        set(noticeEditStateAtom, { status: 'error', data: null, error });
        return;
      }
      set(noticeEditStateAtom, { status: 'success', data: data ?? null });
    } else if (action.type === 'CREATE') {
      set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { data, error } = await createNotice({ body: action.payload });
      if (error) {
        set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'error', error }));
        return;
      }
      set(noticeEditStateAtom, { status: 'success', data: data ?? null });
    } else if (action.type === 'UPDATE') {
      set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { id, version, ...payload } = action.payload;
      const { data, error } = await updateNoticeById({ path: { id }, body: { version, ...payload } });
      if (error) {
        set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'error', error }));
        return;
      }
      set(noticeEditStateAtom, { status: 'success', data: data ?? null });
    } else if (action.type === 'DISTRIBUTE') {
      set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { data, error } = await distributeNotice({ path: { id: action.id }, body: { version: action.version } });
      if (error) {
        set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'error', error }));
        return;
      }
      set(noticeEditStateAtom, { status: 'success', data: data ?? null });
    } else if (action.type === 'RECALL') {
      set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { data, error } = await recallNotice({ path: { id: action.id }, body: { version: action.version } });
      if (error) {
        set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'error', error }));
        return;
      }
      set(noticeEditStateAtom, { status: 'success', data: data ?? null });
    } else if (action.type === 'RESET') {
      set(noticeEditStateAtom, initialState);
    }
  },
);
