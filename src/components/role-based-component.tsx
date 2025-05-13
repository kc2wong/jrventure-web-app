import { ReactElement } from 'react';
import { UserRole } from '../models/openapi';
import { useAtomValue } from 'jotai';
import { authenticationAtom } from '../states/authentication';
import { asArray } from '../utils/array-util';

type RoleBaseComponentProps = {
  entitledRole: UserRole[] | UserRole;
  children: ReactElement | ReactElement[];
};

export const RoleBaseComponent: React.FC<RoleBaseComponentProps> = ({ entitledRole, children }) => {
  const state = useAtomValue(authenticationAtom);
  const userRole = state.login?.user.role;
  const entitledRoleArray = asArray(entitledRole);

  return userRole && entitledRoleArray?.includes(userRole) ? children : <></>;
};
