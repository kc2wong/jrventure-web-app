import { withFilterPage } from '@component/jr-venture-filter-drawer-page';
import { useApiErrorToast } from '@hook/use-api-error-toast';
import { ActivityFilterForm, ActivityMaintenancePage } from '@page/activity';
import { ClassFilterForm, ClassMaintenancePage } from '@page/class';
import { LetterFilterForm, LetterMaintenancePage } from '@page/letter';
import { MainPage } from '@page/main/main-page';
import { isItemVisible, navigationMenu } from '@page/main/navigation-menu-data';
import { NoticeFilterForm, NoticeMaintenancePage } from '@page/notice';
import { SettingsPage } from '@page/settings/settings-page';
import { StudentFilterForm, StudentMaintenancePage } from '@page/student';
import { UserFilterForm, UserMaintenancePage } from '@page/user';
import { useSpinner } from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { LoginPage } from './pages/authentication/login-page';
import { activityEditActionAtom } from './stores/activity/activity-edit-bloc';
import { activityListActionAtom } from './stores/activity/activity-list-bloc';
import { authStateAtom, authActionAtom } from './stores/auth/auth-bloc';
import { classEditActionAtom } from './stores/class/class-edit-bloc';
import { classListActionAtom } from './stores/class/class-list-bloc';
import { letterEditActionAtom } from './stores/letter/letter-edit-bloc';
import { letterListActionAtom } from './stores/letter/letter-list-bloc';
import { isLoadingAtom } from './stores/loading-atom';
import { noticeEditActionAtom } from './stores/notice/notice-edit-bloc';
import { noticeListActionAtom } from './stores/notice/notice-list-bloc';
import { referenceDataActionAtom } from './stores/reference-data/reference-data-bloc';
import { studentEditActionAtom } from './stores/student/student-edit-bloc';
import { studentListActionAtom } from './stores/student/student-list-bloc';
import { userEditActionAtom } from './stores/user/user-edit-bloc';
import { userListActionAtom } from './stores/user/user-list-bloc';

const ActivityFilterPage = withFilterPage(ActivityFilterForm, { entityNameKey: 'activity.title', returnPath: '/activity' });
const ClassFilterPage = withFilterPage(ClassFilterForm, { entityNameKey: 'class.title', returnPath: '/class' });
const LetterFilterPage = withFilterPage(LetterFilterForm, { entityNameKey: 'letter.title', returnPath: '/letter' });
const NoticeFilterPage = withFilterPage(NoticeFilterForm, { entityNameKey: 'notice.title', returnPath: '/notice' });
const StudentFilterPage = withFilterPage(StudentFilterForm, { entityNameKey: 'student.title', returnPath: '/student' });
const UserFilterPage = withFilterPage(UserFilterForm, { entityNameKey: 'user.title', returnPath: '/user' });

const AuthInitializer = () => {
  const dispatch = useSetAtom(authActionAtom);
  useEffect(() => {
    dispatch({ type: 'INITIALIZE' });
  }, [dispatch]);
  return null;
};

const ApiErrorToastController = () => {
  useApiErrorToast();
  return null;
};

const StudentSwitchController = () => {
  const selectedStudentId = useAtomValue(authStateAtom).selectedStudentId;
  const resetActivityEdit = useSetAtom(activityEditActionAtom);
  const resetActivityList = useSetAtom(activityListActionAtom);
  const resetClassEdit = useSetAtom(classEditActionAtom);
  const resetClassList = useSetAtom(classListActionAtom);
  const resetLetterEdit = useSetAtom(letterEditActionAtom);
  const resetLetterList = useSetAtom(letterListActionAtom);
  const resetNoticeEdit = useSetAtom(noticeEditActionAtom);
  const resetNoticeList = useSetAtom(noticeListActionAtom);
  const resetRefData = useSetAtom(referenceDataActionAtom);
  const resetStudentEdit = useSetAtom(studentEditActionAtom);
  const resetStudentList = useSetAtom(studentListActionAtom);
  const resetUserEdit = useSetAtom(userEditActionAtom);
  const resetUserList = useSetAtom(userListActionAtom);

  useEffect(() => {
    resetActivityEdit({ type: 'RESET' });
    resetActivityList({ type: 'RESET' });
    resetClassEdit({ type: 'RESET' });
    resetClassList({ type: 'RESET' });
    resetLetterEdit({ type: 'RESET' });
    resetLetterList({ type: 'RESET' });
    resetNoticeEdit({ type: 'RESET' });
    resetNoticeList({ type: 'RESET' });
    resetRefData({ type: 'RESET' });
    resetStudentEdit({ type: 'RESET' });
    resetStudentList({ type: 'RESET' });
    resetUserEdit({ type: 'RESET' });
    resetUserList({ type: 'RESET' });
  }, [selectedStudentId, resetActivityEdit, resetActivityList, resetClassEdit, resetClassList, resetLetterEdit, resetLetterList, resetNoticeEdit, resetNoticeList, resetRefData, resetStudentEdit, resetStudentList, resetUserEdit, resetUserList]);

  return null;
};

