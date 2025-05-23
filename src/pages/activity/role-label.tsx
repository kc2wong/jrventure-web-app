import { FC } from 'react';
import { Body1, makeStyles, shorthands } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { SubmissionRoleEnum } from '../../models/openapi';
import { getEnumValueByRawValue } from '../../utils/enum-util';
import {
  BookRegular,
  PeopleCommunityRegular,
  PersonFeedbackRegular,
} from '@fluentui/react-icons';

interface RoleLabelProps {
  role: SubmissionRoleEnum;
}

const useStyles = makeStyles({
  label: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('0.5rem'),
  },
});

interface RoleIconProps {
  role: SubmissionRoleEnum | string;
  size?: number;
}

const roleIconComponents: Record<SubmissionRoleEnum, FC<{ fontSize?: number }>> = {
  Student: BookRegular,
  Teacher: PersonFeedbackRegular,
  Both: PeopleCommunityRegular,
};

export const RoleIcon: FC<RoleIconProps> = ({ role, size = 20 }) => {
  const r = getEnumValueByRawValue(SubmissionRoleEnum, role);
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
      <Body1>{t(`activityMaintenance.submissionRole.value.${role}`)}</Body1>
    </div>
  );
};
