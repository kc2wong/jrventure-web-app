import { FC } from 'react';
import { Body1, makeStyles, shorthands } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../../models/openapi';
import { getEnumValueByRawValue } from '../../utils/enum-util';
import { BookRegular, PeopleListRegular, PersonFeedbackRegular, WrenchRegular } from '@fluentui/react-icons';

interface RoleLabelProps {
  role: UserRole;
}

const useStyles = makeStyles({
  label: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('0.5rem'),
  },
});

interface RoleIconProps {
  role: UserRole | string;
  size?: number;
}

const roleIconComponents: Record<UserRole, FC<{ fontSize?: number }>> = {
  Student: BookRegular,
  Parent: PeopleListRegular,
  Teacher: PersonFeedbackRegular,
  Admin: WrenchRegular,
};

export const RoleIcon: FC<RoleIconProps> = ({ role, size = 20 }) => {
  const r = getEnumValueByRawValue(UserRole, role);
  if (r) {
    const IconComponent = roleIconComponents[r];
    return <IconComponent fontSize={size} />;
  } else {
    return <></>;
  }
};

export const RoleLabel: FC<RoleLabelProps> = ({ role }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <div className={styles.label}>
      <RoleIcon role={role} />
      <Body1>{t(`userMaintenance.role.value.${role}`)}</Body1>
    </div>
  );
};