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
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from '@fluentui/react-icons';
import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageEnum, Student, UserRoleEnum } from '../models/openapi';
import { Theme } from '../contexts/Theme';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useFormDirty } from '../contexts/FormDirty';
import { authenticationAtom } from '../states/authentication';
import { useDialog } from '../hooks/use-dialog';
import { useMessage } from '../hooks/use-message';
import { useNavigationHelpers } from '../hooks/use-delay-navigate';
import { SimpleUser } from '../__generated__/linkedup-web-api-client';
import {
  useNameInPreferredLanguage,
} from '../hooks/use-preferred-language';
import { Login } from '../models/login';
import { useTimezone } from '../hooks/use-timezone';
import { RoleIcon } from '../pages/user-maintenance/role-label';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '10px',
  },
  nameLabel: { width: '40px' },

  item: { display: 'flex', justifyContent: 'flex-start', gap: '10px' },
  button: { justifyContent: 'flex-start', width: '110px' },
  siteButtonText: {
    display: 'block',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    width: '80px',
  },
  dialogButtonPanel: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: '4px',
    gap: '8px',
  },
  divider: { width: '8px' },
  profileContentHeader: { marginTop: '0' },
});

const Spacer: React.FC = () => {
  const styles = useStyles();
  return <Divider className={styles.divider} vertical />;
};

interface AvatarInfoProps {
  student: Student;
}

// 👇 Forward the ref and spread props so MenuTrigger can handle events
const AvatarInfo = forwardRef<
  HTMLDivElement,
  AvatarInfoProps & React.HTMLAttributes<HTMLDivElement>
>(({ student, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      {...rest} // 👈 Spread the interaction props
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'start',
        margin: '4px',
        gap: tokens.spacingHorizontalS,
        minWidth: '150px',
        cursor: 'pointer', // 👈 Optional but helpful
      }}
    >
      <BookRegular fontSize={24} />
      <Label style={{ width: 50 }}>{`${student.classId}-${student.studentNumber}`}</Label>
      <Label>{useNameInPreferredLanguage(student)}</Label>
    </div>
  );
});

const ParentRoleInfo: React.FC<{ entitledStudent: Student[]; selectedStudent?: Student }> = ({
  entitledStudent,
  selectedStudent,
}) => {
  const [, authAction] = useAtom(authenticationAtom);
  const handleChange = (id: string) => {
    const student = entitledStudent.find((s) => s.id === id);
    student && authAction({ selectEntitledStudent: { student } });
  };

  if (entitledStudent.length === 0 || !selectedStudent) {
    return <></>;
  }

  return (
    <Menu checkedValues={{ studentId: [selectedStudent.id] }}>
      <MenuTrigger disableButtonEnhancement>
        <AvatarInfo student={selectedStudent} />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {entitledStudent.map((s) => {
            return (
              <MenuItemRadio
                key={s.id}
                name="studentId"
                onClick={() => handleChange(s.id)}
                value={`${s.id}`}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'start',
                    gap: tokens.spacingHorizontalS,
                  }}
                >
                  <Label style={{ width: 40 }}>{`${s.classId}-${s.studentNumber}`}</Label>
                  <Label>{useNameInPreferredLanguage(s)}</Label>
                </div>
              </MenuItemRadio>
            );
          })}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

