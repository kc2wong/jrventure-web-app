import { ClassDropdown, GradeDropdown } from '@component/grade-class-input';
import { CancelButton } from '@component/jr-venture-button';
import { JrVcEditPageLayout } from '@component/jr-venture-edit-page-layout';
import { JrVcGrid, JrVcGridItem } from '@component/jr-venture-grid';
import {
  JrVcInputDate,
  JrVcInputDropdown,
  JrVcInputText,
} from '@component/jr-venture-input';
import type { MaintenanceEditPageProps } from '@component/with-maintenance-page';
import {
  Button,
  Radio,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowSyncRegular,
  ArrowUndoRegular,
  CheckmarkCircleRegular,
  DocumentRegular,
  MailRegular,
  SaveRegular,
} from '@fluentui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { authUserAtom } from '@store/auth/auth-bloc';
import {
  noticeEditActionAtom,
  noticeEditStateAtom,
} from '@store/notice/notice-edit-bloc';
import { noticeListActionAtom } from '@store/notice/notice-list-bloc';
import type {
  NoticePayload,
  NoticePayloadForGrade,
  NoticeStatus,
} from '@store/notice/notice-types';
import {
  referenceDataActionAtom,
  referenceDataStateAtom,
} from '@store/reference-data/reference-data-bloc';
import { toIsoDateString } from '@util/date-util';
import {
  EMPTY_MULTI_LANG_TEXT,
  multiLangNameToText,
  multiLangTextToName,
} from '@util/form-util';
import {
  FuiButtonPanel,
  FuiInputRadio,
  FuiInputSwitch,
  FuiInputTextArea,
  FuiTab,
  FuiTabList,
  type MultiLangText,
} from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useController, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const useStyles = makeStyles({
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: tokens.spacingVerticalS,
  },
  statusOption: {
    alignItems: 'center',
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  tabError: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
    paddingTop: tokens.spacingVerticalXS,
  },
});

type TargetType = 'grade' | 'class';

type NoticeFormValues = {
  noticeTitle: MultiLangText;
  content: MultiLangText;
  dueAt: Date | null;
  isAcknowledgementRequired: boolean;
  status: NoticeStatus;
  targetType: TargetType;
  forGrade: string[];
  forClass: string[];
};

const isForGrade = (payload: NoticePayload): payload is NoticePayloadForGrade =>
  'forGrade' in payload;

