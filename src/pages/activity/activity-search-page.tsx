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
  Option,
  Body1,
  useTableSelection,
  Tooltip,
  Label,
  makeStyles,
  Dropdown,
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
import { atom, useAtom, useAtomValue } from 'jotai';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SearchCriteriaDrawer } from '../../components/drawer';
import { Form, Root, Row } from '../../components/Container';
import { Field } from '../../components/field';
import {
  Filter,
  activityListAtom,
  ActivityListStateInitial,
  ActivityListStateSuccess,
  ActivityOrdering,
} from '../../states/activity-list';
import { Activity, ActivityStatusEnum, SubmissionRoleEnum } from '../../models/openapi';
import { getRawValueByEnumValue, getEnumValueByRawValue } from '../../utils/enum-util';
import { constructErrorMessage } from '../../utils/string-util';
import { zodOptionalDate, zodOptionalString } from '../../types/zod';
import { createTableColumn } from '../../components/table/create-table-column-definition';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import { useNameInPreferredLanguage } from '../../hooks/use-preferred-language';
import { activityCategoryListAtom } from '../../states/activity-category-list';
import { useTimezone } from '../../hooks/use-timezone';
import { StatusLabel } from './status-label';
import { RoleLabel } from './role-label';
import { Pagination } from '../../components/pagination';
import { formatParticpantGrade } from './participant-grade-formatter';
import { useCommonStyles } from '../common';
import { Input } from '../../components/Input';
import { DatePicker } from '../../components/date-picker';

const searchSchema = z.object({
  categoryCode: zodOptionalString(),
  name: zodOptionalString(),
  startDateFrom: zodOptionalDate(),
  startDateTo: zodOptionalDate(),
  endDateFrom: zodOptionalDate(),
  endDateTo: zodOptionalDate(),
  participantGrade: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
});

const pageSize = 10;
const statusList = Object.values(ActivityStatusEnum) as ActivityStatusEnum[];
const gradeList = [1, 2, 3, 4, 5, 6];

type SearchFormData = z.infer<typeof searchSchema>;

type SearchDrawerProps = { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; t: TFunction };

const useStyles = makeStyles({
  row: {
    display: 'grid',
    gridTemplateColumns: '47% 6% 47%',
    width: '100%',
    alignItems: 'center',
  },
});

const toLabel = (
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <Label>-</Label>
  </div>
);

