import { withMaintenancePage } from '@component/with-maintenance-page';
import {
  referenceDataActionAtom,
  referenceDataStateAtom,
} from '@store/reference-data/reference-data-bloc';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { UserEditPage } from './user-edit-page';
import { UserListPage } from './user-list-page';

const InnerPage = withMaintenancePage(UserListPage, UserEditPage, {
  entityName: 'user',
});

const UserMaintenancePage = () => {
  const referenceDataDispatch = useSetAtom(referenceDataActionAtom);
  const { status: refDataStatus } = useAtomValue(referenceDataStateAtom);

  useEffect(() => {
    if (refDataStatus === 'idle' || refDataStatus === 'error') {
      referenceDataDispatch({ type: 'FETCH' });
    }
  }, [refDataStatus, referenceDataDispatch]);

  return <InnerPage />;
};

export { UserMaintenancePage };
