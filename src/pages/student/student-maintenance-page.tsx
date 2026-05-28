import { withMaintenancePage } from '@component/with-maintenance-page';
import {
  referenceDataActionAtom,
  referenceDataStateAtom,
} from '@store/reference-data/reference-data-bloc';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { StudentEditPage } from './student-edit-page';
import { StudentListPage } from './student-list-page';

const InnerPage = withMaintenancePage(StudentListPage, StudentEditPage, {
  entityName: 'student',
});

const StudentMaintenancePage = () => {
  const referenceDataDispatch = useSetAtom(referenceDataActionAtom);
  const { status: refDataStatus } = useAtomValue(referenceDataStateAtom);

  useEffect(() => {
    if (refDataStatus === 'idle' || refDataStatus === 'error') {
      referenceDataDispatch({ type: 'FETCH' });
    }
  }, [refDataStatus, referenceDataDispatch]);

  return <InnerPage />;
};

export { StudentMaintenancePage };