const SpinnerController = () => {
  const isLoading = useAtomValue(isLoadingAtom);
  const { show, hide } = useSpinner();
  const prevRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      show();
    } else if (prevRef.current) {
      hide();
    }
    prevRef.current = isLoading;
  }, [isLoading, show, hide]);

  return null;
};

const RoleProtectedRoute = () => {
  const { entitledMenuItemIds } = useAtomValue(authStateAtom);
  const location = useLocation();

  const firstSegment = '/' + location.pathname.split('/')[1];
  const allItems = navigationMenu.flatMap((s) => s.items);
  const matchingItem = allItems.find((item) => {
    const itemSegment = '/' + item.path.split('/')[1];
    return itemSegment === firstSegment;
  });

  if (matchingItem && !isItemVisible(matchingItem, entitledMenuItemIds)) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { status } = useAtomValue(authStateAtom);
  if (status === 'initializing') {
    return null;
  }
  if (status === 'unauthenticated') {
    return <Navigate replace to="/login" />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { status } = useAtomValue(authStateAtom);
  if (status === 'initializing') {
    return null;
  }
  if (status === 'authenticated') {
    return <Navigate replace to="/" />;
  }
  return <>{children}</>;
};

const SettingsRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  if (!location.state?.fromMain) {
    return <Navigate replace to="/" />;
  }
  return <>{children}</>;
};


const App = () => {
  return (
    <BrowserRouter>
      <ApiErrorToastController />
      <StudentSwitchController />
      <AuthInitializer />
      <SpinnerController />
      <Routes>
        <Route
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
          path="/login"
        />
        <Route
          element={
            <ProtectedRoute>
              <SettingsRoute>
                <SettingsPage />
              </SettingsRoute>
            </ProtectedRoute>
          }
          path="/settings"
        />
        <Route
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
          path="/"
        >
          <Route element={<RoleProtectedRoute />}>
            <Route element={<ActivityMaintenancePage key="activity-list" />} path="activity" />
            <Route element={<ActivityMaintenancePage key="activity-add" />} path="activity/add" />
            <Route element={<ActivityMaintenancePage key="activity-edit" />} path="activity/:id/edit" />
            <Route element={<ActivityMaintenancePage key="activity-view" />} path="activity/:id/view" />
            <Route element={<ActivityFilterPage />} path="activity/filter" />
            <Route element={<ClassMaintenancePage key="class-list" />} path="class" />
            <Route element={<ClassMaintenancePage key="class-view" />} path="class/:id/view" />
            <Route element={<ClassFilterPage />} path="class/filter" />
            <Route element={<StudentMaintenancePage key="student-list" />} path="student" />
            <Route element={<StudentMaintenancePage key="student-add" />} path="student/add" />
            <Route element={<StudentMaintenancePage key="student-edit" />} path="student/:id/edit" />
            <Route element={<StudentMaintenancePage key="student-view" />} path="student/:id/view" />
            <Route element={<StudentFilterPage />} path="student/filter" />
            <Route element={<LetterMaintenancePage key="letter-list" />} path="letter" />
            <Route element={<LetterMaintenancePage key="letter-view" />} path="letter/:id/view" />
            <Route element={<LetterFilterPage />} path="letter/filter" />
            <Route element={<NoticeMaintenancePage key="notice-list" />} path="notice" />
            <Route element={<NoticeMaintenancePage key="notice-add" />} path="notice/add" />
            <Route element={<NoticeMaintenancePage key="notice-edit" />} path="notice/:id/edit" />
            <Route element={<NoticeMaintenancePage key="notice-view" />} path="notice/:id/view" />
            <Route element={<NoticeFilterPage />} path="notice/filter" />
            <Route element={<UserMaintenancePage key="user-list" />} path="user" />
            <Route element={<UserMaintenancePage key="user-add" />} path="user/add" />
            <Route element={<UserMaintenancePage key="user-edit" />} path="user/:id/edit" />
            <Route element={<UserMaintenancePage key="user-view" />} path="user/:id/view" />
            <Route element={<UserFilterPage />} path="user/filter" />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
