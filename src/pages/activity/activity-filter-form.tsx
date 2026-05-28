import { authStateAtom } from '@store/auth/auth-bloc';
import { useAtomValue } from 'jotai';

import { StudentActivityFilterForm } from './student-activity-filter-form';
import { TeacherActivityFilterForm } from './teacher-activity-filter-form';

type ActivityFilterFormProps = {
  onSearch?: () => void;
};

const ActivityFilterForm = ({ onSearch }: ActivityFilterFormProps) => {
  const { user } = useAtomValue(authStateAtom);
  const isParentOrStudent = user?.role === 'PARENT' || user?.role === 'STUDENT';
  return isParentOrStudent ? (
    <StudentActivityFilterForm onSearch={onSearch} />
  ) : (
    <TeacherActivityFilterForm onSearch={onSearch} />
  );
};

export { ActivityFilterForm };
