import { findUser } from '@openapi/sdk.gen';
import { atom } from 'jotai';

import type {
  UserListAction,
  UserListState,
} from './user-types';

const initialState: UserListState = {
  status: 'idle',
  data: [],
  filter: {},
  pagination: undefined,
  total: 0,
};

export const userListStateAtom = atom<UserListState>(initialState);

export const userListActionAtom = atom(
  null,
  async (get, set, action: UserListAction) => {
    const state = get(userListStateAtom);

    if (action.type === 'SEARCH') {
      const filter = action.filter ?? state.filter;
      const pagination = action.pagination;
      set(userListStateAtom, { ...state, status: 'loading', filter, pagination: state.pagination ?? pagination });
      const { data, error } = await findUser({
        query: {
          email: filter.email || undefined,
          name: filter.name || undefined,
          role: filter.role || undefined,
          status: filter.status || undefined,
          limit: pagination.pageSize,
          skip: pagination.offset,
        },
      });
      if (error) {
        set(userListStateAtom, { ...state, status: 'error', filter, pagination, error });
        return;
      }
      set(userListStateAtom, {
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
      set(userListStateAtom, { ...state, status: 'loading' });
      const { data, error } = await findUser({
        query: {
          email: state.filter.email || undefined,
          name: state.filter.name || undefined,
          role: state.filter.role || undefined,
          status: state.filter.status || undefined,
          limit: state.pagination.pageSize,
          skip: state.pagination.offset,
        },
      });
      if (error) {
        set(userListStateAtom, { ...state, status: 'error', error });
        return;
      }
      set(userListStateAtom, {
        ...state,
        status: 'success',
        data: data?.items ?? [],
        total: data?.total ?? 0,
      });
    } else if (action.type === 'INVALIDATE') {
      if (state.status !== 'success' && state.status !== 'error') {
        return;
      }
      set(userListStateAtom, { ...state, status: 'invalid' });
    } else if (action.type === 'RESET') {
      set(userListStateAtom, initialState);
    }
  },
);
