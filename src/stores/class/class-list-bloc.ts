import { getStudent } from '@openapi/student';
import { toApiError } from '@store/api-error';
import type { SchoolClass } from '@store/class/class-types';
import { atom } from 'jotai';

import type {
  ClassListAction,
  ClassListFilter,
  ClassListPagination,
  ClassListState,
} from './class-types';

const applyFilter = (all: SchoolClass[], filter: ClassListFilter) =>
  filter.grade !== undefined && filter.grade.length > 0
    ? all.filter((c) => filter.grade!.includes(c.grade))
    : all;

const applyPagination = (list: SchoolClass[], pagination: ClassListPagination) => {
  const start = pagination.offset;
  return list.slice(start, start + pagination.pageSize);
};

const initialState: ClassListState = {
  status: 'idle',
  data: [],
  filter: {},
  pagination: undefined,
  total: 0,
};

export const classListStateAtom = atom<ClassListState>(initialState);

export const classListActionAtom = atom(
  null,
  async (get, set, action: ClassListAction) => {
    const state = get(classListStateAtom);

    if (action.type === 'SEARCH') {
      const filter = action.filter ?? state.filter;
      const pagination = action.pagination;
      set(classListStateAtom, { ...state, status: 'loading', filter, pagination: state.pagination ?? pagination });
      try {
        const data = await getStudent().findClass();
        const filtered = applyFilter(data, filter);
        const pageData = applyPagination(filtered, pagination);
        set(classListStateAtom, {
          status: 'success',
          data: pageData,
          filter,
          pagination,
          total: filtered.length,
        });
      } catch (err) {
        set(classListStateAtom, { ...state, status: 'error', filter, pagination, error: toApiError(err) });
      }
    } else if (action.type === 'REFRESH') {
      if (
        state.status !== 'success' &&
        state.status !== 'error' &&
        state.status !== 'invalid'
      ) {
        return;
      }
      set(classListStateAtom, { ...state, status: 'loading' });
      try {
        const data = await getStudent().findClass();
        const filtered = applyFilter(data, state.filter);
        const pageData = applyPagination(filtered, state.pagination);
        set(classListStateAtom, {
          ...state,
          status: 'success',
          data: pageData,
          total: filtered.length,
        });
      } catch (err) {
        set(classListStateAtom, { ...state, status: 'error', error: toApiError(err) });
      }
    } else if (action.type === 'INVALIDATE') {
      if (state.status !== 'success' && state.status !== 'error') {
        return;
      }
      set(classListStateAtom, { ...state, status: 'invalid' });
    } else if (action.type === 'RESET') {
      set(classListStateAtom, initialState);
    }
  },
);
