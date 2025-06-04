import { z } from 'zod';
import {
  LanguageEnum,
  User,
  UserCreation,
  UserRoleEnum,
  UserStatusEnum,
} from '../../models/openapi';
import { Button, Dropdown, Option, Spinner } from '@fluentui/react-components';
import { Field } from '../../components/Field';
import { Input } from '../../components/Input';
import { Switch } from '../../components/switch';
import {
  ArrowTurnUpLeftRegular,
  CheckmarkRegular,
  DismissRegular,
  KeyResetRegular,
  SaveRegular,
} from '@fluentui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Form, Root, Row } from '../../components/Container';
import { zodEmail, zodOptionalString, zodString } from '../../types/zod';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMessage } from '../../hooks/use-message';
import {
  userDetailAtom,
  UserDetailStateGetSuccess,
  UserDetailStateUpdateSuccess,
} from '../../states/user-detail';
import { useAtom, useAtomValue } from 'jotai';
import { useDialog } from '../../hooks/use-dialog';
import { useFormDirty } from '../../contexts/FormDirty';
import { constructMessage } from '../../utils/string-util';
import { getEnumValueByRawValue } from '../../utils/enum-util';
import { EmptyCell } from '../../components/Container';
import { asArray } from '../../utils/array-util';
import {
  studentListAtom,
  StudentListStateProgress,
  StudentListStateSuccess,
} from '../../states/student';
import { useLocation, useParams } from 'react-router-dom';
import { MultiLangButton, MultiLangDrawer } from '../../components/multi-lang-drawer';
import { hasMissingRequiredField } from '../../utils/form-util';
import { emptyStringToUndefined } from '../../utils/object-util';
import { MessageType } from '../../models/system';
import { RoleIcon, RoleLabel } from './role-label';
import { StatusIcon, StatusLabel } from './status-label';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import { authenticationAtom } from '../../states/authentication';
import { useNameInPreferredLanguage } from '../../hooks/use-preferred-language';

// form for editing user
const maxNameLength = 50;

const statusList = Object.values(UserStatusEnum) as UserStatusEnum[];
const roleList = Object.values(UserRoleEnum) as UserRoleEnum[];

type UserEditPageProps = { mode: string; onBackButtonClick: () => void; onSave: () => void };

