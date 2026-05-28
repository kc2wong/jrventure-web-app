import { JrVcInputDropdown } from '@component/jr-venture-input';
import { makeStyles, tokens } from '@fluentui/react-components';
import {
  CheckmarkCircleRegular,
  MailReadRegular,
  MailUnreadRegular,
} from '@fluentui/react-icons';
import type { InputDropdownProps } from 'handy-fluentui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  optionContent: {
    alignItems: 'center',
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
});

type LetterStatusDropdownProps = Omit<InputDropdownProps, 'options'>;

const LetterStatusDropdown = (props: LetterStatusDropdownProps) => {
  const styles = useStyles();
  const { t } = useTranslation();

  const options = useMemo(
    () => [
      {
        text: t('letter.statusUnread'),
        value: 'UNREAD',
        render: () => (
          <span className={styles.optionContent}>
            <MailUnreadRegular fontSize={20} />
            {t('letter.statusUnread')}
          </span>
        ),
      },
      {
        text: t('letter.statusRead'),
        value: 'READ',
        render: () => (
          <span className={styles.optionContent}>
            <MailReadRegular fontSize={20} />
            {t('letter.statusRead')}
          </span>
        ),
      },
      {
        text: t('letter.statusAcknowledged'),
        value: 'ACKNOWLEDGED',
        render: () => (
          <span className={styles.optionContent}>
            <CheckmarkCircleRegular fontSize={20} />
            {t('letter.statusAcknowledged')}
          </span>
        ),
      },
    ],
    [t, styles.optionContent],
  );

  return <JrVcInputDropdown {...(props as InputDropdownProps)} options={options} />;
};

export { LetterStatusDropdown };
export type { LetterStatusDropdownProps };
