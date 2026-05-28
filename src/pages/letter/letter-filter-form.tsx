import { JrVcFilterForm } from '@component/jr-venture-filter-drawer-page';
import { RoleBasedComponent } from '@component/role-based-component';
import { StudentIdInputText } from '@component/student-id-input-text';
import { authStateAtom } from '@store/auth/auth-bloc';
import {
  letterListActionAtom,
  letterListStateAtom,
} from '@store/letter/letter-list-bloc';
import type { LetterStatus } from '@store/letter/letter-types';
import { FuiInputDate, FuiInputGroup } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { LetterStatusDropdown } from './letter-status-dropdown';

type LetterFilterFormValues = {
  studentId: string | null;
  status: LetterStatus[] | null;
  fromCreatedAt: Date | null;
  toCreatedAt: Date | null;
};

type LetterFilterFormProps = {
  onSearch?: () => void;
};

const LetterFilterForm = ({ onSearch }: LetterFilterFormProps) => {
  const { t } = useTranslation();
  const listDispatch = useSetAtom(letterListActionAtom);
  const { filter, pagination } = useAtomValue(letterListStateAtom);
  const { user, selectedStudentId } = useAtomValue(authStateAtom);

  const defaultValues = {
    studentId: filter.studentId ?? null,
    status: filter.status ?? null,
    fromCreatedAt: filter.fromCreatedAt ?? null,
    toCreatedAt: filter.toCreatedAt ?? null,
  };

  const { control, handleSubmit, reset } = useForm<LetterFilterFormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [filter]);

  const onSubmit = async (values: LetterFilterFormValues) => {
    const isParentOrStudent =
      user?.role === 'PARENT' || user?.role === 'STUDENT';
    await listDispatch({
      type: 'SEARCH',
      filter: {
        studentId: isParentOrStudent
          ? (selectedStudentId ?? undefined)
          : values.studentId || undefined,
        status: values.status?.length ? values.status : undefined,
        fromCreatedAt: values.fromCreatedAt ?? undefined,
        toCreatedAt: values.toCreatedAt ?? undefined,
      },
      pagination: { offset: 0, pageSize: pagination?.pageSize ?? 10 },
    });
    onSearch?.();
  };

  return (
    <JrVcFilterForm onSearch={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="fromCreatedAt"
        render={({ field: fromField }) => (
          <Controller
            control={control}
            name="toCreatedAt"
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
                label={t('letter.createdAt')}
              />
            )}
          />
        )}
      />
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <LetterStatusDropdown
            label={t('letter.status')}
            multiselect
            onChange={(value) =>
              field.onChange((value as LetterStatus[]) ?? null)
            }
            placeholder={t('general.text.all')}
            value={field.value ?? null}
          />
        )}
      />
      <RoleBasedComponent role="TEACHER">
        <Controller
          control={control}
          name="studentId"
          render={({ field }) => (
            <StudentIdInputText
              label={t('letter.studentId')}
              onChange={(value) => field.onChange(value)}
              placeholder={t('letter.studentIdPlaceholder')}
              value={field.value ?? null}
            />
          )}
        />
      </RoleBasedComponent>
    </JrVcFilterForm>
  );
};

export { LetterFilterForm };
export type { LetterFilterFormProps };
