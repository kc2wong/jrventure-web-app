import { useCommonStyles } from '@component/common-styles';
import { CancelButton, SaveButton } from '@component/jr-venture-button';
import { JrVcEditPageLayout } from '@component/jr-venture-edit-page-layout';
import { JrVcGrid, JrVcGridItem } from '@component/jr-venture-grid';
import {
  JrVcInputMultiLangText,
  JrVcInputText,
} from '@component/jr-venture-input';
import {
  StudentIdInputText,
  type StudentIdInputTextRef,
  type StudentLookup,
} from '@component/student-id-input-text';
import type { MaintenanceEditPageProps } from '@component/with-maintenance-page';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Divider,
  Subtitle2,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  CheckmarkCircleRegular,
  DismissCircleRegular,
  EditPersonRegular,
  PeopleListRegular,
  PersonFeedbackRegular,
  ProhibitedRegular,
  WrenchRegular,
} from '@fluentui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SchoolClass } from '@store/class/class-types';
import { referenceDataStateAtom } from '@store/reference-data/reference-data-bloc';
import {
  userEditActionAtom,
  userEditStateAtom,
} from '@store/user/user-edit-bloc';
import { userListActionAtom } from '@store/user/user-list-bloc';
import type {
  ParentEntitlement,
  StudentEntitlement,
  TeacherEntitlement,
  UserRole,
  UserStatus,
} from '@store/user/user-types';
import {
  EMPTY_MULTI_LANG_TEXT,
  multiLangNameToText,
  multiLangTextToName,
} from '@util/form-util';
import {
  FuiButtonPanel,
  FuiInputCheckbox,
  FuiInputDropdown,
  FuiInputGroup,
  FuiInputSwitch,
  FuiTab,
  FuiTabList,
  type MultiLangText,
} from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useController, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const useStyles = makeStyles({
  checkboxRow: {
    paddingTop: tokens.spacingVerticalS,
  },
  noEntitlementRow: {
    paddingLeft: tokens.spacingHorizontalM,
  },
  individualClassSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    paddingTop: tokens.spacingVerticalXS,
  },
  gradeGroup: {
    display: 'grid',
    gap: tokens.spacingHorizontalS,
    gridTemplateColumns: 'repeat(auto-fill, 72px)',
  },
});


type UserFormValues = {
  firstName: MultiLangText;
  lastName: MultiLangText;
  email: string | null;
  role: string | null;
  status: string | null;
  allClasses: boolean;
  classIds: string[];
  studentId1: string | null;
  studentId2: string | null;
};

type EntitlementTab = 'class' | 'student' | 'none';

