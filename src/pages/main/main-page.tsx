import {
  Avatar,
  Persona,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarGroup,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  DismissRegular,
  DoorArrowLeftRegular,
  HatGraduationRegular,
  MailUnreadRegular,
  NavigationRegular,
  PersonFeedbackRegular,
  SettingsRegular,
} from '@fluentui/react-icons';
import { usePreferredLanguage } from '@hook/use-preferred-language';
import type { AuthUser } from '@store/auth/auth-types';
import {
  FuiCaption1,
  FuiMenuBar,
  FuiMenuBarMenu,
  FuiMenuBarRadioGroup,
  FuiMenuBarRadioItem,
  FuiSwitch,
  useDialog,
  useIsMobile,
  useTheme,
} from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';

import { BottombarMenu, SidebarMenu } from './navigation-menu';
import { authActionAtom, authStateAtom } from '../../stores/auth/auth-bloc';

const useStyles = makeStyles({
  layout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100svh',
  },
  toolbar: {
    position: 'sticky',
    top: '0',
    zIndex: '100',
    justifyContent: 'space-between',
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke2,
    boxShadow: tokens.shadow2,
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
  },
  breadcrumb: {
    flex: '1',
    overflow: 'hidden',
    marginLeft: '32px',
  },
  spacer: {
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
  },
  body: {
    display: 'flex',
    flexDirection: 'row',
    flex: '1',
    overflow: 'hidden',
  },
  content: {
    flex: '1',
    padding: tokens.spacingVerticalXL,
    overflow: 'auto',
  },
  bottombar: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderTopColor: tokens.colorNeutralStroke2,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    flexShrink: 0,
    overflow: 'hidden',
    transition: 'max-height 0.3s ease',
  },
  selectedStudent: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    gap: tokens.spacingHorizontalS,
    width: '120px',
  },
  selectedStudentTexts: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },
  selectedStudentCaption: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  selectedStudentClickable: {
    cursor: 'pointer',
  },
});

const Divider = () => {
  const styles = useStyles();
  return <ToolbarDivider className={styles.spacer} vertical />;
};

const ToggleThemeButton = () => {
  const { t } = useTranslation();
  const { currentTheme, switchTheme } = useTheme();

  const isDark = currentTheme === 'dark';
  return (
    <FuiSwitch
      checked={isDark}
      label={t('setting.darkMode')}
      onChange={() => {
        switchTheme(isDark ? 'light' : 'dark');
      }}
    />
  );
};

const ChangeLanguageButtonPanel = () => {
  const { t, i18n } = useTranslation();

  return (
    <FuiMenuBar>
      <FuiMenuBarMenu label={t(`general.language.${i18n.language}Short`)}>
        <FuiMenuBarRadioGroup
          onValueChange={(lng) => i18n.changeLanguage(lng)}
          value={i18n.language}
        >
          {(['en', 'zh-Hant', 'zh-Hans'] as const).map((lng) => (
            <FuiMenuBarRadioItem key={lng} value={lng}>
              {t(`general.language.${lng}Short`)}
            </FuiMenuBarRadioItem>
          ))}
        </FuiMenuBarRadioGroup>
      </FuiMenuBarMenu>
    </FuiMenuBar>
  );
};

const SettingButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <ToolbarButton
      appearance="subtle"
      aria-label="Setting"
      icon={<SettingsRegular />}
      onClick={onClick}
    />
  );
};

const SelectedStudentDisplay = () => {
  const styles = useStyles();
  const dispatch = useSetAtom(authActionAtom);
  const { selectedStudentId, entitledStudents, user, lastLoginDatetime } = useAtomValue(authStateAtom);
  const { t } = useTranslation();
  const { fullNameInPreferredLanguage } = usePreferredLanguage();
  const isMobile = useIsMobile();

  const student = entitledStudents.find((s) => s.id === selectedStudentId);
  if (!student || !user) {
    return null;
  }

  const gradeClass = `${student.classId}-${student.studentNumber}`;
  const name = fullNameInPreferredLanguage(student.firstName, student.lastName);
  const isStudent = user.role === 'STUDENT';
  const canSelectStudent = entitledStudents.length > 1 && !isMobile;

  const inner = (
    <div
      className={mergeClasses(
        styles.selectedStudent,
        (isStudent || canSelectStudent) && styles.selectedStudentClickable,
      )}
    >
      <HatGraduationRegular fontSize={24} />
      <div className={styles.selectedStudentTexts}>
        <FuiCaption1 className={styles.selectedStudentCaption} text={gradeClass} />
        <FuiCaption1 className={styles.selectedStudentCaption} text={name} />
      </div>
    </div>
  );

  if (isStudent) {
    const fullName = fullNameInPreferredLanguage(user.firstName, user.lastName);
    const lastLoginText = lastLoginDatetime ? new Date(lastLoginDatetime).toLocaleString() : undefined;
    return (
      <Popover withArrow>
        <PopoverTrigger disableButtonEnhancement>{inner}</PopoverTrigger>
        <PopoverSurface tabIndex={-1}>
          <Persona
            avatar={{ icon: <PersonFeedbackRegular /> }}
            primaryText={fullName}
            secondaryText={user.email}
            size="huge"
            tertiaryText={t('toolbar.lastLogin', { lastLogin: lastLoginText ?? 'N/A' })}
          />
        </PopoverSurface>
      </Popover>
    );
  }

  if (!canSelectStudent) {
    return inner;
  }

  return (
    <FuiMenuBar>
      <FuiMenuBarMenu label={inner}>
        <FuiMenuBarRadioGroup
          onValueChange={(studentId) =>
            dispatch({ type: 'SWITCH_STUDENT', payload: { studentId } })
          }
          value={selectedStudentId ?? ''}
        >
          {entitledStudents.map((s) => (
            <FuiMenuBarRadioItem key={s.id} value={s.id}>
              {`${s.classId}-${s.studentNumber}  ${fullNameInPreferredLanguage(s.firstName, s.lastName)}`}
            </FuiMenuBarRadioItem>
          ))}
        </FuiMenuBarRadioGroup>
      </FuiMenuBarMenu>
    </FuiMenuBar>
  );
};

