import { useCommonStyles } from '@component/common-styles';
import { JrVcSearchPageLayout } from '@component/jr-venture-search-page-layout';
import { JrVcTable } from '@component/jr-venture-table';
import type { MaintenanceListPageProps } from '@component/with-maintenance-page';
import { EditRegular, EyeRegular } from '@fluentui/react-icons';
import { usePreferredLanguage } from '@hook/use-preferred-language';
import type { MultiLanguageName } from '@openapi/index.schemas';
import { userEditActionAtom } from '@store/user/user-edit-bloc';
import {
  userListActionAtom,
  userListStateAtom,
} from '@store/user/user-list-bloc';
import { toTitleCase } from '@util/string-util';
import { FuiButton, FuiColumn, FuiTooltip } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { UserFilterForm } from './user-filter-form';

const UserListPage = ({ onAdd, onEdit, onView }: MaintenanceListPageProps) => {
  const commonStyles = useCommonStyles();
  const { t } = useTranslation();
  const { fullNameInPreferredLanguage } = usePreferredLanguage();
  const listDispatch = useSetAtom(userListActionAtom);
  const editDispatch = useSetAtom(userEditActionAtom);
  const { status, data, filter, pagination, total } =
    useAtomValue(userListStateAtom);
  const [pageSize, setPageSize] = useState(10);

  const filterTags = useMemo(() => {
    const tags: { label: string; onRemove: () => void }[] = [];
    if (filter.name) {
      tags.push({
        label: `${t('user.name')}: ${filter.name}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, name: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    if (filter.email) {
      tags.push({
        label: `${t('user.email')}: ${filter.email}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, email: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    if (filter.role) {
      tags.push({
        label: `${t('user.role')}: ${t(`user.role${toTitleCase(filter.role)}`)}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, role: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    if (filter.status) {
      tags.push({
        label: `${t('user.status')}: ${t(`user.status${toTitleCase(filter.status)}`)}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, status: undefined }, pagination: { offset: 0, pageSize } }),
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
      desktop={{
        filterWidth: { minWidth: '280px' },
        width: {
          maxWidth: '800px',
          width: '70vw',
        },
      }}
      entityName={t('user.title')}
      filterForm={(onSearch) => <UserFilterForm onSearch={onSearch} />}
      filterTags={filterTags}
      mobile={{
        filterPath: '/user/filter',
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
        width={{ minWidth: '800px' }}
      >
        <FuiColumn
          field="name"
          formatter={(_, row) =>
            fullNameInPreferredLanguage(
              row.firstName as MultiLanguageName,
              row.lastName as MultiLanguageName,
            )
          }
          header={t('user.name')}
          sortable
          style={{ width: '25%' }}
        />
        <FuiColumn
          field="email"
          header={t('user.email')}
          sortable
          style={{ width: '30%' }}
        />
        <FuiColumn
          field="role"
          formatter={(val) => t(`user.role${toTitleCase(val as string)}`)}
          header={t('user.role')}
          style={{ width: '20%' }}
        />
        <FuiColumn
          field="status"
          formatter={(val) => t(`user.status${toTitleCase(val as string)}`)}
          header={t('user.status')}
          style={{ width: '15%' }}
        />
        <FuiColumn
          key="actions"
          builder={(_, row) => {
            const id = row.id as string;
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
          style={{ width: '10%' }}
        />
      </JrVcTable>
    </JrVcSearchPageLayout>
  );
};

export { UserListPage };
