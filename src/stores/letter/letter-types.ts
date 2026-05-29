import type { Auditible, Letter, LetterStatus } from '@openapi/index.schemas';
import type { ApiError } from '@store/api-error';

export type LetterListFilter = {
  studentId?: string;
  status?: LetterStatus[];
  fromCreatedAt?: Date;
  toCreatedAt?: Date;
};

export type LetterListPagination = {
  offset: number;
  pageSize: number;
};

export type LetterListStatus = 'idle' | 'loading' | 'success' | 'invalid' | 'error';

type LetterListStateBase = {
  data: Letter[];
  error?: ApiError;
  filter: LetterListFilter;
  total: number;
};

export type LetterListState =
  | (LetterListStateBase & { status: 'idle'; pagination: undefined })
  | (LetterListStateBase & {
      status: Exclude<LetterListStatus, 'idle'>;
      pagination: LetterListPagination;
    });

export type LetterListAction =
  | { type: 'SEARCH'; filter?: LetterListFilter; pagination: LetterListPagination }
  | { type: 'REFRESH' }
  | { type: 'INVALIDATE' }
  | { type: 'RESET' };

export type LetterEditStatus = 'idle' | 'loading' | 'success' | 'error';

export type LetterEditState = {
  status: LetterEditStatus;
  data: Letter | null;
  error?: ApiError;
};

export type LetterEditAction =
  | { type: 'GET'; id: string }
  | { type: 'ACKNOWLEDGE'; id: string; version: number }
  | { type: 'RESET' };

export type { Auditible, Letter, LetterStatus };
