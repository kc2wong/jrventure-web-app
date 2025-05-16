import {
  makeStyles,
  Menu,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MenuItemRadio,
  Button,
  Divider,
  Label,
  Avatar,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  tokens,
  List,
  ListItem,
  Persona,
  Body1Strong,
} from '@fluentui/react-components';
import {
  BalloonRegular,
  BookRegular,
  CheckmarkRegular,
  DismissRegular,
  DoorArrowLeftRegular,
  GlobeRegular,
  MailUnreadRegular,
  PeopleAddRegular,
  SettingsRegular,
  DarkThemeRegular,
  WeatherSunnyRegular,
} from '@fluentui/react-icons';
import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, Student, UserRole } from '../models/openapi';
import { Theme } from '../contexts/Theme';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useFormDirty } from '../contexts/FormDirty';
import { authenticationAtom } from '../states/authentication';
import { useDialog } from '../hooks/use-dialog';
import { useMessage } from '../hooks/use-message';
import { useNavigationHelpers } from '../hooks/use-delay-navigate';
import { SimpleUser } from '../__generated__/linkedup-web-api-client';
import { useNameInPreferredLanguage } from '../hooks/use-preferred-language';
import { Login } from '../models/login';
import { useTimezone } from '../hooks/use-timezone';
import { RoleIcon } from '../pages/user-maintenance/role-label';
import { DeviceComponent } from './device-component';

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '10px',
    minHeight: '32px',
  },
  divider: { width: '8px' },
});

const Spacer: React.FC = () => {
  const styles = useStyles();
  return <Divider className={styles.divider} vertical />;
};

const AvatarInfo = forwardRef<
  HTMLDivElement,
  { student: Student } & React.HTMLAttributes<HTMLDivElement>
>(({ student, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacingHorizontalS,
      minWidth: '150px',
      cursor: 'pointer',
      margin: '4px',
    }}
  >
    <BookRegular fontSize={24} />
    <Label style={{ width: 50 }}>{`${student.classId}-${student.studentNumber}`}</Label>
    <Label>{useNameInPreferredLanguage(student)}</Label>
  </div>
));

