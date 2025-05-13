import { ReactElement } from 'react';
import { UserRoleEnum } from '../models/openapi';
import { useAtomValue } from 'jotai';
import { authenticationAtom } from '../states/authentication';
import { asArray } from '../utils/array-util';
import { getEnumValueByRawValue } from '../utils/enum-util';

type RoleBaseComponentProps = {
  entitledRole: UserRoleEnum[] | UserRoleEnum;
  children: ReactElement | ReactElement[];
};

export const RoleBaseComponent: React.FC<RoleBaseComponentProps> = ({ entitledRole, children }) => {
  const state = useAtomValue(authenticationAtom);
  const userRole = state.login?.user.role;
  const entitledRoleArray = asArray(entitledRole);

  return userRole &&
    entitledRoleArray?.includes(getEnumValueByRawValue(UserRoleEnum, userRole)!) ? (
    children
  ) : (
    <></>
  );
};
