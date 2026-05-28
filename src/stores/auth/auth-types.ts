import type { JwtPayload, Student } from '@openapi/types.gen';

export type AuthUser = JwtPayload;

export type AuthStatus = 'initializing' | 'unauthenticated' | 'loading' | 'authenticated';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  lastLoginDatetime: string | null;
  selectedStudentId: string | undefined;
  entitledStudents: Student[];
  entitledMenuItemIds: string[];
  error: string | null;
}

export type AuthAction =
  | { type: 'INITIALIZE' }
  | { type: 'LOGIN'; payload: { email: string; password: string } }
  | { type: 'LOGOUT' }
  | { type: 'SWITCH_STUDENT'; payload: { studentId: string } };