const ParentRoleInfo = ({
  entitledStudent,
  selectedStudent,
}: {
  entitledStudent: Student[];
  selectedStudent?: Student;
}) => {
  const [, authAction] = useAtom(authenticationAtom);
  const handleChange = (id: string) => {
    const student = entitledStudent.find((s) => s.id === id);
    if (student) {
      authAction({ selectEntitledStudent: { student } });
    }
  };

  if (!selectedStudent || entitledStudent.length === 0) {
    return null;
  }

  return (
    <Menu checkedValues={{ studentId: [selectedStudent.id] }}>
      <MenuTrigger disableButtonEnhancement>
        <AvatarInfo student={selectedStudent} />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {entitledStudent.map((s) => (
            <MenuItemRadio
              key={s.id}
              name="studentId"
              onClick={() => handleChange(s.id)}
              value={s.id}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}
              >
                <Label style={{ width: 40 }}>{`${s.classId}-${s.studentNumber}`}</Label>
                <Label>{useNameInPreferredLanguage(s)}</Label>
              </div>
            </MenuItemRadio>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

const StudentRoleInfo = ({
  parentUser,
  student,
}: {
  parentUser: SimpleUser[];
  student?: Student;
}) => {
  const { t } = useTranslation();
  const { navigateWithSpinner } = useNavigationHelpers();
  const [isPopupOpen, setPopupOpen] = useState(false);
  if (!student) {
    return null;
  }

  return (
    <Popover onOpenChange={(_, data) => setPopupOpen(data.open)} open={isPopupOpen} withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <AvatarInfo student={student} />
      </PopoverTrigger>
      <PopoverSurface tabIndex={-1}>
        <Body1Strong>
          {parentUser.length > 0 ? t('userProfile.parentUser') : t('userProfile.noParentUser')}
        </Body1Strong>
        <List style={{ marginTop: tokens.spacingHorizontalS }}>
          {parentUser.map((u) => (
            <ListItem key={u.id}>
              <Persona name={useNameInPreferredLanguage(u)} secondaryText={u.email} />
            </ListItem>
          ))}
        </List>
        <Button
          icon={<PeopleAddRegular />}
          onClick={() => {
            setPopupOpen(false);
            navigateWithSpinner('/user/add-parent');
          }}
        >
          {t('userProfile.addParentUser')}
        </Button>
      </PopoverSurface>
    </Popover>
  );
};

const MessageButton = () => <Button icon={<MailUnreadRegular />} />;

const ProfileButton = ({ login }: { login: Login }) => {
  const { t } = useTranslation();
  const { formatDatetime } = useTimezone();
  const name = useNameInPreferredLanguage(login.user);
  return (
    <Popover withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Avatar color="brand" name={name} shape="square" size={32} />
      </PopoverTrigger>
      <PopoverSurface tabIndex={-1}>
        <Persona
          avatar={{ icon: <RoleIcon role={login.user.role} size={40} /> }}
          primaryText={name}
          secondaryText={login.user.email}
          size="huge"
          tertiaryText={`${t('userProfile.lastLogin')}: ${login.user.lastLoginDatetime ? formatDatetime(new Date(login.user.lastLoginDatetime)) : ''}`}
        />
      </PopoverSurface>
    </Popover>
  );
};

const SignoutButton = () => {
  const action = useSetAtom(authenticationAtom);
  const { t } = useTranslation();
  const { showConfirmationDialog } = useDialog();
  const { isDirty } = useFormDirty();
  const { showSpinner, stopSpinner } = useMessage();
  const { navigateWithSpinner } = useNavigationHelpers();

  const confirmAndSignOut = () => {
    showSpinner();
    setTimeout(() => {
      stopSpinner();
      action({ signOut: {} });
      navigateWithSpinner('/');
    }, 500);
  };

  return (
    <Button
      icon={<DoorArrowLeftRegular />}
      onClick={() =>
        showConfirmationDialog({
          confirmType: t('system.message.signOut'),
          message: isDirty()
            ? t('userProfile.discardChangeAndSignOut')
            : t('userProfile.doYouWantToSignOut'),
          primaryButton: {
            label: t('userProfile.signOut'),
            icon: <CheckmarkRegular />,
            action: confirmAndSignOut,
          },
          secondaryButton: {
            label: t('system.message.cancel'),
            icon: <DismissRegular />,
          },
        })
      }
    />
  );
};

export const SystemToolbar = ({
  theme,
  onSetTheme,
  language,
  onSetLanguage,
  setShowBackButton,
}: {
  theme: Theme;
  onSetTheme: (t: Theme) => void;
  language: Language;
  onSetLanguage: (l: Language) => void;
  setShowBackButton: (toShow: boolean) => void;
}) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { login, selectedStudent } = useAtomValue(authenticationAtom);
  const { navigate } = useNavigationHelpers();

  const SettingButton = () => {
    return (
      <Button
        icon={<SettingsRegular />}
        onClick={() => {
          navigate('/setting');
          setShowBackButton(true);
        }}
      />
    );
  };

  const themeIcons = {
    light: <WeatherSunnyRegular />,
    dark: <DarkThemeRegular />,
    playful: <BalloonRegular />,
  };

  return (
    <div className={styles.toolbar}>
      <Spacer />
      {login?.user.role === UserRole.STUDENT ? (
        <>
          <StudentRoleInfo
            parentUser={login?.parentUser ?? []}
            student={login?.user.entitledStudent[0]}
          />
          <Spacer />
        </>
      ) : login?.user.role === UserRole.PARENT ? (
        <>
          <ParentRoleInfo
            entitledStudent={login?.user.entitledStudent ?? []}
            selectedStudent={selectedStudent}
          />
          <Spacer />
        </>
      ) : null}

      <DeviceComponent forMobile={false}>
        {login ? <ProfileButton login={login} /> : <></>}
        <Menu checkedValues={{ lang: [language === Language.ENGLISH ? 'en' : 'zhHant'] }}>
          <MenuTrigger disableButtonEnhancement>
            <Button icon={<GlobeRegular />} />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItemRadio name="lang" onClick={() => onSetLanguage(Language.ENGLISH)} value="en">
                {t('system.language.value.en')}
              </MenuItemRadio>
              <MenuItemRadio
                name="lang"
                onClick={() => onSetLanguage(Language.TRADITIONAL_CHINESE)}
                value="zhHant"
              >
                {t('system.language.value.zhHant')}
              </MenuItemRadio>
            </MenuList>
          </MenuPopover>
        </Menu>

        <Menu checkedValues={{ theme: [theme] }}>
          <MenuTrigger disableButtonEnhancement>
            <Button icon={themeIcons[theme]} />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {(['light', 'dark', 'playful'] as Theme[]).map((th) => (
                <MenuItemRadio key={th} name="theme" onClick={() => onSetTheme(th)} value={th}>
                  {t(`system.theme.value.${th}`)}
                </MenuItemRadio>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </DeviceComponent>

      <DeviceComponent forMobile={true}>
        <SettingButton />
      </DeviceComponent>

      <MessageButton />

      <DeviceComponent forMobile={false}>
        <SignoutButton />
      </DeviceComponent>
    </div>
  );
};
