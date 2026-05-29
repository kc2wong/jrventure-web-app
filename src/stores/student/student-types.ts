import type { Auditible, Student } from '@openapi/index.schemas';
import type { ApiError } from '@store/api-error';

export type StudentListFilter = {
  id?: string;
  classId?: string;
  name?: string;
};

export type StudentListPagination = {
  offset: number;
  pageSize: number;
};

export type StudentListStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'invalid'
  | 'error';

type StudentListStateBase = {
  data: Student[];
  error?: ApiError;
  filter: StudentListFilter;
  total: number;
};

export type StudentListState =
  | (StudentListStateBase & { status: 'idle'; pagination: undefined })
  | (StudentListStateBase & {
      status: Exclude<StudentListStatus, 'idle'>;
      pagination: StudentListPagination;
    });

export type StudentListAction =
  | {
      type: 'SEARCH';
      filter?: StudentListFilter;
      pagination: StudentListPagination;
    }
  | { type: 'REFRESH' }
  | { type: 'INVALIDATE' }
  | { type: 'RESET' };

export type StudentEditStatus = 'idle' | 'loading' | 'success' | 'error';

export type StudentEditState = {
  status: StudentEditStatus;
  data: Student | null;
  error?: ApiError;
};

export type StudentEditAction =
  | { type: 'GET'; id: string }
  | { type: 'CREATE'; payload: Omit<Student, 'id' | keyof Auditible> }
  | { type: 'UPDATE'; payload: Omit<Student, keyof Auditible> }
  | { type: 'RESET' };

export type { Student };
