import type {
  Activity,
  ActivityCategory,
  ActivityPayload,
  ActivityPayloadForClass,
  ActivityPayloadForGrade,
  ActivityStatus,
} from '@openapi/types.gen';
import type { ApiError } from '@store/api-error';

export type ActivityListItem = Activity & { withParticipation?: boolean | null };

export type ActivityListFilter = {
  category?: ActivityCategory[];
  status?: ActivityStatus[];
  withParticipation?: boolean;
  studentIds?: string[];
  forGrade?: number[];
  forClass?: string[];
  fromStartDate?: Date;
  toEndDate?: Date;
};

export type ActivityListPagination = {
  offset: number;
  pageSize: number;
};

export type ActivityListStatus = 'idle' | 'loading' | 'success' | 'invalid' | 'error';

type ActivityListStateBase = {
  data: ActivityListItem[];
  error?: ApiError;
  filter: ActivityListFilter;
  total: number;
};

export type ActivityListState =
  | (ActivityListStateBase & { status: 'idle'; pagination: undefined })
  | (ActivityListStateBase & {
      status: Exclude<ActivityListStatus, 'idle'>;
      pagination: ActivityListPagination;
    });

export type ActivityListAction =
  | { type: 'SEARCH'; filter?: ActivityListFilter; pagination: ActivityListPagination }
  | { type: 'REFRESH' }
  | { type: 'INVALIDATE' }
  | { type: 'RESET' };

export type ActivityEditStatus = 'idle' | 'loading' | 'success' | 'error';

export type ActivityEditState = {
  status: ActivityEditStatus;
  data: Activity | null;
  error?: ApiError;
};

export type ActivityEditAction =
  | { type: 'GET'; id: string }
  | { type: 'CREATE'; payload: ActivityPayload }
  | { type: 'UPDATE'; payload: { id: string; version: number } & ActivityPayload }
  | { type: 'RESET' };

export type {
  Activity,
  ActivityCategory,
  ActivityPayload,
  ActivityPayloadForClass,
  ActivityPayloadForGrade,
  ActivityStatus,
};
