import type { User, UserCreation, UserRole, UserStatus } from '@openapi/index.schemas';
import type { ApiError } from '@store/api-error';

export type UserListFilter = {
  email?: string;
  name?: string;
  role?: UserRole;
  status?: UserStatus;
};

export type UserListPagination = {
  offset: number;
  pageSize: number;
};

export type UserListStatus = 'idle' | 'loading' | 'success' | 'invalid' | 'error';

type UserListStateBase = {
  data: User[];
  error?: ApiError;
  filter: UserListFilter;
  total: number;
};

export type UserListState =
  | (UserListStateBase & { status: 'idle'; pagination: undefined })
  | (UserListStateBase & {
      status: Exclude<UserListStatus, 'idle'>;
      pagination: UserListPagination;
    });

export type UserListAction =
  | { type: 'SEARCH'; filter?: UserListFilter; pagination: UserListPagination }
  | { type: 'REFRESH' }
  | { type: 'INVALIDATE' }
  | { type: 'RESET' };

export type UserEditStatus = 'idle' | 'loading' | 'success' | 'error';

export type UserEditState = {
  status: UserEditStatus;
  data: User | null;
  error?: ApiError;
};

export type UserEditAction =
  | { type: 'GET'; id: string }
  | { type: 'CREATE'; payload: UserCreation }
  | { type: 'UPDATE'; payload: UserCreation & { id: string; version: number } }
  | { type: 'RESET' };

export type { ParentEntitlement, StudentEntitlement, TeacherEntitlement } from '@openapi/index.schemas';
export type { User, UserCreation, UserRole, UserStatus };