const UserProfileButton = ({
  user,
  lastLoginDatetime,
}: {
  user: AuthUser;
  lastLoginDatetime: string | null;
}) => {
  const { t, i18n } = useTranslation();
  const { nameInPreferredLanguage, fullNameInPreferredLanguage } =
    usePreferredLanguage();
  const fullName = fullNameInPreferredLanguage(user.firstName, user.lastName);
  const lastLoginText = lastLoginDatetime
    ? new Date(lastLoginDatetime).toLocaleString()
    : undefined;

  return (
    <Popover withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Avatar
          initials={
            i18n.language === 'en'
              ? undefined
              : nameInPreferredLanguage(user.firstName)
          }
          name={fullName}
          size={28}
          style={{ marginRight: tokens.spacingHorizontalXS }}
        />
      </PopoverTrigger>
      <PopoverSurface tabIndex={-1}>
        <Persona
          avatar={{ icon: <PersonFeedbackRegular /> }}
          primaryText={fullName}
          secondaryText={user.email}
          size="huge"
          tertiaryText={t('toolbar.lastLogin', {
            lastLogin: lastLoginText ?? 'N/A',
          })}
        />
      </PopoverSurface>
    </Popover>
  );
};

const SignoutButton = () => {
  const { t } = useTranslation();
  const dialog = useDialog();
  const dispatch = useSetAtom(authActionAtom);

  return (
    <ToolbarButton
      appearance="subtle"
      aria-label="Logout"
      icon={<DoorArrowLeftRegular />}
      onClick={() => {
        dialog.openDialog({
          title: t('setting.confirmLogout'),
          content: t('setting.confirmLogoutContent'),
          primaryButton: {
            icon: <DoorArrowLeftRegular />,
            label: t('setting.logout'),
            action: () => {
              dispatch({ type: 'LOGOUT' });
            },
          },
          secondaryButton: { icon: <DismissRegular />, label: t('general.text.cancel'), action: () => {} },
        });
      }}
    />
  );
};

export function MainPage() {
  const styles = useStyles();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, lastLoginDatetime } = useAtomValue(authStateAtom);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className={styles.layout}>
      <Toolbar className={styles.toolbar}>
        <ToolbarGroup role="presentation">
          <ToolbarButton
            appearance="subtle"
            aria-label="Open navigation menu"
            icon={<NavigationRegular />}
            onClick={() => setSidebarCollapsed((prev) => !prev)}
          />
        </ToolbarGroup>
        <ToolbarGroup>
          {!isMobile && (
            <>
              <ToggleThemeButton />
              <Divider />
              <ChangeLanguageButtonPanel />
              <Divider />
            </>
          )}
          {user !== null &&
            (user.role === 'STUDENT' || user.role === 'PARENT') && (
              <SelectedStudentDisplay />
            )}
          {user !== null && user.role !== 'STUDENT' && (
            <UserProfileButton
              lastLoginDatetime={lastLoginDatetime}
              user={user}
            />
          )}
          <Divider />
          {isMobile && (
            <SettingButton
              onClick={() =>
                navigate('/settings', { state: { fromMain: true } })
              }
            />
          )}
          <ToolbarButton
            appearance="subtle"
            aria-label="Message"
            icon={<MailUnreadRegular />}
          />
          <SignoutButton />
        </ToolbarGroup>
      </Toolbar>
      <div className={styles.body}>
        {!isMobile && <SidebarMenu collapsed={sidebarCollapsed} />}
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
      {isMobile && (
        <div
          className={styles.bottombar}
          style={{ maxHeight: sidebarCollapsed ? '0' : '56px' }}
        >
          <BottombarMenu />
        </div>
      )}
    </div>
  );
}
