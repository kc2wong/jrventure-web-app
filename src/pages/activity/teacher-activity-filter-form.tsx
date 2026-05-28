import { ClassDropdown, GradeDropdown } from '@component/grade-class-input';
import { JrVcFilterForm } from '@component/jr-venture-filter-drawer-page';
import { ActivityCategoryDropdown, ActivityStatusDropdown } from '@page/activity/activity-dropdown';
import {
  activityListActionAtom,
  activityListStateAtom,
} from '@store/activity/activity-list-bloc';
import type { ActivityCategory, ActivityStatus } from '@store/activity/activity-types';
import { FuiInputDate, FuiInputGroup } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type TeacherActivityFilterFormValues = {
  status: ActivityStatus[] | null;
  category: ActivityCategory[] | null;
  forGrade: string[] | null;
  forClass: string[] | null;
  fromStartDate: Date | null;
  toEndDate: Date | null;
};

type TeacherActivityFilterFormProps = {
  onSearch?: () => void;
};

const TeacherActivityFilterForm = ({ onSearch }: TeacherActivityFilterFormProps) => {
  const { t } = useTranslation();
  const listDispatch = useSetAtom(activityListActionAtom);
  const { filter, pagination } = useAtomValue(activityListStateAtom);

  const defaultValues = {
    status: filter.status ?? null,
    category: filter.category ?? null,
    forGrade: filter.forGrade?.map(String) ?? null,
    forClass: filter.forClass ?? null,
    fromStartDate: filter.fromStartDate ?? null,
    toEndDate: filter.toEndDate ?? null,
  };

  const { control, handleSubmit, reset } = useForm<TeacherActivityFilterFormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [filter]);

  const onSubmit = async (values: TeacherActivityFilterFormValues) => {
    await listDispatch({
      type: 'SEARCH',
      filter: {
        status: values.status?.length ? values.status : undefined,
        category: values.category?.length ? values.category : undefined,
        forGrade: values.forGrade?.length ? values.forGrade.map(Number) : undefined,
        forClass: values.forClass?.length ? values.forClass : undefined,
        fromStartDate: values.fromStartDate ?? undefined,
        toEndDate: values.toEndDate ?? undefined,
      },
      pagination: { offset: 0, pageSize: pagination?.pageSize ?? 10 },
    });
    onSearch?.();
  };

  return (
    <JrVcFilterForm onSearch={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <ActivityStatusDropdown
            label={t('activity.status')}
            multiselect
            onChange={(value) => field.onChange((value as ActivityStatus[]) ?? null)}
            placeholder={t('general.text.all')}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <ActivityCategoryDropdown
            label={t('activity.category')}
            multiselect
            onChange={(value) => field.onChange((value as ActivityCategory[]) ?? null)}
            placeholder={t('general.text.all')}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="forGrade"
        render={({ field }) => (
          <GradeDropdown
            label={t('activity.forGrade')}
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
            label={t('activity.forClass')}
            onChange={field.onChange}
            placeholder={t('general.text.all')}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="fromStartDate"
        render={({ field: fromField }) => (
          <Controller
            control={control}
            name="toEndDate"
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
                label={t('activity.startDate')}
              />
            )}
          />
        )}
      />
    </JrVcFilterForm>
  );
};

export { TeacherActivityFilterForm };