export const UserEditPage: React.FC<UserEditPageProps> = ({
  mode,
  onBackButtonClick,
  onSave,
}: UserEditPageProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t } = useTranslation();
  const { dispatchMessage } = useMessage();
  const { useStartBreadcrumb, useAppendBreadcrumb } = useBreadcrumb();

  const { showConfirmationDialog } = useDialog();
  const { markDirty, resetDirty } = useFormDirty();

  const { id } = useParams<{ id: string }>();
  const userFromParentPage = useLocation().state?.user;

  const [state, action] = useAtom(userDetailAtom);
  const [studentListState, studentListAction] = useAtom(studentListAtom);
  const login = useAtomValue(authenticationAtom).login;
  const isToAddParentUser = mode === 'add' && login?.user.role === UserRoleEnum.Student;

  const readOnly = mode === 'view';
  const baselineTimestamp = useRef<number>(Date.now());

  const _user2FormData = (user?: User): FormData => {
    if (user) {
      const { entitledStudentId, ...others } = user;
      return {
        entitledStudentId: entitledStudentId[0] ?? '',
        entitledStudentId2: entitledStudentId[1] ?? '',
        ...others,
        name: others.name as Record<string, string | undefined>, // Ensure correct type
      };
    } else {
      if (isToAddParentUser) {
        return {
          email: '',
          role: UserRoleEnum.Parent,
          status: UserStatusEnum.Active,
          name: {},
          entitledStudentId: login?.user.entitledStudent[0].id,
          entitledStudentId2: '',
          withApprovalRight: false,
        };
      } else {
        return {
          email: '',
          role: '',
          status: '',
          name: {},
          entitledStudentId: '',
          entitledStudentId2: '',
          withApprovalRight: false,
        };
      }
    }
  };

  const _formData2UserCreation = (formData: FormData): UserCreation => {
    const { role, status, entitledStudentId, entitledStudentId2, ...others } = formData;
    return {
      role: getEnumValueByRawValue(UserRoleEnum, role)!,
      status: getEnumValueByRawValue(UserStatusEnum, status)!,
      entitledStudentId: [entitledStudentId, entitledStudentId2]
        .map((s) => emptyStringToUndefined(s))
        .filter((s) => s !== undefined),
      ...others,
    };
  };

  const schema = z
    .object({
      id: zodOptionalString(),
      email: zodEmail(),
      name: z
        .record(zodOptionalString({ maxLength: maxNameLength }))
        .refine(
          (data) => data[LanguageEnum.English] && data[LanguageEnum.English].trim().length > 0,
          {
            message: 'Required',
            path: ['en'], // path of error
          },
        ),
      role: zodString(),
      entitledStudentId: zodOptionalString(),
      entitledStudentId2: zodOptionalString(),
      withApprovalRight: z.boolean(),
      status: zodString(),
    })
    // Rule 1: If STUDENT, then entitledStudentId must exist
    .refine(
      (data) =>
        data.role !== UserRoleEnum.Student || (data.entitledStudentId?.trim().length ?? 0) > 0,
      {
        message: 'zod.error.Required',
        path: ['entitledStudentId'],
      },
    )
    // Rule 1: If STUDENT, then entitledStudentId2 must be empty
    .refine(
      (data) => data.role !== UserRoleEnum.Student || !data.entitledStudentId2?.trim().length,
      {
        message: 'zod.error.NotRequired',
        path: ['entitledStudentId2'],
      },
    )
    // Rule 2: If PARENT, at least one of the IDs must be present
    .refine(
      (data) =>
        data.role !== UserRoleEnum.Parent ||
        data.entitledStudentId?.trim() ||
        data.entitledStudentId2?.trim(),
      {
        message: 'zod.error.Required',
        path: ['entitledStudentId'], // picking one arbitrarily for error
      },
    )
    // Rule 3: If not STUDENT or PARENT, both IDs must be empty
    .refine(
      (data) =>
        data.role === UserRoleEnum.Student ||
        data.role === UserRoleEnum.Parent ||
        (!data.entitledStudentId?.trim() && !data.entitledStudentId2?.trim()),
      {
        message: 'zod.error.NotRequired',
        path: ['entitledStudentId'],
      },
    )
    .refine(
      (data) =>
        emptyStringToUndefined(data.entitledStudentId) === undefined ||
        studentListState.result.find((s) => s.id === data.entitledStudentId),
      { message: 'zod.error.user.invalidStudentId', path: ['entitledStudentId'] },
    )
    .refine(
      (data) =>
        emptyStringToUndefined(data.entitledStudentId2) === undefined ||
        studentListState.result.find((s) => s.id === data.entitledStudentId2),
      { message: 'zod.error.user.invalidStudentId', path: ['entitledStudentId2'] },
    )
    .refine(
      (data) =>
        (data.role !== UserRoleEnum.Teacher && data.withApprovalRight === false) ||
        data.role === UserRoleEnum.Teacher,
      {
        message: 'zod.error.NotRequired',
        path: ['withApprovalRight'],
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
    defaultValues: _user2FormData(userFromParentPage),
    resolver: zodResolver(schema),
  });

  const formValues = watch();
  useEffect(() => {
    // to trigger enable / disable of save button and mark dirtiness
    if (isDirty) {
      markDirty();
    }
    return () => resetDirty();
  }, [formValues, isDirty, markDirty, resetDirty]);

  useEffect(() => {
    if (id) {
      action({ search: { id: id } });
    } else {
      action({ reset: {} });
      if (isToAddParentUser && formValues.entitledStudentId) {
        studentListAction({ search: { id: [formValues.entitledStudentId] } });
      }
    }
  }, [id]);

  useEffect(() => {
    if (state.eventTime > baselineTimestamp.current) {
      baselineTimestamp.current = state.eventTime;
      if (state instanceof UserDetailStateGetSuccess) {
        reset(_user2FormData(state.result));
        const studentId = state.result.entitledStudentId;
        if (studentId.length > 0) {
          studentListAction({ search: { id: studentId } });
        }
      } else if (state instanceof UserDetailStateUpdateSuccess) {
        dispatchMessage({
          type: MessageType.Success,
          text: constructMessage(t, 'system.message.saveObjectSuccess', ['User', state.result.id]),
        });
        onSave();
      }
    }
  }, [state]);

  useEffect(() => {
    baselineTimestamp.current = state.eventTime;

    if (!(studentListState instanceof StudentListStateSuccess)) {
      return;
    }
    if (mode !== 'add' || isToAddParentUser) {
      return;
    }

    const [student, student2] = studentListState.result;
    if (!student) {
      return;
    }

    const isMatchingStudent1 =
      student.id === formValues.entitledStudentId ||
      `${student.classId}-${student.studentNumber}` === formValues.entitledStudentId;

    if (isMatchingStudent1) {
      setValue('entitledStudentId', student.id);

      if (formValues.role === UserRoleEnum.Student) {
        setValue('name', {
          [LanguageEnum.English]: `${student.name[LanguageEnum.English] ?? ''}`,
          [LanguageEnum.TraditionalChinese]: `${student.name[LanguageEnum.TraditionalChinese] ?? ''}}`,
          // [Language.SIMPLIFIED_CHINESE]: `${student.lastName[Language.SIMPLIFIED_CHINESE] ?? ''}${student.firstName[Language.SIMPLIFIED_CHINESE] ?? ''}`,
        });
      }
    }

    if (!student2) {
      return;
    }

    const isMatchingStudent2 =
      student2.id === formValues.entitledStudentId2 ||
      `${student2.classId}-${student2.studentNumber}` === formValues.entitledStudentId2;

    if (isMatchingStudent2) {
      setValue('entitledStudentId2', student2.id);
    }
  }, [studentListState]);

  useEffect(() => {
    isToAddParentUser
      ? useStartBreadcrumb('userMaintenance.titleAddParent')
      : useAppendBreadcrumb('userMaintenance.titleEdit', `system.message.${mode}`);
  }, [isToAddParentUser]);

  const handleNameFieldChange = (fieldName: 'name', langStr: string, value: string) => {
    const currentFieldValues = formValues[fieldName];

    currentFieldValues[
      langStr === LanguageEnum.TraditionalChinese
        ? LanguageEnum.TraditionalChinese
        : LanguageEnum.English
    ] = value;

    setValue(fieldName, currentFieldValues, { shouldDirty: true });
  };

  const backButton =
    window.history.length > 1 ? (
      <Button icon={<ArrowTurnUpLeftRegular />} onClick={onBackButtonClick}>
        {t('system.message.back')}
      </Button>
    ) : (
      <></>
    );

  const resetPasswordButton =
    mode === 'edit' ? (
      <Button appearance="outline" disabled={true} icon={<KeyResetRegular />}>
        {t('system.message.resetPassword')}
      </Button>
    ) : (
      <></>
    );

  const saveButton = readOnly ? (
    <></>
  ) : (
    <Button
      appearance="primary"
      disabled={hasMissingRequiredField(formValues, schema)}
      icon={<SaveRegular />}
      onClick={handleSubmit(() => {
        showConfirmationDialog({
          confirmType: 'save',
          message: t('system.message.doYouWantToSaveChange'),
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
                        user: _formData2UserCreation(formValues),
                      },
                    }
                  : { create: _formData2UserCreation(formValues) },
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
      {/* <Row> to make MultiLangDrawer inline */}
      <Row>
        <Form
          buttons={[backButton, resetPasswordButton, saveButton]}
          numColumn={3}
          styles={{ width: '690px' }}
          title={
            isToAddParentUser
              ? t('userMaintenance.titleAddParent')
              : constructMessage(t, 'userMaintenance.titleEdit', [
                  mode ? `system.message.${mode}` : '',
                ])
          }
        >
          {mode !== 'add' ? (
            <>
              <Controller
                control={control}
                name="id"
                render={({ field }) => (
                  <Field colSpan={2} label={t('userMaintenance.id')} required>
                    <Input {...field} readOnly={true} />
                  </Field>
                )}
              />
              <EmptyCell colSpan={1} />
            </>
          ) : (
            <></>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Field
                colSpan={2}
                label={t('userMaintenance.email')}
                required
                validationMessage={errors?.email?.message}
              >
                <Input {...field} readOnly={readOnly || mode !== 'add'} />
              </Field>
            )}
          />
          <EmptyCell colSpan={1} />

          <Controller
            control={control}
            name="name"
            render={({ field }) => {
              return (
                <Field
                  colSpan={3}
                  label={t('userMaintenance.name')}
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
            name="role"
            render={({ field }) => {
              const { value, ...others } = field;
              const selectedValue = value ?? '';
              return (
                <Field
                  label={t('userMaintenance.role.label')}
                  orientation="horizontal"
                  required={true}
                  validationMessage={errors?.role?.message}
                >
                  {readOnly || isToAddParentUser ? (
                    <Input
                      appearance="underline"
                      contentBefore={<RoleIcon role={value} />}
                      value={value ? t(`userMaintenance.role.value.${value}`) : ''}
                    />
                  ) : (
                    <Dropdown
                      {...others}
                      multiselect={false}
                      onOptionSelect={(_ev, data) => {
                        field.onChange(data.selectedOptions[0] ?? '');
                        // clear entitledStudentId if role is not Student / Parent
                        const optionValue = data.optionValue;
                        if (
                          optionValue !== UserRoleEnum.Student &&
                          optionValue !== UserRoleEnum.Parent
                        ) {
                          setValue('entitledStudentId', '');
                          setValue('entitledStudentId2', '');
                        }
                        if (
                          optionValue !== UserRoleEnum.Teacher &&
                          formValues.withApprovalRight === true
                        ) {
                          setValue('withApprovalRight', false);
                        }
                      }}
                      selectedOptions={asArray(selectedValue)}
                      value={selectedValue}
                    >
                      {roleList.map((role) => (
                        <Option
                          key={role.toString()}
                          disabled={role === UserRoleEnum.Alumni}
                          text={t(`userMaintenance.role.value.${role}`)}
                          value={`${role}`}
                        >
                          <RoleLabel role={role}></RoleLabel>
                        </Option>
                      ))}
                    </Dropdown>
                  )}
                </Field>
              );
            }}
          />

          {formValues.role == UserRoleEnum.Student || formValues.role == UserRoleEnum.Parent ? (
            <>
              <Controller
                control={control}
                name="entitledStudentId"
                render={({ field }) => {
                  const { value, ...others } = field;
                  const student = value
                    ? studentListState.result.find((s) => s.id === value)
                    : undefined;
                  return (
                    <Field
                      colSpan={2}
                      infoMessage={useNameInPreferredLanguage(student)}
                      label={t('userMaintenance.studentId')}
                      labelHint="P[1 to 6]-[1 to 30] e.g. P1A-1, P1A-2, .... P6E-30"
                      orientation="horizontal"
                      required={true}
                      validationMessage={errors?.entitledStudentId?.message}
                    >
                      <Input
                        {...others}
                        contentAfter={
                          studentListState instanceof StudentListStateProgress ? (
                            <Spinner size="extra-tiny" />
                          ) : undefined
                        }
                        onBlur={() => {
                          const entitledStudentIds = [
                            formValues.entitledStudentId,
                            formValues.entitledStudentId2,
                          ].filter((s) => s !== undefined);
                          if (entitledStudentIds.length > 0) {
                            studentListAction({ search: { id: entitledStudentIds } });
                          }
                        }}
                        readOnly={readOnly || isToAddParentUser}
                        value={value}
                      />
                    </Field>
                  );
                }}
              />
            </>
          ) : formValues.role === UserRoleEnum.Teacher ? (
            <>
              <Controller
                control={control}
                name="withApprovalRight"
                render={({ field }) => {
                  const { value, ...others } = field;
                  return (
                    <Field label={t('userMaintenance.withApprovalRight')}>
                      <Switch {...others} checked={value} readOnly={readOnly} />
                    </Field>
                  );
                }}
              />
              <EmptyCell />
            </>
          ) : (
            <EmptyCell colSpan={2} />
          )}

          {formValues.role == UserRoleEnum.Parent && !isToAddParentUser ? (
            <>
              <EmptyCell />
              <Controller
                control={control}
                name="entitledStudentId2"
                render={({ field }) => {
                  const { value, ...others } = field;
                  const student = value
                    ? studentListState.result.find((s) => s.id === value)
                    : undefined;
                  return (
                    <Field
                      colSpan={2}
                      infoMessage={useNameInPreferredLanguage(student)}
                      label={t('userMaintenance.studentId')}
                      orientation="horizontal"
                      validationMessage={errors?.entitledStudentId2?.message}
                    >
                      <Input
                        {...others}
                        contentAfter={
                          studentListState instanceof StudentListStateProgress ? (
                            <Spinner size="extra-tiny" />
                          ) : undefined
                        }
                        onBlur={() => {
                          const entitledStudentIds = [
                            formValues.entitledStudentId,
                            formValues.entitledStudentId2,
                          ].filter((s) => s !== undefined);
                          if (entitledStudentIds.length > 0) {
                            studentListAction({ search: { id: entitledStudentIds } });
                          }
                        }}
                        readOnly={readOnly || isToAddParentUser}
                        value={value}
                      />
                    </Field>
                  );
                }}
              />
            </>
          ) : (
            <></>
          )}

          <Controller
            control={control}
            name="status"
            render={({ field }) => {
              const { value, ...others } = field;
              const selectedValue = value ?? '';
              return (
                <Field
                  label={t('userMaintenance.status.label')}
                  orientation="horizontal"
                  required={true}
                  validationMessage={errors?.status?.message}
                >
                  {readOnly || isToAddParentUser ? (
                    <Input
                      appearance="underline"
                      contentBefore={<StatusIcon status={value} />}
                      value={value ? t(`userMaintenance.status.value.${value}`) : ''}
                    />
                  ) : (
                    <Dropdown
                      {...others}
                      multiselect={false}
                      onOptionSelect={(_ev, data) => {
                        field.onChange(data.selectedOptions[0] ?? '');
                      }}
                      selectedOptions={asArray(selectedValue)}
                      value={selectedValue}
                    >
                      {statusList.map((status) => (
                        <Option
                          key={status.toString()}
                          text={t(`userMaintenance.status.value.${status}`)}
                          value={`${status}`}
                        >
                          <StatusLabel status={status}></StatusLabel>
                        </Option>
                      ))}
                    </Dropdown>
                  )}
                </Field>
              );
            }}
          />
          <EmptyCell colSpan={2} />
        </Form>
        <div style={{ flex: 1 }}></div>

        <MultiLangDrawer
          initialData={formValues.name}
          isOpen={isDrawerOpen}
          isReadOnly={readOnly}
          onDrawerClose={() => setIsDrawerOpen(false)}
          onValueChange={(ev, data) => handleNameFieldChange('name', ev, data)}
          t={t}
          title={t('userMaintenance.name')}
        />
      </Row>
    </Root>
  );
};
