import { Body1, Button, makeStyles, Option, Radio, Textarea } from '@fluentui/react-components';
import {
  ArrowTurnUpLeftRegular,
  CheckmarkRegular,
  DismissRegular,
  SaveRegular,
} from '@fluentui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageType } from '@schemas/system';
import { ActivityStatusEnum, LanguageEnum, SubmissionRoleEnum } from '@schemas/webapi';
import { zodOptionalString, zodString } from '@t/zod';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import { Checkbox } from '@components/check-box';
import { Form, Root, Row } from '@components/container';
import { EmptyCell } from '@components/container';
import { DatePicker } from '@components/date-picker';
import { Dropdown } from '@components/drop-down';
import { Field } from '@components/field';
import { Input } from '@components/input';
import { MultiLangButton, MultiLangDrawer } from '@components/multi-lang-drawer';
import { RadioGroup } from '@components/radio-group';
import { SpinButton } from '@components/spinner-button';
import { Switch } from '@components/switch';
import { useBreadcrumb } from '@hooks/use-breadcrumb';
import { useDialog } from '@hooks/use-dialog';
import { useFormDirtiness } from '@hooks/use-form-dirtiness';
import { useMessage } from '@hooks/use-message';
import { useNameInPreferredLanguage } from '@hooks/use-preferred-language';
import { useTimezone } from '@hooks/use-timezone';
import { activityCategoryListAtom } from '@states/activity-category-list';
import {
  activityDetailAtom,
  ActivityDetailStateGetSuccess,
  ActivityDetailStateUpdateSuccess,
} from '@states/activity-detail';
import { asArray } from '@utils/array-util';
import { getEnumValueByRawValue } from '@utils/enum-util';
import { hasMissingRequiredField } from '@utils/form-util';
import { constructMessage } from '@utils/string-util';
import { Activity, ActivityPayload } from '@webapi/types';

import { StatusLabel } from './shared/components/status-label';

const maxNameLength = 50;
const roleList = Object.values(SubmissionRoleEnum) as SubmissionRoleEnum[];
const statusList = Object.values(ActivityStatusEnum) as ActivityStatusEnum[];
const gradeList = [1, 2, 3, 4, 5, 6];

// === STYLES ===
const useStyles = makeStyles({
  field: {
    width: '100%', // Fill full 1fr column
    minWidth: 0, // Override Fluent UI's internal ~200px min-width
    maxWidth: '100%', // Prevent it from overflowing
    boxSizing: 'border-box', // Ensure padding doesn't break layout
  },
  formContainer: {
    width: '750px',
  },
  rowSpaceAround: {
    justifyContent: 'space-around',
  },
  flexSpacer: {
    flex: 1,
  },
});

type ActivityEditPageProps = {
  mode: string;
  activity?: Activity;
  onBackButtonClick: () => void;
  onSave: () => void;
};

