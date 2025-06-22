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
  shorthands,
  makeStyles,
} from '@fluentui/react-components';
import { AppsListDetailRegular, ArrowClockwiseRegular, FilterRegular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { TFunction } from 'i18next';
import { atom, useAtom } from 'jotai';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {} from '../../models/system';
import { SearchCriteriaDrawer } from '../../components/drawer';
import { Form, Root, Row } from '../../components/Container';
import { Field } from '../../components/field';
import { logger } from '../../utils/logging-util';
import { constructErrorMessage } from '../../utils/string-util';
import { zodOptionalString } from '../../types/zod';
import { Input } from '../../components/Input';
import { createTableColumn } from '../../components/table/create-table-column-definition';
import { useMessage } from '../../hooks/use-message';
import { Achievement } from '../../__generated__/linkedup-web-api-client';
import { useTimezone } from '../../hooks/use-timezone';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import {
  achievementApprovalListAtom,
  AchievementApprovalListStateFail,
  AchievementApprovalListStateInitial,
  AchievementApprovalListStateSuccess,
  Filter,
} from '../../states/achievement-approval-list';
import { MultiLangBody1 } from '../../components/multi-lang-field';
import { useCommonStyles } from '../common';

const gradeList = [1, 2, 3, 4, 5, 6];

const pageSize = 10;

const searchSchema = z.object({
  activityName: zodOptionalString(),
  participantGrade: z.array(z.string()).optional(),
  // classNo: zodOptionalString(),
  // studentId: zodOptionalString(),
  // status: z.array(z.string()).optional(),
});

// const statusList = [
//   ApprovalStatusEnum.Pending,
//   ApprovalStatusEnum.Rejected,
//   ApprovalStatusEnum.Approved,
// ];

type SearchFormData = z.infer<typeof searchSchema>;

const useStyles = makeStyles({
  label: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('0.5rem'),
  },
  gridColumn: {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

type SearchDrawerProps = { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; t: TFunction };

const SearchDrawer = ({ t, isOpen, onOpenChange }: SearchDrawerProps) => {
  const [state, action] = useAtom(achievementApprovalListAtom);

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

  const commonStyles = useCommonStyles();

  useEffect(() => {
    if (state instanceof AchievementApprovalListStateInitial) {
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
        logger.info(`Start search achievement approval with criteria ${JSON.stringify(formData)}`);
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
        name="activityName"
        render={({ field }) => {
          return (
            <Field label={t('achievementApproval.activityName')}>
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

      {/* <Controller
        control={control}
        name="studentId"
        render={({ field }) => (
          <Field label={t('productApproval.studentId')} orientation="horizontal">
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
            <Field label={t('productApproval.status.label')} orientation="horizontal">
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
                    {t(`productApproval.status.value.${status}`)}
                  </Option>
                ))}
              </Dropdown>
            </Field>
          );
        }}
      /> */}
    </SearchCriteriaDrawer>
  );
};

const drawerOpenAtom = atom(false);

type AchievementApprovalSearchPageProps = {
  onViewButtonClick: () => void;
};

export const AchievementApprovalSearchPage: React.FC<AchievementApprovalSearchPageProps> = ({
  onViewButtonClick,
}: AchievementApprovalSearchPageProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useAtom(drawerOpenAtom);
  const { t } = useTranslation();

  const { useStartBreadcrumb } = useBreadcrumb();
  const [state, action] = useAtom(achievementApprovalListAtom);

  const { formatDate } = useTimezone();
  const styles = useStyles();

  useEffect(() => {
    useStartBreadcrumb('achievementApproval.title');
  });

  const columns: TableColumnDefinition<Achievement>[] = [
    createTableColumn({
      columnId: 'activityName',
      header: t('achievementApproval.activityName'),
      width: 24,
      builder: (achv) => (
        <MultiLangBody1 className={styles.gridColumn} object={achv.activity}></MultiLangBody1>
      ),
    }),
    createTableColumn({
      columnId: 'classNo',
      header: t('achievementApproval.studentNo'),
      width: 8,
      builder: (achv) => <Body1>{`${achv.student.classId}-${achv.student.studentNumber}`}</Body1>,
    }),
    createTableColumn({
      columnId: 'studentName',
      header: t('achievementApproval.studentName'),
      width: 16,
      builder: (achv) => <MultiLangBody1 object={achv.student}></MultiLangBody1>,
    }),
    createTableColumn({
      columnId: 'submissionRole',
      header: t('achievementApproval.submissionRole'),
      width: 8,
      builder: (achv) => <Body1>{`${achv.submissionRole}`}</Body1>,
    }),
    createTableColumn({
      columnId: 'submissionDate',
      header: t('achievementApproval.submissionDate'),
      width: 12,
      builder: (achv) => (
        <Body1>{`${achv.submissionDate ? formatDate(new Date(achv.submissionDate)) : ''}`}</Body1>
      ),
    }),
    createTableColumn({
      columnId: 'rating',
      header: t('achievementApproval.rating'),
      width: 6,
      builder: (achv) => <Body1 className={styles.gridColumn}>{`${achv.rating ?? ''}`}</Body1>,
    }),
    createTableColumn({
      columnId: 'comment',
      header: t('achievementApproval.comment'),
      width: 32,
      builder: (achv) => <Body1>{achv.comment}</Body1>,
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
          action({ select: { achievement: selected } });
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

  // useStartBreadcrumb('productApproval.title');

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

  const toolbarButtonFilter = (
    <Tooltip content={t('system.message.searchCriteria')} relationship="label" withArrow>
      <ToolbarButton
        aria-label="Filter"
        icon={<FilterRegular />}
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
      />
    </Tooltip>
  );

  const toolbarButtonView = (
    <Tooltip content={t('system.message.detail')} relationship="label" withArrow>
      <ToolbarButton
        aria-label="View"
        disabled={state.selectedResult === undefined}
        icon={<AppsListDetailRegular />}
        onClick={onViewButtonClick}
      />
    </Tooltip>
  );

  return (
    <Root>
      <Row>
        <SearchDrawer isOpen={isDrawerOpen} onOpenChange={(open) => setIsDrawerOpen(open)} t={t} />

        <Form
          numColumn={1}
          title={t('achievementApproval.title')}
          toolbarSlot={[toolbarButtonFilter, toolbarButtonRefresh, toolbarButtonView]}
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

// const _searchFormData2Filter = ({ classNo, studentId }: SearchFormData): Filter => {
//   return {
//     classNo,
//     studentId,
//     status: status?.map((s) => getEnumValueByRawValue(ApprovalStatusEnum, s)!) ?? [],
//   };
// };

const _searchFormData2Filter = ({ activityName }: SearchFormData): Filter => {
  return {
    activityName,
    offset: 0,
    limit: pageSize,
  };
};

// const _filter2SearchFormData = ({ status, ...others }: Filter): SearchFormData => {
//   return {
//     ...others,
//     status: status?.map((s) => getRawValueByEnumValue(ApprovalStatusEnum, s)!) ?? [],
//   };
// };

const _filter2SearchFormData = ({ ...others }: Filter): SearchFormData => {
  return {
    ...others,
  };
};
