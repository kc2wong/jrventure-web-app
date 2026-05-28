import { JrVcFilterForm } from '@component/jr-venture-filter-drawer-page';
import { zodResolver } from '@hookform/resolvers/zod';
import { referenceDataStateAtom } from '@store/reference-data/reference-data-bloc';
import {
  studentListActionAtom,
  studentListStateAtom,
} from '@store/student/student-list-bloc';
import { FuiInputDropdown, FuiInputText } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const studentFilterSchema = z.object({
  id: z.string().optional().nullable(),
  classId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
});
type StudentFilterFormValues = z.infer<typeof studentFilterSchema>;

type StudentFilterFormProps = {
  onSearch?: () => void;
};

export const StudentFilterForm = ({ onSearch }: StudentFilterFormProps) => {
  const { t } = useTranslation();
  const listDispatch = useSetAtom(studentListActionAtom);
  const { filter, pagination } = useAtomValue(studentListStateAtom);

  const { classes } = useAtomValue(referenceDataStateAtom);

  const classOptions = useMemo(
    () =>
      classes.map((c) => ({
        text: `${c.grade}${c.classNumber}`,
        value: c.id,
      })),
    [classes],
  );

  const { control, handleSubmit, reset } = useForm<StudentFilterFormValues>({
    resolver: zodResolver(studentFilterSchema),
    defaultValues: {
      id: filter.id ?? null,
      classId: filter.classId ?? null,
      name: filter.name ?? null,
    },
  });

  useEffect(() => {
    reset({
      id: filter.id ?? null,
      classId: filter.classId ?? null,
      name: filter.name ?? null,
    });
  }, [filter]);

  const onSubmit = async (values: StudentFilterFormValues) => {
    await listDispatch({
      type: 'SEARCH',
      filter: {
        id: values.id || undefined,
        classId: values.classId || undefined,
        name: values.name || undefined,
      },
      pagination: { offset: 0, pageSize: pagination?.pageSize ?? 10 },
    });
    onSearch?.();
  };

  return (
    <JrVcFilterForm onSearch={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="id"
        render={({ field }) => (
          <FuiInputText
            label={t('student.id')}
            onChange={(value) => field.onChange(value)}
            placeholder={t('student.idPlaceholder')}
            value={field.value ?? null}
          />
        )}
      />
      <Controller
        control={control}
        name="classId"
        render={({ field }) => (
          <FuiInputDropdown
            label={t('student.classId')}
            onChange={(value) => {
              field.onChange(value as string | null);
            }}
            options={classOptions}
            placeholder={t('general.text.all')}
            value={field.value ?? null}
          />
        )}
      />
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <FuiInputText
            label={t('student.name')}
            onChange={(value) => field.onChange(value)}
            placeholder={t('student.namePlaceholder')}
            value={field.value ?? null}
          />
        )}
      />
    </JrVcFilterForm>
  );
};
