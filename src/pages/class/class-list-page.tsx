import { useCommonStyles } from '@component/common-styles';
import { JrVcSearchPageLayout } from '@component/jr-venture-search-page-layout';
import { JrVcTable } from '@component/jr-venture-table';
import type { MaintenanceListPageProps } from '@component/with-maintenance-page';
import { EyeRegular } from '@fluentui/react-icons';
import { classEditActionAtom } from '@store/class/class-edit-bloc';
import {
  classListActionAtom,
  classListStateAtom,
} from '@store/class/class-list-bloc';
import { FuiButton, FuiColumn, FuiTooltip } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ClassFilterForm } from './class-filter-form';

const ClassListPage = ({ onView }: MaintenanceListPageProps) => {
  const commonStyles = useCommonStyles();
  const { t } = useTranslation();
  const listDispatch = useSetAtom(classListActionAtom);
  const editDispatch = useSetAtom(classEditActionAtom);
  const { status, data, filter, pagination, total } =
    useAtomValue(classListStateAtom);
  const [pageSize, setPageSize] = useState(10);

  const filterTags = useMemo(() => {
    const tags: { label: string; onRemove: () => void }[] = [];
    if (filter.grade?.length) {
      tags.push({
        label: `${t('class.grade')}: ${filter.grade.join(', ')}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, grade: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    return tags;
  }, [filter, listDispatch, pageSize, t]);

  const handleSearch = async (offset: number, size: number) => {
    await listDispatch({
      type: 'SEARCH',
      filter,
      pagination: { offset, pageSize: size },
    });
  };

  const handleView = async (id: string) => {
    await editDispatch({ type: 'GET', id });
    onView(id);
  };

  return (
    <JrVcSearchPageLayout
      entityName={t('class.title')}
      filterForm={(onSearch) => <ClassFilterForm onSearch={onSearch} />}
      filterTags={filterTags}
      mobile={{
        filterPath: '/class/filter',
      }}
      onClear={() => listDispatch({ type: 'RESET' })}
      onRefresh={() => listDispatch({ type: 'REFRESH' })}
      status={status}
    >
      <JrVcTable
        data={data}
        onPageOrSort={async (page) => {
          if (page) {
            await handleSearch(page.offset, page.pageSize);
            setPageSize(page.pageSize);
          }
        }}
        pagination={{
          offset: pagination?.offset ?? 0,
          pageSize,
          pageSizeOption: [10, 20, 50],
          totalRecord: total,
        }}
      >
        <FuiColumn
          field="grade"
          header={t('class.grade')}
          sortable
          style={{ width: '40%' }}
        />
        <FuiColumn
          field="classNumber"
          header={t('class.classNumber')}
          style={{ width: '40%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const id = record.id as string;
            return (
              <div className={commonStyles.actionCell}>
                <FuiTooltip text={t('general.text.view', { entityName: '' }).trim()}>
                  <FuiButton
                    appearance="outline"
                    icon={<EyeRegular />}
                    onClick={() => handleView(id)}
                  />
                </FuiTooltip>
              </div>
            );
          }}
          field="action"
          header=""
          style={{ width: '20%' }}
        />
      </JrVcTable>
    </JrVcSearchPageLayout>
  );
};

export { ClassListPage };