export const ActivityEditPage: React.FC<ActivityEditPageProps> = ({
  mode,
  activity,
  onBackButtonClick,
  onSave,
}: ActivityEditPageProps) => {
  const styles = useStyles();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t } = useTranslation();
  const { formatDate } = useTimezone();
  const { dispatchMessage } = useMessage();
  const { useAppendBreadcrumb } = useBreadcrumb();
  const { showConfirmationDialog } = useDialog();
  const { markDirty, resetDirty } = useFormDirtiness();

  const { id } = useParams<{ id: string }>();
  const [state, action] = useAtom(activityDetailAtom);
  const activityCategoryState = useAtomValue(activityCategoryListAtom);

  const readOnly = mode === 'view';
  const baselineTimestamp = useRef<number>(Date.now());

  const _activity2FormData = (activity?: Activity): FormData => {
    if (!activity) {
      return {
        categoryCode: '',
        name: {},
        description: '',
        participantGrade: [],
        submissionRole: '',
        startDate: null,
        endDate: null,
        sharable: false,
        ratable: false,
        eCoin: 0,
        status: '',
      };
    }

    const {
      id,
      categoryCode,
      description,
      participantGrade,
      name,
      achievementSubmissionRole,
      startDate,
      endDate,
      sharable,
      ratable,
      eCoin,
      status,
    } = activity;

    return {
      id,
      categoryCode,
      name: name as Record<string, string | undefined>,
      description,
      participantGrade,
      submissionRole: achievementSubmissionRole,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      sharable,
      ratable,
      eCoin,
      status,
    };
  };

  const _formData2ActivityCreation = (formData: FormData): ActivityPayload => {
    const { submissionRole, status, startDate, endDate, ...rest } = formData;
    return {
      achievementSubmissionRole: getEnumValueByRawValue(SubmissionRoleEnum, submissionRole)!,
      status: getEnumValueByRawValue(ActivityStatusEnum, status)!,
      startDate: startDate!.toISOString(),
      endDate: endDate!.toISOString(),
      ...rest,
    };
  };

  const schema = z
    .object({
      id: zodOptionalString(),
      categoryCode: zodString(),

      name: z
        .record(zodOptionalString({ maxLength: maxNameLength }))
        .refine(
          (data) => data[LanguageEnum.English] && data[LanguageEnum.English].trim().length > 0,
          {
            message: 'zod.error.required',
            path: ['en'], // path of error
          },
        ),
      description: zodString(),
      submissionRole: zodString(),
      participantGrade: z.array(z.number()).refine((data) => data.length > 0, {
        message: 'zod.error.required',
      }),
      startDate: z.date().nullable(),
      endDate: z.date().nullable(),
      ratable: z.boolean(),
      sharable: z.boolean(),
      eCoin: z.number(),
      status: zodString(),
    })
    .refine(
      (data) =>
        !data.startDate || !data.endDate || data.endDate.getTime() >= data.startDate.getTime(),
      {
        message: 'zod.error.too_small',
        path: ['endDate'],
      },
    );

  type FormData = z.infer<typeof schema>;

  const {
    control,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues: _activity2FormData(activity),
    resolver: zodResolver(schema),
  });

  const formValues = watch();

  useEffect(() => {
    useAppendBreadcrumb('activityMaintenance.titleEdit', `system.message.${mode}`);
  }, []);

  useEffect(() => {
    if (isDirty) {
      markDirty();
    }
    return () => resetDirty();
  }, [formValues, isDirty]);

  useEffect(() => {
    if (id) {
      action({ search: { id } });
    }
  }, [id]);

  useEffect(() => {
    if (state.eventTime > baselineTimestamp.current) {
      baselineTimestamp.current = state.eventTime;
      if (state instanceof ActivityDetailStateGetSuccess) {
        reset(_activity2FormData(state.result));
      } else if (state instanceof ActivityDetailStateUpdateSuccess) {
        dispatchMessage({
          type: MessageType.Success,
          text: constructMessage(t, 'system.message.saveObjectSuccess', [
            'Activity',
            state.result.id,
          ]),
        });
        onSave();
      }
    }
  }, [state]);

  const handleNameFieldChange = (fieldName: 'name', lang: string, value: string) => {
    const current = formValues[fieldName];
    current[
      lang === LanguageEnum.TraditionalChinese
        ? LanguageEnum.TraditionalChinese
        : LanguageEnum.English
    ] = value;
    setValue(fieldName, current, { shouldDirty: true });
  };

  const backButton =
    window.history.length > 1 ? (
      <Button icon={<ArrowTurnUpLeftRegular />} onClick={onBackButtonClick}>
        {t('system.message.back')}
      </Button>
    ) : null;

  const saveButton = readOnly ? null : (
    <Button
      appearance="primary"
      disabled={hasMissingRequiredField(formValues, schema)}
      icon={<SaveRegular />}
      onClick={handleSubmit(() => {
        showConfirmationDialog({
          title: { confirmType: 'save' },
          content: { message: t('system.message.doYouWantToSaveChange') },
          primaryButton: {
            label: t('system.message.save'),
            icon: <CheckmarkRegular />,
            action: () => {
              action(
                state.result
                  ? {
                      update: {
                        id: state.result.id,
                        version: state.result.version,
                        activity: _formData2ActivityCreation(formValues),
                      },
                    }
                  : { create: _formData2ActivityCreation(formValues) },
              );
            },
          },
          secondaryButton: { label: t('system.message.cancel'), icon: <DismissRegular /> },
        });
      })}
    >
      {t('system.message.save')}
    </Button>
  );

  return (
    <Root>
      <Row>
        <Form
          buttons={[backButton, saveButton].filter((b) => b !== null)}
          className={styles.formContainer}
          numColumn={3}
          title={constructMessage(t, 'activityMaintenance.titleEdit', [
            mode ? `system.message.${mode}` : '',
          ])}
        >
          {mode !== 'add' ? (
            <>
              <Controller
                control={control}
                name="id"
                render={({ field }) => (
                  <Field label={t('activityMaintenance.id')} required>
                    <Input {...field} readOnly={true} />
                  </Field>
                )}
              />
              <EmptyCell colSpan={2} />
            </>
          ) : (
            <></>
          )}

          <Controller
            control={control}
            name="categoryCode"
            render={({ field }) => {
              const { value, ...others } = field;
              const selectedValue = value ?? '';
              const activityCategoryList = activityCategoryState.getResult() ?? [];
              return (
                <Field
                  label={t('activityMaintenance.category')}
                  orientation="horizontal"
                  required={true}
                  validationMessage={errors?.categoryCode?.message}
                >
                  <Dropdown
                    {...others}
                    className={styles.field}
                    multiselect={false}
                    onOptionSelect={(_ev, data) => {
                      field.onChange(data.selectedOptions[0] ?? '');
                    }}
                    readOnly={readOnly}
                    selectedOptions={asArray(selectedValue)}
                    value={useNameInPreferredLanguage(
                      activityCategoryList.find((ac) => ac.code === selectedValue),
                    )}
                  >
                    {activityCategoryList.map((ac) => (
                      <Option key={ac.code} text={useNameInPreferredLanguage(ac)} value={ac.code}>
                        <Body1>{useNameInPreferredLanguage(ac)}</Body1>
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              );
            }}
          />

          <Controller
            control={control}
            name="name"
            render={({ field }) => {
              return (
                <Field
                  colSpan={2}
                  label={t('activityMaintenance.name')}
                  required
                  validationMessage={errors?.name?.en?.message}
                >
                  <Input
                    contentAfter={
                      <MultiLangButton
                        isOpen={isDrawerOpen}
                        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                      />
                    }
                    name={field.name}
                    onChange={(evt, data) => {
                      handleNameFieldChange(field.name, evt.target.name, data.value);
                    }}
                    readOnly={readOnly}
                    value={field.value[LanguageEnum.English]}
                  />
                </Field>
              );
            }}
          />

          <Controller
            control={control}
            name="description"
            render={({ field }) => {
              const { name, ...others } = field;
              return (
                <Field
                  colSpan={3}
                  label={t('activityMaintenance.description')}
                  required
                  validationMessage={errors?.description?.message}
                >
                  <Textarea readOnly={readOnly} rows={5} {...others}></Textarea>
                </Field>
              );
            }}
          />

          <Controller
            control={control}
            name="participantGrade"
            render={({ field }) => {
              const { value, onChange } = field;
              const handleCheckboxToggle = (num: number) => {
                const newValue = value.includes(num)
                  ? value.filter((e) => e !== num)
                  : [...value, num];
                onChange(newValue); // This keeps RHF in sync
              };

              return (
                <Field
                  colSpan={2}
                  label={t('activityMaintenance.forClass')}
                  required
                  validationMessage={errors?.participantGrade?.message}
                >
                  <Row>
                    {gradeList.map((num) => {
                      const checked = value.includes(num);
                      return (
                        <Checkbox
                          key={num}
                          checked={checked}
                          label={`P${num}`}
                          onChange={() => handleCheckboxToggle(num)}
                          readOnly={readOnly}
                        />
                      );
                    })}
                  </Row>
                </Field>
              );
            }}
          />

          <EmptyCell />

          <Controller
            control={control}
            name="startDate"
            render={({ field }) => {
              const { onChange, ...others } = field;
              return (
                <Field
                  label={t('activityMaintenance.startDate')}
                  required
                  validationMessage={errors?.startDate?.message}
                >
                  <DatePicker
                    formatDate={(date) => {
                      return date ? formatDate(date) : '';
                    }}
                    onSelectDate={(data) => {
                      onChange(data ? data : null);
                    }}
                    readOnly={readOnly}
                    {...others}
                  />
                </Field>
              );
            }}
          />

          <Controller
            control={control}
            name="endDate"
            render={({ field }) => {
              const { onChange, ...others } = field;
              return (
                <Field
                  label={t('activityMaintenance.endDate')}
                  required
                  validationMessage={errors?.endDate?.message}
                >
                  <DatePicker
                    formatDate={(date) => (date ? formatDate(date) : '')}
                    onSelectDate={(data) => {
                      onChange(data ? data : null);
                    }}
                    readOnly={readOnly}
                    {...others}
                  />
                </Field>
              );
            }}
          />

          <Controller
            control={control}
            name="eCoin"
            render={({ field }) => {
              const { onChange, ...others } = field;
              return (
                <Field
                  label={t('activityMaintenance.eCoin')}
                  required
                  validationMessage={errors?.eCoin?.message}
                >
                  <SpinButton
                    min={0}
                    onChange={(_ev, data) => {
                      if (data.value) {
                        setValue(field.name, data.value);
                      }
                    }}
                    readOnly={readOnly}
                    {...others}
                  />
                </Field>
              );
            }}
          />

          <Controller
            control={control}
            name="submissionRole"
            render={({ field }) => {
              const { name, ...others } = field;
              return (
                <Field
                  colSpan={2}
                  label={t('activityMaintenance.submissionRole.label')}
                  required={true}
                  validationMessage={errors?.submissionRole?.message}
                >
                  <Row>
                    <RadioGroup layout="horizontal" readOnly={readOnly} {...others}>
                      {roleList.map((role) => {
                        return (
                          <Radio
                            key={role}
                            label={t(`activityMaintenance.submissionRole.value.${role}`)}
                            value={role}
                          />
                        );
                      })}
                    </RadioGroup>
                  </Row>
                </Field>
              );
            }}
          />

          <Row style={{ justifyContent: 'space-around' }}>
            <Controller
              control={control}
              name="sharable"
              render={({ field }) => {
                const { value, ...others } = field;
                return (
                  <Field
                    label={t('activityMaintenance.sharable')}
                    required
                    validationMessage={errors?.sharable?.message}
                  >
                    <Switch checked={value} readOnly={readOnly} {...others} />
                  </Field>
                );
              }}
            />
            <Controller
              control={control}
              name="ratable"
              render={({ field }) => {
                const { value, ...others } = field;
                return (
                  <Field
                    label={t('activityMaintenance.ratable')}
                    required
                    validationMessage={errors?.sharable?.message}
                  >
                    <Switch checked={value} readOnly={readOnly} {...others} />
                  </Field>
                );
              }}
            />
          </Row>

          <Controller
            control={control}
            name="status"
            render={({ field }) => {
              const { value, ...others } = field;
              const selectedValue = value ?? '';
              return (
                <Field
                  label={t('activityMaintenance.status.label')}
                  required={true}
                  validationMessage={errors?.status?.message}
                >
                  <Dropdown
                    {...others}
                    className={styles.field}
                    multiselect={false}
                    onOptionSelect={(_ev, data) => {
                      field.onChange(data.selectedOptions[0] ?? '');
                    }}
                    readOnly={readOnly}
                    selectedOptions={asArray(selectedValue)}
                    value={
                      selectedValue ? t(`activityMaintenance.status.value.${selectedValue}`) : ''
                    }
                  >
                    {statusList.map((status) => (
                      <Option
                        key={status.toString()}
                        text={t(`activityMaintenance.status.value.${status}`)}
                        value={`${status}`}
                      >
                        <StatusLabel status={status}></StatusLabel>
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              );
            }}
          />
        </Form>
        <div className={styles.flexSpacer} />
        <MultiLangDrawer
          initialData={formValues.name}
          isOpen={isDrawerOpen}
          isReadOnly={readOnly}
          onDrawerClose={() => setIsDrawerOpen(false)}
          onValueChange={(ev, data) => handleNameFieldChange('name', ev, data)}
          t={t}
          title={t('activityMaintenance.name')}
        />
      </Row>
    </Root>
  );
};
