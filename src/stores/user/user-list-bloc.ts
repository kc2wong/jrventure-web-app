import { getUserMaintenance } from '@openapi/user-maintenance';
import { toApiError } from '@store/api-error';
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
      try {
        const data = await getUserMaintenance().findUser({
          email: filter.email || undefined,
          name: filter.name || undefined,
          role: filter.role || undefined,
          status: filter.status || undefined,
          limit: pagination.pageSize,
          skip: pagination.offset,
        });
        set(userListStateAtom, {
          status: 'success',
          data: data.items ?? [],
          filter,
          pagination,
          total: data.total ?? 0,
        });
      } catch (err) {
        set(userListStateAtom, { ...state, status: 'error', filter, pagination, error: toApiError(err) });
      }
    } else if (action.type === 'REFRESH') {
      if (
        state.status !== 'success' &&
        state.status !== 'error' &&
        state.status !== 'invalid'
      ) {
        return;
      }
      set(userListStateAtom, { ...state, status: 'loading' });
      try {
        const data = await getUserMaintenance().findUser({
          email: state.filter.email || undefined,
          name: state.filter.name || undefined,
          role: state.filter.role || undefined,
          status: state.filter.status || undefined,
          limit: state.pagination.pageSize,
          skip: state.pagination.offset,
        });
        set(userListStateAtom, {
          ...state,
          status: 'success',
          data: data.items ?? [],
          total: data.total ?? 0,
        });
      } catch (err) {
        set(userListStateAtom, { ...state, status: 'error', error: toApiError(err) });
      }
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