const UserEditPage = ({
  id,
  mode,
  onExit,
}: MaintenanceEditPageProps) => {
  const styles = useStyles();
  const commonStyles = useCommonStyles();
  const { i18n, t } = useTranslation();

  const dispatch = useSetAtom(userEditActionAtom);
  const listDispatch = useSetAtom(userListActionAtom);
  const { data } = useAtomValue(userEditStateAtom);
  const { classes: refClasses } = useAtomValue(referenceDataStateAtom);

  const emptyFormValues: UserFormValues = {
    firstName: EMPTY_MULTI_LANG_TEXT,
    lastName: EMPTY_MULTI_LANG_TEXT,
    email: null,
    role: null,
    status: 'ACTIVE',
    allClasses: false,
    classIds: [],
    studentId1: null,
    studentId2: null,
  };

  const [activeTab, setActiveTab] = useState<EntitlementTab>('class');
  const [studentId1Lookup, setStudentId1Lookup] = useState<StudentLookup>({ status: 'idle' });
  const [studentId2Lookup, setStudentId2Lookup] = useState<StudentLookup>({ status: 'idle' });
  const studentId1Ref = useRef<StudentIdInputTextRef>(null);
  const studentId2Ref = useRef<StudentIdInputTextRef>(null);

  const gradeGroups = useMemo(() => {
    const map = new Map<number, SchoolClass[]>();
    for (const cls of refClasses) {
      if (!map.has(cls.grade)) {
        map.set(cls.grade, []);
      }
      map.get(cls.grade)!.push(cls);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([grade, classes]) => ({
        grade,
        classes: [...classes].sort((a, b) =>
          a.classNumber.localeCompare(b.classNumber),
        ),
      }));
  }, [refClasses]);

  const roleOptions = useMemo(
    () => [
      {
        text: t('user.roleStudent'),
        value: 'STUDENT',
        render: () => (
          <span className={commonStyles.optionContent}>
            <EditPersonRegular className={commonStyles.largeIcon} />
            {t('user.roleStudent')}
          </span>
        ),
      },
      {
        text: t('user.roleParent'),
        value: 'PARENT',
        render: () => (
          <span className={commonStyles.optionContent}>
            <PeopleListRegular className={commonStyles.largeIcon} />
            {t('user.roleParent')}
          </span>
        ),
      },
      {
        text: t('user.roleTeacher'),
        value: 'TEACHER',
        render: () => (
          <span className={commonStyles.optionContent}>
            <PersonFeedbackRegular className={commonStyles.largeIcon} />
            {t('user.roleTeacher')}
          </span>
        ),
      },
      {
        text: t('user.roleAdmin'),
        value: 'ADMIN',
        render: () => (
          <span className={commonStyles.optionContent}>
            <WrenchRegular className={commonStyles.largeIcon} />
            {t('user.roleAdmin')}
          </span>
        ),
      },
    ],
    [t, commonStyles],
  );

  const statusOptions = useMemo(
    () => [
      {
        text: t('user.statusActive'),
        value: 'ACTIVE',
        render: () => (
          <span className={commonStyles.optionContent}>
            <CheckmarkCircleRegular className={commonStyles.largeIcon} />
            {t('user.statusActive')}
          </span>
        ),
      },
      {
        text: t('user.statusInactive'),
        value: 'INACTIVE',
        render: () => (
          <span className={commonStyles.optionContent}>
            <DismissCircleRegular className={commonStyles.largeIcon} />
            {t('user.statusInactive')}
          </span>
        ),
      },
      {
        text: t('user.statusSuspend'),
        value: 'SUSPEND',
        render: () => (
          <span className={commonStyles.optionContent}>
            <ProhibitedRegular className={commonStyles.largeIcon} />
            {t('user.statusSuspend')}
          </span>
        ),
      },
    ],
    [t, commonStyles],
  );

  const userSchema = useMemo(
    () =>
      z
        .object({
          firstName: z
            .object({
              valueInLangOne: z.string().max(50).nullable(),
              valueInLangTwo: z.string().max(50).nullable(),
              valueInLangThree: z.string().max(50).nullable(),
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
          lastName: z
            .object({
              valueInLangOne: z.string().max(50).nullable(),
              valueInLangTwo: z.string().max(50).nullable(),
              valueInLangThree: z.string().max(50).nullable(),
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
          email: z
            .string()
            .email({ message: t('validation.invalidEmail') })
            .nullable(),
          role: z.string().nullable(),
          status: z.string().nullable(),
          allClasses: z.boolean(),
          classIds: z.array(z.string()),
          studentId1: z.string().nullable(),
          studentId2: z.string().nullable(),
        })
        .superRefine((val, ctx) => {
          if (!val.email?.trim()) {
            ctx.addIssue({
              code: 'custom',
              message: t('validation.required'),
              path: ['email'],
            });
          }
          if (!val.role) {
            ctx.addIssue({
              code: 'custom',
              message: t('validation.required'),
              path: ['role'],
            });
          }
          if (!val.status) {
            ctx.addIssue({
              code: 'custom',
              message: t('validation.required'),
              path: ['status'],
            });
          }
          if (
            (val.role === 'STUDENT' || val.role === 'PARENT') &&
            !val.studentId1?.trim()
          ) {
            ctx.addIssue({
              code: 'custom',
              message: t('validation.required'),
              path: ['studentId1'],
            });
          }
          if (
            val.role === 'PARENT' &&
            val.studentId1?.trim() &&
            val.studentId2?.trim() &&
            val.studentId1.trim() === val.studentId2.trim()
          ) {
            ctx.addIssue({
              code: 'custom',
              message: t('user.duplicateStudentId'),
              path: ['studentId2'],
            });
          }
        }),
    [t],
  );

  const {
    clearErrors,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    trigger,
    formState: { isSubmitted },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: emptyFormValues,
  });

  const watchedRole = useWatch({ control, name: 'role' });
  const watchedAllClasses = useWatch({ control, name: 'allClasses' });
  const watchedClassIds = useWatch({ control, name: 'classIds' });

  useEffect(() => {
    if (watchedRole === 'TEACHER') {
      setActiveTab('class');
    } else if (watchedRole === 'PARENT' || watchedRole === 'STUDENT') {
      setActiveTab('student');
    } else {
      setActiveTab('none');
    }
  }, [watchedRole]);

  useEffect(() => {
    if (isSubmitted) {
      void trigger();
    }
  }, [i18n.language]);

  useEffect(() => {
    if (mode === 'add') {
      dispatch({ type: 'RESET' });
    } else if (id && data?.id !== id) {
      dispatch({ type: 'GET', id });
    }
  }, [id, mode, data?.id]);

  useEffect(() => {
    if (data) {
      const entitlement = data.entitlement;
      const studentIds = entitlement?.studentIds ?? [];
      reset({
        firstName: multiLangNameToText(data.firstName),
        lastName: multiLangNameToText(data.lastName),
        email: data.email,
        role: data.role,
        status: data.status,
        allClasses: entitlement?.isForAllClasses ?? false,
        classIds: data.role === 'TEACHER' ? (entitlement?.classIds ?? []) : [],
        studentId1: studentIds[0] ?? null,
        studentId2: studentIds[1] ?? null,
      });
    } else {
      reset(emptyFormValues);
    }
  }, [data]);

  const isReadOnly = mode === 'view';

  const onSubmit = async (values: UserFormValues) => {
    if (values.role === 'STUDENT' || values.role === 'PARENT') {
      if (values.studentId1?.trim()) {
        if (studentId1Lookup.status === 'invalid') {
          setError('studentId1', { message: t('user.invalidStudentId'), type: 'manual' });
          return;
        }
        if (studentId1Lookup.status !== 'valid') {
          const valid = await studentId1Ref.current?.triggerLookup();
          if (!valid) { return; }
        }
      }
      if (values.role === 'PARENT' && values.studentId2?.trim()) {
        if (studentId2Lookup.status === 'invalid') {
          setError('studentId2', { message: t('user.invalidStudentId'), type: 'manual' });
          return;
        }
        if (studentId2Lookup.status !== 'valid') {
          const valid = await studentId2Ref.current?.triggerLookup();
          if (!valid) { return; }
        }
      }
    }

    let entitlement:
      | TeacherEntitlement
      | StudentEntitlement
      | ParentEntitlement
      | null = null;
    if (values.role === 'TEACHER') {
      entitlement = {
        isForAllClasses: values.allClasses,
        classIds: values.allClasses ? [] : values.classIds,
        studentIds: [],
      } as TeacherEntitlement;
    } else if (values.role === 'STUDENT') {
      entitlement = {
        isForAllClasses: false,
        classIds: [],
        studentIds: [values.studentId1!],
      } as StudentEntitlement;
    } else if (values.role === 'PARENT') {
      const ids = [values.studentId1, values.studentId2].filter(
        (s): s is string => !!s?.trim(),
      );
      entitlement = {
        isForAllClasses: false,
        classIds: [],
        studentIds: ids,
      } as ParentEntitlement;
    }

    const payload = {
      firstName: multiLangTextToName(values.firstName),
      lastName: multiLangTextToName(values.lastName),
      email: values.email ?? '',
      role: (values.role ?? '') as UserRole,
      status: (values.status ?? '') as UserStatus,
      entitlement,
    };
    if (mode === 'add') {
      await dispatch({ type: 'CREATE', payload });
    } else if (id) {
      await dispatch({ type: 'UPDATE', payload: { id, version: data!.version, ...payload } });
    }
    listDispatch({ type: 'INVALIDATE' });
    onExit();
  };

  const { field: fnField, fieldState: fnState } = useController({
    control,
    name: 'firstName',
  });
  const { field: lnField, fieldState: lnState } = useController({
    control,
    name: 'lastName',
  });

  return (
    <JrVcEditPageLayout
      actionButtons={
        <FuiButtonPanel>
          <CancelButton onClick={onExit} />
          {mode !== 'view' && <SaveButton onClick={handleSubmit(onSubmit)} />}
        </FuiButtonPanel>
      }
      data={data}
      desktopWidth={{ maxWidth: '60vw' }}
      entityName={t('user.title')}
      mode={mode}
    >
      <JrVcGrid columns={2}>
        <JrVcGridItem fullWidth>
          <FuiInputGroup
            items={[
              {
                element: (
                  <JrVcInputMultiLangText
                    errorMessage={fnState.error?.message}
                    label={t('user.firstName')}
                    onChange={(value) =>
                      fnField.onChange(value ?? EMPTY_MULTI_LANG_TEXT)
                    }
                    readOnly={isReadOnly}
                    value={fnField.value}
                  />
                ),
              },
              {
                element: (
                  <JrVcInputMultiLangText
                    errorMessage={lnState.error?.message}
                    label={t('user.lastName')}
                    onChange={(value) =>
                      lnField.onChange(value ?? EMPTY_MULTI_LANG_TEXT)
                    }
                    readOnly={isReadOnly}
                    value={lnField.value}
                  />
                ),
              },
            ]}
            label={t('user.name')}
            required
          />
        </JrVcGridItem>

        <JrVcGridItem fullWidth>
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <JrVcInputText
                errorMessage={fieldState.error?.message}
                label={t('user.email')}
                onChange={(value) => field.onChange(value)}
                placeholder={t('user.emailPlaceholder')}
                readOnly={isReadOnly}
                required
                value={field.value}
              />
            )}            
          />
        </JrVcGridItem>

        <Controller
          control={control}
          name="role"
          render={({ field, fieldState }) => (
            <FuiInputDropdown
              errorMessage={fieldState.error?.message}
              label={t('user.role')}
              onChange={(value) => field.onChange(value)}
              options={roleOptions}
              placeholder={t('user.rolePlaceholder')}
              readOnly={isReadOnly}
              required
              value={field.value || null}
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field, fieldState }) => (
            <FuiInputDropdown
              errorMessage={fieldState.error?.message}
              label={t('user.status')}
              onChange={(value) => field.onChange(value)}
              options={statusOptions}
              placeholder={t('user.statusPlaceholder')}
              readOnly={isReadOnly}
              required
              value={field.value || null}
            />
          )}
        />
      </JrVcGrid>

      <Accordion onToggle={() => {}} openItems={['1']}>
        <AccordionItem value="1">
          <AccordionHeader>{t('user.entitlement')}</AccordionHeader>
          <AccordionPanel>
            <FuiTabList selectedValue={activeTab}>
              <FuiTab
                disabled={activeTab !== 'class'}
                name={t('user.entitlementClass')}
                value="class"
              >
                <Controller
                  control={control}
                  name="allClasses"
                  render={({ field }) => (
                    <div className={styles.checkboxRow}>
                      <FuiInputSwitch
                        checked={field.value}
                        label={t('user.allClasses')}
                        onChange={(data) => {
                          const checked = data;
                          field.onChange(checked);
                          if (checked) {
                            setValue('classIds', []);
                          }
                        }}
                        readOnly={isReadOnly}
                      />
                    </div>
                  )}
                />
                <Divider>{t('user.individualClass')}</Divider>
                <div className={styles.individualClassSection}>
                  {gradeGroups.map(({ grade, classes }) => (
                    <div key={grade} className={styles.gradeGroup}>
                      {classes.map((cls) => (
                        <FuiInputCheckbox
                          key={cls.id}
                          checked={watchedClassIds.includes(cls.id)}
                          disabled={watchedAllClasses || isReadOnly}
                          label={`${cls.grade}${cls.classNumber}`}
                          onChange={(data) => {
                            const updated =
                              data.checked === true
                                ? [...watchedClassIds, cls.id]
                                : watchedClassIds.filter(
                                    (cid) => cid !== cls.id,
                                  );
                            setValue('classIds', updated);
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </FuiTab>

              <FuiTab
                disabled={activeTab !== 'student'}
                name={t('user.entitlementStudent')}
                value="student"
              >
                <JrVcGrid columns={2}>
                  <Controller
                    control={control}
                    name="studentId1"
                    render={({ field, fieldState }) => (
                      <StudentIdInputText
                        ref={studentId1Ref}
                        errorMessage={fieldState.error?.message}
                        label={t('user.studentId1')}
                        onChange={(value) => {
                          clearErrors('studentId1');
                          field.onChange(value);
                        }}
                        onLookupChange={(lookup) => {
                          setStudentId1Lookup(lookup);
                          if (lookup.status === 'invalid') {
                            setError('studentId1', { message: t('user.invalidStudentId'), type: 'manual' });
                          } else if (lookup.status === 'valid') {
                            clearErrors('studentId1');
                          }
                        }}
                        placeholder={t('user.studentId1Placeholder')}
                        readOnly={isReadOnly}
                        required={watchedRole === 'STUDENT' || watchedRole === 'PARENT'}
                        value={field.value}
                      />
                    )}
                  />

                  {watchedRole === 'PARENT' && (
                    <Controller
                      control={control}
                      name="studentId2"
                      render={({ field, fieldState }) => (
                        <StudentIdInputText
                          ref={studentId2Ref}
                          errorMessage={fieldState.error?.message}
                          label={t('user.studentId2')}
                          onChange={(value) => {
                            clearErrors('studentId2');
                            field.onChange(value);
                          }}
                          onLookupChange={(lookup) => {
                            setStudentId2Lookup(lookup);
                            if (lookup.status === 'invalid') {
                              setError('studentId2', { message: t('user.invalidStudentId'), type: 'manual' });
                            } else if (lookup.status === 'valid') {
                              clearErrors('studentId2');
                            }
                          }}
                          placeholder={t('user.studentId2Placeholder')}
                          readOnly={isReadOnly}
                          value={field.value}
                        />
                      )}
                    />
                  )}
                </JrVcGrid>
              </FuiTab>

              <FuiTab
                disabled={activeTab !== 'none'}
                name={'None'}
                value="none"
              >
                <div className={styles.noEntitlementRow}>
                  <Subtitle2>Entitlement not required</Subtitle2>
                </div>
              </FuiTab>
            </FuiTabList>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

    </JrVcEditPageLayout>
  );
};

export { UserEditPage };
