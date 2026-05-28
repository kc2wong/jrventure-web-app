import { useCommonStyles } from '@component/common-styles';
import { JrVcSearchPageLayout } from '@component/jr-venture-search-page-layout';
import { JrVcTable } from '@component/jr-venture-table';
import type { MaintenanceListPageProps } from '@component/with-maintenance-page';
import { Button, Tooltip } from '@fluentui/react-components';
import { EyeRegular } from '@fluentui/react-icons';
import { usePreferredLanguage } from '@hook/use-preferred-language';
import { authStateAtom } from '@store/auth/auth-bloc';
import { letterEditActionAtom } from '@store/letter/letter-edit-bloc';
import {
  letterListActionAtom,
  letterListStateAtom,
} from '@store/letter/letter-list-bloc';
import type { Letter } from '@store/letter/letter-types';
import { formatDateDDMMYYYY } from '@util/date-util';
import { FuiColumn } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LetterFilterForm } from './letter-filter-form';

const LetterListPage = ({ onView }: MaintenanceListPageProps) => {
  const commonStyles = useCommonStyles();
  const { t } = useTranslation();
  const { nameInPreferredLanguage } = usePreferredLanguage();
  const listDispatch = useSetAtom(letterListActionAtom);
  const editDispatch = useSetAtom(letterEditActionAtom);
  const { status, data, filter, pagination, total } =
    useAtomValue(letterListStateAtom);
  const { user } = useAtomValue(authStateAtom);
  const [pageSize, setPageSize] = useState(10);

  const isTeacher = user?.role === 'TEACHER';

  const filterTags = useMemo(() => {
    const tags: { label: string; onRemove: () => void }[] = [];
    if (filter.studentId) {
      tags.push({
        label: `${t('letter.studentId')}: ${filter.studentId}`,
        onRemove: () =>
          listDispatch({
            type: 'SEARCH',
            filter: { ...filter, studentId: undefined },
            pagination: { offset: 0, pageSize },
          }),
      });
    }
    if (filter.status?.length) {
      const labels = filter.status.map((s) =>
        t(`letter.status${s.charAt(0) + s.slice(1).toLowerCase()}` as never),
      );
      tags.push({
        label: `${t('letter.status')}: ${labels.join(', ')}`,
        onRemove: () =>
          listDispatch({
            type: 'SEARCH',
            filter: { ...filter, status: undefined },
            pagination: { offset: 0, pageSize },
          }),
      });
    }
    if (filter.fromCreatedAt) {
      tags.push({
        label: `${t('general.text.from')}: ${formatDateDDMMYYYY(filter.fromCreatedAt)}`,
        onRemove: () =>
          listDispatch({
            type: 'SEARCH',
            filter: { ...filter, fromCreatedAt: undefined },
            pagination: { offset: 0, pageSize },
          }),
      });
    }
    if (filter.toCreatedAt) {
      tags.push({
        label: `${t('general.text.to')}: ${formatDateDDMMYYYY(filter.toCreatedAt)}`,
        onRemove: () =>
          listDispatch({
            type: 'SEARCH',
            filter: { ...filter, toCreatedAt: undefined },
            pagination: { offset: 0, pageSize },
          }),
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
      desktop={{
        width: {
          minWidth: '900px',
          width: '60vw',
        },
      }}
      entityName={t('letter.title')}
      filterForm={(onSearch) => <LetterFilterForm onSearch={onSearch} />}
      filterTags={filterTags}
      mobile={{
        filterPath: '/letter/filter',
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
        width={{ minWidth: '900px' }}
      >
        <FuiColumn
          builder={(_, record) => {
            const letter = record as Letter;
            return <span>{nameInPreferredLanguage(letter.title)}</span>;
          }}
          field="title"
          header={t('letter.letterTitle')}
          style={{ width: isTeacher ? '40%' : '60%' }}
        />
        {isTeacher && (
          <FuiColumn
            builder={(_, record) => <span>{(record as Letter).studentId}</span>}
            field="studentId"
            header={t('letter.studentId')}
            style={{ width: '20%' }}
          />
        )}
        <FuiColumn
          builder={(_, record) => {
            const letter = record as Letter;
            return (
              <span>
                {t(
                  `letter.status${letter.status.charAt(0) + letter.status.slice(1).toLowerCase()}`,
                )}
              </span>
            );
          }}
          field="status"
          header={t('letter.status')}
          style={{ width: '15%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const letter = record as Letter;
            return (
              <span>
                {letter.acknowledgedAt
                  ? formatDateDDMMYYYY(new Date(letter.acknowledgedAt))
                  : ''}
              </span>
            );
          }}
          field="acknowledgedAt"
          header={t('letter.acknowledgedAt')}
          style={{ width: '15%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const id = (record as Letter).id;
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

export { LetterListPage };
