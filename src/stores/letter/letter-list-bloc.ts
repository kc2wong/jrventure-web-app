import { findLetter } from '@openapi/sdk.gen';
import { atom } from 'jotai';

import type { LetterListAction, LetterListState } from './letter-types';

const initialState: LetterListState = {
  status: 'idle',
  data: [],
  filter: {},
  pagination: undefined,
  total: 0,
};

export const letterListStateAtom = atom<LetterListState>(initialState);

export const letterListActionAtom = atom(
  null,
  async (get, set, action: LetterListAction) => {
    const state = get(letterListStateAtom);

    if (action.type === 'SEARCH') {
      const filter = action.filter ?? state.filter;
      const pagination = action.pagination;
      set(letterListStateAtom, { ...state, status: 'loading', filter, pagination: state.pagination ?? pagination });
      const { data, error } = await findLetter({
        query: {
          studentId: filter.studentId ? [filter.studentId] : undefined,
          status: filter.status?.length ? filter.status : undefined,
          fromCreatedAt: filter.fromCreatedAt?.toISOString(),
          toCreatedAt: filter.toCreatedAt?.toISOString(),
          limit: pagination.pageSize,
          skip: pagination.offset,
        },
      });
      if (error) {
        set(letterListStateAtom, { ...state, status: 'error', filter, pagination, error });
        return;
      }
      set(letterListStateAtom, {
        status: 'success',
        data: data?.items ?? [],
        filter,
        pagination,
        total: data?.total ?? 0,
      });
    } else if (action.type === 'REFRESH') {
      if (
        state.status !== 'success' &&
        state.status !== 'error' &&
        state.status !== 'invalid'
      ) {
        return;
      }
      set(letterListStateAtom, { ...state, status: 'loading' });
      const { data, error } = await findLetter({
        query: {
          studentId: state.filter.studentId ? [state.filter.studentId] : undefined,
          status: state.filter.status?.length ? state.filter.status : undefined,
          fromCreatedAt: state.filter.fromCreatedAt?.toISOString(),
          toCreatedAt: state.filter.toCreatedAt?.toISOString(),
          limit: state.pagination.pageSize,
          skip: state.pagination.offset,
        },
      });
      if (error) {
        set(letterListStateAtom, { ...state, status: 'error', error });
        return;
      }
      set(letterListStateAtom, {
        ...state,
        status: 'success',
        data: data?.items ?? [],
        total: data?.total ?? 0,
      });
    } else if (action.type === 'INVALIDATE') {
      if (state.status !== 'success' && state.status !== 'error') {
        return;
      }
      set(letterListStateAtom, { ...state, status: 'invalid' });
    } else if (action.type === 'RESET') {
      set(letterListStateAtom, initialState);
    }
  },
);
