import { useCommonStyles } from '@component/common-styles';
import { JrVcSearchPageLayout } from '@component/jr-venture-search-page-layout';
import { JrVcTable } from '@component/jr-venture-table';
import type { MaintenanceListPageProps } from '@component/with-maintenance-page';
import { EditRegular, EyeRegular } from '@fluentui/react-icons';
import { usePreferredLanguage } from '@hook/use-preferred-language';
import type { MultiLanguageName } from '@openapi/index.schemas';
import { referenceDataStateAtom } from '@store/reference-data/reference-data-bloc';
import { studentEditActionAtom } from '@store/student/student-edit-bloc';
import {
  studentListActionAtom,
  studentListStateAtom,
} from '@store/student/student-list-bloc';
import { FuiButton, FuiColumn, FuiTooltip } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StudentFilterForm } from './student-filter-form';

const StudentListPage = ({
  onAdd,
  onEdit,
  onView,
}: MaintenanceListPageProps) => {
  const commonStyles = useCommonStyles();
  const { t } = useTranslation();
  const { fullNameInPreferredLanguage } = usePreferredLanguage();
  const listDispatch = useSetAtom(studentListActionAtom);
  const editDispatch = useSetAtom(studentEditActionAtom);
  const { status, data, filter, pagination, total } =
    useAtomValue(studentListStateAtom);
  const [pageSize, setPageSize] = useState(10);

  const { classes } = useAtomValue(referenceDataStateAtom);

  const classMap = useMemo(() => {
    return classes.reduce(
      (acc, c) => {
        acc[c.id] = `${c.grade}${c.classNumber}`;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [classes]);

  const filterTags = useMemo(() => {
    const tags: { label: string; onRemove: () => void }[] = [];
    if (filter.id) {
      tags.push({
        label: `${t('student.id')}: ${filter.id}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, id: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    if (filter.name) {
      tags.push({
        label: `${t('student.name')}: ${filter.name}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, name: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    if (filter.classId) {
      tags.push({
        label: `${t('student.classId')}: ${classMap[filter.classId] ?? filter.classId}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, classId: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    return tags;
  }, [classMap, filter, listDispatch, pageSize, t]);

  const handleSearch = async (offset: number, size: number) => {
    await listDispatch({
      type: 'SEARCH',
      filter,
      pagination: { offset, pageSize: size },
    });
  };

  const handleAdd = onAdd
    ? async () => {
        await editDispatch({ type: 'RESET' });
        onAdd();
      }
    : undefined;

  const handleEdit = onEdit
    ? async (id: string) => {
        await editDispatch({ type: 'GET', id });
        onEdit(id);
      }
    : undefined;

  const handleView = async (id: string) => {
    await editDispatch({ type: 'GET', id });
    onView(id);
  };

  return (
    <JrVcSearchPageLayout
      desktop={{ filterWidth: { minWidth: '280px' } }}
      entityName={t('student.title')}
      filterForm={(onSearch) => <StudentFilterForm onSearch={onSearch} />}
      filterTags={filterTags}
      mobile={{
        filterPath: '/student/filter',
      }}
      onAdd={handleAdd}
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
        width={{ minWidth: '600px' }}
      >
        <FuiColumn
          field="id"
          header={t('student.id')}
          sortable
          style={{ width: '15%' }}
        />
        <FuiColumn
          field="name"
          formatter={(_, row) => {
            return fullNameInPreferredLanguage(
              row.firstName as MultiLanguageName,
              row.lastName as MultiLanguageName,
            );
          }}
          header={t('student.name')}
          sortable
          style={{ width: '35%' }}
        />
        <FuiColumn
          field="classId"
          formatter={(val) => classMap[val as string] || (val as string)}
          header={t('student.classId')}
          style={{ width: '15%' }}
        />
        <FuiColumn
          field="studentNumber"
          header={t('student.studentNumber')}
          style={{ width: '15%' }}
        />
        <FuiColumn
          key="actions"
          builder={(_, data) => {
            const id = data.id as string;
            return (
              <div className={commonStyles.actionCell}>
                <FuiTooltip text={t('general.text.view', { entityName: '' }).trim()}>
                  <FuiButton
                    appearance="outline"
                    icon={<EyeRegular />}
                    onClick={() => handleView(id)}
                  />
                </FuiTooltip>
                {handleEdit && (
                  <FuiTooltip text={t('general.text.edit', { entityName: '' }).trim()}>
                    <FuiButton
                      appearance="outline"
                      icon={<EditRegular />}
                      onClick={() => handleEdit(id)}
                    />
                  </FuiTooltip>
                )}
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

export { StudentListPage };
