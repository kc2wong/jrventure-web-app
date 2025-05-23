import { FC } from 'react';
import { Body1, makeStyles, shorthands } from '@fluentui/react-components';
import {
  BookClockRegular,
  BookDismissRegular,
  BookExclamationMarkRegular,
  BookStarRegular,
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { ActivityStatusEnum } from '../../models/openapi';
import { getEnumValueByRawValue } from '../../utils/enum-util';

interface StatusLabelProps {
  status: ActivityStatusEnum;
}

const useStyles = makeStyles({
  label: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('0.5rem'),
  },
});

interface StatusIconProps {
  status: ActivityStatusEnum | string;
  size?: number;
}

const statusIcons: Record<ActivityStatusEnum, FC<{ fontSize?: number }>> = {
  Open: BookStarRegular,
  Cancelled: BookDismissRegular,
  Closed: BookExclamationMarkRegular,
  Scheduled: BookClockRegular,
};

export const StatusIcon: FC<StatusIconProps> = ({ status, size = 20 }) => {
  const r = getEnumValueByRawValue(ActivityStatusEnum, status);
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
      <Body1>{t(`activityMaintenance.status.value.${status}`)}</Body1>
    </div>
  );
};
