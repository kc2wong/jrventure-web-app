import { withMaintenancePage } from '@component/with-maintenance-page';
import {
  referenceDataActionAtom,
  referenceDataStateAtom,
} from '@store/reference-data/reference-data-bloc';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { NoticeEditPage } from './notice-edit-page';
import { NoticeListPage } from './notice-list-page';

const InnerPage = withMaintenancePage(NoticeListPage, NoticeEditPage, {
  entityName: 'notice',
});

const NoticeMaintenancePage = () => {
  const referenceDataDispatch = useSetAtom(referenceDataActionAtom);
  const { status: refDataStatus } = useAtomValue(referenceDataStateAtom);

  useEffect(() => {
    if (refDataStatus === 'idle' || refDataStatus === 'error') {
      referenceDataDispatch({ type: 'FETCH' });
    }
  }, [refDataStatus, referenceDataDispatch]);

  return <InnerPage />;
};

export { NoticeMaintenancePage };
