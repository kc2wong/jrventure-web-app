import type { Auditible, Notice, NoticePayload, NoticePayloadForClass, NoticePayloadForGrade, NoticeStatus } from '@openapi/types.gen';
import type { ApiError } from '@store/api-error';

export type NoticeListFilter = {
  status?: NoticeStatus[];
  title?: string;
  fromDueAt?: Date;
  toDueAt?: Date;
  fromDistributedAt?: Date;
  toDistributedAt?: Date;
  forGrade?: number[];
  forClass?: string[];
};

export type NoticeListPagination = {
  offset: number;
  pageSize: number;
};

export type NoticeListStatus = 'idle' | 'loading' | 'success' | 'invalid' | 'error';

type NoticeListStateBase = {
  data: Notice[];
  error?: ApiError;
  filter: NoticeListFilter;
  total: number;
};

export type NoticeListState =
  | (NoticeListStateBase & { status: 'idle'; pagination: undefined })
  | (NoticeListStateBase & {
      status: Exclude<NoticeListStatus, 'idle'>;
      pagination: NoticeListPagination;
    });

export type NoticeListAction =
  | { type: 'SEARCH'; filter?: NoticeListFilter; pagination: NoticeListPagination }
  | { type: 'REFRESH' }
  | { type: 'INVALIDATE' }
  | { type: 'RESET' };

export type NoticeEditStatus = 'idle' | 'loading' | 'success' | 'error';

export type NoticeEditState = {
  status: NoticeEditStatus;
  data: Notice | null;
  error?: ApiError;
};

export type NoticeEditAction =
  | { type: 'GET'; id: string }
  | { type: 'CREATE'; payload: NoticePayload }
  | { type: 'UPDATE'; payload: { id: string; version: number } & NoticePayload }
  | { type: 'DISTRIBUTE'; id: string; version: number }
  | { type: 'RECALL'; id: string; version: number }
  | { type: 'RESET' };

export type { Auditible, Notice, NoticePayload, NoticePayloadForClass, NoticePayloadForGrade, NoticeStatus };
