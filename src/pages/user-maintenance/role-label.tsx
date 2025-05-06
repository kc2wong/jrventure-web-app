import { FC } from 'react';
import { Body1, InputProps, makeStyles, shorthands } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../../models/openapi';
import { Input } from '../../components/Input';
import { getEnumValueByRawValue } from '../../utils/enum-util';
import { RoleIcon } from '../../components/role-icon';

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

export const RoleReadOnlyInput: React.FC<InputProps> = ({ value, ...others }) => {
  const { t } = useTranslation();

  const role = value ? getEnumValueByRawValue(UserRole, value) : undefined;
  return (
    <Input
      {...others}
      contentBefore={role ? <RoleIcon role={role} /> : undefined}
      readOnly
      value={role ? t(`userMaintenance.role.value.${role}`) : ''}
    />
  );
};
