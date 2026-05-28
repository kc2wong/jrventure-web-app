import { JrVcFilterForm } from '@component/jr-venture-filter-drawer-page';
import { Switch, tokens } from '@fluentui/react-components';
import { ActivityCategoryDropdown } from '@page/activity/activity-dropdown';
import {
  activityListActionAtom,
  activityListStateAtom,
} from '@store/activity/activity-list-bloc';
import type { ActivityCategory } from '@store/activity/activity-types';
import { authStateAtom } from '@store/auth/auth-bloc';
import { FuiInputDate, FuiInputGroup } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type StudentActivityFilterFormValues = {
  category: ActivityCategory[] | null;
  withParticipation: boolean;
  fromStartDate: Date | null;
  toEndDate: Date | null;
};

type StudentActivityFilterFormProps = {
  onSearch?: () => void;
};

const StudentActivityFilterForm = ({ onSearch }: StudentActivityFilterFormProps) => {
  const { t } = useTranslation();
  const listDispatch = useSetAtom(activityListActionAtom);
  const { filter, pagination } = useAtomValue(activityListStateAtom);
  const { selectedStudentId } = useAtomValue(authStateAtom);

  const defaultValues = {
    category: filter.category ?? null,
    withParticipation: filter.withParticipation ?? false,
    fromStartDate: filter.fromStartDate ?? null,
    toEndDate: filter.toEndDate ?? null,
  };

  const { control, handleSubmit, reset } = useForm<StudentActivityFilterFormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [filter]);

  const onSubmit = async (values: StudentActivityFilterFormValues) => {
    await listDispatch({
      type: 'SEARCH',
      filter: {
        category: values.category?.length ? values.category : undefined,
        fromStartDate: values.fromStartDate ?? undefined,
        status: ['CONFIRMED'],
        studentIds: selectedStudentId ? [selectedStudentId] : undefined,
        toEndDate: values.toEndDate ?? undefined,
        withParticipation: values.withParticipation || undefined,
      },
      pagination: { offset: 0, pageSize: pagination?.pageSize ?? 10 },
    });
    onSearch?.();
  };

  return (
    <JrVcFilterForm onSearch={handleSubmit(onSubmit)}>
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
        name="withParticipation"
        render={({ field }) => (
          <Switch
            checked={field.value}
            label={t('activity.withParticipation')}
            onChange={(_, data) => field.onChange(data.checked)}
            style={{ paddingBottom: tokens.spacingVerticalM, paddingTop: tokens.spacingVerticalM }}
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

export { StudentActivityFilterForm };
