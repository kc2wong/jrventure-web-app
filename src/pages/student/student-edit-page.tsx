import { CancelButton, SaveButton } from '@component/jr-venture-button';
import { JrVcEditPageLayout } from '@component/jr-venture-edit-page-layout';
import { JrVcGrid, JrVcGridItem } from '@component/jr-venture-grid';
import {
  JrVcInputMultiLangText,
  JrVcInputNumber,
  JrVcInputText,
} from '@component/jr-venture-input';
import type { MaintenanceEditPageProps } from '@component/with-maintenance-page';
import { zodResolver } from '@hookform/resolvers/zod';
import { referenceDataStateAtom } from '@store/reference-data/reference-data-bloc';
import {
  studentEditActionAtom,
  studentEditStateAtom,
} from '@store/student/student-edit-bloc';
import { studentListActionAtom } from '@store/student/student-list-bloc';
import {
  EMPTY_MULTI_LANG_TEXT,
  multiLangNameToText,
  multiLangTextToName,
} from '@util/form-util';
import {
  FuiButtonPanel,
  FuiInputGroup,
  type MultiLangText,
} from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { Controller, useController, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

type StudentFormValues = {
  firstName: MultiLangText;
  lastName: MultiLangText;
  classId: string;
  studentNumber: number;
};

const StudentEditPage = ({
  id,
  mode,
  onExit,
}: MaintenanceEditPageProps) => {
  const { i18n, t } = useTranslation();

  const dispatch = useSetAtom(studentEditActionAtom);
  const listDispatch = useSetAtom(studentListActionAtom);
  const { data } = useAtomValue(studentEditStateAtom);
  const { classes } = useAtomValue(referenceDataStateAtom);

  const classTextToId = useMemo(
    () =>
      Object.fromEntries(
        classes.map((c) => [`${c.grade}${c.classNumber}`, c.id]),
      ),
    [classes],
  );

  const classIdToText = useMemo(
    () =>
      Object.fromEntries(
        classes.map((c) => [c.id, `${c.grade}${c.classNumber}`]),
      ),
    [classes],
  );

  const studentSchema = useMemo(
    () =>
      z.object({
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
        classId: z
          .string()
          .min(1, t('validation.required'))
          .refine(
            (val) => classes.some((c) => `${c.grade}${c.classNumber}` === val),
            { message: t('validation.invalidClass') },
          ),
        studentNumber: z
          .number({ message: t('validation.required') })
          .int()
          .min(1),
      }),
    [t, classes],
  );

  const emptyStudentFormValues = {
    firstName: EMPTY_MULTI_LANG_TEXT,
    lastName: EMPTY_MULTI_LANG_TEXT,
    classId: '',
    studentNumber: undefined,
  };

  const { control, handleSubmit, reset, trigger, formState } =
    useForm<StudentFormValues>({
      resolver: zodResolver(studentSchema),
      defaultValues: emptyStudentFormValues,
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
      reset({
        firstName: multiLangNameToText(data.firstName),
        lastName: multiLangNameToText(data.lastName),
        classId: classIdToText[data.classId] ?? data.classId,
        studentNumber: data.studentNumber,
      });
    } else {
      reset(emptyStudentFormValues);
    }
  }, [data]);

  const isReadOnly = mode === 'view';

  const onSubmit = async (values: StudentFormValues) => {
    const payload = {
      firstName: multiLangTextToName(values.firstName),
      lastName: multiLangTextToName(values.lastName),
      classId: classTextToId[values.classId] ?? values.classId,
      studentNumber: values.studentNumber,
    };
    if (mode === 'add') {
      await dispatch({ type: 'CREATE', payload });
    } else if (id) {
      await dispatch({ type: 'UPDATE', payload: { id, ...payload } });
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
      desktopWidth={{ maxWidth: '800px', minWidth: '600px', width: '40vw' }}
      entityName={t('student.title')}
      mode={mode}
    >
      <JrVcGrid columns={2}>
        <Controller
          control={control}
          name="classId"
          render={({ field, fieldState }) => (
            <JrVcInputText
              errorMessage={fieldState.error?.message}
              label={t('student.classId')}
              onChange={(value) => field.onChange(value ?? '')}
              placeholder={t('student.classIdPlaceholder')}
              readOnly={isReadOnly}
              required={!isReadOnly}
              value={field.value}
            />
          )}
        />
        <div></div>
        <Controller
          control={control}
          name="studentNumber"
          render={({ field, fieldState }) => (
            <JrVcInputNumber
              errorMessage={fieldState.error?.message}
              label={t('student.studentNumber')}
              min={1}
              onChange={(value) => field.onChange(value)}
              placeholder={t('student.studentNumberPlaceholder')}
              readOnly={isReadOnly}
              required={!isReadOnly}
              step={1}
              value={field.value ?? null}
            />
          )}
        />
        <div></div>

        <JrVcGridItem fullWidth>
          <FuiInputGroup
            items={[
              {
                element: (
                  <JrVcInputMultiLangText
                    errorMessage={fnState.error?.message}
                    label={t('student.firstName')}
                    onChange={(value) =>
                      fnField.onChange(value ?? EMPTY_MULTI_LANG_TEXT)
                    }
                    readOnly={isReadOnly}
                    required={!isReadOnly}
                    value={fnField.value}
                  />
                ),
              },
              {
                element: (
                  <JrVcInputMultiLangText
                    errorMessage={lnState.error?.message}
                    label={t('student.lastName')}
                    onChange={(value) =>
                      lnField.onChange(value ?? EMPTY_MULTI_LANG_TEXT)
                    }
                    readOnly={isReadOnly}
                    required={!isReadOnly}
                    value={lnField.value}
                  />
                ),
              },
            ]}
            label={t('student.name')}
            required
          />
        </JrVcGridItem>
      </JrVcGrid>

    </JrVcEditPageLayout>
  );
};

export { StudentEditPage };
