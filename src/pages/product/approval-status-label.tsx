import { FC } from 'react';
import { Body1, InputProps, makeStyles, shorthands } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/Input';
import { getEnumValueByRawValue } from '../../utils/enum-util';
import { ApprovalStatus } from '../../__generated__/linkedup-web-api-client';
import { CheckmarkRegular, DismissCircleRegular, PauseCircleRegular } from '@fluentui/react-icons';

interface ApprovalStatusLabelProps {
  status: ApprovalStatus;
}

const useStyles = makeStyles({
  label: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('0.5rem'),
  },
});

const statusIcons: Record<ApprovalStatus, JSX.Element> = {
  Pending: <PauseCircleRegular />,
  Rejected: <DismissCircleRegular />,
  Approved: <CheckmarkRegular />,
};

export const ApprovalStatusLabel: FC<ApprovalStatusLabelProps> = ({ status }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <div className={styles.label}>
      {statusIcons[status]}
      <Body1>{t(`productApproval.status.value.${status}`)}</Body1>
    </div>
  );
};

export const ApprovalStatusReadOnlyInput: React.FC<InputProps> = ({ value, ...others }) => {
  const { t } = useTranslation();

  const status = value ? getEnumValueByRawValue(ApprovalStatus, value) : undefined;
  return (
    <Input
      {...others}
      contentBefore={status ? statusIcons[status] : undefined}
      readOnly
      value={status ? t(`productApproval.status.value.${status}`) : ''}
    />
  );
};
