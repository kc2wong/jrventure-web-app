import { getNotice } from '@openapi/notice';
import { toApiError } from '@store/api-error';
import { toIsoDateString } from '@util/date-util';
import { atom } from 'jotai';

import type { NoticeListAction, NoticeListState } from './notice-types';

const initialState: NoticeListState = {
  status: 'idle',
  data: [],
  filter: {},
  pagination: undefined,
  total: 0,
};

export const noticeListStateAtom = atom<NoticeListState>(initialState);

export const noticeListActionAtom = atom(
  null,
  async (get, set, action: NoticeListAction) => {
    const state = get(noticeListStateAtom);

    if (action.type === 'SEARCH') {
      const filter = action.filter ?? state.filter;
      const pagination = action.pagination;
      set(noticeListStateAtom, { ...state, status: 'loading', filter, pagination: state.pagination ?? pagination });
      try {
        const data = await getNotice().findNotice({
          forClass: filter.forClass?.length ? filter.forClass : undefined,
          forGrade: filter.forGrade?.length ? filter.forGrade : undefined,
          fromDistributedAt: filter.fromDistributedAt ? toIsoDateString(filter.fromDistributedAt) : undefined,
          fromDueAt: filter.fromDueAt ? toIsoDateString(filter.fromDueAt) : undefined,
          limit: pagination.pageSize,
          skip: pagination.offset,
          status: filter.status?.length ? filter.status : undefined,
          title: filter.title || undefined,
          toDistributedAt: filter.toDistributedAt ? toIsoDateString(filter.toDistributedAt) : undefined,
          toDueAt: filter.toDueAt ? toIsoDateString(filter.toDueAt) : undefined,
        });
        set(noticeListStateAtom, {
          status: 'success',
          data: data.items ?? [],
          filter,
          pagination,
          total: data.total ?? 0,
        });
      } catch (err) {
        set(noticeListStateAtom, { ...state, status: 'error', filter, pagination, error: toApiError(err) });
      }
    } else if (action.type === 'REFRESH') {
      if (
        state.status !== 'success' &&
        state.status !== 'error' &&
        state.status !== 'invalid'
      ) {
        return;
      }
      set(noticeListStateAtom, { ...state, status: 'loading' });
      try {
        const data = await getNotice().findNotice({
          forClass: state.filter.forClass?.length ? state.filter.forClass : undefined,
          forGrade: state.filter.forGrade?.length ? state.filter.forGrade : undefined,
          fromDistributedAt: state.filter.fromDistributedAt ? toIsoDateString(state.filter.fromDistributedAt) : undefined,
          fromDueAt: state.filter.fromDueAt ? toIsoDateString(state.filter.fromDueAt) : undefined,
          limit: state.pagination.pageSize,
          skip: state.pagination.offset,
          status: state.filter.status?.length ? state.filter.status : undefined,
          title: state.filter.title || undefined,
          toDistributedAt: state.filter.toDistributedAt ? toIsoDateString(state.filter.toDistributedAt) : undefined,
          toDueAt: state.filter.toDueAt ? toIsoDateString(state.filter.toDueAt) : undefined,
        });
        set(noticeListStateAtom, {
          ...state,
          status: 'success',
          data: data.items ?? [],
          total: data.total ?? 0,
        });
      } catch (err) {
        set(noticeListStateAtom, { ...state, status: 'error', error: toApiError(err) });
      }
    } else if (action.type === 'INVALIDATE') {
      if (state.status !== 'success' && state.status !== 'error') {
        return;
      }
      set(noticeListStateAtom, { ...state, status: 'invalid' });
    } else if (action.type === 'RESET') {
      set(noticeListStateAtom, initialState);
    }
  },
);
