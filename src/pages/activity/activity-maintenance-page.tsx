import { withMaintenancePage } from '@component/with-maintenance-page';
import type { MaintenanceEditPageProps, MaintenanceListPageProps } from '@component/with-maintenance-page';
import { ParticipationEditPage } from '@page/participation/participation-edit-page';
import { authStateAtom } from '@store/auth/auth-bloc';
import {
  referenceDataActionAtom,
  referenceDataStateAtom,
} from '@store/reference-data/reference-data-bloc';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { ActivityEditPage } from './activity-edit-page';
import { ActivityListPage } from './activity-list-page';

const ActivityInnerPage = withMaintenancePage(ActivityListPage, ActivityEditPage, {
  entityName: 'activity',
});

const ParticipationActivityList = ({ onView }: MaintenanceListPageProps) => (
  <ActivityListPage onView={onView} />
);

const ParticipationEditAdapter = ({ onExit }: MaintenanceEditPageProps) => (
  <ParticipationEditPage onExit={onExit} />
);

const ParticipationInnerPage = withMaintenancePage(
  ParticipationActivityList,
  ParticipationEditAdapter,
  { entityName: 'participation' },
);

const ActivityMaintenancePage = () => {
  const referenceDataDispatch = useSetAtom(referenceDataActionAtom);
  const { status: refDataStatus } = useAtomValue(referenceDataStateAtom);
  const { user } = useAtomValue(authStateAtom);

  const isParentOrStudent = user?.role === 'PARENT' || user?.role === 'STUDENT';

  useEffect(() => {
    if (refDataStatus === 'idle' || refDataStatus === 'error') {
      referenceDataDispatch({ type: 'FETCH' });
    }
  }, [refDataStatus, referenceDataDispatch]);

  if (isParentOrStudent) {
    return <ParticipationInnerPage />;
  }

  return <ActivityInnerPage />;
};

export { ActivityMaintenancePage };
