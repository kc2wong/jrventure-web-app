import { useEffect } from 'react';
import {
  ToolbarButton,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableSelectionCell,
  useTableFeatures,
  TableColumnDefinition,
  Dropdown,
  Option,
  Body1,
  useTableSelection,
  Tooltip,
} from '@fluentui/react-components';
import {
  AddCircleRegular,
  ArrowClockwiseRegular,
  EditRegular,
  EyeRegular,
  FilterRegular,
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { TFunction } from 'i18next';
import { atom, useAtom } from 'jotai';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {} from '../../models/system';
import { SearchCriteriaDrawer } from '../../components/Drawer';
import { Form, Root } from '../../components/Container';
import { Field } from '../../components/Field';
import { logger } from '../../utils/logging-util';
import {
  Filter,
  userListAtom,
  UserListStateFail,
  UserListStateInitial,
  UserListStateSuccess,
} from '../../states/user-list';
import { Student, User, UserRole, UserStatus } from '../../models/openapi';
import { getRawValueByEnumValue, getEnumValueByRawValue } from '../../utils/enum-util';
import { constructErrorMessage } from '../../utils/string-util';
import { zodOptionalEmail, zodOptionalString } from '../../types/zod';
import { Input } from '../../components/Input';
import { createTableColumn } from '../../components/table/create-table-column-definition';
import { useMessage } from '../../hooks/use-message';
import { undefinedToEmptyString } from '../../utils/object-util';
import { RoleLabel } from './role-label';
import { StatusLabel } from './status-label';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import { useNameInPreferredLanguage } from '../../hooks/use-preferred-language';

const searchSchema = z.object({
  email: zodOptionalEmail(),
  name: zodOptionalString(),
  studentId: zodOptionalString(),
  role: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
});

const statusList = [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPEND];
const roleList = [UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN];

type SearchFormData = z.infer<typeof searchSchema>;

type SearchDrawerProps = { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; t: TFunction };

const SearchDrawer = ({ t, isOpen, onOpenChange }: SearchDrawerProps) => {
  const [state, action] = useAtom(userListAtom);

  const {
    control,
    getValues,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SearchFormData>({
    defaultValues: { ..._filter2SearchFormData(state.filter) },
    resolver: zodResolver(searchSchema),
  });

  useEffect(() => {
    if (state instanceof UserListStateInitial) {
      reset();
    }
  }, [state]);

  return (
    <SearchCriteriaDrawer
      isOpen={isOpen}
      onClear={() => {
        action({ reset: {} });
      }}
      onDrawerClose={() => onOpenChange(false)}
      onSearch={handleSubmit(() => {
        const formData = getValues();
        logger.info(`Start search user with criteria ${JSON.stringify(formData)}`);
        action({
          search: {
            filter: _searchFormData2Filter(formData),
            // offset: 0,
            // pageSize: 25,
            // code: formData?.code,
            // name: formData?.name,
          },
        });
      })}
      t={t}
    >
      <Controller
        control={control}
        name="email"
        render={({ field }) => {
          return (
            <Field
              label={t('userMaintenance.email')}
              orientation="horizontal"
              validationMessage={
                errors.email?.message ? constructErrorMessage(t, errors.email?.message) : undefined
              }
            >
              <Input {...field} />
            </Field>
          );
        }}
      />

      <Controller
        control={control}
        name="name"
        render={({ field }) => {
          return (
            <Field label={t('userMaintenance.name')} orientation="horizontal">
              <Input {...field} />
            </Field>
          );
        }}
      />

      <Controller
        control={control}
        name="role"
        render={({ field }) => {
          const { value, ...others } = field;
          return (
            <Field label={t('userMaintenance.role.label')} orientation="horizontal">
              <Dropdown
                {...others}
                multiselect={true}
                onOptionSelect={(_ev, data) => {
                  field.onChange(data.selectedOptions);
                }}
                selectedOptions={value}
              >
                {roleList.map((role) => (
                  <Option key={role.toString()} value={`${role}`}>
                    {t(`userMaintenance.role.value.${role}`)}
                  </Option>
                ))}
              </Dropdown>
            </Field>
          );
        }}
      />

      <Controller
        control={control}
        name="studentId"
        render={({ field }) => (
          <Field label={t('userMaintenance.studentId')} orientation="horizontal">
            <Input {...field} />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="status"
        render={({ field }) => {
          const { value, ...others } = field;
          return (
            <Field label={t('userMaintenance.status.label')} orientation="horizontal">
              <Dropdown
                {...others}
                multiselect={true}
                onOptionSelect={(_ev, data) => {
                  setValue(field.name, data.selectedOptions);
                }}
                selectedOptions={value}
              >
                {statusList.map((status) => (
                  <Option key={status.toString()} value={`${status}`}>
                    {t(`userMaintenance.status.value.${status}`)}
                  </Option>
                ))}
              </Dropdown>
            </Field>
          );
        }}
      />
    </SearchCriteriaDrawer>
  );
};

const drawerOpenAtom = atom(false);

type UserSearchPageProps = {
  onAddButtonClick: () => void;
  onEditButtonClick: () => void;
  onViewButtonClick: () => void;
};

export const UserSearchPage: React.FC<UserSearchPageProps> = ({
  onAddButtonClick,
  onEditButtonClick,
  onViewButtonClick,
}: UserSearchPageProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useAtom(drawerOpenAtom);
  const { t } = useTranslation();

  const { startBreadcrumb } = useBreadcrumb();
  const { dispatchMessage } = useMessage();
  const [state, action] = useAtom(userListAtom);

  useEffect(() => {
    if (state instanceof UserListStateSuccess) {
      if (state.isDirty) {
        action({ refresh: {} });
      }
    } else if (state instanceof UserListStateFail) {
      // stopSpinner();
      const failure = state.failure;
      dispatchMessage({
        type: failure.type,
        text: constructErrorMessage(t, failure.key, failure.parameters)!,
      });
    }
  }, [state]);

  startBreadcrumb('userMaintenance.title');

  const NameInPreferredLanguage = ({ user }: { user: User }) => {
    return <Body1>{useNameInPreferredLanguage(user)}</Body1>;
  };

  const columns: TableColumnDefinition<User>[] = [
    createTableColumn({
      columnId: 'name',
      header: t('userMaintenance.name'),
      width: 26,
      builder: (user) => <NameInPreferredLanguage user={user} />,
    }),
    createTableColumn({
      columnId: 'email',
      header: t('userMaintenance.email'),
      width: 20,
      builder: (user) => <Body1>{user.email}</Body1>,
    }),
    createTableColumn({
      columnId: 'role',
      header: t('userMaintenance.role.label'),
      width: 16,
      builder: (user) => <RoleLabel role={user.role}></RoleLabel>,
    }),
    createTableColumn({
      columnId: 'classIdStudentNumber',
      header: t('userMaintenance.classId'),
      width: 6,
      builder: (item) => <Body1>{_classIdStudentNumber(item.entitledStudent[0])}</Body1>,
    }),
    createTableColumn({
      columnId: 'studentId',
      header: t('userMaintenance.studentId'),
      width: 16,
      builder: (item) => <Body1>{undefinedToEmptyString(item.entitledStudentId[0])}</Body1>,
    }),
    createTableColumn({
      columnId: 'status',
      header: t('userMaintenance.status.label'),
      width: 16,
      builder: (user) => <StatusLabel status={user.status}></StatusLabel>,
    }),
  ];

  const items = state.getResult() ?? [];
  const {
    getRows,
    selection: { toggleRow, isRowSelected },
  } = useTableFeatures({ columns, items, getRowId: (item) => item.id }, [
    useTableSelection({
      selectionMode: 'single',
      selectedItems: state.selectedResult ? [state.selectedResult.id] : [],
      onSelectionChange(_event, data) {
        const selected = rows.find((r) => data.selectedItems.has(r.rowId))?.item;
        if (state.selectedResult === undefined || state.selectedResult != selected) {
          action({ select: { user: selected } });
        } else {
          action({ select: {} });
        }
      },
    }),
  ]);

  const rows = getRows((row) => {
    const selected = isRowSelected(row.rowId);
    return {
      ...row,
      onClick: (e: React.MouseEvent) => {
        toggleRow(e, row.rowId);
      },
      selected,
      appearance: selected ? ('brand' as const) : ('none' as const),
    };
  });

  // useStartBreadcrumb('userMaintenance.title');

  const toolbarButtonRefresh = (
    <Tooltip content={t('system.message.refresh')} relationship="label" withArrow>
      <ToolbarButton
        aria-label="Refresh"
        disabled={state.getResult() === undefined}
        icon={<ArrowClockwiseRegular />}
        onClick={() => {
          action({ refresh: {} });
        }}
      />
    </Tooltip>
  );

  const toolbarButtonAdd = (
    <Tooltip content={t('system.message.add')} relationship="label" withArrow>
      <ToolbarButton aria-label="Add" icon={<AddCircleRegular />} onClick={onAddButtonClick} />
    </Tooltip>
  );

  const toolbarButtonFilter = (
    <Tooltip content={t('system.message.searchCriteria')} relationship="label" withArrow>
      <ToolbarButton
        aria-label="Filter"
        icon={<FilterRegular />}
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
      />
    </Tooltip>
  );

  const toolbarButtonEdit = (
    <Tooltip content={t('system.message.edit')} relationship="label" withArrow>
      <ToolbarButton
        aria-label="Edit"
        disabled={state.selectedResult === undefined}
        icon={<EditRegular />}
        onClick={onEditButtonClick}
      />
    </Tooltip>
  );

  const toolbarButtonView = (
    <Tooltip content={t('system.message.view')} relationship="label" withArrow>
      <ToolbarButton
        aria-label="View"
        disabled={state.selectedResult === undefined}
        icon={<EyeRegular />}
        onClick={onViewButtonClick}
      />
    </Tooltip>
  );

  return (
    <Root>
      <SearchDrawer isOpen={isDrawerOpen} onOpenChange={(open) => setIsDrawerOpen(open)} t={t} />

      <Form
        numColumn={1}
        title={t('userMaintenance.title')}
        toolbarSlot={[
          toolbarButtonFilter,
          toolbarButtonRefresh,
          toolbarButtonAdd,
          toolbarButtonEdit,
          toolbarButtonView,
        ]}
      >
        <Table
          style={{ width: '100%', tableLayout: 'fixed', minWidth: '500px', maxWidth: '1200px' }}
        >
          <TableHeader>
            <TableRow>
              <TableSelectionCell
                invisible
                style={{ pointerEvents: 'none', width: '40px', padding: 0 }}
                type="radio"
              />
              {columns.map((col) => col.renderHeaderCell())}
            </TableRow>
          </TableHeader>

          <TableBody>
            {!state.getResult() ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>
                  <Body1>{t('system.message.noSearchPerformed')}</Body1>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>
                  <Body1>{t('system.message.noMatchedData')}</Body1>
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ item, selected, onClick, appearance }) => (
                <TableRow
                  key={item.id}
                  appearance={appearance}
                  aria-selected={selected}
                  onClick={onClick}
                >
                  <TableSelectionCell
                    checked={selected}
                    style={{ width: '40px', padding: 0 }}
                    type="radio"
                  />
                  {columns.map((col) => col.renderCell(item))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Form>
    </Root>
  );
};

const _searchFormData2Filter = ({
  email,
  name,
  studentId,
  role,
  status,
}: SearchFormData): Filter => {
  return {
    email: email,
    name: name,
    studentId: studentId,
    role: role?.map((r) => getEnumValueByRawValue(UserRole, r)!) ?? [],
    status: status?.map((s) => getEnumValueByRawValue(UserStatus, s)!) ?? [],
  };
};

const _filter2SearchFormData = ({ role, status, ...others }: Filter): SearchFormData => {
  return {
    ...others,
    role: role?.map((r) => getRawValueByEnumValue(UserRole, r)!) ?? [],
    status: status?.map((s) => getRawValueByEnumValue(UserStatus, s)!) ?? [],
  };
};

const _classIdStudentNumber = (student?: Student): string => {
  return student ? `${student.classId}-${student.studentNumber}` : '';
};