const NoticeEditPage = ({ id, mode, onExit }: MaintenanceEditPageProps) => {
  const styles = useStyles();
  const { i18n, t } = useTranslation();

  const dispatch = useSetAtom(noticeEditActionAtom);
  const listDispatch = useSetAtom(noticeListActionAtom);
  const { data } = useAtomValue(noticeEditStateAtom);
  const { classes, status: refDataStatus } = useAtomValue(
    referenceDataStateAtom,
  );
  const refDataDispatch = useSetAtom(referenceDataActionAtom);
  const authUser = useAtomValue(authUserAtom);

  const hasGradeAccess = (authUser?.grades?.length ?? 0) > 0;

  useEffect(() => {
    if (classes.length === 0 && refDataStatus !== 'loading') {
      void refDataDispatch({ type: 'FETCH' });
    }
  }, [classes.length, refDataStatus]);

  const statusEditable = data?.status === 'DRAFT' || data?.status === 'NEW';
  const statusOptions = useMemo(
    () => [
      {
        disabled: !statusEditable,
        text: t('notice.statusDraft'),
        value: 'DRAFT',
        render: () => (
          <span className={styles.statusOption}>
            <DocumentRegular fontSize={20} />
            {t('notice.statusDraft')}
          </span>
        ),
      },
      {
        disabled: !statusEditable,
        text: t('notice.statusNew'),
        value: 'NEW',
        render: () => (
          <span className={styles.statusOption}>
            <MailRegular fontSize={20} />
            {t('notice.statusNew')}
          </span>
        ),
      },
      {
        disabled: true,
        text: t('notice.statusDistributing'),
        value: 'DISTRIBUTING',
        render: () => (
          <span className={styles.statusOption}>
            <ArrowSyncRegular fontSize={20} />
            {t('notice.statusDistributing')}
          </span>
        ),
      },
      {
        disabled: true,
        text: t('notice.statusDistributed'),
        value: 'DISTRIBUTED',
        render: () => (
          <span className={styles.statusOption}>
            <CheckmarkCircleRegular fontSize={20} />
            {t('notice.statusDistributed')}
          </span>
        ),
      },
      {
        disabled: true,
        text: t('notice.statusRecalled'),
        value: 'RECALLED',
        render: () => (
          <span className={styles.statusOption}>
            <ArrowUndoRegular fontSize={20} />
            {t('notice.statusRecalled')}
          </span>
        ),
      },
    ],
    [t, styles.statusOption],
  );

  const [contentTab, setContentTab] = useState<string>('en');

  const noticeSchema = useMemo(
    () =>
      z
        .object({
          noticeTitle: z
            .object({
              valueInLangOne: z.string().max(200).nullable(),
              valueInLangTwo: z.string().max(200).nullable(),
              valueInLangThree: z.string().max(200).nullable(),
            })
            .refine(
              (val) =>
                [
                  val.valueInLangOne,
                  val.valueInLangTwo,
                  val.valueInLangThree,
                ].some((v) => v?.trim()),
              { message: t('validation.required') },
            ),
          content: z
            .object({
              valueInLangOne: z.string().nullable(),
              valueInLangTwo: z.string().nullable(),
              valueInLangThree: z.string().nullable(),
            })
            .refine(
              (val) =>
                [
                  val.valueInLangOne,
                  val.valueInLangTwo,
                  val.valueInLangThree,
                ].some((v) => v?.trim()),
              { message: t('validation.required') },
            ),
          dueAt: z
            .date()
            .nullable()
            .refine((v) => v !== null, { message: t('validation.required') }),
          isAcknowledgementRequired: z.boolean(),
          status: z.enum([
            'DRAFT',
            'NEW',
            'DISTRIBUTING',
            'DISTRIBUTED',
            'RECALLED',
          ]),
          targetType: z.enum(['grade', 'class']),
          forGrade: z.array(z.string()),
          forClass: z.array(z.string()),
        })
        .superRefine((val, ctx) => {
          if (val.targetType === 'grade' && val.forGrade.length === 0) {
            ctx.addIssue({
              code: 'custom',
              message: t('validation.required'),
              path: ['forGrade'],
            });
          }
          if (val.targetType === 'class' && val.forClass.length === 0) {
            ctx.addIssue({
              code: 'custom',
              message: t('validation.required'),
              path: ['forClass'],
            });
          }
        }),
    [t],
  );

  const emptyFormValues: NoticeFormValues = {
    noticeTitle: EMPTY_MULTI_LANG_TEXT,
    content: EMPTY_MULTI_LANG_TEXT,
    dueAt: null,
    isAcknowledgementRequired: false,
    status: 'DRAFT',
    targetType: hasGradeAccess ? 'grade' : 'class',
    forGrade: [],
    forClass: [],
  };

  const { control, handleSubmit, reset, setValue, trigger, formState } =
    useForm<NoticeFormValues>({
      resolver: zodResolver(noticeSchema),
      defaultValues: emptyFormValues,
    });

  useEffect(() => {
    if (formState.isSubmitted) {
      void trigger();
    }
  }, [i18n.language]);

  useEffect(() => {
    if (mode === 'add') {
      dispatch({ type: 'RESET' });
    } else if (id && data?.id !== id) {
      void dispatch({ type: 'GET', id });
    }
  }, [id, mode, data?.id]);

  useEffect(() => {
    if (data) {
      const targetType: TargetType = isForGrade(data) ? 'grade' : 'class';
      reset({
        noticeTitle: multiLangNameToText(data.title),
        content: multiLangNameToText(data.content),
        dueAt: data.dueAt
          ? new Date(data.dueAt.substring(0, 10) + 'T00:00:00')
          : null,
        isAcknowledgementRequired: data.isAcknowledgementRequired,
        status: data.status,
        targetType,
        forGrade:
          targetType === 'grade'
            ? (data as NoticePayloadForGrade).forGrade.map(String)
            : [],
        forClass:
          targetType === 'class'
            ? (data as { forClass: string[] }).forClass
            : [],
      });
    } else {
      reset(emptyFormValues);
    }
  }, [data]);

  const targetType = useWatch({ control, name: 'targetType' });
  const isReadOnly = mode === 'view';

  const onSubmit = async (values: NoticeFormValues) => {
    const dueAt = toIsoDateString(values.dueAt!);
    const base = {
      title: multiLangTextToName(values.noticeTitle),
      content: multiLangTextToName(values.content),
      dueAt,
      isAcknowledgementRequired: values.isAcknowledgementRequired,
      status: values.status,
    };
    const payload: NoticePayload =
      values.targetType === 'grade'
        ? { ...base, forGrade: values.forGrade.map((g) => parseInt(g, 10)) }
        : { ...base, forClass: values.forClass };

    if (mode === 'add') {
      await dispatch({ type: 'CREATE', payload });
    } else if (id && data) {
      await dispatch({
        type: 'UPDATE',
        payload: { id, version: data.version, ...payload },
      });
    }
    listDispatch({ type: 'INVALIDATE' });
    onExit();
  };

  const onDistribute = async () => {
    if (id && data) {
      await dispatch({ type: 'DISTRIBUTE', id, version: data.version });
      listDispatch({ type: 'INVALIDATE' });
      onExit();
    }
  };

  const onRecall = async () => {
    if (id && data) {
      await dispatch({ type: 'RECALL', id, version: data.version });
      listDispatch({ type: 'INVALIDATE' });
      onExit();
    }
  };

  const submitButton =
    data?.status === 'NEW' ? (
      <Button
        appearance="primary"
        icon={<MailRegular />}
        onClick={() => void onDistribute()}
      >
        {t('notice.distribute')}
      </Button>
    ) : data?.status === 'DISTRIBUTED' ? (
      <Button icon={<ArrowUndoRegular />} onClick={() => void onRecall()}>
        {t('notice.recall')}
      </Button>
    ) : data?.status === 'DISTRIBUTING' ? (
      <Button disabled icon={<ArrowSyncRegular />}>
        {t('notice.statusDistributing')}
      </Button>
    ) : (
      <Button
        appearance="primary"
        icon={<SaveRegular />}
        onClick={handleSubmit(onSubmit)}
      >
        {t('general.text.save')}
      </Button>
    );

  const { field: titleField, fieldState: titleState } = useController({
    control,
    name: 'noticeTitle',
  });
  const { field: contentField, fieldState: contentState } = useController({
    control,
    name: 'content',
  });

  useEffect(() => {
    if (!formState.isSubmitted) {
      return;
    }
    const { errors } = formState;
    if (errors.noticeTitle?.valueInLangOne || errors.content?.valueInLangOne) {
      setContentTab('en');
    } else if (
      errors.noticeTitle?.valueInLangTwo ||
      errors.content?.valueInLangTwo
    ) {
      setContentTab('zhHant');
    } else if (
      errors.noticeTitle?.valueInLangThree ||
      errors.content?.valueInLangThree
    ) {
      setContentTab('zhHans');
    } else if (errors.noticeTitle || errors.content) {
      setContentTab('en');
    }
  }, [formState.submitCount]);

  return (
    <JrVcEditPageLayout
      actionButtons={
        <FuiButtonPanel>
          <CancelButton onClick={onExit} />
          {!isReadOnly && submitButton}
        </FuiButtonPanel>
      }
      data={data}
      desktopWidth={{ maxWidth: '680px', minWidth: '520px', width: '35vw' }}
      entityName={t('notice.title')}
      mode={mode}
    >
      <JrVcGrid columns={2}>
        <JrVcGridItem fullWidth>
          <FuiTabList
            onTabSelect={(d) => setContentTab(d.value as string)}
            selectedValue={contentTab}
          >
            <FuiTab name={t('general.language.en')} value="en">
              <JrVcInputText
                label={t('notice.noticeTitle')}
                onChange={(v) =>
                  titleField.onChange({
                    ...titleField.value,
                    valueInLangOne: v,
                  })
                }
                placeholder={t('notice.noticeTitlePlaceholder')}
                readOnly={isReadOnly}
                required
                value={titleField.value.valueInLangOne}
              />
              <FuiInputTextArea
                label={t('notice.content')}
                maxLength={500}
                onChange={(v) =>
                  contentField.onChange({
                    ...contentField.value,
                    valueInLangOne: v,
                  })
                }
                placeholder={t('notice.contentPlaceholder')}
                readOnly={isReadOnly}
                required
                rows={5}
                value={contentField.value.valueInLangOne}
              />
            </FuiTab>
            <FuiTab name={t('general.language.zh-Hant')} value="zhHant">
              <JrVcInputText
                label={t('notice.noticeTitle')}
                onChange={(v) =>
                  titleField.onChange({
                    ...titleField.value,
                    valueInLangTwo: v,
                  })
                }
                placeholder={t('notice.noticeTitlePlaceholder')}
                readOnly={isReadOnly}
                value={titleField.value.valueInLangTwo}
              />
              <FuiInputTextArea
                label={t('notice.content')}
                maxLength={500}
                onChange={(v) =>
                  contentField.onChange({
                    ...contentField.value,
                    valueInLangTwo: v,
                  })
                }
                placeholder={t('notice.contentPlaceholder')}
                readOnly={isReadOnly}
                rows={5}
                value={contentField.value.valueInLangTwo}
              />
            </FuiTab>
            <FuiTab name={t('general.language.zh-Hans')} value="zhHans">
              <JrVcInputText
                label={t('notice.noticeTitle')}
                onChange={(v) =>
                  titleField.onChange({
                    ...titleField.value,
                    valueInLangThree: v,
                  })
                }
                placeholder={t('notice.noticeTitlePlaceholder')}
                readOnly={isReadOnly}
                value={titleField.value.valueInLangThree}
              />
              <FuiInputTextArea
                label={t('notice.content')}
                maxLength={500}
                onChange={(v) =>
                  contentField.onChange({
                    ...contentField.value,
                    valueInLangThree: v,
                  })
                }
                placeholder={t('notice.contentPlaceholder')}
                readOnly={isReadOnly}
                rows={5}
                value={contentField.value.valueInLangThree}
              />
            </FuiTab>
          </FuiTabList>
          {titleState.error?.message && (
            <div className={styles.tabError}>{titleState.error.message}</div>
          )}
          {contentState.error?.message && (
            <div className={styles.tabError}>{contentState.error.message}</div>
          )}
        </JrVcGridItem>

        <Controller
          control={control}
          name="targetType"
          render={({ field }) => (
            <FuiInputRadio
              label={t('notice.targetType')}
              layout="horizontal"
              onChange={(d) => {
                const newTarget = (d.value as TargetType) ?? 'grade';
                field.onChange(newTarget);
                if (newTarget === 'grade') {
                  setValue('forClass', []);
                } else {
                  setValue('forGrade', []);
                }
              }}
              readOnly={isReadOnly}
              required
              value={field.value}
            >
              <Radio
                disabled={!hasGradeAccess}
                label={t('notice.targetTypeGrade')}
                value="grade"
              />
              <Radio label={t('notice.targetTypeClass')} value="class" />
            </FuiInputRadio>
          )}
        />

        <Controller
          control={control}
          name="isAcknowledgementRequired"
          render={({ field }) => (
            <div className={styles.switchRow}>
              <FuiInputSwitch
                checked={field.value}
                label={t('notice.isAcknowledgementRequired')}
                onChange={(value) => field.onChange(value)}
                readOnly={isReadOnly}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="forGrade"
          render={({ field, fieldState }) => (
            <GradeDropdown
              disabled={targetType === 'class'}
              errorMessage={fieldState.error?.message}
              label={t('notice.forGrade')}
              onChange={(value: string[] | null) => field.onChange(value ?? [])}
              placeholder={t('notice.forGradePlaceholder')}
              readOnly={isReadOnly}
              required={targetType === 'grade'}
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="forClass"
          render={({ field, fieldState }) => (
            <ClassDropdown
              disabled={targetType === 'grade'}
              errorMessage={fieldState.error?.message}
              label={t('notice.forClass')}
              onChange={(value: string[] | null) => field.onChange(value ?? [])}
              placeholder={t('notice.forClassPlaceholder')}
              readOnly={isReadOnly}
              required={targetType === 'class'}
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="dueAt"
          render={({ field, fieldState }) => (
            <JrVcInputDate
              errorMessage={fieldState.error?.message}
              label={t('notice.dueAt')}
              onChange={(date) => field.onChange(date ?? null)}
              placeholder={t('notice.dueAtPlaceholder')}
              readOnly={isReadOnly}
              required
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field, fieldState }) => (
            <JrVcInputDropdown
              clearable={false}
              errorMessage={fieldState.error?.message}
              label={t('notice.status')}
              onChange={(value) =>
                field.onChange((value as NoticeStatus) ?? 'DRAFT')
              }
              options={statusOptions}
              placeholder={t('notice.statusPlaceholder')}
              readOnly={isReadOnly}
              required
              value={field.value}
            />
          )}
        />
      </JrVcGrid>
    </JrVcEditPageLayout>
  );
};

export { NoticeEditPage };
