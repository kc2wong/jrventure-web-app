import { authStateAtom } from '@store/auth/auth-bloc';
import type { UserRole } from '@store/user/user-types';
import { useAtomValue } from 'jotai';
import type { ReactNode } from 'react';

type RoleBasedComponentProps = {
  children: ReactNode;
  role: UserRole | UserRole[];
};

const RoleBasedComponent = ({ children, role }: RoleBasedComponentProps) => {
  const { user } = useAtomValue(authStateAtom);
  const roles = Array.isArray(role) ? role : [role];

  if (!user || !(roles as string[]).includes(user.role)) {
    return <></>;
  }

  return <>{children}</>;
};

export { RoleBasedComponent };
export type { RoleBasedComponentProps };