const StudentRoleInfo: React.FC<{ parentUser: SimpleUser[]; student?: Student }> = ({
  parentUser,
  student,
}) => {
  const { t } = useTranslation();
  const { navigateWithSpinner } = useNavigationHelpers();
  const [isPopupOpen, setPopupOpen] = useState(false);

  if (!student) {
    return <></>;
  }

  const parentUserList = (
    <div>
      <Body1Strong>
        {parentUser.length > 0 ? t('userProfile.parentUser') : t('userProfile.noParentUser')}
      </Body1Strong>
      <List navigationMode="items" style={{ marginTop: tokens.spacingHorizontalS }}>
        {parentUser.map((u) => (
          <ListItem key={u.id}>
            <Persona name={useNameInPreferredLanguage(u)} secondaryText={u.email} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Popover onOpenChange={(_e, data) => setPopupOpen(data.open)} open={isPopupOpen} withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <AvatarInfo student={student} />
      </PopoverTrigger>

      <PopoverSurface tabIndex={-1}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXL }}>
          {parentUserList}
          <Button
            icon={<PeopleAddRegular />}
            onClick={() => {
              setPopupOpen(false);
              navigateWithSpinner('/user/add-parent');
            }}
          >
            {t('userProfile.addParentUser')}
          </Button>
        </div>
      </PopoverSurface>
    </Popover>
  );
};

const MessageButton: React.FC = () => {
  return <Button icon={<MailUnreadRegular />}></Button>;
};

export const ProfileButton: React.FC<{ login: Login }> = ({ login }) => {
  const { t } = useTranslation();
  const { formatDatetime } = useTimezone();
  const { user } = login;
  const name = useNameInPreferredLanguage(user);

  return (
    <Popover withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Avatar color="brand" name={name} shape="square" size={32}></Avatar>
      </PopoverTrigger>

      <PopoverSurface tabIndex={-1}>
        <Persona
          avatar={{
            icon: <RoleIcon role={user.role} size={40}/>,
          }}
          primaryText={name}
          secondaryText={user.email}
          size="huge"
          tertiaryText={`${t('userProfile.lastLogin')}: ${user.lastLoginDatetime ? formatDatetime(new Date(user.lastLoginDatetime)) : ''}`}
        />
      </PopoverSurface>
    </Popover>
  );
};

const SignoutButton: React.FC = () => {
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

  const confirmMessage = isDirty()
    ? t('userProfile.discardChangeAndSignOut')
    : t('userProfile.doYouWantToSignOut');

  return (
    <Button
      icon={<DoorArrowLeftRegular />}
      onClick={() =>
        showConfirmationDialog({
          confirmType: t('system.message.signOut'),
          message: confirmMessage,
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

export const SystemToolbar: React.FC<{
  theme: Theme;
  onSetTheme: (t: Theme) => void;
  language: LanguageEnum;
  onSetLanguage: (l: LanguageEnum) => void;
}> = ({ theme, onSetTheme, language, onSetLanguage }) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const [, setMenuOpen] = useState(false);
  const { login, selectedStudent } = useAtomValue(authenticationAtom);

  const themeIcons = {
    light: <WeatherSunnyRegular />,
    dark: <WeatherMoonRegular />,
    playful: <BalloonRegular />,
  };

  return (
    <div className={styles.toolbar}>
      <Spacer />
      {login?.user.role === UserRoleEnum.Student ? (
        <>
          <StudentRoleInfo
            parentUser={login?.parentUser ?? []}
            student={login?.user.entitledStudent[0]}
          />
          <Spacer />
        </>
      ) : login?.user.role === UserRoleEnum.Parent ? (
        <>
          <ParentRoleInfo
            entitledStudent={login?.user.entitledStudent ?? []}
            selectedStudent={selectedStudent}
          />
          <Spacer />
        </>
      ) : (
        <></>
      )}
      {login ? <ProfileButton login={login} /> : <></>}
      <Menu checkedValues={{ lang: [language === LanguageEnum.English ? 'en' : 'zhHant'] }}>
        <MenuTrigger disableButtonEnhancement>
          <Button icon={<GlobeRegular />} onClick={() => setMenuOpen(false)} />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItemRadio name="lang" onClick={() => onSetLanguage(LanguageEnum.English)} value="en">
              {t('system.language.value.en')}
            </MenuItemRadio>
            <MenuItemRadio
              name="lang"
              onClick={() => onSetLanguage(LanguageEnum.TraditionalChinese)}
              value="zhHant"
            >
              {t('system.language.value.zhHant')}
            </MenuItemRadio>
          </MenuList>
        </MenuPopover>
      </Menu>

      <Menu checkedValues={{ theme: [theme] }}>
        <MenuTrigger disableButtonEnhancement>
          <Button icon={themeIcons[theme]} onClick={() => setMenuOpen(false)} />
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

      <MessageButton />
      <SignoutButton />
    </div>
  );
};
