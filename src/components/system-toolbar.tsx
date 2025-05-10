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
  CheckmarkRegular,
  DismissRegular,
  DoorArrowLeftRegular,
  GlobeRegular,
  MailUnreadRegular,
  PeopleAddRegular,
  StoreMicrosoftRegular,
  WeatherMoonRegular,
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
import { MultiLingualLabel } from './multi-lang-label';
import { useNavigationHelpers } from '../hooks/use-delay-navigate';
import { RoleBaseComponent } from './role-based-component';
import { SimpleUser } from '../__generated__/linkedup-web-api-client';
import { usePreferredLanguageLabel } from '../hooks/use-preferred-language';

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
export const AvatarInfo = forwardRef<
  HTMLDivElement,
  AvatarInfoProps & React.HTMLAttributes<HTMLDivElement>
>(({ student, ...rest }, ref) => {
  const name = {
    [Language.ENGLISH]: `${student.firstName[Language.ENGLISH]} ${student.lastName[Language.ENGLISH]}`,
    [Language.TRADITIONAL_CHINESE]: `${student.lastName[Language.TRADITIONAL_CHINESE]}${student.firstName[Language.TRADITIONAL_CHINESE]}`,
    [Language.SIMPLIFIED_CHINESE]: `${student.lastName[Language.SIMPLIFIED_CHINESE]}${student.firstName[Language.SIMPLIFIED_CHINESE]}`,
  };

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
        width: '180px',
        cursor: 'pointer', // 👈 Optional but helpful
      }}
    >
      <Avatar color="brand" size={24} />
      <Label style={{ width: 40 }}>{`${student.classId}-${student.studentNumber}`}</Label>
      <MultiLingualLabel caption={name}>
        <Label />
      </MultiLingualLabel>
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
            const name = {
              [Language.ENGLISH]: `${s.firstName[Language.ENGLISH]} ${s.lastName[Language.ENGLISH]}`,
              [Language.TRADITIONAL_CHINESE]: `${s.lastName[Language.TRADITIONAL_CHINESE]}${s.firstName[Language.TRADITIONAL_CHINESE]}`,
              [Language.SIMPLIFIED_CHINESE]: `${s.lastName[Language.SIMPLIFIED_CHINESE]}${s.firstName[Language.SIMPLIFIED_CHINESE]}`,
            };
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
                  <MultiLingualLabel caption={name}>
                    <Label />
                  </MultiLingualLabel>
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
            <Persona name={usePreferredLanguageLabel(u.name)} secondaryText={u.email} />
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
              navigateWithSpinner('/user/add');
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

const MartketPlaceButton: React.FC = () => {
  const { navigateWithSpinner } = useNavigationHelpers();
  return (
    <Button
      appearance="transparent"
      icon={<StoreMicrosoftRegular />}
      onClick={() => navigateWithSpinner('/market')}
    ></Button>
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
  language: Language;
  onSetLanguage: (l: Language) => void;
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
      <MartketPlaceButton />
      <Spacer />
      <RoleBaseComponent entitledRole={UserRole.STUDENT}>
        <StudentRoleInfo
          parentUser={login?.parentUser ?? []}
          student={login?.user.entitledStudent[0]}
        />
      </RoleBaseComponent>
      <RoleBaseComponent entitledRole={UserRole.PARENT}>
        <ParentRoleInfo
          entitledStudent={login?.user.entitledStudent ?? []}
          selectedStudent={selectedStudent}
        />
      </RoleBaseComponent>
      <Spacer />

      <Menu checkedValues={{ lang: [language === Language.ENGLISH ? 'en' : 'zhHant'] }}>
        <MenuTrigger disableButtonEnhancement>
          <Button icon={<GlobeRegular />} onClick={() => setMenuOpen(false)} />
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
