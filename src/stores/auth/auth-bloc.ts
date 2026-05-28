import { authenticateUser, findStudent } from '@openapi/sdk.gen';
import { clearTrace, initTrace, logger } from '@util/logger';
import { atom } from 'jotai';

import type { AuthAction, AuthState, AuthUser } from './auth-types';

const JWT_COOKIE = 'accessToken';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()!.split(';').shift() ?? null;
  }
  return null;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function parseJwt(token: string): AuthUser {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
  return JSON.parse(jsonPayload) as AuthUser;
}

function getSelectedStudentId(user: AuthUser): string | undefined {
  if (
    (user.role === 'PARENT' || user.role === 'STUDENT') &&
    user.entitlement?.studentIds?.length
  ) {
    return user.entitlement.studentIds[0];
  }
  return undefined;
}

const initialState: AuthState = {
  status: 'initializing',
  user: null,
  lastLoginDatetime: null,
  selectedStudentId: undefined,
  entitledStudents: [],
  entitledMenuItemIds: [],
  error: null,
};

export const authStateAtom = atom<AuthState>(initialState);

export const authUserAtom = atom<AuthUser | null>(
  (get) => get(authStateAtom).user,
);

export const authActionAtom = atom(
  null,
  async (_get, set, action: AuthAction) => {
    switch (action.type) {
      case 'INITIALIZE': {
        const token = getCookie(JWT_COOKIE);
        if (token) {
          const user = parseJwt(token);
          const studentIds =
            user.role === 'PARENT' || user.role === 'STUDENT'
              ? (user.entitlement?.studentIds ?? [])
              : [];
          const entitledStudents =
            studentIds.length > 0
              ? ((
                  await findStudent({
                    query: {
                      id: studentIds,
                      limit: studentIds.length,
                      skip: 0,
                    },
                  })
                ).data?.items ?? [])
              : [];
          set(authStateAtom, {
            status: 'authenticated',
            user,
            lastLoginDatetime: null,
            selectedStudentId: getSelectedStudentId(user),
            entitledStudents,
            entitledMenuItemIds: user.menuItemId ?? [],
            error: null,
          });
        } else {
          set(authStateAtom, {
            status: 'unauthenticated',
            user: null,
            lastLoginDatetime: null,
            selectedStudentId: undefined,
            entitledStudents: [],
            entitledMenuItemIds: [],
            error: null,
          });
        }
        break;
      }
      case 'LOGIN': {
        set(authStateAtom, (prev) => ({
          ...prev,
          status: 'loading',
          error: null,
        }));
        logger.info('authActionAtom.LOGIN', { email: action.payload.email });
        const { data, error } = await authenticateUser({
          body: {
            email: action.payload.email,
            password: action.payload.password,
          },
          throwOnError: false,
        });

        if (error) {
          set(authStateAtom, {
            status: 'unauthenticated',
            user: null,
            lastLoginDatetime: null,
            selectedStudentId: undefined,
            entitledStudents: [],
            entitledMenuItemIds: [],
            error: error.message,
          });
          break;
        }
        const token = getCookie(JWT_COOKIE);
        if (!token) {
          set(authStateAtom, {
            status: 'unauthenticated',
            user: null,
            lastLoginDatetime: null,
            selectedStudentId: undefined,
            entitledStudents: [],
            entitledMenuItemIds: [],
            error: 'Authentication failed',
          });
          break;
        }
        const user = parseJwt(token);
        set(authStateAtom, {
          status: 'authenticated',
          user,
          lastLoginDatetime: data?.lastLoginDatetime ?? null,
          selectedStudentId: getSelectedStudentId(user),
          entitledStudents: data?.entitlementStudents ?? [],
          entitledMenuItemIds: user.menuItemId ?? [],
          error: null,
        });
        break;
      }
      case 'SWITCH_STUDENT': {
        const current = _get(authStateAtom);
        if (!current.user) {
          break;
        }
        const entitled = current.user.entitlement?.studentIds ?? [];
        if (!entitled.includes(action.payload.studentId)) {
          break;
        }
        set(authStateAtom, {
          ...current,
          selectedStudentId: action.payload.studentId,
        });
        break;
      }
      case 'LOGOUT': {
        set(authStateAtom, (prev) => ({
          ...prev,
          status: 'loading',
          error: null,
        }));
        deleteCookie(JWT_COOKIE);
        clearTrace();
        initTrace();
        set(authStateAtom, {
          status: 'unauthenticated',
          user: null,
          lastLoginDatetime: null,
          selectedStudentId: undefined,
          entitledStudents: [],
          entitledMenuItemIds: [],
          error: null,
        });
        break;
      }
    }
  },
);
