import { ClassDropdown, GradeDropdown } from '@component/grade-class-input';
import { CancelButton } from '@component/jr-venture-button';
import { JrVcEditPageLayout } from '@component/jr-venture-edit-page-layout';
import { JrVcGrid, JrVcGridItem } from '@component/jr-venture-grid';
import {
  JrVcInputDateTime,
  JrVcInputNumber,
  JrVcInputText,
} from '@component/jr-venture-input';
import type { MaintenanceEditPageProps } from '@component/with-maintenance-page';
import { SaveRegular } from '@fluentui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ActivityCategoryDropdown,
  ActivityStatusDropdown,
} from '@page/activity/activity-dropdown';
import {
  activityEditActionAtom,
  activityEditStateAtom,
} from '@store/activity/activity-edit-bloc';
import { activityListActionAtom } from '@store/activity/activity-list-bloc';
import type {
  ActivityCategory,
  ActivityPayload,
  ActivityPayloadForGrade,
  ActivityStatus,
} from '@store/activity/activity-types';
import { authUserAtom } from '@store/auth/auth-bloc';
import {
  referenceDataActionAtom,
  referenceDataStateAtom,
} from '@store/reference-data/reference-data-bloc';
import {
  EMPTY_MULTI_LANG_TEXT,
  multiLangNameToText,
  multiLangTextToName,
} from '@util/form-util';
import {
  FuiButton,
  FuiButtonPanel,
  FuiRadio,
  FuiRadioGroup,
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

type TargetType = 'grade' | 'class';

type ActivityFormValues = {
  description: MultiLangText;
  venue: MultiLangText;
  detail: MultiLangText;
  category: ActivityCategory | null;
  maxNumOfParticipant: number | null;
  startDate: Date | null;
  endDate: Date | null;
  status: ActivityStatus;
  targetType: TargetType;
  forGrade: string[];
  forClass: string[];
};

const isForGrade = (
  payload: ActivityPayload,
): payload is ActivityPayloadForGrade => 'forGrade' in payload;

const ActivityEditPage = ({ id, mode, onExit }: MaintenanceEditPageProps) => {
  const { i18n, t } = useTranslation();

  const dispatch = useSetAtom(activityEditActionAtom);
  const listDispatch = useSetAtom(activityListActionAtom);
  const { data } = useAtomValue(activityEditStateAtom);
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

  const isConfirmed = data?.status === 'CONFIRMED';
  const isCancelled = data?.status === 'CANCELLED';

  const disabledStatusValues = useMemo(() => {
    const disabled: ActivityStatus[] = [];
    if (isConfirmed || isCancelled) {
      disabled.push('DRAFT');
    }
    if (isCancelled) {
      disabled.push('CONFIRMED');
    }
    if (!data) {
      disabled.push('CANCELLED');
    }
    return disabled;
  }, [isConfirmed, isCancelled, data]);

  const [contentTab, setContentTab] = useState<string>('en');

  const activitySchema = useMemo(
    () =>
      z
        .object({
          description: z
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
          venue: z
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
          detail: z
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
          category: z
            .enum([
              'SPORTS',
              'ACADEMIC',
              'ARTISTIC',
              'MUSIC',
              'SERVICE',
              'TECHNOLOGY',
            ] as const)
            .nullable()
            .refine((v) => v !== null, { message: t('validation.required') }),
          maxNumOfParticipant: z.number().positive().nullable(),
          startDate: z
            .date()
            .nullable()
            .refine((v) => v !== null, { message: t('validation.required') }),
          endDate: z
            .date()
            .nullable()
            .refine((v) => v !== null, { message: t('validation.required') }),
          status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']),
          targetType: z.enum(['grade', 'class']),
          forGrade: z.array(z.string()),
          forClass: z.array(z.string()),
        })
        .superRefine((val, ctx) => {
          if (val.startDate && val.endDate && val.endDate < val.startDate) {
            ctx.addIssue({
              code: 'custom',
              message: t('validation.endDateBeforeStartDate'),
              path: ['endDate'],
            });
          }
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

  const emptyFormValues: ActivityFormValues = {
    description: EMPTY_MULTI_LANG_TEXT,
    venue: EMPTY_MULTI_LANG_TEXT,
    detail: EMPTY_MULTI_LANG_TEXT,
    category: null,
    maxNumOfParticipant: null,
    startDate: null,
    endDate: null,
    status: 'DRAFT',
    targetType: hasGradeAccess ? 'grade' : 'class',
    forGrade: [],
    forClass: [],
  };

  const { control, handleSubmit, reset, setValue, trigger, formState } =
    useForm<ActivityFormValues>({
      resolver: zodResolver(activitySchema),
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
        description: multiLangNameToText(data.description),
        venue: multiLangNameToText(data.venue),
        detail: multiLangNameToText(data.detail),
        category: data.category,
        maxNumOfParticipant: data.maxNumOfParticipant ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status,
        targetType,
        forGrade:
          targetType === 'grade'
            ? (data as ActivityPayloadForGrade).forGrade.map(String)
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
  const isReadOnly = mode === 'view' || isCancelled;

  const onSubmit = async (values: ActivityFormValues) => {
    const base = {
      category: values.category as ActivityCategory,
      description: multiLangTextToName(values.description),
      venue: multiLangTextToName(values.venue),
      detail: multiLangTextToName(values.detail),
      maxNumOfParticipant: values.maxNumOfParticipant ?? undefined,
      startDate: values.startDate!.toISOString(),
      endDate: values.endDate!.toISOString(),
      status: values.status,
    };
    const payload: ActivityPayload =
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

  const { field: descriptionField, fieldState: descriptionState } =
    useController({ control, name: 'description' });
  const { field: venueField, fieldState: venueState } = useController({
    control,
    name: 'venue',
  });
  const { field: detailField, fieldState: detailState } = useController({
    control,
    name: 'detail',
  });

  useEffect(() => {
    if (!formState.isSubmitted) {
      return;
    }
    const { errors } = formState;
    if (
      errors.description?.valueInLangOne ||
      errors.venue?.valueInLangOne ||
      errors.detail?.valueInLangOne
    ) {
      setContentTab('en');
    } else if (
      errors.description?.valueInLangTwo ||
      errors.venue?.valueInLangTwo ||
      errors.detail?.valueInLangTwo
    ) {
      setContentTab('zhHant');
    } else if (
      errors.description?.valueInLangThree ||
      errors.venue?.valueInLangThree ||
      errors.detail?.valueInLangThree
    ) {
      setContentTab('zhHans');
    } else if (errors.description || errors.venue || errors.detail) {
      setContentTab('en');
    }
  }, [formState.submitCount]);

  return (
    <JrVcEditPageLayout
      actionButtons={
        <FuiButtonPanel>
          <CancelButton onClick={onExit} />
          {!isReadOnly && (
            <FuiButton
              appearance="primary"
              icon={<SaveRegular />}
              onClick={handleSubmit(onSubmit)}
            >
              {t('general.text.save')}
            </FuiButton>
          )}
        </FuiButtonPanel>
      }
      data={data}
      desktopWidth={{ maxWidth: '800px', minWidth: '520px', width: '50vw' }}
      entityName={t('activity.title')}
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
                errorMessage={
                  formState.errors.description?.valueInLangOne?.message ??
                  descriptionState.error?.message
                }
                label={t('activity.description')}
                onChange={(v) =>
                  descriptionField.onChange({
                    ...descriptionField.value,
                    valueInLangOne: v,
                  })
                }
                placeholder={t('activity.descriptionPlaceholder')}
                readOnly={isReadOnly}
                required
                value={descriptionField.value.valueInLangOne}
              />
              <JrVcInputText
                errorMessage={
                  formState.errors.venue?.valueInLangOne?.message ??
                  venueState.error?.message
                }
                label={t('activity.venue')}
                onChange={(v) =>
                  venueField.onChange({
                    ...venueField.value,
                    valueInLangOne: v,
                  })
                }
                placeholder={t('activity.venuePlaceholder')}
                readOnly={isReadOnly}
                required
                value={venueField.value.valueInLangOne}
              />
              <FuiInputTextArea
                errorMessage={
                  formState.errors.detail?.valueInLangOne?.message ??
                  detailState.error?.message
                }
                label={t('activity.detail')}
                onChange={(v) =>
                  detailField.onChange({
                    ...detailField.value,
                    valueInLangOne: v,
                  })
                }
                placeholder={t('activity.detailPlaceholder')}
                readOnly={isReadOnly}
                required
                rows={4}
                value={detailField.value.valueInLangOne}
              />
            </FuiTab>
            <FuiTab name={t('general.language.zh-Hant')} value="zhHant">
              <JrVcInputText
                errorMessage={
                  formState.errors.description?.valueInLangTwo?.message
                }
                label={t('activity.description')}
                onChange={(v) =>
                  descriptionField.onChange({
                    ...descriptionField.value,
                    valueInLangTwo: v,
                  })
                }
                placeholder={t('activity.descriptionPlaceholder')}
                readOnly={isReadOnly}
                value={descriptionField.value.valueInLangTwo}
              />
              <JrVcInputText
                errorMessage={formState.errors.venue?.valueInLangTwo?.message}
                label={t('activity.venue')}
                onChange={(v) =>
                  venueField.onChange({
                    ...venueField.value,
                    valueInLangTwo: v,
                  })
                }
                placeholder={t('activity.venuePlaceholder')}
                readOnly={isReadOnly}
                value={venueField.value.valueInLangTwo}
              />
              <FuiInputTextArea
                errorMessage={formState.errors.detail?.valueInLangTwo?.message}
                label={t('activity.detail')}
                onChange={(v) =>
                  detailField.onChange({
                    ...detailField.value,
                    valueInLangTwo: v,
                  })
                }
                placeholder={t('activity.detailPlaceholder')}
                readOnly={isReadOnly}
                rows={4}
                value={detailField.value.valueInLangTwo}
              />
            </FuiTab>
            <FuiTab name={t('general.language.zh-Hans')} value="zhHans">
              <JrVcInputText
                errorMessage={
                  formState.errors.description?.valueInLangThree?.message
                }
                label={t('activity.description')}
                onChange={(v) =>
                  descriptionField.onChange({
                    ...descriptionField.value,
                    valueInLangThree: v,
                  })
                }
                placeholder={t('activity.descriptionPlaceholder')}
                readOnly={isReadOnly}
                value={descriptionField.value.valueInLangThree}
              />
              <JrVcInputText
                errorMessage={formState.errors.venue?.valueInLangThree?.message}
                label={t('activity.venue')}
                onChange={(v) =>
                  venueField.onChange({
                    ...venueField.value,
                    valueInLangThree: v,
                  })
                }
                placeholder={t('activity.venuePlaceholder')}
                readOnly={isReadOnly}
                value={venueField.value.valueInLangThree}
              />
              <FuiInputTextArea
                errorMessage={
                  formState.errors.detail?.valueInLangThree?.message
                }
                label={t('activity.detail')}
                onChange={(v) =>
                  detailField.onChange({
                    ...detailField.value,
                    valueInLangThree: v,
                  })
                }
                placeholder={t('activity.detailPlaceholder')}
                readOnly={isReadOnly}
                rows={4}
                value={detailField.value.valueInLangThree}
              />
            </FuiTab>
          </FuiTabList>
        </JrVcGridItem>

        <Controller
          control={control}
          name="category"
          render={({ field, fieldState }) => (
            <ActivityCategoryDropdown
              clearable={false}
              errorMessage={fieldState.error?.message}
              label={t('activity.category')}
              onChange={(value) =>
                field.onChange((value as ActivityCategory) ?? null)
              }
              placeholder={t('activity.categoryPlaceholder')}
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
            <ActivityStatusDropdown
              clearable={false}
              disabledValues={disabledStatusValues}
              errorMessage={fieldState.error?.message}
              label={t('activity.status')}
              onChange={(value) =>
                field.onChange((value as ActivityStatus) ?? 'DRAFT')
              }
              placeholder={t('activity.statusPlaceholder')}
              readOnly={isReadOnly}
              required
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="startDate"
          render={({ field, fieldState }) => (
            <JrVcInputDateTime
              errorMessage={fieldState.error?.message}
              label={t('activity.startDateTime')}
              onChange={(date) => field.onChange(date ?? null)}
              readOnly={isReadOnly}
              required
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="endDate"
          render={({ field, fieldState }) => (
            <JrVcInputDateTime
              errorMessage={fieldState.error?.message}
              label={t('activity.endDateTime')}
              onChange={(date) => field.onChange(date ?? null)}
              readOnly={isReadOnly}
              required
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="targetType"
          render={({ field }) => (
            <FuiRadioGroup
              label={t('activity.targetType')}
              layout="horizontal"
              onChange={(value) => {
                const newTarget = (value as TargetType) ?? 'grade';
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
              <FuiRadio
                disabled={!hasGradeAccess}
                label={t('activity.targetTypeGrade')}
                value="grade"
              />
              <FuiRadio label={t('activity.targetTypeClass')} value="class" />
            </FuiRadioGroup>
          )}
        />

        <Controller
          control={control}
          name="maxNumOfParticipant"
          render={({ field, fieldState }) => (
            <JrVcInputNumber
              errorMessage={fieldState.error?.message}
              label={t('activity.maxNumOfParticipant')}
              onChange={(value) => field.onChange(value ?? null)}
              placeholder={t('activity.maxNumOfParticipantPlaceholder')}
              readOnly={isReadOnly}
              value={field.value}
            />
          )}
        />

        <JrVcGridItem fullWidth>
          <JrVcGrid columns={2}>
            <Controller
              control={control}
              name="forGrade"
              render={({ field, fieldState }) => (
                <GradeDropdown
                  disabled={targetType === 'class'}
                  errorMessage={fieldState.error?.message}
                  label={t('activity.forGrade')}
                  onChange={(value) => field.onChange(value ?? [])}
                  placeholder={t('activity.forGradePlaceholder')}
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
                  label={t('activity.forClass')}
                  onChange={(value) => field.onChange(value ?? [])}
                  placeholder={t('activity.forClassPlaceholder')}
                  readOnly={isReadOnly}
                  required={targetType === 'class'}
                  value={field.value}
                />
              )}
            />
          </JrVcGrid>
        </JrVcGridItem>
      </JrVcGrid>
    </JrVcEditPageLayout>
  );
};

export { ActivityEditPage };
