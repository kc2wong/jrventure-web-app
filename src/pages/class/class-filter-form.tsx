import { JrVcFilterForm } from '@component/jr-venture-filter-drawer-page';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  classListActionAtom,
  classListStateAtom,
} from '@store/class/class-list-bloc';
import { FuiInputDropdown } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const gradeOptions = [1, 2, 3, 4, 5, 6].map((g) => ({
  text: String(g),
  value: String(g),
}));

const classFilterSchema = z.object({
  grade: z.array(z.string()),
});
type ClassFilterFormValues = z.infer<typeof classFilterSchema>;

type ClassFilterFormProps = {
  onSearch?: () => void;
};

export const ClassFilterForm = ({ onSearch }: ClassFilterFormProps) => {
  const { t } = useTranslation();
  const listDispatch = useSetAtom(classListActionAtom);
  const { filter, pagination } = useAtomValue(classListStateAtom);

  const { control, handleSubmit, reset } = useForm<ClassFilterFormValues>({
    resolver: zodResolver(classFilterSchema),
    defaultValues: { grade: (filter.grade ?? []).map(String) },
  });

  useEffect(() => {
    reset({ grade: (filter.grade ?? []).map(String) });
  }, [filter]);

  const onSubmit = async (values: ClassFilterFormValues) => {
    const grades = values.grade.map(Number);
    await listDispatch({
      type: 'SEARCH',
      filter: { grade: grades.length > 0 ? grades : undefined },
      pagination: { offset: 0, pageSize: pagination?.pageSize ?? 10 },
    });
    onSearch?.();
  };

  return (
    <JrVcFilterForm onSearch={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="grade"
        render={({ field }) => (
          <FuiInputDropdown
            label={t('class.grade')}
            multiselect
            onChange={(values) => field.onChange((values as string[]) ?? [])}
            options={gradeOptions}
            placeholder={t('general.text.all')}
            value={field.value}
          />
        )}
      />
    </JrVcFilterForm>
  );
};

