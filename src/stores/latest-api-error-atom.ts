import { atom } from 'jotai';

import { activityEditStateAtom } from './activity/activity-edit-bloc';
import { activityListStateAtom } from './activity/activity-list-bloc';
import { classEditStateAtom } from './class/class-edit-bloc';
import { classListStateAtom } from './class/class-list-bloc';
import { letterEditStateAtom } from './letter/letter-edit-bloc';
import { letterListStateAtom } from './letter/letter-list-bloc';
import { noticeEditStateAtom } from './notice/notice-edit-bloc';
import { noticeListStateAtom } from './notice/notice-list-bloc';
import { studentEditStateAtom } from './student/student-edit-bloc';
import { studentListStateAtom } from './student/student-list-bloc';
import { userEditStateAtom } from './user/user-edit-bloc';
import { userListStateAtom } from './user/user-list-bloc';

// Derives the most recent API error across all blocs.
// When adding a new bloc, add its state atom here.
export const latestApiErrorAtom = atom((get) => {
  const rawError = [
    get(activityEditStateAtom).error,
    get(activityListStateAtom).error,
    get(classEditStateAtom).error,
    get(classListStateAtom).error,
    get(letterEditStateAtom).error,
    get(letterListStateAtom).error,
    get(noticeEditStateAtom).error,
    get(noticeListStateAtom).error,
    get(studentEditStateAtom).error,
    get(studentListStateAtom).error,
    get(userEditStateAtom).error,
    get(userListStateAtom).error,
  ].find((e) => e !== undefined);

  return rawError ?? null;
});
