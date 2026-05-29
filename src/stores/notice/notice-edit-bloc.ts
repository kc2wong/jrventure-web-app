import { getNotice } from '@openapi/notice';
import { toApiError } from '@store/api-error';
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
      try {
        const data = await getNotice().getNoticeById(action.id);
        set(noticeEditStateAtom, { status: 'success', data });
      } catch (err) {
        set(noticeEditStateAtom, { status: 'error', data: null, error: toApiError(err) });
      }
    } else if (action.type === 'CREATE') {
      set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      try {
        const data = await getNotice().createNotice(action.payload);
        set(noticeEditStateAtom, { status: 'success', data });
      } catch (err) {
        set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'error', error: toApiError(err) }));
      }
    } else if (action.type === 'UPDATE') {
      set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      const { id, version, ...payload } = action.payload;
      try {
        const data = await getNotice().updateNoticeById(id, { version, ...payload });
        set(noticeEditStateAtom, { status: 'success', data });
      } catch (err) {
        set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'error', error: toApiError(err) }));
      }
    } else if (action.type === 'DISTRIBUTE') {
      set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      try {
        const data = await getNotice().distributeNotice(action.id, { version: action.version });
        set(noticeEditStateAtom, { status: 'success', data });
      } catch (err) {
        set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'error', error: toApiError(err) }));
      }
    } else if (action.type === 'RECALL') {
      set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'loading' }));
      try {
        const data = await getNotice().recallNotice(action.id, { version: action.version });
        set(noticeEditStateAtom, { status: 'success', data });
      } catch (err) {
        set(noticeEditStateAtom, (prev) => ({ ...prev, status: 'error', error: toApiError(err) }));
      }
    } else if (action.type === 'RESET') {
      set(noticeEditStateAtom, initialState);
    }
  },
);