const SearchDrawer = ({ t, isOpen, onOpenChange }: SearchDrawerProps) => {
  const { formatDate } = useTimezone();
  const [state, action] = useAtom(activityListAtom);
  const activtyCategoryState = useAtomValue(activityCategoryListAtom);
  const commonStyles = useCommonStyles();
  const styles = useStyles();

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
    if (state instanceof ActivityListStateInitial) {
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
        action({
          search: {
            filter: _searchFormData2Filter(formData),
          },
        });
      })}
      t={t}
    >
      <Controller
        control={control}
        name="categoryCode"
        render={({ field }) => {
          const activityCategoryList = activtyCategoryState.getResult() ?? [];
          const { value, ...others } = field;
          return (
            <Field
              label={t('activityMaintenance.category')}
              validationMessage={
                errors.categoryCode?.message
                  ? constructErrorMessage(t, errors.categoryCode?.message)
                  : undefined
              }
            >
              <Dropdown
                {...others}
                className={commonStyles.field}
                multiselect={false}
                onOptionSelect={(_ev, data) => {
                  setValue(
                    field.name,
                    data.selectedOptions.length > 0 ? data.selectedOptions[0] : undefined,
                  );
                }}
                selectedOptions={value ? [value] : []}
                value={useNameInPreferredLanguage(
                  activityCategoryList.find((ac) => ac.code === value),
                )}
              >
                {activityCategoryList.map((ac) => (
                  <Option key={ac.code} value={`${ac.code}`}>
                    {useNameInPreferredLanguage(ac)}
                  </Option>
                ))}
              </Dropdown>
            </Field>
          );
        }}
      />

      <Controller
        control={control}
        name="name"
        render={({ field }) => {
          return (
            <Field
              label={t('activityMaintenance.name')}
              validationMessage={
                errors.categoryCode?.message
                  ? constructErrorMessage(t, errors.categoryCode?.message)
                  : undefined
              }
            >
              <Input {...field} />
            </Field>
          );
        }}
      />

      <Controller
        control={control}
        name="participantGrade"
        render={({ field }) => {
          const { name, value, ...others } = field;
          return (
            <Field
              label={t('activityMaintenance.forClass')}
              validationMessage={
                errors.participantGrade?.message
                  ? constructErrorMessage(t, errors.participantGrade?.message)
                  : undefined
              }
            >
              <Dropdown
                {...others}
                className={commonStyles.field}
                multiselect={true}
                onOptionSelect={(_ev, data) => {
                  setValue(name, data.selectedOptions);
                }}
                selectedOptions={value}
                value={(value ? value.sort().map((i) => `P${i}`) : []).join(', ')}
              >
                {gradeList.map((i) => (
                  <Option key={i} value={`${i}`}>
                    {`P${i}`}
                  </Option>
                ))}
              </Dropdown>
            </Field>
          );
        }}
      />

      <Field
        label={t('activityMaintenance.startDate')}
        validationMessage={
          errors.startDateFrom?.message !== undefined || errors.startDateTo?.message !== undefined
            ? constructErrorMessage(
                t,
                errors.startDateFrom?.message ?? errors.startDateTo?.message ?? '',
              )
            : undefined
        }
      >
        <div className={styles.row}>
          <Controller
            control={control}
            name="startDateFrom"
            render={({ field }) => {
              return (
                <DatePicker
                  className={commonStyles.field}
                  formatDate={(date) => (date ? formatDate(date) : '')}
                  {...field}
                />
              );
            }}
          />
          {toLabel}
          <Controller
            control={control}
            name="startDateTo"
            render={({ field }) => {
              return (
                <DatePicker
                  className={commonStyles.field}
                  formatDate={(date) => (date ? formatDate(date) : '')}
                  {...field}
                />
              );
            }}
          />
        </div>
      </Field>

      <Field
        label={t('activityMaintenance.endDate')}
        validationMessage={
          errors.endDateFrom?.message !== undefined || errors.endDateTo?.message !== undefined
            ? constructErrorMessage(
                t,
                errors.endDateFrom?.message ?? errors.endDateTo?.message ?? '',
              )
            : undefined
        }
      >
        <div className={styles.row}>
          <Controller
            control={control}
            name="endDateFrom"
            render={({ field }) => {
              return (
                <DatePicker
                  className={commonStyles.field}
                  formatDate={(date) => (date ? formatDate(date) : '')}
                  {...field}
                />
              );
            }}
          />
          {toLabel}
          <Controller
            control={control}
            name="endDateTo"
            render={({ field }) => {
              return (
                <DatePicker
                  className={commonStyles.field}
                  formatDate={(date) => (date ? formatDate(date) : '')}
                  {...field}
                />
              );
            }}
          />
        </div>
      </Field>

      <Controller
        control={control}
        name="status"
        render={({ field }) => {
          const { value, ...others } = field;
          return (
            <Field label={t('activityMaintenance.status.label')}>
              <Dropdown
                {...others}
                multiselect={true}
                onOptionSelect={(_ev, data) => {
                  setValue(field.name, data.selectedOptions);
                }}
                selectedOptions={value}
                value={(value
                  ? value.sort().map((s) => t(`activityMaintenance.status.value.${s}`))
                  : []
                ).join(', ')}
              >
                {statusList.map((status) => (
                  <Option key={status.toString()} value={`${status}`}>
                    {t(`activityMaintenance.status.value.${status}`)}
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

type ActivitySearchPageProps = {
  onAddButtonClick: () => void;
  onEditButtonClick: () => void;
  onViewButtonClick: () => void;
};

export const ActivitySearchPage: React.FC<ActivitySearchPageProps> = ({
  onAddButtonClick,
  onEditButtonClick,
  onViewButtonClick,
}: ActivitySearchPageProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useAtom(drawerOpenAtom);
  const { t } = useTranslation();

  const { useStartBreadcrumb } = useBreadcrumb();
  const { formatDate } = useTimezone();
  const [state, action] = useAtom(activityListAtom);

  useEffect(() => {
    if (state instanceof ActivityListStateSuccess) {
      if (state.isDirty) {
        action({ refresh: {} });
      }
    }
  }, [state]);

  useEffect(() => {
    useStartBreadcrumb('activityMaintenance.title');
  });

  const ActivityCategoryInPreferredLanguage = ({
    activityCategoryCode,
  }: {
    activityCategoryCode: string;
  }) => {
    const activtyCategoryState = useAtomValue(activityCategoryListAtom);
    const ac = (activtyCategoryState.getResult() ?? []).find(
      (ac) => ac.code === activityCategoryCode,
    );
    return <Body1>{useNameInPreferredLanguage(ac)}</Body1>;
  };

  const ActivityNameInPreferredLanguage = ({ activity }: { activity: Activity }) => {
    return <Body1>{useNameInPreferredLanguage(activity)}</Body1>;
  };

  const orderBy = state.getResult() ? state.ordering : undefined;
  const columns: TableColumnDefinition<Activity>[] = [
    createTableColumn({
      columnId: 'category',
      header: t('activityMaintenance.category'),
      width: 10,
      builder: (activity) => (
        <ActivityCategoryInPreferredLanguage activityCategoryCode={activity.categoryCode} />
      ),
    }),
    createTableColumn({
      columnId: 'name',
      header: t('activityMaintenance.name'),
      width: 25,
      builder: (activity) => <ActivityNameInPreferredLanguage activity={activity} />,
      sortDirection:
        orderBy === ActivityOrdering.NameAsc
          ? 'asc'
          : orderBy === ActivityOrdering.NameDesc
            ? 'desc'
            : undefined,
      onSort: (direction) => {
        action({
          orderBy: {
            ordering: direction === 'asc' ? ActivityOrdering.NameAsc : ActivityOrdering.NameDesc,
          },
        });
      },
    }),
    createTableColumn({
      columnId: 'participantGrade',
      header: t('activityMaintenance.forClass'),
      width: 10,
      builder: (activity) => <Body1>{formatParticpantGrade(activity.participantGrade)}</Body1>,
    }),
    createTableColumn({
      columnId: 'startDate',
      header: t('activityMaintenance.startDate'),
      width: 10,
      builder: (activity) => <Body1>{formatDate(activity.startDate)}</Body1>,
      sortDirection:
        orderBy === ActivityOrdering.StartDateAsc
          ? 'asc'
          : orderBy === ActivityOrdering.StartDateDesc
            ? 'desc'
            : undefined,
      onSort: (direction) => {
        action({
          orderBy: {
            ordering:
              direction === 'asc' ? ActivityOrdering.StartDateAsc : ActivityOrdering.StartDateDesc,
          },
        });
      },
    }),
    createTableColumn({
      columnId: 'endDate',
      header: t('activityMaintenance.endDate'),
      width: 10,
      builder: (activity) => <Body1>{formatDate(activity.endDate)}</Body1>,
      sortDirection:
        orderBy === ActivityOrdering.EndDateAsc
          ? 'asc'
          : orderBy === ActivityOrdering.EndDateDesc
            ? 'desc'
            : undefined,
      onSort: (direction) => {
        action({
          orderBy: {
            ordering:
              direction === 'asc' ? ActivityOrdering.EndDateAsc : ActivityOrdering.EndDateDesc,
          },
        });
      },
    }),
    createTableColumn({
      columnId: 'sharable',
      header: t('activityMaintenance.sharable'),
      width: 5,
      builder: (activity) => (
        <Body1>{activity.sharable ? t('system.message.yes') : t('system.message.no')}</Body1>
      ),
    }),
    createTableColumn({
      columnId: 'submissionRole',
      header: t('activityMaintenance.submissionRole.label'),
      width: 10,
      builder: (activity) => (
        <RoleLabel
          role={
            getEnumValueByRawValue(
              SubmissionRoleEnum,
              activity.achievementSubmissionRole,
            ) as SubmissionRoleEnum
          }
        />
      ),
    }),
    createTableColumn({
      columnId: 'ratable',
      header: t('activityMaintenance.ratable'),
      width: 5,
      builder: (activity) => (
        <Body1>{activity.ratable ? t('system.message.yes') : t('system.message.no')}</Body1>
      ),
    }),
    createTableColumn({
      columnId: 'eCoin',
      header: t('activityMaintenance.eCoin'),
      width: 7,
      builder: (activity) => <Body1>{activity.eCoin}</Body1>,
    }),
    createTableColumn({
      columnId: 'status',
      header: t('activityMaintenance.status.label'),
      width: 8,
      builder: (activity) => (
        <StatusLabel
          status={getEnumValueByRawValue(ActivityStatusEnum, activity.status) as ActivityStatusEnum}
        />
      ),
    }),
  ];

  const items = state.getResult()?.data ?? [];
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
          action({ select: { activity: selected } });
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
      <ToolbarButton
        aria-label="Add"
        icon={<AddCircleRegular />}
        onClick={() => {
          action({ select: {} });
          onAddButtonClick();
        }}
      />
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

  const result = state.getResult();
  const pagination = result ? (
    <Pagination
      offset={result.offset}
      onOffsetChanged={(offset) => {
        action({ pagination: { offSet: offset } });
      }}
      pageSize={pageSize}
      totalRecord={result.total}
    />
  ) : (
    <></>
  );

  return (
    <Root>
      <Row>
        <SearchDrawer isOpen={isDrawerOpen} onOpenChange={(open) => setIsDrawerOpen(open)} t={t} />

        <Form
          numColumn={1}
          pagination={pagination}
          title={t('activityMaintenance.title')}
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
      </Row>
    </Root>
  );
};

const _searchFormData2Filter = ({
  participantGrade,
  status,
  ...others
}: SearchFormData): Filter => {
  return {
    ...others,
    participantGrade: participantGrade ? participantGrade.map((i) => parseInt(i)) : undefined,
    status: status?.map((s) => getEnumValueByRawValue(ActivityStatusEnum, s)!) ?? [],
    offset: 0,
    limit: pageSize,
  };
};

const _filter2SearchFormData = ({
  participantGrade,
  status,
  ...others
}: Filter): SearchFormData => {
  return {
    participantGrade: participantGrade ? participantGrade.map((i) => i.toString()) : [],
    status: status?.map((s) => getRawValueByEnumValue(ActivityStatusEnum, s)!) ?? [],
    ...others,
  };
};
