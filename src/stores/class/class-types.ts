import type { Class } from '@openapi/types.gen';
import type { ApiError } from '@store/api-error';

export type ClassListFilter = {
  grade?: number[];
};

export type ClassListPagination = {
  offset: number;
  pageSize: number;
};

export type ClassListStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'invalid'
  | 'error';

type ClassListStateBase = {
  data: Class[];
  error?: ApiError;
  filter: ClassListFilter;
  total: number;
};

export type ClassListState =
  | (ClassListStateBase & { status: 'idle'; pagination: undefined })
  | (ClassListStateBase & {
      status: Exclude<ClassListStatus, 'idle'>;
      pagination: ClassListPagination;
    });

export type ClassListAction =
  | {
      type: 'SEARCH';
      filter?: ClassListFilter;
      pagination: ClassListPagination;
    }
  | { type: 'REFRESH' }
  | { type: 'INVALIDATE' }
  | { type: 'RESET' };

export type ClassEditStatus = 'idle' | 'loading' | 'success' | 'error';

export type ClassEditState = {
  status: ClassEditStatus;
  data: Class | null;
  error?: ApiError;
};

export type ClassEditAction =
  | { type: 'GET'; id: string }
  | { type: 'CREATE'; payload: Omit<Class, 'id'> }
  | { type: 'UPDATE'; payload: Class }
  | { type: 'RESET' };

export type { Class };
