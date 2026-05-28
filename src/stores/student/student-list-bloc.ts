import { findStudent } from '@openapi/sdk.gen';
import { atom } from 'jotai';

import type {
  StudentListAction,
  StudentListState,
} from './student-types';

const initialState: StudentListState = {
  status: 'idle',
  data: [],
  filter: {},
  pagination: undefined,
  total: 0,
};

export const studentListStateAtom = atom<StudentListState>(initialState);

export const studentListActionAtom = atom(
  null,
  async (get, set, action: StudentListAction) => {
    const state = get(studentListStateAtom);

    if (action.type === 'SEARCH') {
      const filter = action.filter ?? state.filter;
      const pagination = action.pagination;
      set(studentListStateAtom, { ...state, status: 'loading', filter, pagination: state.pagination ?? pagination });
      const { data, error } = await findStudent({
        query: {
          classId: filter.classId || undefined,
          id: filter.id ? [filter.id] : undefined,
          limit: pagination.pageSize,
          name: filter.name || undefined,
          skip: pagination.offset,
        },
      });
      if (error) {
        set(studentListStateAtom, { ...state, status: 'error', filter, pagination, error });
        return;
      }
      set(studentListStateAtom, {
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
      set(studentListStateAtom, { ...state, status: 'loading' });
      const { data, error } = await findStudent({
        query: {
          classId: state.filter.classId || undefined,
          id: state.filter.id ? [state.filter.id] : undefined,
          limit: state.pagination.pageSize,
          name: state.filter.name || undefined,
          skip: state.pagination.offset,
        },
      });
      if (error) {
        set(studentListStateAtom, { ...state, status: 'error', error });
        return;
      }
      set(studentListStateAtom, {
        ...state,
        status: 'success',
        data: data?.items ?? [],
        total: data?.total ?? 0,
      });
    } else if (action.type === 'INVALIDATE') {
      if (state.status !== 'success' && state.status !== 'error') {
        return;
      }
      set(studentListStateAtom, { ...state, status: 'invalid' });
    } else if (action.type === 'RESET') {
      set(studentListStateAtom, initialState);
    }
  },
);
