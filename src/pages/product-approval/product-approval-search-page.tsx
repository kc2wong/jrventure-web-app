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
import {
  AppsListDetailRegular,
  ArrowClockwiseRegular,
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
import { getRawValueByEnumValue, getEnumValueByRawValue } from '../../utils/enum-util';
import { constructErrorMessage } from '../../utils/string-util';
import { zodOptionalString } from '../../types/zod';
import { Input } from '../../components/Input';
import { createTableColumn } from '../../components/table/create-table-column-definition';
import { useMessage } from '../../hooks/use-message';
import {
  Filter,
  productApprovalListAtom,
  ProductApprovalListStateFail,
  ProductApprovalListStateInitial,
  ProductApprovalListStateSuccess,
} from '../../states/product-approval-list';
import { ApprovalStatus, ProductApproval } from '../../__generated__/linkedup-web-api-client';
import { useTimezone } from '../../hooks/use-timezone';
import { ApprovalStatusLabel } from '../product/approval-status-label';
import { BsCoin } from 'react-icons/bs';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';

const searchSchema = z.object({
  classNo: zodOptionalString(),
  studentId: zodOptionalString(),
  status: z.array(z.string()).optional(),
});

const statusList = [ApprovalStatus.PENDING, ApprovalStatus.REJECTED, ApprovalStatus.APPROVED];

type SearchFormData = z.infer<typeof searchSchema>;

const useStyles = makeStyles({
  label: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('0.5rem'),
  },
});

type SearchDrawerProps = { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; t: TFunction };

const SearchDrawer = ({ t, isOpen, onOpenChange }: SearchDrawerProps) => {
  const [state, action] = useAtom(productApprovalListAtom);

  const {
    control,
    getValues,
    setValue,
    handleSubmit,
    reset,
  } = useForm<SearchFormData>({
    defaultValues: { ..._filter2SearchFormData(state.filter) },
    resolver: zodResolver(searchSchema),
  });

  useEffect(() => {
    if (state instanceof ProductApprovalListStateInitial) {
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
        name="classNo"
        render={({ field }) => {
          return (
            <Field label={t('productApproval.classNo')} orientation="horizontal">
              <Input {...field} />
            </Field>
          );
        }}
      />

      <Controller
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
      />
    </SearchCriteriaDrawer>
  );
};

const drawerOpenAtom = atom(false);

type ProductApprovalSearchPageProps = {
  onViewButtonClick: () => void;
};

export const ProductApprovalSearchPage: React.FC<ProductApprovalSearchPageProps> = ({
  onViewButtonClick,
}: ProductApprovalSearchPageProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useAtom(drawerOpenAtom);
  const { t } = useTranslation();

  const { useStartBreadcrumb } = useBreadcrumb();
    const { dispatchMessage } = useMessage();
  const [state, action] = useAtom(productApprovalListAtom);

  const { formatDate } = useTimezone();
  const styles = useStyles();

  useEffect(() => {
    if (state instanceof ProductApprovalListStateSuccess) {
    } else if (state instanceof ProductApprovalListStateFail) {
      // stopSpinner();
      const failure = state.failure;
      dispatchMessage({
        type: failure.type,
        text: constructErrorMessage(t, failure.key, failure.parameters)!,
      });
    }
  }, [state]);

  useEffect(() => {
    useStartBreadcrumb('productApproval.title');
  })

  const coinLabel = (value: number) => {
    return (
      <div className={styles.label}>
        {<BsCoin/>}
        <Body1>{value.toString()}</Body1>
      </div>
    );  
  }

  const columns: TableColumnDefinition<ProductApproval>[] = [
    createTableColumn({
      columnId: 'classNo',
      header: t('productApproval.classNo'),
      width: 6,
      builder: (pa) => <Body1>{pa.product.sellerClass}</Body1>,
    }),
    createTableColumn({
      columnId: 'studentName',
      header: t('productApproval.studentName'),
      width: 18,
      builder: (pa) => <Body1>{pa.product.seller}</Body1>,
    }),
    createTableColumn({
      columnId: 'productName',
      header: t('productApproval.productName'),
      width: 18,
      builder: (pa) => <Body1>{pa.product.name}</Body1>,
    }),
    createTableColumn({
      columnId: 'productSummary',
      header: t('productApproval.productSummary'),
      width: 28,
      builder: (pa) => <Body1>{pa.product.summary}</Body1>,
    }),
    createTableColumn({
      columnId: 'cost',
      header: t('productApproval.cost'),
      width: 7,
      builder: (pa) => <Body1>{coinLabel(pa.product.cost)}</Body1>,
    }),
    createTableColumn({
      columnId: 'submissionDate',
      header: t('productApproval.submissionDate'),
      width: 15,
      builder: (_pa) => <Body1>{formatDate(new Date())}</Body1>,
    }),
    createTableColumn({
      columnId: 'status',
      header: t('productApproval.status.label'),
      width: 8,
      builder: (pa) => (
        <ApprovalStatusLabel status={pa.status}></ApprovalStatusLabel>
      ),
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
          action({ select: { product: selected } });
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
      <SearchDrawer isOpen={isDrawerOpen} onOpenChange={(open) => setIsDrawerOpen(open)} t={t} />

      <Form
        numColumn={1}
        title={t('productApproval.title')}
        toolbarSlot={[
          toolbarButtonFilter,
          toolbarButtonRefresh,
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
  classNo,
  studentId,
  status,
}: SearchFormData): Filter => {
  return {
    classNo,
    studentId,
    status: status?.map((s) => getEnumValueByRawValue(ApprovalStatus, s)!) ?? [],
  };
};

const _filter2SearchFormData = ({ status, ...others }: Filter): SearchFormData => {
  return {
    ...others,
    status: status?.map((s) => getRawValueByEnumValue(ApprovalStatus, s)!) ?? [],
  };
};

