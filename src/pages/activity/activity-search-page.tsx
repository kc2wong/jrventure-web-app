import {
  ToolbarButton,
  useTableFeatures,
  TableColumnDefinition,
  Option,
  Body1,
  useTableSelection,
  Tooltip,
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
import { zodResolver } from '@hookform/resolvers/zod';
import { ActivityStatusEnum, SubmissionRoleEnum } from '@schemas/webapi';
import { zodOptionalDate, zodOptionalString } from '@t/zod';
import { TFunction } from 'i18next';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Form, Root, Row } from '@components/container';
import { DatePicker } from '@components/date-picker';
import { SearchCriteriaDrawer } from '@components/drawer';
import { Field, FromToField } from '@components/field';
import { Input } from '@components/input';
import { MultiLangBody1 } from '@components/multi-lang-field';
import { Pagination } from '@components/pagination';
import { createTableColumn } from '@components/table/create-table-column-definition';
import { DataTable } from '@components/table/data-table';
import { useBreadcrumb } from '@hooks/use-breadcrumb';
import { useNameInPreferredLanguage } from '@hooks/use-preferred-language';
import { useTimezone } from '@hooks/use-timezone';
import { activityCategoryListAtom } from '@states/activity-category-list';
import {
  Filter,
  activityListAtom,
  ActivityListStateInitial,
  ActivityListStateSuccess,
  ActivityOrdering,
} from '@states/activity-list';
import { getRawValueByEnumValue, getEnumValueByRawValue } from '@utils/enum-util';
import { constructErrorMessage } from '@utils/string-util';
import { Activity } from '@webapi/types';

import { useCommonStyles } from '../common';
import { RoleLabel } from './shared/components/role-label';
import { StatusLabel } from './shared/components/status-label';

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
  gridColumn: {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
});

const SearchDrawer = ({ t, isOpen, onOpenChange }: SearchDrawerProps) => {
  const { formatDate } = useTimezone();
  const [state, action] = useAtom(activityListAtom);
  const activtyCategoryState = useAtomValue(activityCategoryListAtom);
  const commonStyles = useCommonStyles();

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

      <FromToField
        fromComponent={
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
        }
        label={t('activityMaintenance.startDate')}
        toComponent={
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
        }
        validationMessage={
          errors.startDateFrom?.message !== undefined || errors.startDateTo?.message !== undefined
            ? constructErrorMessage(
                t,
                errors.startDateFrom?.message ?? errors.startDateTo?.message ?? '',
              )
            : undefined
        }
      ></FromToField>

      <FromToField
        fromComponent={
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
        }
        label={t('activityMaintenance.endDate')}
        toComponent={
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
        }
        validationMessage={
          errors.endDateFrom?.message !== undefined || errors.endDateTo?.message !== undefined
            ? constructErrorMessage(
                t,
                errors.endDateFrom?.message ?? errors.endDateTo?.message ?? '',
              )
            : undefined
        }
      ></FromToField>

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
  const styles = useStyles();

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
      builder: (act) => <MultiLangBody1 className={styles.gridColumn} object={act} />,
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
      builder: (activity) => <Body1>{_formatParticpantGrade(activity.participantGrade)}</Body1>,
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
      width: 5,
      builder: (activity) => <Body1>{activity.eCoin}</Body1>,
    }),
    createTableColumn({
      columnId: 'status',
      header: t('activityMaintenance.status.label'),
      width: 10,
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

  const toolbarButtons = [
    toolbarButtonFilter,
    toolbarButtonRefresh,
    toolbarButtonAdd,
    toolbarButtonEdit,
    toolbarButtonView,
  ];

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
          toolbarSlot={toolbarButtons}
        >
          <DataTable
            columns={columns}
            maxWidth="1200px"
            minWidth="500px"
            noSearchPerformed={!state.getResult()}
            rows={rows}
            t={t}
          ></DataTable>
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

const _formatParticpantGrade = (numbers: number[]): string => {
  if (numbers.length === 0) {
    return '';
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const result: string[] = [];

  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];

    if (current === end + 1) {
      // Still consecutive
      end = current;
    } else {
      // Break in the sequence
      result.push(start === end ? `P${start}` : `P${start} - P${end}`);
      start = current;
      end = current;
    }
  }

  // Push the final range
  result.push(start === end ? `P${start}` : `P${start} - P${end}`);

  return result.join(', ');
};
