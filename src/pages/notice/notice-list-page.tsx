import { useCommonStyles } from '@component/common-styles';
import { JrVcSearchPageLayout } from '@component/jr-venture-search-page-layout';
import { JrVcTable } from '@component/jr-venture-table';
import type { MaintenanceListPageProps } from '@component/with-maintenance-page';
import { Button, Tooltip } from '@fluentui/react-components';
import { EditRegular, EyeRegular } from '@fluentui/react-icons';
import { usePreferredLanguage } from '@hook/use-preferred-language';
import { noticeEditActionAtom } from '@store/notice/notice-edit-bloc';
import {
  noticeListActionAtom,
  noticeListStateAtom,
} from '@store/notice/notice-list-bloc';
import type { Notice, NoticePayloadForGrade } from '@store/notice/notice-types';
import { formatDateDDMMYYYY } from '@util/date-util';
import { FuiColumn } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NoticeFilterForm } from './notice-filter-form';

const isForGrade = (notice: Notice): notice is Notice & NoticePayloadForGrade =>
  'forGrade' in notice;

const NoticeListPage = ({ onAdd, onEdit, onView }: MaintenanceListPageProps) => {
  const commonStyles = useCommonStyles();
  const { t } = useTranslation();
  const { nameInPreferredLanguage } = usePreferredLanguage();
  const listDispatch = useSetAtom(noticeListActionAtom);
  const editDispatch = useSetAtom(noticeEditActionAtom);
  const { status, data, filter, pagination, total } = useAtomValue(noticeListStateAtom);
  const [pageSize, setPageSize] = useState(10);

  const filterTags = useMemo(() => {
    const tags: { label: string; onRemove: () => void }[] = [];
    if (filter.status?.length) {
      const labels = filter.status.map((s) =>
        t(`notice.status${s.charAt(0) + s.slice(1).toLowerCase()}` as never),
      );
      tags.push({
        label: `${t('notice.status')}: ${labels.join(', ')}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, status: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    if (filter.title) {
      tags.push({
        label: `${t('notice.noticeTitle')}: ${filter.title}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, title: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    if (filter.fromDueAt) {
      tags.push({
        label: `${t('notice.dueAt')} ${t('general.text.from')}: ${formatDateDDMMYYYY(filter.fromDueAt)}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, fromDueAt: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    if (filter.toDueAt) {
      tags.push({
        label: `${t('notice.dueAt')} ${t('general.text.to')}: ${formatDateDDMMYYYY(filter.toDueAt)}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, toDueAt: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    if (filter.fromDistributedAt) {
      tags.push({
        label: `${t('notice.distributedAt')} ${t('general.text.from')}: ${formatDateDDMMYYYY(filter.fromDistributedAt)}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, fromDistributedAt: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    if (filter.toDistributedAt) {
      tags.push({
        label: `${t('notice.distributedAt')} ${t('general.text.to')}: ${formatDateDDMMYYYY(filter.toDistributedAt)}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, toDistributedAt: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    if (filter.forGrade?.length) {
      tags.push({
        label: `${t('notice.forGrade')}: ${filter.forGrade.join(', ')}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, forGrade: undefined }, pagination: { offset: 0, pageSize } }),
      });
    }
    if (filter.forClass?.length) {
      tags.push({
        label: `${t('notice.forClass')}: ${filter.forClass.join(', ')}`,
        onRemove: () => listDispatch({ type: 'SEARCH', filter: { ...filter, forClass: undefined }, pagination: { offset: 0, pageSize } }),
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
          minWidth: '1000px',
          width: '80vw',
        },
      }}
      entityName={t('notice.title')}
      filterForm={(onSearch) => <NoticeFilterForm onSearch={onSearch} />}
      filterTags={filterTags}
      mobile={{
        filterPath: '/notice/filter',
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
      >
        <FuiColumn
          builder={(_, record) => {
            const notice = record as Notice;
            return <span>{notice.id}</span>;
          }}
          field="id"
          header={t('notice.id')}
          style={{ width: '10%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const notice = record as Notice;
            return <span>{nameInPreferredLanguage(notice.title)}</span>;
          }}
          field="title"
          header={t('notice.noticeTitle')}
          style={{ width: '25%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const notice = record as Notice;
            return <span>{notice.dueAt ? formatDateDDMMYYYY(new Date(notice.dueAt)) : ''}</span>;
          }}
          field="dueAt"
          header={t('notice.dueAt')}
          style={{ width: '10%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const notice = record as Notice;
            return <span>{t(`notice.status${notice.status.charAt(0) + notice.status.slice(1).toLowerCase()}`)}</span>;
          }}
          field="status"
          header={t('notice.status')}
          style={{ width: '10%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const notice = record as Notice;
            return <span>{isForGrade(notice) ? notice.forGrade.join(', ') : ''}</span>;
          }}
          field="forGrade"
          header={t('notice.forGrade')}
          style={{ width: '10%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const notice = record as Notice;
            return <span>{isForGrade(notice) ? '' : (notice as Notice & { forClass: string[] }).forClass.join(', ')}</span>;
          }}
          field="forClass"
          header={t('notice.forClass')}
          style={{ width: '15%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const notice = record as Notice;
            return <span>{notice.distributedAt ? formatDateDDMMYYYY(new Date(notice.distributedAt)) : ''}</span>;
          }}
          field="distributedAt"
          header={t('notice.distributedAt')}
          style={{ width: '10%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const id = (record as Notice).id;
            return (
              <div className={commonStyles.actionCell}>
                <Tooltip
                  content={t('general.text.view', { entityName: '' }).trim()}
                  relationship="label"
                >
                  <Button
                    appearance="outline"
                    icon={<EyeRegular />}
                    onClick={() => handleView(id)}
                  />
                </Tooltip>
                {handleEdit && (
                  <Tooltip
                    content={t('general.text.edit', { entityName: '' }).trim()}
                    relationship="label"
                  >
                    <Button
                      appearance="outline"
                      icon={<EditRegular />}
                      onClick={() => handleEdit(id)}
                    />
                  </Tooltip>
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

export { NoticeListPage };
