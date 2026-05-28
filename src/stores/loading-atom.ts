import { atom } from 'jotai';

import { activityEditStateAtom } from './activity/activity-edit-bloc';
import { activityListStateAtom } from './activity/activity-list-bloc';
import { authStateAtom } from './auth/auth-bloc';
import { classEditStateAtom } from './class/class-edit-bloc';
import { classListStateAtom } from './class/class-list-bloc';
import { letterEditStateAtom } from './letter/letter-edit-bloc';
import { letterListStateAtom } from './letter/letter-list-bloc';
import { noticeEditStateAtom } from './notice/notice-edit-bloc';
import { noticeListStateAtom } from './notice/notice-list-bloc';
import { referenceDataStateAtom } from './reference-data/reference-data-bloc';
import { studentEditStateAtom } from './student/student-edit-bloc';
import { studentListStateAtom } from './student/student-list-bloc';
import { userEditStateAtom } from './user/user-edit-bloc';
import { userListStateAtom } from './user/user-list-bloc';

// Aggregate loading state across all blocs.
// When adding a new bloc, add its loading condition here.
export const isLoadingAtom = atom(
  (get) =>
    get(activityEditStateAtom).status === 'loading' ||
    get(activityListStateAtom).status === 'loading' ||
    get(authStateAtom).status === 'loading' ||
    get(classListStateAtom).status === 'loading' ||
    get(classEditStateAtom).status === 'loading' ||
    get(letterEditStateAtom).status === 'loading' ||
    get(letterListStateAtom).status === 'loading' ||
    get(noticeEditStateAtom).status === 'loading' ||
    get(noticeListStateAtom).status === 'loading' ||
    get(studentEditStateAtom).status === 'loading' ||
    get(studentListStateAtom).status === 'loading' ||
    get(userEditStateAtom).status === 'loading' ||
    get(userListStateAtom).status === 'loading' ||
    get(referenceDataStateAtom).status === 'loading',
);
