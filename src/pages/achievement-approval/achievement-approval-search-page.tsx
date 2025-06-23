import {
  ToolbarButton,
  useTableFeatures,
  TableColumnDefinition,
  Dropdown,
  Option,
  Body1,
  useTableSelection,
  Tooltip,
  makeStyles,
} from '@fluentui/react-components';
import { AppsListDetailRegular, ArrowClockwiseRegular, FilterRegular } from '@fluentui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { TFunction } from 'i18next';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Form, Root, Row } from '@components/container';
import { SearchCriteriaDrawer } from '@components/drawer';
import { Field } from '@components/field';
import { Input } from '@components/input';
import { MultiLangBody1 } from '@components/multi-lang-field';
import { createTableColumn } from '@components/table/create-table-column-definition';
import { DataTable } from '@components/table/data-table';
import { useBreadcrumb } from '@hooks/use-breadcrumb';
import { useTimezone } from '@hooks/use-timezone';
import {
  achievementApprovalListAtom,
  AchievementApprovalListStateInitial,
  Filter,
} from '@states/achievement-approval-list';
import { logger } from '@utils/logging-util';
import { constructErrorMessage } from '@utils/string-util';
import { Achievement } from '@webapi/types';

import { zodOptionalString } from '../../types/zod';
import { useCommonStyles } from '../common';

const gradeList = [1, 2, 3, 4, 5, 6];
const gradeOptions = gradeList.map((i) => <Option key={i} value={`${i}`}>{`P${i}`}</Option>);

const pageSize = 10;

const searchSchema = z.object({
  activityName: zodOptionalString(),
  participantGrade: z.array(z.string()).optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

const useStyles = makeStyles({
  gridColumn: {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  table: {
    width: '100%',
    tableLayout: 'fixed',
    minWidth: '500px',
    maxWidth: '1200px',
  },
  selectionCell: {
    pointerEvents: 'none',
    width: '40px',
    padding: 0,
  },
  activeSelectionCell: {
    width: '40px',
    padding: 0,
  },
});

type SearchDrawerProps = {
  t: TFunction;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

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
      onClear={() => action({ reset: {} })}
      onDrawerClose={() => onOpenChange(false)}
      onSearch={handleSubmit(() => {
        const formData = getValues();
        logger.info(`Start search achievement approval with criteria ${JSON.stringify(formData)}`);
        action({ search: { filter: _searchFormData2Filter(formData) } });
      })}
      t={t}
    >
      <Controller
        control={control}
        name="activityName"
        render={({ field }) => (
          <Field label={t('achievementApproval.activityName')}>
            <Input {...field} />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="participantGrade"
        render={({ field: { name, value, ...others } }) => (
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
              multiselect
              onOptionSelect={(_, data) => setValue(name, data.selectedOptions)}
              selectedOptions={value}
              value={(value ?? [])
                .sort()
                .map((i) => `P${i}`)
                .join(', ')}
            >
              {gradeOptions}
            </Dropdown>
          </Field>
        )}
      />
    </SearchCriteriaDrawer>
  );
};

const drawerOpenAtom = atom(false);

type AchievementApprovalSearchPageProps = {
  onViewButtonClick: () => void;
};

export const AchievementApprovalSearchPage = ({
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
  }, []);

  const columns: TableColumnDefinition<Achievement>[] = [
    createTableColumn({
      columnId: 'activityName',
      header: t('achievementApproval.activityName'),
      width: 24,
      builder: (achv) => <MultiLangBody1 className={styles.gridColumn} object={achv.activity} />,
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
      builder: (achv) => <MultiLangBody1 object={achv.student} />,
    }),
    createTableColumn({
      columnId: 'submissionRole',
      header: t('achievementApproval.submissionRole'),
      width: 8,
      builder: (achv) => <Body1>{achv.submissionRole}</Body1>,
    }),
    createTableColumn({
      columnId: 'submissionDate',
      header: t('achievementApproval.submissionDate'),
      width: 12,
      builder: (achv) => (
        <Body1>{achv.submissionDate ? formatDate(new Date(achv.submissionDate)) : ''}</Body1>
      ),
    }),
    createTableColumn({
      columnId: 'rating',
      header: t('achievementApproval.rating'),
      width: 6,
      builder: (achv) => <Body1 className={styles.gridColumn}>{achv.rating ?? ''}</Body1>,
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
      onSelectionChange: (_event, data) => {
        const selected = rows.find((r) => data.selectedItems.has(r.rowId))?.item;
        if (!selected || state.selectedResult === selected) {
          return action({ select: {} });
        }
        action({ select: { achievement: selected } });
      },
    }),
  ]);

  const rows = getRows((row) => {
    const selected = isRowSelected(row.rowId);
    return {
      ...row,
      onClick: (e: React.MouseEvent) => toggleRow(e, row.rowId),
      selected,
      appearance: (selected ? 'brand' : 'none') as 'brand' | 'none',
    };
  });

  const toolbarButtons = [
    <Tooltip
      key="filter"
      content={t('system.message.searchCriteria')}
      relationship="label"
      withArrow
    >
      <ToolbarButton
        aria-label="Filter"
        icon={<FilterRegular />}
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
      />
    </Tooltip>,
    <Tooltip key="refresh" content={t('system.message.refresh')} relationship="label" withArrow>
      <ToolbarButton
        aria-label="Refresh"
        disabled={!state.getResult()}
        icon={<ArrowClockwiseRegular />}
        onClick={() => action({ refresh: {} })}
      />
    </Tooltip>,
    <Tooltip key="view" content={t('system.message.detail')} relationship="label" withArrow>
      <ToolbarButton
        aria-label="View"
        disabled={!state.selectedResult}
        icon={<AppsListDetailRegular />}
        onClick={onViewButtonClick}
      />
    </Tooltip>,
  ];

  return (
    <Root>
      <Row>
        <SearchDrawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} t={t} />
        <Form numColumn={1} title={t('achievementApproval.title')} toolbarSlot={toolbarButtons}>
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

const _searchFormData2Filter = ({ activityName }: SearchFormData): Filter => ({
  activityName,
  offset: 0,
  limit: pageSize,
});

const _filter2SearchFormData = ({ ...others }: Filter): SearchFormData => ({
  ...others,
});
