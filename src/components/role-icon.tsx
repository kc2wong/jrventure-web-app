import { FC } from 'react';
import {
  BookRegular,
  PeopleListRegular,
  PersonFeedbackRegular,
  WrenchRegular,
} from '@fluentui/react-icons';
import { UserRole } from '../models/openapi';

interface RoleIconProps {
  role: UserRole;
  size?: number;
}

const roleIconComponents: Record<UserRole, FC<{ fontSize?: number }>> = {
  Student: BookRegular,
  Parent: PeopleListRegular,
  Teacher: PersonFeedbackRegular,
  Admin: WrenchRegular,
};

export const RoleIcon: FC<RoleIconProps> = ({ role, size = 20 }) => {
  const IconComponent = roleIconComponents[role];
  return <IconComponent fontSize={size} />;
};
