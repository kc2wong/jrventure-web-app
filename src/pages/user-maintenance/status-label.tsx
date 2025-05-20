import { FC } from 'react';
import { Body1, makeStyles, shorthands } from '@fluentui/react-components';
import {
  CheckmarkCircleRegular,
  DismissCircleRegular,
  ProhibitedRegular,
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { UserStatusEnum } from '../../models/openapi';
import { getEnumValueByRawValue } from '../../utils/enum-util';

interface StatusLabelProps {
  status: UserStatusEnum;
}

const useStyles = makeStyles({
  label: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('0.5rem'),
  },
});

interface StatusIconProps {
  status: UserStatusEnum | string;
  size?: number;
}

const statusIcons: Record<UserStatusEnum, FC<{ fontSize?: number }>> = {
  Active: CheckmarkCircleRegular,
  Inactive: DismissCircleRegular,
  Suspend: ProhibitedRegular,
};

export const StatusIcon: FC<StatusIconProps> = ({ status, size = 20 }) => {
  const r = getEnumValueByRawValue(UserStatusEnum, status);
  if (r) {
    const IconComponent = statusIcons[r];
    return <IconComponent fontSize={size} />;
  } else {
    return <></>;
  }
};

export const StatusLabel: FC<StatusLabelProps> = ({ status }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <div className={styles.label}>
      <StatusIcon status={status} />
      <Body1>{t(`userMaintenance.status.value.${status}`)}</Body1>
    </div>
  );
};
