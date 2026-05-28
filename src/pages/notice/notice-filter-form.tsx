import { JrVcFilterForm } from '@component/jr-venture-filter-drawer-page';
import { ClassDropdown, GradeDropdown } from '@component/grade-class-input';
import { makeStyles, tokens } from '@fluentui/react-components';
import {
  ArrowSyncRegular,
  ArrowUndoRegular,
  CheckmarkCircleRegular,
  DocumentRegular,
  MailRegular,
} from '@fluentui/react-icons';
import {
  noticeListActionAtom,
  noticeListStateAtom,
} from '@store/notice/notice-list-bloc';
import type { NoticeStatus } from '@store/notice/notice-types';
import {
  FuiInputDate,
  FuiInputDropdown,
  FuiInputGroup,
  FuiInputText,
} from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  optionContent: {
    alignItems: 'center',
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
});

type NoticeFilterFormValues = {
  title: string | null;
  status: NoticeStatus[] | null;
  fromDueAt: Date | null;
  toDueAt: Date | null;
  fromDistributedAt: Date | null;
  toDistributedAt: Date | null;
  forGrade: string[] | null;
  forClass: string[] | null;
};

type NoticeFilterFormProps = {
  onSearch?: () => void;
};

const NoticeFilterForm = ({ onSearch }: NoticeFilterFormProps) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const listDispatch = useSetAtom(noticeListActionAtom);
  const { filter, pagination } = useAtomValue(noticeListStateAtom);

  const statusOptions = useMemo(
    () => [
      {
        text: t('notice.statusDraft'),
        value: 'DRAFT',
        render: () => (
          <span className={styles.optionContent}>
            <DocumentRegular fontSize={20} />
            {t('notice.statusDraft')}
          </span>
        ),
      },
      {
        text: t('notice.statusNew'),
        value: 'NEW',
        render: () => (
          <span className={styles.optionContent}>
            <MailRegular fontSize={20} />
            {t('notice.statusNew')}
          </span>
        ),
      },
      {
        text: t('notice.statusDistributing'),
        value: 'DISTRIBUTING',
        render: () => (
          <span className={styles.optionContent}>
            <ArrowSyncRegular fontSize={20} />
            {t('notice.statusDistributing')}
          </span>
        ),
      },
      {
        text: t('notice.statusDistributed'),
        value: 'DISTRIBUTED',
        render: () => (
          <span className={styles.optionContent}>
            <CheckmarkCircleRegular fontSize={20} />
            {t('notice.statusDistributed')}
          </span>
        ),
      },
      {
        text: t('notice.statusRecalled'),
        value: 'RECALLED',
        render: () => (
          <span className={styles.optionContent}>
            <ArrowUndoRegular fontSize={20} />
            {t('notice.statusRecalled')}
          </span>
        ),
      },
    ],
    [t, styles.optionContent],
  );

  const defaultValues = {
    title: filter.title ?? null,
    status: filter.status ?? null,
    fromDueAt: filter.fromDueAt ?? null,
    toDueAt: filter.toDueAt ?? null,
    fromDistributedAt: filter.fromDistributedAt ?? null,
    toDistributedAt: filter.toDistributedAt ?? null,
    forGrade: filter.forGrade?.map(String) ?? null,
    forClass: filter.forClass ?? null,
  };

  const { control, handleSubmit, reset } = useForm<NoticeFilterFormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [filter]);

  const onSubmit = async (values: NoticeFilterFormValues) => {
    await listDispatch({
      type: 'SEARCH',
      filter: {
        title: values.title || undefined,
        status: values.status?.length ? values.status : undefined,
        fromDueAt: values.fromDueAt ?? undefined,
        toDueAt: values.toDueAt ?? undefined,
        fromDistributedAt: values.fromDistributedAt ?? undefined,
        toDistributedAt: values.toDistributedAt ?? undefined,
        forGrade: values.forGrade?.length ? values.forGrade.map(Number) : undefined,
        forClass: values.forClass?.length ? values.forClass : undefined,
      },
      pagination: { offset: 0, pageSize: pagination?.pageSize ?? 10 },
    });
    onSearch?.();
  };

  return (
    <JrVcFilterForm onSearch={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <FuiInputText
            label={t('notice.noticeTitle')}
            onChange={(value) => field.onChange(value)}
            placeholder={t('notice.noticeTitlePlaceholder')}
            value={field.value ?? null}
          />
        )}
      />
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <FuiInputDropdown
            label={t('notice.status')}
            multiselect
            onChange={(value) => field.onChange((value as NoticeStatus[]) ?? null)}
            options={statusOptions}
            placeholder={t('general.text.all')}
            value={field.value ?? null}
          />
        )}
      />
      <Controller
        control={control}
        name="forGrade"
        render={({ field }) => (
          <GradeDropdown
            label={t('notice.forGrade')}
            onChange={field.onChange}
            placeholder={t('general.text.all')}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="forClass"
        render={({ field }) => (
          <ClassDropdown
            label={t('notice.forClass')}
            onChange={field.onChange}
            placeholder={t('general.text.all')}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="fromDueAt"
        render={({ field: fromField }) => (
          <Controller
            control={control}
            name="toDueAt"
            render={({ field: toField }) => (
              <FuiInputGroup
                items={[
                  {
                    element: (
                      <FuiInputDate
                        onChange={(date) => fromField.onChange(date ?? null)}
                        placeholder={t('general.text.from')}
                        value={fromField.value}
                      />
                    ),
                  },
                  {
                    element: (
                      <FuiInputDate
                        onChange={(date) => toField.onChange(date ?? null)}
                        placeholder={t('general.text.to')}
                        value={toField.value}
                      />
                    ),
                  },
                ]}
                label={t('notice.dueAt')}
              />
            )}
          />
        )}
      />
      <Controller
        control={control}
        name="fromDistributedAt"
        render={({ field: fromField }) => (
          <Controller
            control={control}
            name="toDistributedAt"
            render={({ field: toField }) => (
              <FuiInputGroup
                items={[
                  {
                    element: (
                      <FuiInputDate
                        onChange={(date) => fromField.onChange(date ?? null)}
                        placeholder={t('general.text.from')}
                        value={fromField.value}
                      />
                    ),
                  },
                  {
                    element: (
                      <FuiInputDate
                        onChange={(date) => toField.onChange(date ?? null)}
                        placeholder={t('general.text.to')}
                        value={toField.value}
                      />
                    ),
                  },
                ]}
                label={t('notice.distributedAt')}
              />
            )}
          />
        )}
      />
    </JrVcFilterForm>
  );
};

export { NoticeFilterForm };
