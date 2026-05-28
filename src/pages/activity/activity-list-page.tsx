import { useCommonStyles } from '@component/common-styles';
import { JrVcSearchPageLayout } from '@component/jr-venture-search-page-layout';
import { JrVcTable } from '@component/jr-venture-table';
import type { MaintenanceListPageProps } from '@component/with-maintenance-page';
import { Button, Tooltip } from '@fluentui/react-components';
import {
  CheckmarkCircleRegular,
  EditRegular,
  EyeRegular,
} from '@fluentui/react-icons';
import { usePreferredLanguage } from '@hook/use-preferred-language';
import { activityEditActionAtom } from '@store/activity/activity-edit-bloc';
import {
  activityListActionAtom,
  activityListStateAtom,
} from '@store/activity/activity-list-bloc';
import type {
  Activity,
  ActivityListItem,
  ActivityPayloadForGrade,
} from '@store/activity/activity-types';
import { authStateAtom } from '@store/auth/auth-bloc';
import { participationEditActionAtom } from '@store/participation/participation-edit-bloc';
import { formatDateDDMMYYYY } from '@util/date-util';
import { FuiColumn } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActivityFilterForm } from './activity-filter-form';

const isForGrade = (
  activity: Activity,
): activity is Activity & ActivityPayloadForGrade => 'forGrade' in activity;

