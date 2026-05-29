import { getActivity } from '@openapi/activity';
import { getActivityParticipation } from '@openapi/activity-participation';
import { toApiError } from '@store/api-error';
import type { ApiError } from '@store/api-error';
import { atom } from 'jotai';

import type {
  ActivityListAction,
  ActivityListFilter,
  ActivityListItem,
  ActivityListPagination,
  ActivityListState,
} from './activity-types';

const initialState: ActivityListState = {
  status: 'idle',
  data: [],
  filter: {},
  pagination: undefined,
  total: 0,
};

const buildActivityQuery = (
  filter: ActivityListFilter,
  pagination: ActivityListPagination,
) => ({
  forclass: filter.forClass?.length ? filter.forClass : undefined,
  forGrade: filter.forGrade?.length ? filter.forGrade : undefined,
  fromStartDate: filter.fromStartDate?.toISOString(),
  limit: pagination.pageSize,
  skip: pagination.offset,
  status: filter.status?.length ? filter.status : undefined,
  studentIds: filter.studentIds?.length ? filter.studentIds : undefined,
  toEndDate: filter.toEndDate?.toISOString(),
});

type FetchResult = {
  items: ActivityListItem[];
  total: number;
  error?: ApiError;
};

const fetchActivities = async (
  filter: ActivityListFilter,
  pagination: ActivityListPagination,
): Promise<FetchResult> => {
  try {
    if (filter.withParticipation && filter.studentIds?.length) {
      const data = await getActivityParticipation().findParticipation({
        activityCategories: filter.category?.length ? filter.category : undefined,
        activityFromStartDate: filter.fromStartDate?.toISOString(),
        activityToStartDate: filter.toEndDate?.toISOString(),
        limit: pagination.pageSize,
        skip: pagination.offset,
        studentIds: filter.studentIds,
      });
      const items = (data.items ?? []).map((p) => ({
        ...p.activity,
        withParticipation: true as const,
      }));
      return { items, total: data.total ?? 0 };
    }

    const data = await getActivity().findActivity(buildActivityQuery(filter, pagination));
    return { items: data.items ?? [], total: data.total ?? 0 };
  } catch (err) {
    return { items: [], total: 0, error: toApiError(err) };
  }
};

export const activityListStateAtom = atom<ActivityListState>(initialState);

export const activityListActionAtom = atom(
  null,
  async (get, set, action: ActivityListAction) => {
    const state = get(activityListStateAtom);

    if (action.type === 'SEARCH') {
      const filter = action.filter ?? state.filter;
      const pagination = action.pagination;
      set(activityListStateAtom, {
        ...state,
        status: 'loading',
        filter,
        pagination: state.pagination ?? pagination,
      });
      const result = await fetchActivities(filter, pagination);
      if (result.error) {
        set(activityListStateAtom, {
          ...state,
          status: 'error',
          filter,
          pagination,
          error: result.error,
        });
        return;
      }
      set(activityListStateAtom, {
        status: 'success',
        data: result.items,
        filter,
        pagination,
        total: result.total,
      });
    } else if (action.type === 'REFRESH') {
      if (
        state.status !== 'success' &&
        state.status !== 'error' &&
        state.status !== 'invalid'
      ) {
        return;
      }
      set(activityListStateAtom, { ...state, status: 'loading' });
      const result = await fetchActivities(state.filter, state.pagination);
      if (result.error) {
        set(activityListStateAtom, {
          ...state,
          status: 'error',
          error: result.error,
        });
        return;
      }
      set(activityListStateAtom, {
        ...state,
        status: 'success',
        data: result.items,
        total: result.total,
      });
    } else if (action.type === 'INVALIDATE') {
      if (state.status !== 'success' && state.status !== 'error') {
        return;
      }
      set(activityListStateAtom, { ...state, status: 'invalid' });
    } else if (action.type === 'RESET') {
      set(activityListStateAtom, initialState);
    }
  },
);
