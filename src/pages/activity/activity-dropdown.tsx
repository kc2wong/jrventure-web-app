import { JrVcInputDropdown } from '@component/jr-venture-input';
import { makeStyles, tokens } from '@fluentui/react-components';
import {
  BookRegular,
  CheckmarkCircleRegular,
  CodeRegular,
  DismissCircleRegular,
  DocumentRegular,
  DrawTextRegular,
  HeartRegular,
  MusicNote2Regular,
  SportRegular,
} from '@fluentui/react-icons';
import type { ActivityCategory, ActivityStatus } from '@store/activity/activity-types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  optionContent: {
    alignItems: 'center',
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
});

type ActivityCategoryDropdownProps = {
  clearable?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  label?: string;
  multiselect?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value: ActivityCategory | ActivityCategory[] | null;
  onChange: (value: ActivityCategory | ActivityCategory[] | null) => void;
};

const ActivityCategoryDropdown = ({
  clearable,
  disabled,
  errorMessage,
  label,
  multiselect,
  onChange,
  placeholder,
  readOnly,
  required,
  value,
}: ActivityCategoryDropdownProps) => {
  const styles = useStyles();
  const { t } = useTranslation();

  const options = useMemo(
    () => [
      {
        text: t('activity.categorySports'),
        value: 'SPORTS',
        render: () => (
          <span className={styles.optionContent}>
            <SportRegular fontSize={20} />
            {t('activity.categorySports')}
          </span>
        ),
      },
      {
        text: t('activity.categoryAcademic'),
        value: 'ACADEMIC',
        render: () => (
          <span className={styles.optionContent}>
            <BookRegular fontSize={20} />
            {t('activity.categoryAcademic')}
          </span>
        ),
      },
      {
        text: t('activity.categoryArtistic'),
        value: 'ARTISTIC',
        render: () => (
          <span className={styles.optionContent}>
            <DrawTextRegular fontSize={20} />
            {t('activity.categoryArtistic')}
          </span>
        ),
      },
      {
        text: t('activity.categoryMusic'),
        value: 'MUSIC',
        render: () => (
          <span className={styles.optionContent}>
            <MusicNote2Regular fontSize={20} />
            {t('activity.categoryMusic')}
          </span>
        ),
      },
      {
        text: t('activity.categoryService'),
        value: 'SERVICE',
        render: () => (
          <span className={styles.optionContent}>
            <HeartRegular fontSize={20} />
            {t('activity.categoryService')}
          </span>
        ),
      },
      {
        text: t('activity.categoryTechnology'),
        value: 'TECHNOLOGY',
        render: () => (
          <span className={styles.optionContent}>
            <CodeRegular fontSize={20} />
            {t('activity.categoryTechnology')}
          </span>
        ),
      },
    ],
    [t, styles.optionContent],
  );

  return (
    <JrVcInputDropdown
      clearable={clearable}
      disabled={disabled}
      errorMessage={errorMessage}
      label={label}
      multiselect={multiselect}
      onChange={(v) => onChange(v as ActivityCategory | ActivityCategory[] | null)}
      options={options}
      placeholder={placeholder}
      readOnly={readOnly}
      required={required}
      value={value}
    />
  );
};

type ActivityStatusDropdownProps = {
  clearable?: boolean;
  disabled?: boolean;
  disabledValues?: ActivityStatus[];
  errorMessage?: string;
  label?: string;
  multiselect?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value: ActivityStatus | ActivityStatus[] | null;
  onChange: (value: ActivityStatus | ActivityStatus[] | null) => void;
};

const ActivityStatusDropdown = ({
  clearable,
  disabled,
  disabledValues,
  errorMessage,
  label,
  multiselect,
  onChange,
  placeholder,
  readOnly,
  required,
  value,
}: ActivityStatusDropdownProps) => {
  const styles = useStyles();
  const { t } = useTranslation();

  const options = useMemo(
    () => [
      {
        disabled: disabledValues?.includes('DRAFT'),
        text: t('activity.statusDraft'),
        value: 'DRAFT',
        render: () => (
          <span className={styles.optionContent}>
            <DocumentRegular fontSize={20} />
            {t('activity.statusDraft')}
          </span>
        ),
      },
      {
        disabled: disabledValues?.includes('CONFIRMED'),
        text: t('activity.statusConfirmed'),
        value: 'CONFIRMED',
        render: () => (
          <span className={styles.optionContent}>
            <CheckmarkCircleRegular fontSize={20} />
            {t('activity.statusConfirmed')}
          </span>
        ),
      },
      {
        disabled: disabledValues?.includes('CANCELLED'),
        text: t('activity.statusCancelled'),
        value: 'CANCELLED',
        render: () => (
          <span className={styles.optionContent}>
            <DismissCircleRegular fontSize={20} />
            {t('activity.statusCancelled')}
          </span>
        ),
      },
    ],
    [t, styles.optionContent, disabledValues],
  );

  return (
    <JrVcInputDropdown
      clearable={clearable}
      disabled={disabled}
      errorMessage={errorMessage}
      label={label}
      multiselect={multiselect}
      onChange={(v) => onChange(v as ActivityStatus | ActivityStatus[] | null)}
      options={options}
      placeholder={placeholder}
      readOnly={readOnly}
      required={required}
      value={value}
    />
  );
};

export { ActivityCategoryDropdown, ActivityStatusDropdown };