const ActivityListPage = ({
  onAdd,
  onEdit,
  onView,
}: MaintenanceListPageProps) => {
  const commonStyles = useCommonStyles();
  const { t } = useTranslation();
  const { nameInPreferredLanguage } = usePreferredLanguage();
  const listDispatch = useSetAtom(activityListActionAtom);
  const editDispatch = useSetAtom(activityEditActionAtom);
  const participationDispatch = useSetAtom(participationEditActionAtom);
  const { status, data, filter, pagination, total } = useAtomValue(
    activityListStateAtom,
  );
  const { user, selectedStudentId } = useAtomValue(authStateAtom);
  const isParentOrStudent = user?.role === 'PARENT' || user?.role === 'STUDENT';
  const [pageSize, setPageSize] = useState(10);

  const filterTags = useMemo(() => {
    const tags: { label: string; onRemove: () => void }[] = [];
    if (!isParentOrStudent && filter.status?.length) {
      const labels = filter.status.map((s) =>
        t(`activity.status${s.charAt(0) + s.slice(1).toLowerCase()}` as never),
      );
      tags.push({
        label: `${t('activity.status')}: ${labels.join(', ')}`,
        onRemove: () =>
          listDispatch({
            type: 'SEARCH',
            filter: { ...filter, status: undefined },
            pagination: { offset: 0, pageSize },
          }),
      });
    }
    if (filter.category?.length) {
      const labels = filter.category.map((c) =>
        t(
          `activity.category${c.charAt(0) + c.slice(1).toLowerCase()}` as never,
        ),
      );
      tags.push({
        label: `${t('activity.category')}: ${labels.join(', ')}`,
        onRemove: () =>
          listDispatch({
            type: 'SEARCH',
            filter: { ...filter, category: undefined },
            pagination: { offset: 0, pageSize },
          }),
      });
    }
    if (filter.withParticipation) {
      tags.push({
        label: t('activity.withParticipation'),
        onRemove: () =>
          listDispatch({
            type: 'SEARCH',
            filter: { ...filter, withParticipation: undefined },
            pagination: { offset: 0, pageSize },
          }),
      });
    }
    if (filter.fromStartDate) {
      tags.push({
        label: `${t('activity.startDate')} ${t('general.text.from')}: ${formatDateDDMMYYYY(filter.fromStartDate)}`,
        onRemove: () =>
          listDispatch({
            type: 'SEARCH',
            filter: { ...filter, fromStartDate: undefined },
            pagination: { offset: 0, pageSize },
          }),
      });
    }
    if (filter.toEndDate) {
      tags.push({
        label: `${t('activity.endDate')} ${t('general.text.to')}: ${formatDateDDMMYYYY(filter.toEndDate)}`,
        onRemove: () =>
          listDispatch({
            type: 'SEARCH',
            filter: { ...filter, toEndDate: undefined },
            pagination: { offset: 0, pageSize },
          }),
      });
    }
    if (filter.forGrade?.length) {
      tags.push({
        label: `${t('activity.forGrade')}: ${filter.forGrade.join(', ')}`,
        onRemove: () =>
          listDispatch({
            type: 'SEARCH',
            filter: { ...filter, forGrade: undefined },
            pagination: { offset: 0, pageSize },
          }),
      });
    }
    if (filter.forClass?.length) {
      tags.push({
        label: `${t('activity.forClass')}: ${filter.forClass.join(', ')}`,
        onRemove: () =>
          listDispatch({
            type: 'SEARCH',
            filter: { ...filter, forClass: undefined },
            pagination: { offset: 0, pageSize },
          }),
      });
    }
    return tags;
  }, [filter, listDispatch, pageSize, t]);

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
    const tasks: Promise<void>[] = [editDispatch({ type: 'GET', id })];
    if (isParentOrStudent && selectedStudentId) {
      tasks.push(
        participationDispatch({ type: 'GET', activityId: id, studentId: selectedStudentId }),
      );
    }
    await Promise.all(tasks);
    onView(id);
  };

  return (
    <JrVcSearchPageLayout
      desktop={{
        filterWidth: { minWidth: '280px' },
        width: { minWidth: '1000px', width: '80vw' },
      }}
      entityName={t('activity.title')}
      filterForm={(onSearch) => <ActivityFilterForm onSearch={onSearch} />}
      filterTags={filterTags}
      mobile={{ filterPath: '/activity/filter' }}
      onAdd={handleAdd}
      onClear={() => listDispatch({ type: 'RESET' })}
      onRefresh={() => listDispatch({ type: 'REFRESH' })}
      status={status}
    >
      <JrVcTable
        data={data}
        onPageOrSort={async (page) => {
          if (page) {
            await listDispatch({
              type: 'SEARCH',
              filter,
              pagination: { offset: page.offset, pageSize: page.pageSize },
            });
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
            const activity = record as Activity;
            return <span>{nameInPreferredLanguage(activity.description)}</span>;
          }}
          field="description"
          header={t('activity.description')}
          style={{ width: '25%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const activity = record as Activity;
            return (
              <span>
                {t(
                  `activity.category${activity.category.charAt(0) + activity.category.slice(1).toLowerCase()}` as never,
                )}
              </span>
            );
          }}
          field="category"
          header={t('activity.category')}
          style={{ width: '15%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const activity = record as Activity;
            return (
              <span>{formatDateDDMMYYYY(new Date(activity.startDate))}</span>
            );
          }}
          field="startDate"
          header={t('activity.startDate')}
          style={{ width: '10%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const activity = record as Activity;
            return (
              <span>{formatDateDDMMYYYY(new Date(activity.endDate))}</span>
            );
          }}
          field="endDate"
          header={t('activity.endDate')}
          style={{ width: '10%' }}
        />
        {isParentOrStudent ? (
          <FuiColumn
            builder={(_, record) => {
              const { withParticipation } = record as ActivityListItem;
              return (
                <div className={commonStyles.centeredCell}>
                  {withParticipation && <CheckmarkCircleRegular />}
                </div>
              );
            }}
            field="withParticipation"
            header={t('activity.enrolled')}
            style={{ width: '10%' }}
          />
        ) : (
          <FuiColumn
            builder={(_, record) => {
              const activity = record as Activity;
              return (
                <span>
                  {t(
                    `activity.status${activity.status.charAt(0) + activity.status.slice(1).toLowerCase()}` as never,
                  )}
                </span>
              );
            }}
            field="status"
            header={t('activity.status')}
            style={{ width: '10%' }}
          />
        )}
        <FuiColumn
          builder={(_, record) => {
            const activity = record as Activity;
            return (
              <span>
                {isForGrade(activity) ? activity.forGrade.join(', ') : ''}
              </span>
            );
          }}
          field="forGrade"
          header={t('activity.forGrade')}
          style={{ width: '10%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const activity = record as Activity;
            return (
              <span>
                {isForGrade(activity)
                  ? ''
                  : (
                      activity as Activity & { forClass: string[] }
                    ).forClass.join(', ')}
              </span>
            );
          }}
          field="forClass"
          header={t('activity.forClass')}
          style={{ width: '10%' }}
        />
        <FuiColumn
          builder={(_, record) => {
            const id = (record as Activity).id;
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

export { ActivityListPage };
