import { FC } from 'react';
import { Body1, InputProps, makeStyles, shorthands } from '@fluentui/react-components';
import { CheckmarkCircleRegular, DismissCircleRegular, ProhibitedRegular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { UserStatus } from '../../models/openapi';
import { Input } from '../../components/Input';
import { getEnumValueByRawValue } from '../../utils/enum-util';

interface StatusLabelProps {
  status: UserStatus;
}

const useStyles = makeStyles({
  label: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('0.5rem'),
  },
});

const statusIcons: Record<UserStatus, JSX.Element> = {
  Active: <CheckmarkCircleRegular />,
  Inactive: <DismissCircleRegular />,
  Suspend: <ProhibitedRegular />,
};

export const StatusLabel: FC<StatusLabelProps> = ({ status }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <div className={styles.label}>
      {statusIcons[status]}
      <Body1>{t(`userMaintenance.status.value.${status}`)}</Body1>
    </div>
  );
};

export const StatusReadOnlyInput: React.FC<InputProps> = ({ value, ...others }) => {
  const { t } = useTranslation();

  const status = value ? getEnumValueByRawValue(UserStatus, value) : undefined;
  return (
    <Input
      {...others}
      contentBefore={status ? statusIcons[status] : undefined}
      readOnly
      value={status ? t(`userMaintenance.status.value.${status}`) : ''}
    />
  );
};
