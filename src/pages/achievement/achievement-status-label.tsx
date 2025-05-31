import { FC } from 'react';
import { Body1, makeStyles, shorthands } from '@fluentui/react-components';
import {
  CheckmarkCircleRegular,
  CheckmarkCircleSquareRegular,
  DismissCircleRegular,
  PauseCircleRegular,
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { AchievementStatusEnum } from '../../models/openapi';
import { getEnumValueByRawValue } from '../../utils/enum-util';

interface StatusLabelProps {
  status: AchievementStatusEnum;
}

const useStyles = makeStyles({
  label: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('0.5rem'),
  },
});

interface StatusIconProps {
  status: AchievementStatusEnum | string;
  size?: number;
}

const statusIcons: Record<AchievementStatusEnum, FC<{ fontSize?: number }>> = {
  New: PauseCircleRegular,
  Pending: PauseCircleRegular,
  Rejected: DismissCircleRegular,
  Approved: CheckmarkCircleRegular,
  Published: CheckmarkCircleSquareRegular,
};

export const AchievementStatusIcon: FC<StatusIconProps> = ({ status, size = 20 }) => {
  const r = getEnumValueByRawValue(AchievementStatusEnum, status);
  if (r) {
    const IconComponent = statusIcons[r];
    return <IconComponent fontSize={size} />;
  } else {
    return <></>;
  }
};

export const AchievementStatusLabel: FC<StatusLabelProps> = ({ status }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <div className={styles.label}>
      <AchievementStatusIcon status={status} />
      <Body1>{t(`achievement.status.value.${status}`)}</Body1>
    </div>
  );
};
