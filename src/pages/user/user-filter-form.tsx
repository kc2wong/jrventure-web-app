import { useCommonStyles } from '@component/common-styles';
import { JrVcFilterForm } from '@component/jr-venture-filter-drawer-page';
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
import {
  userListActionAtom,
  userListStateAtom,
} from '@store/user/user-list-bloc';
import type { UserRole, UserStatus } from '@store/user/user-types';
import { FuiInputDropdown, FuiInputText } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const userFilterSchema = z.object({
  email: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
});
type UserFilterFormValues = z.infer<typeof userFilterSchema>;

type UserFilterFormProps = {
  onSearch?: () => void;
};

const UserFilterForm = ({ onSearch }: UserFilterFormProps) => {
  const commonStyles = useCommonStyles();
  const { t } = useTranslation();
  const listDispatch = useSetAtom(userListActionAtom);
  const { filter, pagination } = useAtomValue(userListStateAtom);

  const roleOptions = useMemo(
    () => [
      {
        text: t('user.roleStudent'),
        value: 'STUDENT' as UserRole,
        render: () => (
          <span className={commonStyles.optionContent}>
            <EditPersonRegular className={commonStyles.largeIcon} />
            {t('user.roleStudent')}
          </span>
        ),
      },
      {
        text: t('user.roleParent'),
        value: 'PARENT' as UserRole,
        render: () => (
          <span className={commonStyles.optionContent}>
            <PeopleListRegular className={commonStyles.largeIcon} />
            {t('user.roleParent')}
          </span>
        ),
      },
      {
        text: t('user.roleTeacher'),
        value: 'TEACHER' as UserRole,
        render: () => (
          <span className={commonStyles.optionContent}>
            <PersonFeedbackRegular className={commonStyles.largeIcon} />
            {t('user.roleTeacher')}
          </span>
        ),
      },
      {
        text: t('user.roleAdmin'),
        value: 'ADMIN' as UserRole,
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
        value: 'ACTIVE' as UserStatus,
        render: () => (
          <span className={commonStyles.optionContent}>
            <CheckmarkCircleRegular className={commonStyles.largeIcon} />
            {t('user.statusActive')}
          </span>
        ),
      },
      {
        text: t('user.statusInactive'),
        value: 'INACTIVE' as UserStatus,
        render: () => (
          <span className={commonStyles.optionContent}>
            <DismissCircleRegular className={commonStyles.largeIcon} />
            {t('user.statusInactive')}
          </span>
        ),
      },
      {
        text: t('user.statusSuspend'),
        value: 'SUSPEND' as UserStatus,
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

  const defaultValues = {
    email: filter.email ?? null,
    name: filter.name ?? null,
    role: filter.role ?? null,
    status: filter.status ?? null,
  };

  const { control, handleSubmit, reset } = useForm<UserFilterFormValues>({
    resolver: zodResolver(userFilterSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [filter]);

  const onSubmit = async (values: UserFilterFormValues) => {
    await listDispatch({
      type: 'SEARCH',
      filter: {
        email: values.email || undefined,
        name: values.name || undefined,
        role: (values.role as UserRole) || undefined,
        status: (values.status as UserStatus) || undefined,
      },
      pagination: { offset: 0, pageSize: pagination?.pageSize ?? 10 },
    });
    onSearch?.();
  };

  return (
    <JrVcFilterForm onSearch={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <FuiInputText
            label={t('user.email')}
            onChange={(value) => field.onChange(value)}
            placeholder={t('user.emailPlaceholder')}
            value={field.value ?? null}
          />
        )}
      />
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <FuiInputText
            label={t('user.name')}
            onChange={(value) => field.onChange(value)}
            placeholder={t('user.namePlaceholder')}
            value={field.value ?? null}
          />
        )}
      />
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <FuiInputDropdown
            label={t('user.role')}
            onChange={(value) => field.onChange(value as string | null)}
            options={roleOptions}
            placeholder={t('general.text.all')}
            value={field.value ?? null}
          />
        )}
      />
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <FuiInputDropdown
            label={t('user.status')}
            onChange={(value) => field.onChange(value as string | null)}
            options={statusOptions}
            placeholder={t('general.text.all')}
            value={field.value ?? null}
          />
        )}
      />
    </JrVcFilterForm>
  );
};

export { UserFilterForm };
